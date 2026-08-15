import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`page_content_headers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`page\` text NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`subheading\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_content_headers_order_idx\` ON \`page_content_headers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_content_headers_parent_id_idx\` ON \`page_content_headers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`page_content\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`page_content_headers\`;`)
  await db.run(sql`DROP TABLE \`page_content\`;`)
}
