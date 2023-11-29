import { IndexedDb, StoreIndexDb } from './common';

export async function deleteDatabase(name: string) {
  const index = StoreIndexDb.name(name);
  await IndexedDb.delete(name);
  await IndexedDb.delete(index);
  console.info(`🐷 DELETED: ${name} | ${index}`);
}

/**
 * DevHarness "Spec" databases.
 */
export const SpecDb = {
  name: 'dev.spec',
  deleteDatabase: () => deleteDatabase(SpecDb.name),
} as const;

export const UnitDb = {
  name: 'dev.test',
  deleteDatabase: () => deleteDatabase(UnitDb.name),
} as const;

export const IndexDb = {
  name: 'dev.test.IndexDb',
  deleteDatabase: () => deleteDatabase(IndexDb.name),
} as const;

/**
 * Unit-test databases.
 */
export const TestDb = {
  Spec: SpecDb,
  Unit: UnitDb,
  Index: IndexDb,
  deleteDatabase,
  async deleteDatabases() {
    await SpecDb.deleteDatabase();
    await UnitDb.deleteDatabase();
    await IndexDb.deleteDatabase();
  },
} as const;