import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/rss/:team?', async (req, res) => {
    try {
        const { team } = req.params;

        const baseUrl = 'https://www.mlb.com/';
        const rssPath = team ? `${team}/feeds/news/rss.xml` : 'feeds/news/rss.xml';
        const rssUrl = `${baseUrl}${rssPath}`;
        const response = await axios.get(rssUrl);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

if (process.env.VITE_LOCAL === 'LOCAL') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
