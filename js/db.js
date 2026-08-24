/*!
 * PizzaAlkimista — db.js
 * IndexedDB wrapper a mentett receptek tárolásához.
 */
const PizzaDB = (() => {
  'use strict';

  const DB_NAME = 'pizzaalkimista';
  const DB_VERSION = 1;
  const STORE = 'recipes';
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function tx(mode) {
    const db = await open();
    return db.transaction(STORE, mode).objectStore(STORE);
  }

  async function save(recipe) {
    const store = await tx('readwrite');
    const record = {
      id: recipe.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)),
      name: recipe.name,
      input: recipe.input,
      result: recipe.result,
      notes: recipe.notes || '',
      createdAt: recipe.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  }

  async function remove(id) {
    const store = await tx('readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function getAll() {
    const store = await tx('readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result.sort((a, b) => b.createdAt - a.createdAt));
      req.onerror = () => reject(req.error);
    });
  }

  async function get(id) {
    const store = await tx('readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  return { save, remove, getAll, get };
})();
