import { Router, Request, Response } from 'express';
import db from '../database';

type ActionRow = { action: string; value: number };

const router = Router();

const VALID_ACTIONS = new Set(['liked', 'bookmarked', 'inSpace', 'disliked']);

type ActionsMap = { liked: boolean; bookmarked: boolean; inSpace: boolean; disliked: boolean };

function getActions(articleId: string): ActionsMap {
  const rows = db
    .prepare('SELECT action, value FROM article_actions WHERE article_id = ?')
    .all(articleId) as ActionRow[];

  const result: ActionsMap = { liked: false, bookmarked: false, inSpace: false, disliked: false };
  for (const row of rows) {
    (result as Record<string, boolean>)[row.action] = row.value === 1;
  }
  return result;
}

/**
 * POST /api/actions
 * Body: { articleId, action, value }
 * 儲存單一 action 到 SQLite
 */
router.post('/', (req: Request, res: Response) => {
  const { articleId, action, value } = req.body;

  if (!articleId || !VALID_ACTIONS.has(action) || typeof value !== 'boolean') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // UPSERT — 有就更新，沒有就插入
  db.prepare(`
    INSERT INTO article_actions (article_id, action, value)
    VALUES (?, ?, ?)
    ON CONFLICT(article_id, action) DO UPDATE SET value = excluded.value
  `).run(String(articleId), action, value ? 1 : 0);

  res.json({ ok: true, articleId, action, value });
});

/**
 * GET /api/actions?articleIds=1,2,3
 * 批次取得多篇文章的 action 狀態
 */
router.get('/', (req: Request, res: Response) => {
  const ids = String(req.query.articleIds || '').split(',').filter(Boolean);
  const result: Record<string, ActionsMap> = {};
  for (const id of ids) {
    result[id] = getActions(id);
  }
  res.json(result);
});

export default router;
