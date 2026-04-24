import { Router, Request, Response } from 'express';
import { DUMMY_ARTICLES } from '../../data/news';

const router = Router();

/**
 * GET /api/news
 * Query: page, limit, category, categories
 */
router.get('/', (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(String(req.query.page))  || 1);
  const limit = Math.min(24, Math.max(1, parseInt(String(req.query.limit)) || 12));

  const category       = req.query.category as string | undefined;
  const categoriesParam = req.query.categories as string | undefined;

  const delay = 200 + Math.random() * 300;

  try {
    let articles = [...DUMMY_ARTICLES];

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category === category);
    }

    if (categoriesParam) {
      const cats = categoriesParam.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length > 0) {
        articles = articles.filter(a => cats.includes(a.category));
      }
    }

    articles.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const total = articles.length;
    const start = (page - 1) * limit;
    const end   = start + limit;

    res.json({
      articles: articles.slice(start, end),
      page,
      limit,
      total,
      hasMore: end < total,
    });
  } catch (err) {
    console.error('[news route error]', err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
