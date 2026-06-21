import * as migration_20260621_091142_initial from './20260621_091142_initial';
import * as migration_20260621_182658_round2 from './20260621_182658_round2';
import * as migration_20260621_191451_round3 from './20260621_191451_round3';
import * as migration_20260621_192637_round4_plans from './20260621_192637_round4_plans';

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
    name: '20260621_192637_round4_plans'
  },
];
