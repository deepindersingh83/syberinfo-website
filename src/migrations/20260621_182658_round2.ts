import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_benefits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`benefit\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_benefits_order_idx\` ON \`services_benefits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_benefits_parent_id_idx\` ON \`services_benefits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_sections_order_idx\` ON \`services_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_sections_parent_id_idx\` ON \`services_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_faqs_order_idx\` ON \`services_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_faqs_parent_id_idx\` ON \`services_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_sections_order_idx\` ON \`products_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_sections_parent_id_idx\` ON \`products_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_faqs_order_idx\` ON \`products_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_faqs_parent_id_idx\` ON \`products_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_stats_order_idx\` ON \`site_content_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_stats_parent_id_idx\` ON \`site_content_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_process_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_process_steps_order_idx\` ON \`site_content_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_process_steps_parent_id_idx\` ON \`site_content_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`services\` ADD \`overview\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`slug\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`overview\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_benefits\`;`)
  await db.run(sql`DROP TABLE \`services_sections\`;`)
  await db.run(sql`DROP TABLE \`services_faqs\`;`)
  await db.run(sql`DROP TABLE \`products_sections\`;`)
  await db.run(sql`DROP TABLE \`products_faqs\`;`)
  await db.run(sql`DROP TABLE \`site_content_stats\`;`)
  await db.run(sql`DROP TABLE \`site_content_process_steps\`;`)
  await db.run(sql`DROP TABLE \`site_content\`;`)
  await db.run(sql`DROP INDEX \`products_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`slug\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`overview\`;`)
  await db.run(sql`ALTER TABLE \`services\` DROP COLUMN \`overview\`;`)
}
