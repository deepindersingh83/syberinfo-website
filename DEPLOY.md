# Deploying SyberInfo on CloudPanel

> **Key concept:** This is a **Next.js (Node.js) app**, not a PHP/static site.
> You do **NOT** point a document root at a `public/` folder. nginx must
> **reverse-proxy** to a running Node process. A `502 Bad Gateway` means nginx
> is up but the Node app isn't reachable (not running / crashed / wrong port).

## 1. Create the site

In CloudPanel: **Sites → Add Site → Create a Node.js Site**
- Domain: `syberinfo.com.au` (or a subdomain)
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
pm2 start ecosystem.config.js     # serves .next/standalone/server.js on :3000
pm2 save
pm2 startup                        # run the printed command so it survives reboot
```

Check it's alive: `pm2 status` and `curl -I http://127.0.0.1:3000` → expect `200`.

## 5. Environment variables

Create `.env.local` in the project root (see `.env.example`) for the contact
form email:

```
RESEND_API_KEY=...
CONTACT_TO=admin@syberinfo.com.au
CONTACT_FROM=SyberInfo <noreply@syberinfo.com.au>
```

Rebuild / `pm2 restart syberinfo` after changes.

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
