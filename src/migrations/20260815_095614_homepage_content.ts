import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_cta_primary_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_cta_primary_href\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_cta_secondary_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`hero_cta_secondary_href\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`closing_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`closing_cta_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`closing_cta_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_content\` ADD \`closing_cta_button_href\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_heading\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_subheading\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_cta_primary_label\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_cta_primary_href\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_cta_secondary_label\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`hero_cta_secondary_href\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`closing_cta_heading\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`closing_cta_subheading\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`closing_cta_button_label\`;`)
  await db.run(sql`ALTER TABLE \`site_content\` DROP COLUMN \`closing_cta_button_href\`;`)
}
