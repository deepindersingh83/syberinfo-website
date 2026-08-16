import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_referrals_status" AS ENUM('pending', 'qualified', 'rewarded', 'rejected');
  CREATE TABLE "referral_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"partner" varchar,
  	"email" varchar,
  	"reward" varchar,
  	"active" boolean DEFAULT true,
  	"times_used" numeric DEFAULT 0,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "referrals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ref_code" varchar NOT NULL,
  	"code_id" integer,
  	"lead_id" integer,
  	"name" varchar,
  	"email" varchar,
  	"status" "enum_referrals_status" DEFAULT 'pending',
  	"value" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "leads" ADD COLUMN "attribution_referral_code" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "referral_codes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "referrals_id" integer;
  ALTER TABLE "referrals" ADD CONSTRAINT "referrals_code_id_referral_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."referral_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "referrals" ADD CONSTRAINT "referrals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "referral_codes_code_idx" ON "referral_codes" USING btree ("code");
  CREATE INDEX "referral_codes_updated_at_idx" ON "referral_codes" USING btree ("updated_at");
  CREATE INDEX "referral_codes_created_at_idx" ON "referral_codes" USING btree ("created_at");
  CREATE INDEX "referrals_code_idx" ON "referrals" USING btree ("code_id");
  CREATE INDEX "referrals_lead_idx" ON "referrals" USING btree ("lead_id");
  CREATE INDEX "referrals_updated_at_idx" ON "referrals" USING btree ("updated_at");
  CREATE INDEX "referrals_created_at_idx" ON "referrals" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_referral_codes_fk" FOREIGN KEY ("referral_codes_id") REFERENCES "public"."referral_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_referrals_fk" FOREIGN KEY ("referrals_id") REFERENCES "public"."referrals"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_referral_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("referral_codes_id");
  CREATE INDEX "payload_locked_documents_rels_referrals_id_idx" ON "payload_locked_documents_rels" USING btree ("referrals_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "referral_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "referrals" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "referral_codes" CASCADE;
  DROP TABLE "referrals" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_referral_codes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_referrals_fk";
  
  DROP INDEX "payload_locked_documents_rels_referral_codes_id_idx";
  DROP INDEX "payload_locked_documents_rels_referrals_id_idx";
  ALTER TABLE "leads" DROP COLUMN "attribution_referral_code";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "referral_codes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "referrals_id";
  DROP TYPE "public"."enum_referrals_status";`)
}
