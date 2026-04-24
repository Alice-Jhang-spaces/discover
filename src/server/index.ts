import express from 'express';
import cors    from 'cors';
import newsRouter    from './routes/news';
import actionsRouter from './routes/actions';

const app  = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/news',    newsRouter);
app.use('/api/actions', actionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`  GET  /api/news?page=1&limit=12`);
  console.log(`  POST /api/actions`);
  console.log(`  GET  /api/actions?articleIds=1,2,3`);
});
