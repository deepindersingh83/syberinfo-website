import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`page_content_about_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_content_about_intro_order_idx\` ON \`page_content_about_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_intro_parent_id_idx\` ON \`page_content_about_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`page_content_about_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_content_about_timeline_order_idx\` ON \`page_content_about_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_timeline_parent_id_idx\` ON \`page_content_about_timeline\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`contact_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`contact_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`contact_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_values_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_timeline_heading\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`page_content_about_intro\`;`)
  await db.run(sql`DROP TABLE \`page_content_about_timeline\`;`)
  await db.run(sql`ALTER TABLE \`page_content\` DROP COLUMN \`contact_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`page_content\` DROP COLUMN \`contact_heading\`;`)
  await db.run(sql`ALTER TABLE \`page_content\` DROP COLUMN \`contact_subheading\`;`)
  await db.run(sql`ALTER TABLE \`page_content\` DROP COLUMN \`about_values_heading\`;`)
  await db.run(sql`ALTER TABLE \`page_content\` DROP COLUMN \`about_timeline_heading\`;`)
}
