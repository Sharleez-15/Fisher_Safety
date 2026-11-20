require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ACCUWEATHER_API_KEY;
const BASE = 'https://dataservice.accuweather.com';
const cache = new Map();
const CACHE_MS = 5 * 60 * 1000;

app.use(express.static(path.join(__dirname, 'public')));

async function accu(endpoint) {
  const response = await fetch(`${BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Accept-Encoding': 'gzip,deflate'
    },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) {
    const error = new Error(`AccuWeather HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, accuWeatherConfigured: Boolean(API_KEY) });
});

app.get('/api/weather', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({ error: 'AccuWeather API key is not configured. Add it to the .env file and restart the server.' });
    }
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_MS) {
      return res.json({ ...cached.data, cached: true });
    }

    const location = await accu(`/locations/v1/cities/geoposition/search?q=${encodeURIComponent(`${lat},${lon}`)}&language=en-us`);
    if (!location || !location.Key) {
      return res.status(404).json({ error: 'AccuWeather could not identify this location.' });
    }
    const key = encodeURIComponent(location.Key);
    const [conditions, forecast] = await Promise.all([
      accu(`/currentconditions/v1/${key}?details=true&language=en-us`),
      accu(`/forecasts/v1/daily/5day/${key}?details=true&metric=true&language=en-us`)
    ]);
    const c = Array.isArray(conditions) ? conditions[0] : null;
    if (!c) throw new Error('AccuWeather returned no current observation.');

    const metric = value => value && Number.isFinite(Number(value.Value)) ? Number(value.Value) : null;
    const data = {
      area: location.LocalizedName || 'Selected area',
      locationKey: location.Key,
      weather: {
        temperature_c: metric(c.Temperature && c.Temperature.Metric),
        condition: c.WeatherText || 'Conditions unavailable',
        // Names below match the five weather cards in the browser app.
        visibility_km: metric(c.Visibility && c.Visibility.Metric),
        pressure_hpa: metric(c.Pressure && c.Pressure.Metric),
        wind_speed_kmh: metric(c.Wind && c.Wind.Speed && c.Wind.Speed.Metric),
        wind_gust_kmh: metric(c.WindGust && c.WindGust.Speed && c.WindGust.Speed.Metric),
        wind_direction: c.Wind && c.Wind.Direction ? c.Wind.Direction.Localized : null,
        wind_direction_degrees: c.Wind && c.Wind.Direction && Number.isFinite(Number(c.Wind.Direction.Degrees)) ? Number(c.Wind.Direction.Degrees) : null,
        relative_humidity: Number.isFinite(Number(c.RelativeHumidity)) ? Number(c.RelativeHumidity) : null,
        precipitation: c.HasPrecipitation ? 1 : 0,
        observation_time: c.LocalObservationDateTime || null
      },
      fiveDayForecast: forecast && forecast.DailyForecasts ? forecast.DailyForecasts : [],
      fetched: new Date().toISOString(),
      source: 'AccuWeather'
    };
    cache.set(cacheKey, { at: Date.now(), data });
    // Keep the in-memory cache bounded for long-running sessions.
    if (cache.size > 250) cache.delete(cache.keys().next().value);
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (error) {
    console.error('AccuWeather request failed:', error.message);
    const status = error.status === 401 || error.status === 403 || error.status === 429 ? error.status : 502;
    const message = status === 401
      ? 'AccuWeather rejected the API key (401). Check that the regenerated key is active.'
      : status === 403
        ? 'AccuWeather denied this endpoint (403). Check your subscription and API access.'
        : status === 429
          ? 'AccuWeather request limit reached (429). Wait before trying again.'
          : 'AccuWeather is temporarily unavailable. Check your connection and try again.';
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Fisher Safety running at http://localhost:${PORT}`);
  console.log(`AccuWeather API key: ${API_KEY ? 'configured' : 'NOT configured — add it to .env'}`);
});
