import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import crypto from 'node:crypto';
import { normalizeSandboxUniverse } from '../.work/sandbox-schema.mjs';

export function createSandboxStore(dataDir) {
  const dbPath = path.join(dataDir, 'sandbox-saves.sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sandbox_saves (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      preset TEXT NOT NULL DEFAULT 'custom',
      body_count INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const listStmt = db.prepare('SELECT id, name, preset, body_count, created_at FROM sandbox_saves ORDER BY created_at DESC LIMIT 40');
  const getStmt = db.prepare('SELECT id, name, preset, body_count, payload, created_at FROM sandbox_saves WHERE id = ?');
  const insStmt = db.prepare('INSERT OR REPLACE INTO sandbox_saves (id, name, preset, body_count, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  const delStmt = db.prepare('DELETE FROM sandbox_saves WHERE id = ?');
  const countStmt = db.prepare('SELECT COUNT(*) as c FROM sandbox_saves');
  const trimStmt = db.prepare('DELETE FROM sandbox_saves WHERE id IN (SELECT id FROM sandbox_saves ORDER BY created_at ASC LIMIT ?)');

  return {
    list() {
      return listStmt.all();
    },
    get(id) {
      const row = getStmt.get(String(id || '').slice(0, 64));
      if (!row) return null;
      return { ...row, data: JSON.parse(row.payload) };
    },
    save({ name, preset = 'custom', data }) {
      const cleanName = String(name || '我的宇宙').trim().slice(0, 48) || '我的宇宙';
      const cleanPreset = String(preset || 'custom').trim().slice(0, 32);
      data = normalizeSandboxUniverse(data);
      const payload = JSON.stringify(data);
      if (Buffer.byteLength(payload, 'utf8') > 262144) {
        throw Object.assign(new Error('存档体积过大'), { statusCode: 400 });
      }
      const id = 'sb_' + crypto.randomBytes(6).toString('hex');
      const now = new Date().toISOString();
      insStmt.run(id, cleanName, cleanPreset, data.bodies.length, payload, now);
      const total = countStmt.get().c;
      if (total > 60) trimStmt.run(total - 60);
      return { id, name: cleanName, preset: cleanPreset, body_count: data.bodies.length, created_at: now };
    },
    remove(id) {
      const info = delStmt.run(String(id || '').slice(0, 64));
      return info.changes > 0;
    },
    close() {
      try { db.close(); } catch {}
    }
  };
}
