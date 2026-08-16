import * as migration_20260621_091142_initial from './20260621_091142_initial';
import * as migration_20260621_182658_round2 from './20260621_182658_round2';
import * as migration_20260621_191451_round3 from './20260621_191451_round3';
import * as migration_20260621_192637_round4_plans from './20260621_192637_round4_plans';
import * as migration_20260621_193826_round5_extras from './20260621_193826_round5_extras';
import * as migration_20260621_212859_phase1 from './20260621_212859_phase1';
import * as migration_20260622_155315_media from './20260622_155315_media';
import * as migration_20260622_170310_service_pricing from './20260622_170310_service_pricing';
import * as migration_20260622_172425_billing_phase0 from './20260622_172425_billing_phase0';
import * as migration_20260719_184322_software_catalog from './20260719_184322_software_catalog';
import * as migration_20260813_151651_billing_dunning from './20260813_151651_billing_dunning';
import * as migration_20260813_152816_seo_and_redirects from './20260813_152816_seo_and_redirects';
import * as migration_20260813_181950_service_delivery from './20260813_181950_service_delivery';
import * as migration_20260813_183200_sales_crm from './20260813_183200_sales_crm';
import * as migration_20260813_190228_rich_body from './20260813_190228_rich_body';
import * as migration_20260813_200136_onboarding_status_subs from './20260813_200136_onboarding_status_subs';
import * as migration_20260815_093013_site_settings from './20260815_093013_site_settings';
import * as migration_20260815_095614_homepage_content from './20260815_095614_homepage_content';
import * as migration_20260815_105304_case_studies from './20260815_105304_case_studies';
import * as migration_20260815_114149_legal_pages from './20260815_114149_legal_pages';
import * as migration_20260815_115028_page_content from './20260815_115028_page_content';
import * as migration_20260815_163058_phase13_page_body from './20260815_163058_phase13_page_body';
import * as migration_20260816_024155_phase15_quote_paid from './20260816_024155_phase15_quote_paid';
import * as migration_20260816_035725_phase16_assets from './20260816_035725_phase16_assets';
import * as migration_20260816_042705_phase18_authors from './20260816_042705_phase18_authors';
import * as migration_20260816_043415_phase19_reviews from './20260816_043415_phase19_reviews';
import * as migration_20260816_055346_phase21_referrals from './20260816_055346_phase21_referrals';
import * as migration_20260816_060014_phase22_usage from './20260816_060014_phase22_usage';

export const migrations = [
  {
    up: migration_20260621_091142_initial.up,
    down: migration_20260621_091142_initial.down,
    name: '20260621_091142_initial',
  },
  {
    up: migration_20260621_182658_round2.up,
    down: migration_20260621_182658_round2.down,
    name: '20260621_182658_round2',
  },
  {
    up: migration_20260621_191451_round3.up,
    down: migration_20260621_191451_round3.down,
    name: '20260621_191451_round3',
  },
  {
    up: migration_20260621_192637_round4_plans.up,
    down: migration_20260621_192637_round4_plans.down,
    name: '20260621_192637_round4_plans',
  },
  {
    up: migration_20260621_193826_round5_extras.up,
    down: migration_20260621_193826_round5_extras.down,
    name: '20260621_193826_round5_extras',
  },
  {
    up: migration_20260621_212859_phase1.up,
    down: migration_20260621_212859_phase1.down,
    name: '20260621_212859_phase1',
  },
  {
    up: migration_20260622_155315_media.up,
    down: migration_20260622_155315_media.down,
    name: '20260622_155315_media',
  },
  {
    up: migration_20260622_170310_service_pricing.up,
    down: migration_20260622_170310_service_pricing.down,
    name: '20260622_170310_service_pricing',
  },
  {
    up: migration_20260622_172425_billing_phase0.up,
    down: migration_20260622_172425_billing_phase0.down,
    name: '20260622_172425_billing_phase0',
  },
  {
    up: migration_20260719_184322_software_catalog.up,
    down: migration_20260719_184322_software_catalog.down,
    name: '20260719_184322_software_catalog',
  },
  {
    up: migration_20260813_151651_billing_dunning.up,
    down: migration_20260813_151651_billing_dunning.down,
    name: '20260813_151651_billing_dunning',
  },
  {
    up: migration_20260813_152816_seo_and_redirects.up,
    down: migration_20260813_152816_seo_and_redirects.down,
    name: '20260813_152816_seo_and_redirects',
  },
  {
    up: migration_20260813_181950_service_delivery.up,
    down: migration_20260813_181950_service_delivery.down,
    name: '20260813_181950_service_delivery',
  },
  {
    up: migration_20260813_183200_sales_crm.up,
    down: migration_20260813_183200_sales_crm.down,
    name: '20260813_183200_sales_crm',
  },
  {
    up: migration_20260813_190228_rich_body.up,
    down: migration_20260813_190228_rich_body.down,
    name: '20260813_190228_rich_body',
  },
  {
    up: migration_20260813_200136_onboarding_status_subs.up,
    down: migration_20260813_200136_onboarding_status_subs.down,
    name: '20260813_200136_onboarding_status_subs',
  },
  {
    up: migration_20260815_093013_site_settings.up,
    down: migration_20260815_093013_site_settings.down,
    name: '20260815_093013_site_settings',
  },
  {
    up: migration_20260815_095614_homepage_content.up,
    down: migration_20260815_095614_homepage_content.down,
    name: '20260815_095614_homepage_content',
  },
  {
    up: migration_20260815_105304_case_studies.up,
    down: migration_20260815_105304_case_studies.down,
    name: '20260815_105304_case_studies',
  },
  {
    up: migration_20260815_114149_legal_pages.up,
    down: migration_20260815_114149_legal_pages.down,
    name: '20260815_114149_legal_pages',
  },
  {
    up: migration_20260815_115028_page_content.up,
    down: migration_20260815_115028_page_content.down,
    name: '20260815_115028_page_content',
  },
  {
    up: migration_20260815_163058_phase13_page_body.up,
    down: migration_20260815_163058_phase13_page_body.down,
    name: '20260815_163058_phase13_page_body',
  },
  {
    up: migration_20260816_024155_phase15_quote_paid.up,
    down: migration_20260816_024155_phase15_quote_paid.down,
    name: '20260816_024155_phase15_quote_paid',
  },
  {
    up: migration_20260816_035725_phase16_assets.up,
    down: migration_20260816_035725_phase16_assets.down,
    name: '20260816_035725_phase16_assets',
  },
  {
    up: migration_20260816_042705_phase18_authors.up,
    down: migration_20260816_042705_phase18_authors.down,
    name: '20260816_042705_phase18_authors',
  },
  {
    up: migration_20260816_043415_phase19_reviews.up,
    down: migration_20260816_043415_phase19_reviews.down,
    name: '20260816_043415_phase19_reviews',
  },
  {
    up: migration_20260816_055346_phase21_referrals.up,
    down: migration_20260816_055346_phase21_referrals.down,
    name: '20260816_055346_phase21_referrals',
  },
  {
    up: migration_20260816_060014_phase22_usage.up,
    down: migration_20260816_060014_phase22_usage.down,
    name: '20260816_060014_phase22_usage'
  },
];
