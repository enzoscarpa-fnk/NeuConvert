const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

// Cache séparé pour le quota (1 heure)
const quotaCache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

const API_KEY = process.env.EXCHANGE_API_KEY || '';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Fonction pour récupérer le quota (avec cache)
const getQuota = async () => {
    const cached = quotaCache.get('quota');
    if (cached) {
        console.log('📊 Quota depuis cache');
        return cached;
    }

    try {
        console.log('🌐 Appel API /quota');
        const response = await axios.get(`${BASE_URL}/${API_KEY}/quota`);

        const quota = {
            used: response.data.plan_quota - response.data.requests_remaining,
            limit: response.data.plan_quota,
            remaining: response.data.requests_remaining,
            refreshDay: response.data.refresh_day_of_month
        };

        quotaCache.set('quota', quota);
        return quota;
    } catch (error) {
        console.error('❌ Erreur quota:', error.message);
        // Retourne des valeurs par défaut en cas d'erreur
        return { used: 0, limit: 30000, remaining: null, refreshDay: null };
    }
};

app.get('/api/rates', async (req, res) => {
    try {
        const { from = 'JPY', to = 'EUR' } = req.query;
        const cacheKey = `${from}_${to}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            // Pour le cache, récupère le quota en arrière-plan (non-bloquant)
            const quota = await getQuota();
            return res.json({
                ...cached,
                cached: true,
                remaining: quota.remaining,
                limit: quota.limit
            });
        }

        // Appels en parallèle : taux + quota
        const [rateResponse, quota] = await Promise.all([
            axios.get(`${BASE_URL}/${API_KEY}/pair/${from}/${to}`),
            getQuota()
        ]);

        const data = {
            rate: rateResponse.data.conversion_rate,
            from,
            to,
            lastUpdate: rateResponse.data.time_last_update_utc,
            remaining: quota.remaining,
            limit: quota.limit
        };

        cache.set(cacheKey, data);
        res.json({ ...data, cached: false });

    } catch (error) {
        console.error('❌ Erreur API:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération du taux' });
    }
});

// Endpoint pour forcer le refresh du quota
app.get('/api/quota', async (req, res) => {
    try {
        // Force un nouveau fetch en vidant le cache
        quotaCache.del('quota');
        const quota = await getQuota();
        res.json(quota);
    } catch (error) {
        console.error('❌ Erreur quota:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération du quota' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
