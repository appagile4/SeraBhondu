import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Crash-proof persistent storage adapter for Serabondhu.
 * - Hardware-backed secure storage using expo-secure-store on iOS/Android.
 * - Handles chunking for payloads > 1800 bytes.
 * - Falls back to memory cache / localStorage so the app NEVER crashes on startup.
 */

const memoryStore = new Map<string, string>();
const CHUNK_SIZE = 1800;

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const storage = {
  /**
   * Retrieve a string value by key
   */
  async getItem(key: string): Promise<string | null> {
    const safeKey = sanitizeKey(key);

    // Web localStorage
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        const val = window.localStorage.getItem(safeKey);
        if (val !== null) return val;
      } catch {}
    }

    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (!isAvailable) {
        return memoryStore.get(safeKey) ?? null;
      }

      // Check if value was stored in chunks
      const chunkCountStr = await SecureStore.getItemAsync(`${safeKey}__chunks`);
      if (chunkCountStr) {
        const count = parseInt(chunkCountStr, 10) || 0;
        let combined = "";
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${safeKey}__c_${i}`);
          if (chunk) combined += chunk;
        }
        if (combined) {
          memoryStore.set(safeKey, combined);
          return combined;
        }
      }

      // Regular single item
      const val = await SecureStore.getItemAsync(safeKey);
      if (val !== null) {
        memoryStore.set(safeKey, val);
        return val;
      }
    } catch {
      // Non-fatal, fallback to memory store
    }

    return memoryStore.get(safeKey) ?? null;
  },

  /**
   * Save a string value by key
   */
  async setItem(key: string, value: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    const strVal = String(value);
    memoryStore.set(safeKey, strVal);

    // Web localStorage
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(safeKey, strVal);
      } catch {}
      return;
    }

    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (!isAvailable) return;

      if (strVal.length <= CHUNK_SIZE) {
        // Remove any old chunks if previously stored as chunks
        try {
          const oldChunkCountStr = await SecureStore.getItemAsync(`${safeKey}__chunks`);
          if (oldChunkCountStr) {
            const count = parseInt(oldChunkCountStr, 10) || 0;
            for (let i = 0; i < count; i++) {
              await SecureStore.deleteItemAsync(`${safeKey}__c_${i}`);
            }
            await SecureStore.deleteItemAsync(`${safeKey}__chunks`);
          }
        } catch {}

        await SecureStore.setItemAsync(safeKey, strVal);
      } else {
        // Chunk storage for large payloads (e.g. favourite items list)
        const chunkCount = Math.ceil(strVal.length / CHUNK_SIZE);
        for (let i = 0; i < chunkCount; i++) {
          const chunk = strVal.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          await SecureStore.setItemAsync(`${safeKey}__c_${i}`, chunk);
        }
        await SecureStore.setItemAsync(`${safeKey}__chunks`, String(chunkCount));
        try {
          await SecureStore.deleteItemAsync(safeKey);
        } catch {}
      }
    } catch (err) {
      console.warn(`[Serabondhu Storage] setItem non-fatal warning for "${key}":`, err);
    }
  },

  /**
   * Remove a value by key
   */
  async removeItem(key: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    memoryStore.delete(safeKey);

    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(safeKey);
      } catch {}
      return;
    }

    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (!isAvailable) return;

      try {
        const chunkCountStr = await SecureStore.getItemAsync(`${safeKey}__chunks`);
        if (chunkCountStr) {
          const count = parseInt(chunkCountStr, 10) || 0;
          for (let i = 0; i < count; i++) {
            await SecureStore.deleteItemAsync(`${safeKey}__c_${i}`);
          }
          await SecureStore.deleteItemAsync(`${safeKey}__chunks`);
        }
      } catch {}

      await SecureStore.deleteItemAsync(safeKey);
    } catch (err) {
      console.warn(`[Serabondhu Storage] removeItem non-fatal warning for "${key}":`, err);
    }
  },

  /**
   * Clear all memory items
   */
  async clear(): Promise<void> {
    memoryStore.clear();
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {}
    }
  },

  /**
   * Multi-get compatibility
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return Promise.all(
      keys.map(async (k) => [k, await this.getItem(k)] as [string, string | null])
    );
  },

  /**
   * Multi-remove compatibility
   */
  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.removeItem(k)));
  },
};

export default storage;
