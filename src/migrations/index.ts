import * as migration_20260621_091142_initial from './20260621_091142_initial';

export const migrations = [
  {
    up: migration_20260621_091142_initial.up,
    down: migration_20260621_091142_initial.down,
    name: '20260621_091142_initial'
  },
];
