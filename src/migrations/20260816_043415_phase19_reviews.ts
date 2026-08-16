import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`company\` text;`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`rating\` numeric;`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`approved\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`submitted_at\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`company\`;`)
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`rating\`;`)
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`approved\`;`)
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`submitted_at\`;`)
}
