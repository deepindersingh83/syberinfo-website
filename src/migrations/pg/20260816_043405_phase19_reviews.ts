import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" ADD COLUMN "company" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "rating" numeric;
  ALTER TABLE "testimonials" ADD COLUMN "approved" boolean DEFAULT true;
  ALTER TABLE "testimonials" ADD COLUMN "submitted_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DROP COLUMN "company";
  ALTER TABLE "testimonials" DROP COLUMN "rating";
  ALTER TABLE "testimonials" DROP COLUMN "approved";
  ALTER TABLE "testimonials" DROP COLUMN "submitted_at";`)
}
