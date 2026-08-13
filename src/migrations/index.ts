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
    name: '20260813_183200_sales_crm'
  },
];
