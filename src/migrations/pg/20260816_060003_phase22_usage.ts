import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "usage_records" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"customer_id" integer,
  	"subscription_id" integer,
  	"quantity" numeric DEFAULT 1,
  	"unit_amount" numeric,
  	"amount" numeric,
  	"billed" boolean DEFAULT false,
  	"billed_invoice_id" integer,
  	"occurred_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "usage_records_id" integer;
  ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_billed_invoice_id_invoices_id_fk" FOREIGN KEY ("billed_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "usage_records_customer_idx" ON "usage_records" USING btree ("customer_id");
  CREATE INDEX "usage_records_subscription_idx" ON "usage_records" USING btree ("subscription_id");
  CREATE INDEX "usage_records_billed_invoice_idx" ON "usage_records" USING btree ("billed_invoice_id");
  CREATE INDEX "usage_records_updated_at_idx" ON "usage_records" USING btree ("updated_at");
  CREATE INDEX "usage_records_created_at_idx" ON "usage_records" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usage_records_fk" FOREIGN KEY ("usage_records_id") REFERENCES "public"."usage_records"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_usage_records_id_idx" ON "payload_locked_documents_rels" USING btree ("usage_records_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "usage_records" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "usage_records" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_usage_records_fk";
  
  DROP INDEX "payload_locked_documents_rels_usage_records_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "usage_records_id";`)
}
