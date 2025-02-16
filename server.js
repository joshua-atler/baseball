import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());

// const response = await axios.get('https://www.mlb.com/rockies/feeds/news/rss.xml');

app.get('/rss/:team?', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
