'use strict';
const BASE = 'https://dataservice.accuweather.com';
const CACHE_MS = 5 * 60 * 1000;
function createWeatherService({ apiKey, fetchImpl = fetch, now = () => Date.now() }) {
  const cache = new Map();
  async function accu(endpoint, params={}) {
    const url = new URL(endpoint, BASE);
    for (const [name,value] of Object.entries(params)) url.searchParams.set(name,String(value));
    url.searchParams.set('apikey',apiKey);
    const response = await fetchImpl(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
    if(!response.ok){const error=new Error('AccuWeather HTTP '+response.status);error.status=response.status;throw error;}
    return response.json();
  }
  async function getWeather(lat,lon) {
    if(!apiKey || apiKey.includes('PASTE_YOUR_')){const error=new Error('AccuWeather API key is not configured.');error.status=503;throw error;}
    const cacheKey=lat.toFixed(3)+','+lon.toFixed(3);
    const cached=cache.get(cacheKey);
    if(cached && now()-cached.at<CACHE_MS)return {...cached.data,cached:true};
    const location=await accu('/locations/v1/cities/geoposition/search',{q:lat+','+lon,language:'en-us'});
    if(!location?.Key){const error=new Error('AccuWeather could not identify this location.');error.status=404;throw error;}
    const key=encodeURIComponent(location.Key);
    const [conditions,forecast]=await Promise.all([
      accu('/currentconditions/v1/'+key,{details:'true',language:'en-us'}),
      accu('/forecasts/v1/daily/5day/'+key,{details:'true',metric:'true',language:'en-us'})
    ]);
    const c=Array.isArray(conditions)?conditions[0]:null;
    if(!c)throw new Error('AccuWeather returned no current observation.');
    const metric=obj=>obj && Number.isFinite(Number(obj.Value))?Number(obj.Value):null;
    const data={
      area:location.LocalizedName||'Selected area',locationKey:location.Key,
      weather:{
        temperature_c:metric(c.Temperature?.Metric),condition:c.WeatherText||'Conditions unavailable',
        visibility_km:metric(c.Visibility?.Metric),pressure_hpa:metric(c.Pressure?.Metric),
        wind_speed_kmh:metric(c.Wind?.Speed?.Metric),wind_gust_kmh:metric(c.WindGust?.Speed?.Metric),
        wind_direction:c.Wind?.Direction?.Localized||null,
        wind_direction_degrees:c.Wind?.Direction?.Degrees!=null && Number.isFinite(Number(c.Wind.Direction.Degrees))?Number(c.Wind.Direction.Degrees):null,
        relative_humidity:c.RelativeHumidity!=null && Number.isFinite(Number(c.RelativeHumidity))?Number(c.RelativeHumidity):null,
        precipitation:c.HasPrecipitation===true?1:c.HasPrecipitation===false?0:null,
        observation_time:c.LocalObservationDateTime||null
      },
      fiveDayForecast:Array.isArray(forecast?.DailyForecasts)?forecast.DailyForecasts:[],
      fetched:new Date(now()).toISOString(),source:'AccuWeather',cached:false
    };
    cache.set(cacheKey,{at:now(),data});
    if(cache.size>250)cache.delete(cache.keys().next().value);
    return data;
  }
  return {getWeather};
}
module.exports={createWeatherService};
