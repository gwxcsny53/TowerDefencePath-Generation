import { PROJECT_PERSISTENCE_SCHEMA_VERSION, ProjectPersistenceError } from './ProjectPersistence';
import type { PersistedProjectState, ProjectRepository } from './ProjectPersistence';
import { PersistedProjectStateSchema } from './schema';

const DATABASE_NAME = 'tower-defense-path-editor';
const DATABASE_VERSION = 1;
const PROJECT_STORE_NAME = 'projects';

interface ProjectRecord extends PersistedProjectState {
  readonly projectId: string;
}

let databasePromise: Promise<IDBDatabase> | null = null;

export const indexedDbProjectRepository: ProjectRepository = {
  async load(projectId) {
    const database = await openDatabase();
    const record = await readProjectRecord(database, projectId);
    if (record === undefined) return null;
    const result = PersistedProjectStateSchema.safeParse(record);
    if (result.success) return result.data;
    const code =
      typeof record === 'object' &&
      record !== null &&
      'schemaVersion' in record &&
      record.schemaVersion !== PROJECT_PERSISTENCE_SCHEMA_VERSION
        ? 'unsupported-version'
        : 'invalid-data';
    throw new ProjectPersistenceError(code, 'Stored project data is invalid.', result.error);
  },
  async save(state) {
    const result = PersistedProjectStateSchema.safeParse(state);
    if (!result.success)
      throw new ProjectPersistenceError(
        'invalid-data',
        'Project data cannot be persisted.',
        result.error,
      );
    const database = await openDatabase();
    await writeProjectRecord(database, { ...result.data, projectId: result.data.project.id });
  },
  async delete(projectId) {
    const database = await openDatabase();
    await deleteProjectRecord(database, projectId);
  },
};

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise !== null) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => {
      databasePromise = null;
      reject(
        new ProjectPersistenceError(
          'open-failed',
          'Unable to open project storage.',
          request.error,
        ),
      );
    };
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PROJECT_STORE_NAME))
        request.result.createObjectStore(PROJECT_STORE_NAME, { keyPath: 'projectId' });
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        if (databasePromise !== null) databasePromise = null;
      };
      resolve(database);
    };
  });
  return databasePromise;
}

function readProjectRecord(database: IDBDatabase, projectId: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROJECT_STORE_NAME, 'readonly');
    const request = transaction.objectStore(PROJECT_STORE_NAME).get(projectId);
    request.onerror = () =>
      reject(
        new ProjectPersistenceError(
          'read-failed',
          'Unable to read project storage.',
          request.error,
        ),
      );
    request.onsuccess = () => resolve(request.result);
    transaction.onerror = () =>
      reject(
        new ProjectPersistenceError(
          'read-failed',
          'Unable to read project storage.',
          transaction.error,
        ),
      );
    transaction.onabort = () =>
      reject(
        new ProjectPersistenceError(
          'read-failed',
          'Project storage read was aborted.',
          transaction.error,
        ),
      );
  });
}

function writeProjectRecord(database: IDBDatabase, record: ProjectRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROJECT_STORE_NAME, 'readwrite');
    transaction.objectStore(PROJECT_STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        new ProjectPersistenceError(
          'write-failed',
          'Unable to save project storage.',
          transaction.error,
        ),
      );
    transaction.onabort = () =>
      reject(
        new ProjectPersistenceError(
          'write-failed',
          'Project storage save was aborted.',
          transaction.error,
        ),
      );
  });
}

function deleteProjectRecord(database: IDBDatabase, projectId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROJECT_STORE_NAME, 'readwrite');
    transaction.objectStore(PROJECT_STORE_NAME).delete(projectId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        new ProjectPersistenceError(
          'write-failed',
          'Unable to delete project storage.',
          transaction.error,
        ),
      );
    transaction.onabort = () =>
      reject(
        new ProjectPersistenceError(
          'write-failed',
          'Project storage deletion was aborted.',
          transaction.error,
        ),
      );
  });
}
