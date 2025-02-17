import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/server', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.get('/api/rss/:team?', async (req, res) => {
    try {
        const { team } = req.params;
        const baseUrl = 'https://www.mlb.com/';
        const rssPath = team ? `${team}/feeds/news/rss.xml` : 'feeds/news/rss.xml';
        const rssUrl = `${baseUrl}${rssPath}`;

        console.log(rssUrl);

        const response = await axios.get(rssUrl);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

export default app;
