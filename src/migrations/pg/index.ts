import * as migration_20260815_233557_initial_pg from './20260815_233557_initial_pg';
import * as migration_20260816_024135_phase15_quote_paid from './20260816_024135_phase15_quote_paid';
import * as migration_20260816_035707_phase16_assets from './20260816_035707_phase16_assets';
import * as migration_20260816_042654_phase18_authors from './20260816_042654_phase18_authors';
import * as migration_20260816_043405_phase19_reviews from './20260816_043405_phase19_reviews';

export const migrations = [
  {
    up: migration_20260815_233557_initial_pg.up,
    down: migration_20260815_233557_initial_pg.down,
    name: '20260815_233557_initial_pg',
  },
  {
    up: migration_20260816_024135_phase15_quote_paid.up,
    down: migration_20260816_024135_phase15_quote_paid.down,
    name: '20260816_024135_phase15_quote_paid',
  },
  {
    up: migration_20260816_035707_phase16_assets.up,
    down: migration_20260816_035707_phase16_assets.down,
    name: '20260816_035707_phase16_assets',
  },
  {
    up: migration_20260816_042654_phase18_authors.up,
    down: migration_20260816_042654_phase18_authors.down,
    name: '20260816_042654_phase18_authors',
  },
  {
    up: migration_20260816_043405_phase19_reviews.up,
    down: migration_20260816_043405_phase19_reviews.down,
    name: '20260816_043405_phase19_reviews'
  },
];
