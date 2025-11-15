const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

// CORS doit être AVANT les routes
app.use(cors());
app.use(express.json());

const API_KEY = process.env.EXCHANGE_API_KEY || '';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

app.get('/api/rates', async (req, res) => {
    try {
        const { from = 'JPY', to = 'EUR' } = req.query;
        const cacheKey = `${from}_${to}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json({ ...cached, cached: true });
        }

        const response = await axios.get(
            `${BASE_URL}/${API_KEY}/pair/${from}/${to}`
        );

        const data = {
            rate: response.data.conversion_rate,
            from,
            to,
            lastUpdate: response.data.time_last_update_utc
        };

        cache.set(cacheKey, data);
        res.json({ ...data, cached: false });

    } catch (error) {
        console.error('Erreur API:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération du taux' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
