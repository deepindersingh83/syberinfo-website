import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_pricing_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services_pricing\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_pricing_features_order_idx\` ON \`services_pricing_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_pricing_features_parent_id_idx\` ON \`services_pricing_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_pricing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`price\` text,
  	\`unit\` text,
  	\`highlight\` integer DEFAULT false,
  	\`cta_label\` text DEFAULT 'Get a quote',
  	\`cta_href\` text DEFAULT '/contact',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_pricing_order_idx\` ON \`services_pricing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_pricing_parent_id_idx\` ON \`services_pricing\` (\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_pricing_features\`;`)
  await db.run(sql`DROP TABLE \`services_pricing\`;`)
}
