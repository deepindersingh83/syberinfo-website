import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assets_category" AS ENUM('hardware', 'software', 'license', 'subscription', 'other');
  CREATE TYPE "public"."enum_assets_status" AS ENUM('active', 'expiring', 'expired', 'retired');
  CREATE TABLE "assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"customer_id" integer,
  	"category" "enum_assets_category" DEFAULT 'hardware',
  	"vendor" varchar,
  	"identifier" varchar,
  	"quantity" numeric DEFAULT 1,
  	"unit_cost" numeric,
  	"purchase_date" timestamp(3) with time zone,
  	"renewal_date" timestamp(3) with time zone,
  	"status" "enum_assets_status" DEFAULT 'active',
  	"auto_remind" boolean DEFAULT true,
  	"last_reminder_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assets_id" integer;
  ALTER TABLE "assets" ADD CONSTRAINT "assets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "assets_customer_idx" ON "assets" USING btree ("customer_id");
  CREATE INDEX "assets_updated_at_idx" ON "assets" USING btree ("updated_at");
  CREATE INDEX "assets_created_at_idx" ON "assets" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assets_fk" FOREIGN KEY ("assets_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("assets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "assets" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assets_fk";
  
  DROP INDEX "payload_locked_documents_rels_assets_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assets_id";
  DROP TYPE "public"."enum_assets_category";
  DROP TYPE "public"."enum_assets_status";`)
}
