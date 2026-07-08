"use client";

import type {
  QueuedCheckIn,
  RosterEntry,
} from "@/components/modules/checkin/schema";

/**
 * IndexedDB persistence for the validator's offline session (JIKU-25). Two stores:
 * `roster` holds one pre-synced guest/ticket list per validator link, and `queue`
 * holds check-ins captured offline until they sync. Everything is keyed by the
 * link token, and saving a roster clears any other link's roster so one event's
 * guest list never leaks into another's offline session.
 */
const DB_NAME = "jiku-validator";
const DB_VERSION = 1;
const ROSTER_STORE = "roster";
const QUEUE_STORE = "queue";

interface RosterRecord {
  token: string;
  entries: RosterEntry[];
  syncedAt: string;
}

interface QueueRecord extends QueuedCheckIn {
  token: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ROSTER_STORE)) {
        db.createObjectStore(ROSTER_STORE, { keyPath: "token" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        store.createIndex("token", "token", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRoster(token: string, entries: RosterEntry[]): Promise<string> {
  const db = await openDb();
  const syncedAt = new Date().toISOString();
  const tx = db.transaction(ROSTER_STORE, "readwrite");
  const store = tx.objectStore(ROSTER_STORE);
  // Scope isolation: drop every other link's roster before storing this one.
  const keys = await promisify(store.getAllKeys());
  keys
    .filter((key) => key !== token)
    .forEach((key) => store.delete(key));
  store.put({ token, entries, syncedAt } satisfies RosterRecord);
  await txDone(tx);
  db.close();
  return syncedAt;
}

export async function loadRoster(
  token: string,
): Promise<{ entries: RosterEntry[]; syncedAt: string } | null> {
  const db = await openDb();
  const store = db.transaction(ROSTER_STORE, "readonly").objectStore(ROSTER_STORE);
  const record = (await promisify(store.get(token))) as RosterRecord | undefined;
  db.close();
  return record ? { entries: record.entries, syncedAt: record.syncedAt } : null;
}

export async function enqueueCheckIn(token: string, item: QueuedCheckIn): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).put({ ...item, token } satisfies QueueRecord);
  await txDone(tx);
  db.close();
}

export async function loadQueue(token: string): Promise<QueuedCheckIn[]> {
  const db = await openDb();
  const index = db
    .transaction(QUEUE_STORE, "readonly")
    .objectStore(QUEUE_STORE)
    .index("token");
  const records = (await promisify(index.getAll(token))) as QueueRecord[];
  db.close();
  return records.map((record) => ({
    id: record.id,
    ticketCode: record.ticketCode,
    scannedAt: record.scannedAt,
    guestName: record.guestName,
  }));
}

export async function removeQueued(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDb();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  ids.forEach((id) => store.delete(id));
  await txDone(tx);
  db.close();
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
