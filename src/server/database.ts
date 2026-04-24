import Database from 'better-sqlite3';

let db: Database.Database;

try {
  db = new Database('./database.sqlite');
} catch {
  db = new Database(':memory:');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS article_actions (
    article_id TEXT    NOT NULL,
    action     TEXT    NOT NULL,
    value      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (article_id, action)
  )
`);

export default db;
