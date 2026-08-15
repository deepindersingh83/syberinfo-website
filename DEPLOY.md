# Deploying SyberInfo on CloudPanel

> **Key concept:** This is a **Next.js (Node.js) app**, not a PHP/static site.
> You do **NOT** point a document root at a `public/` folder. nginx must
> **reverse-proxy** to a running Node process. A `502 Bad Gateway` means nginx
> is up but the Node app isn't reachable (not running / crashed / wrong port).

## 1. Create the site

In CloudPanel: **Sites → Add Site → Create a Node.js Site**
- Domain: `syberinfo.com` (or a subdomain)
- Node.js version: **22**
- App Port: **3000**

CloudPanel creates the nginx vhost and reverse-proxies the domain to port 3000.

## 2. Get the code onto the server

Into the site directory, e.g. `/home/<site-user>/htdocs/syberinfo.com.au/`:

```bash
git clone <repo-url> .
# or upload the files
```

## 3. Build

```bash
npm ci
npm run build
```

This produces a **standalone** server at `.next/standalone/` (see
`next.config.ts`). Standalone does **not** auto-include static assets, so copy
them in (one-time per build):

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public        .next/standalone/public
```

## 4. Run it with PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs    # serves .next/standalone/server.js on :3000
pm2 save
pm2 startup                        # run the printed command so it survives reboot
```

Check it's alive: `pm2 status` and `curl -I http://127.0.0.1:3000` → expect `200`.

## 5. Environment variables

Create `.env.local` in the project root (see `.env.example`):

```
# Payload CMS (required)
PAYLOAD_SECRET=<long-random-string>          # openssl rand -base64 32
DATABASE_URI=file:/home/<site-user>/syberinfo.db   # ABSOLUTE path

# Contact form email (optional)
RESEND_API_KEY=...
CONTACT_TO=admin@syberinfo.com.au
CONTACT_FROM=SyberInfo <noreply@syberinfo.com.au>
```

> Use an **absolute** `DATABASE_URI` so the SQLite file lives outside `.next/`
> and survives redeploys (the standalone server runs from `.next/standalone`).

> **Media uploads:** set `MEDIA_DIR` to an absolute path outside the project
> (e.g. `/home/<site-user>/media`) so images uploaded in the admin survive
> redeploys. Image optimisation uses `sharp` (already a dependency).

Rebuild / `pm2 restart syberinfo` after changes.

## 6. Payload CMS admin

The site includes a self-hosted **Payload CMS** (SQLite) for managing content.

- **Schema & seed are automatic.** On first production start, the bundled
  migrations create the tables and the initial Services / Products /
  Testimonials are seeded from code. No manual migrate step on deploy.
- **Create your admin account:** visit `https://syberinfo.com/admin` and
  Payload will prompt you to create the first user.
- **Edit content:** Services, Products and Testimonials are editable under the
  *Content* group. Changes appear on the site immediately (pages are dynamic).
- **Database backup:** just copy the SQLite file referenced by `DATABASE_URI`.

### Changing collections/fields later

After editing `payload.config.ts` (adding fields, collections, etc.):

```bash
npm run payload migrate:create   # writes a new file in src/migrations
git add src/migrations && git commit -m "cms: migration"
```

The new migration is bundled and auto-applied on the next production start.
Run `npm run generate:importmap` too if you add custom admin components.

> **Which migration folder?** The DB adapter is chosen from `DATABASE_URI`
> (a `postgres://` URL uses Postgres, anything else uses SQLite). Each adapter
> keeps its own migration set — `src/migrations/pg` for Postgres,
> `src/migrations` for SQLite — because the generated SQL differs per dialect.
> `migrate:create` writes to whichever adapter your current `DATABASE_URI`
> selects, so generate migrations while pointed at the same database type you
> run in production (Postgres).

## Migrating SQLite → PostgreSQL

Postgres is recommended for production: real backups/replication and none of
the relative-path/file-locking pitfalls of a file DB. The switch is driven
entirely by `DATABASE_URI` — no code change.

**CloudPanel note:** CloudPanel's database manager only covers MySQL/MariaDB,
which Payload does **not** support. So either:

- **(Recommended) A managed Postgres** — e.g. Neon, Supabase, or Amazon RDS.
  This gets the database off the app server entirely and gives you automated
  backups + point-in-time restore with zero server admin. Create a database,
  copy its connection string.
- **Self-hosted on the VPS** — install Postgres alongside CloudPanel:
  ```bash
  sudo apt-get install -y postgresql
  sudo -u postgres createuser --pwprompt syberinfo
  sudo -u postgres createdb -O syberinfo syberinfo
  # connection string: postgres://syberinfo:PASSWORD@127.0.0.1:5432/syberinfo
  ```
  Backups are then your responsibility (`pg_dump` on a cron).

### One-time cutover (with data)

Do this during a short maintenance window. It copies the existing SQLite data
into a Postgres schema that **Payload** creates, so all types/relationships stay
correct. Verified with pgloader 3.6.

```bash
cd /home/<site-user>/syberinfo-website
pm2 stop syberinfo                      # freeze writes

# 1. Point at Postgres and let Payload build the schema (runs src/migrations/pg)
export DATABASE_URI="postgres://syberinfo:PASSWORD@HOST:5432/syberinfo"
npx payload migrate

# 2. Copy DATA ONLY from the live SQLite file into the new Postgres schema.
#    (Install once: sudo apt-get install -y pgloader)
cat > /tmp/cutover.load <<'LOAD'
LOAD DATABASE
  FROM sqlite:///home/<site-user>/syberinfo-website/data/syberinfo.db
  INTO postgresql://syberinfo:PASSWORD@HOST:5432/syberinfo
WITH data only, workers = 2, concurrency = 1, no truncate,
     create no tables, create no indexes, disable triggers
SET work_mem to '32MB'
EXCLUDING TABLE NAMES LIKE 'payload_migrations', 'sqlite_sequence';
LOAD
pgloader /tmp/cutover.load            # resets sequences + FKs automatically

# 3. Put DATABASE_URI in .env (so PM2 uses Postgres on every restart), then:
pm2 start ecosystem.config.cjs && pm2 save
```

Verify: log into `/admin` (existing password works — hashes are copied), open a
few records, and create a test row to confirm ID sequences are healthy. Keep the
old `data/syberinfo.db` file until you're satisfied, then archive it.

> Migrating **only the schema** (fresh start, no data)? Just set the Postgres
> `DATABASE_URI` and run `npx payload migrate` — skip pgloader.

## Updating the site

```bash
git pull
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public        .next/standalone/public
pm2 restart syberinfo
```

## Troubleshooting the 502

| Check | Command |
|-------|---------|
| Is Node running? | `pm2 status` |
| App logs / crashes | `pm2 logs syberinfo` |
| Does the app answer locally? | `curl -I http://127.0.0.1:3000` |
| Port matches nginx proxy_pass? | App `PORT=3000` ↔ vhost `proxy_pass http://127.0.0.1:3000` |
| nginx errors | CloudPanel → site → Vhost / logs |

## Serving under a sub-path (not recommended)

To serve at `https://syberinfo.com/syberinfo-website` instead of the domain
root, build with a base path:

```bash
BASE_PATH=/syberinfo-website npm run build
```

A **subdomain** (e.g. `app.syberinfo.com.au`) is cleaner than a sub-folder and
needs no `BASE_PATH`.
