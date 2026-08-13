import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_invoices\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`customer_id\` integer,
  	\`subscription_id\` integer,
  	\`subtotal\` numeric,
  	\`tax\` numeric,
  	\`total\` numeric,
  	\`status\` text DEFAULT 'unpaid',
  	\`due_date\` text,
  	\`paid_date\` text,
  	\`reminders_sent\` numeric DEFAULT 0,
  	\`last_reminder_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`subscription_id\`) REFERENCES \`subscriptions\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_invoices\`("id", "number", "customer_id", "subscription_id", "subtotal", "tax", "total", "status", "due_date", "paid_date", "reminders_sent", "last_reminder_at", "updated_at", "created_at") SELECT "id", "number", "customer_id", "subscription_id", "subtotal", "tax", "total", "status", "due_date", "paid_date", "reminders_sent", "last_reminder_at", "updated_at", "created_at" FROM \`invoices\`;`)
  await db.run(sql`DROP TABLE \`invoices\`;`)
  await db.run(sql`ALTER TABLE \`__new_invoices\` RENAME TO \`invoices\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`invoices_number_idx\` ON \`invoices\` (\`number\`);`)
  await db.run(sql`CREATE INDEX \`invoices_customer_idx\` ON \`invoices\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX \`invoices_subscription_idx\` ON \`invoices\` (\`subscription_id\`);`)
  await db.run(sql`CREATE INDEX \`invoices_updated_at_idx\` ON \`invoices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`invoices_created_at_idx\` ON \`invoices\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_invoices\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text NOT NULL,
  	\`customer_id\` integer,
  	\`subtotal\` numeric,
  	\`tax\` numeric,
  	\`total\` numeric,
  	\`status\` text DEFAULT 'unpaid',
  	\`due_date\` text,
  	\`paid_date\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_invoices\`("id", "number", "customer_id", "subtotal", "tax", "total", "status", "due_date", "paid_date", "updated_at", "created_at") SELECT "id", "number", "customer_id", "subtotal", "tax", "total", "status", "due_date", "paid_date", "updated_at", "created_at" FROM \`invoices\`;`)
  await db.run(sql`DROP TABLE \`invoices\`;`)
  await db.run(sql`ALTER TABLE \`__new_invoices\` RENAME TO \`invoices\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`invoices_number_idx\` ON \`invoices\` (\`number\`);`)
  await db.run(sql`CREATE INDEX \`invoices_customer_idx\` ON \`invoices\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX \`invoices_updated_at_idx\` ON \`invoices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`invoices_created_at_idx\` ON \`invoices\` (\`created_at\`);`)
}
