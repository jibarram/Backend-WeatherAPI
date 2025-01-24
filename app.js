import express from 'express';
import fetch from 'node-fetch';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redisUrl);

const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Rate limit exceeded. Try again later.'
    },
});

app.use(limiter);

app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    const unitGroup = req.query.unitGroup || 'us';

    const validUnitGroups = ['metric', 'us', 'uk'];
    if (!validUnitGroups.includes(unitGroup)) {
        return res.status(400).json({ error: 'The unitGroup parameter must be one of the following: metric, us, uk.' });
    }

    const apiKey = process.env.VISUAL_CROSSING_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured.' });
    }

    const cacheKey = `weather:${city}:${unitGroup}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Data retrieved from cache');
            return res.json(JSON.parse(cachedData));
        }

        const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unitGroup}&include=days&key=${apiKey}&contentType=json`;
        console.log(`Calling API: ${apiUrl}`);

        const response = await fetch(apiUrl, { method: 'GET' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error from Visual Crossing API: ${errorText}`);
        }

        const data = await response.json();

        const result = {
            city: data.resolvedAddress,
            currentTemperature: `${data.days[0].temp}${unitGroup === 'us' ? '°F' : '°C'}`,
            minTemperature: `${data.days[0].tempmin}${unitGroup === 'us' ? '°F' : '°C'}`,
            maxTemperature: `${data.days[0].tempmax}${unitGroup === 'us' ? '°F' : '°C'}`,
            description: data.days[0].conditions,
            humidity: `${data.days[0].humidity}%`
        };

        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 12 * 60 * 60);

        console.log('Data retrieved from API and stored in cache');
        res.json(result);
    } catch (error) {
        console.error(error);

        if (error.message.includes('Visual Crossing API')) {
            return res.status(503).json({ error: 'The Visual Crossing API service is unavailable. Try again later.' });
        }

        res.status(500).json({ error: 'Could not retrieve weather information.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
