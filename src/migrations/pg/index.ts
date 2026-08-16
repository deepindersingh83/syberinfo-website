import * as migration_20260815_233557_initial_pg from './20260815_233557_initial_pg';
import * as migration_20260816_024135_phase15_quote_paid from './20260816_024135_phase15_quote_paid';

export const migrations = [
  {
    up: migration_20260815_233557_initial_pg.up,
    down: migration_20260815_233557_initial_pg.down,
    name: '20260815_233557_initial_pg',
  },
  {
    up: migration_20260816_024135_phase15_quote_paid.up,
    down: migration_20260816_024135_phase15_quote_paid.down,
    name: '20260816_024135_phase15_quote_paid'
  },
];
