import { openDB } from 'idb';

const DB_NAME = 'MediaStore';
const STORE_NAME = 'MediaFiles';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getMedia(url) {
  const db = await getDB();
  return await db.get(STORE_NAME, url);
}

export async function storeMedia(url, blob) {
  const db = await getDB();
  await db.put(STORE_NAME, blob, url);
}
