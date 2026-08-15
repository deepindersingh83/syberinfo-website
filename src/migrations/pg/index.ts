import * as migration_20260815_233557_initial_pg from './20260815_233557_initial_pg';

export const migrations = [
  {
    up: migration_20260815_233557_initial_pg.up,
    down: migration_20260815_233557_initial_pg.down,
    name: '20260815_233557_initial_pg'
  },
];
