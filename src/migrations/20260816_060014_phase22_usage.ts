import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`usage_records\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`description\` text NOT NULL,
  	\`customer_id\` integer,
  	\`subscription_id\` integer,
  	\`quantity\` numeric DEFAULT 1,
  	\`unit_amount\` numeric,
  	\`amount\` numeric,
  	\`billed\` integer DEFAULT false,
  	\`billed_invoice_id\` integer,
  	\`occurred_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`subscription_id\`) REFERENCES \`subscriptions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`billed_invoice_id\`) REFERENCES \`invoices\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`usage_records_customer_idx\` ON \`usage_records\` (\`customer_id\`);`)
  await db.run(sql`CREATE INDEX \`usage_records_subscription_idx\` ON \`usage_records\` (\`subscription_id\`);`)
  await db.run(sql`CREATE INDEX \`usage_records_billed_invoice_idx\` ON \`usage_records\` (\`billed_invoice_id\`);`)
  await db.run(sql`CREATE INDEX \`usage_records_updated_at_idx\` ON \`usage_records\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`usage_records_created_at_idx\` ON \`usage_records\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`usage_records_id\` integer REFERENCES usage_records(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_usage_records_id_idx\` ON \`payload_locked_documents_rels\` (\`usage_records_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`usage_records\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`services_id\` integer,
  	\`products_id\` integer,
  	\`software_id\` integer,
  	\`testimonials_id\` integer,
  	\`posts_id\` integer,
  	\`authors_id\` integer,
  	\`leads_id\` integer,
  	\`referral_codes_id\` integer,
  	\`referrals_id\` integer,
  	\`plans_id\` integer,
  	\`partners_id\` integer,
  	\`faqs_id\` integer,
  	\`subscribers_id\` integer,
  	\`media_id\` integer,
  	\`help_articles_id\` integer,
  	\`projects_id\` integer,
  	\`data_requests_id\` integer,
  	\`customers_id\` integer,
  	\`orders_id\` integer,
  	\`subscriptions_id\` integer,
  	\`invoices_id\` integer,
  	\`transactions_id\` integer,
  	\`client_domains_id\` integer,
  	\`assets_id\` integer,
  	\`tickets_id\` integer,
  	\`coupons_id\` integer,
  	\`legal_pages_id\` integer,
  	\`case_studies_id\` integer,
  	\`quotes_id\` integer,
  	\`system_components_id\` integer,
  	\`incidents_id\` integer,
  	\`onboarding_id\` integer,
  	\`status_subscribers_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`software_id\`) REFERENCES \`software\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leads_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`referral_codes_id\`) REFERENCES \`referral_codes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`referrals_id\`) REFERENCES \`referrals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`plans_id\`) REFERENCES \`plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`partners_id\`) REFERENCES \`partners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`subscribers_id\`) REFERENCES \`subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`help_articles_id\`) REFERENCES \`help_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`data_requests_id\`) REFERENCES \`data_requests\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`customers_id\`) REFERENCES \`customers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`orders_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`subscriptions_id\`) REFERENCES \`subscriptions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`invoices_id\`) REFERENCES \`invoices\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`transactions_id\`) REFERENCES \`transactions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`client_domains_id\`) REFERENCES \`client_domains\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`assets_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tickets_id\`) REFERENCES \`tickets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`coupons_id\`) REFERENCES \`coupons\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`legal_pages_id\`) REFERENCES \`legal_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`quotes_id\`) REFERENCES \`quotes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`system_components_id\`) REFERENCES \`system_components\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`incidents_id\`) REFERENCES \`incidents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`onboarding_id\`) REFERENCES \`onboarding\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`status_subscribers_id\`) REFERENCES \`status_subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "services_id", "products_id", "software_id", "testimonials_id", "posts_id", "authors_id", "leads_id", "referral_codes_id", "referrals_id", "plans_id", "partners_id", "faqs_id", "subscribers_id", "media_id", "help_articles_id", "projects_id", "data_requests_id", "customers_id", "orders_id", "subscriptions_id", "invoices_id", "transactions_id", "client_domains_id", "assets_id", "tickets_id", "coupons_id", "legal_pages_id", "case_studies_id", "quotes_id", "system_components_id", "incidents_id", "onboarding_id", "status_subscribers_id", "redirects_id") SELECT "id", "order", "parent_id", "path", "users_id", "services_id", "products_id", "software_id", "testimonials_id", "posts_id", "authors_id", "leads_id", "referral_codes_id", "referrals_id", "plans_id", "partners_id", "faqs_id", "subscribers_id", "media_id", "help_articles_id", "projects_id", "data_requests_id", "customers_id", "orders_id", "subscriptions_id", "invoices_id", "transactions_id", "client_domains_id", "assets_id", "tickets_id", "coupons_id", "legal_pages_id", "case_studies_id", "quotes_id", "system_components_id", "incidents_id", "onboarding_id", "status_subscribers_id", "redirects_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_software_id_idx\` ON \`payload_locked_documents_rels\` (\`software_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`leads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_referral_codes_id_idx\` ON \`payload_locked_documents_rels\` (\`referral_codes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_referrals_id_idx\` ON \`payload_locked_documents_rels\` (\`referrals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`plans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_partners_id_idx\` ON \`payload_locked_documents_rels\` (\`partners_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_help_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`help_articles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_data_requests_id_idx\` ON \`payload_locked_documents_rels\` (\`data_requests_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_customers_id_idx\` ON \`payload_locked_documents_rels\` (\`customers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_subscriptions_id_idx\` ON \`payload_locked_documents_rels\` (\`subscriptions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_invoices_id_idx\` ON \`payload_locked_documents_rels\` (\`invoices_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_transactions_id_idx\` ON \`payload_locked_documents_rels\` (\`transactions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_client_domains_id_idx\` ON \`payload_locked_documents_rels\` (\`client_domains_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_assets_id_idx\` ON \`payload_locked_documents_rels\` (\`assets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tickets_id_idx\` ON \`payload_locked_documents_rels\` (\`tickets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_coupons_id_idx\` ON \`payload_locked_documents_rels\` (\`coupons_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_legal_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`legal_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_case_studies_id_idx\` ON \`payload_locked_documents_rels\` (\`case_studies_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_quotes_id_idx\` ON \`payload_locked_documents_rels\` (\`quotes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_system_components_id_idx\` ON \`payload_locked_documents_rels\` (\`system_components_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_incidents_id_idx\` ON \`payload_locked_documents_rels\` (\`incidents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_onboarding_id_idx\` ON \`payload_locked_documents_rels\` (\`onboarding_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_status_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`status_subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
}
