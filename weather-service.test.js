'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createWeatherService}=require('./weather-service');
const ok=body=>({ok:true,json:async()=>body});
const sample={
  Temperature:{Metric:{Value:28}},Visibility:{Metric:{Value:4.2}},
  Pressure:{Metric:{Value:1007}},Wind:{Speed:{Metric:{Value:22}},Direction:{Localized:'SW',Degrees:225}},
  WindGust:{Speed:{Metric:{Value:34}}},RelativeHumidity:87,HasPrecipitation:false,
  LocalObservationDateTime:'2026-11-20T10:00:00+06:00'
};
test('uses AccuWeather apikey parameter, maps measurements and caches',async()=>{
 const urls=[];
 const mockFetch=async url=>{
   urls.push(new URL(String(url)));
   if(url.pathname.includes('geoposition'))return ok({Key:'123',LocalizedName:'Coast'});
   if(url.pathname.includes('currentconditions'))return ok([sample]);
   return ok({DailyForecasts:[]});
 };
 const svc=createWeatherService({apiKey:'test-secret',fetchImpl:mockFetch,now:()=>Date.parse('2026-11-20T05:00:00Z')});
 const first=await svc.getWeather(22.2,90.6);
 assert.equal(first.weather.visibility_km,4.2);
 assert.equal(first.weather.pressure_hpa,1007);
 assert.equal(first.weather.wind_speed_kmh,22);
 assert.equal(first.weather.wind_gust_kmh,34);
 assert.equal(first.weather.wind_direction_degrees,225);
 assert.equal(first.weather.observation_time,sample.LocalObservationDateTime);
 assert.equal(first.cached,false);
 assert.equal((await svc.getWeather(22.2,90.6)).cached,true);
 assert.equal(urls.length,3);
 for(const url of urls){assert.equal(url.searchParams.get('apikey'),'test-secret');assert.equal(url.host,'dataservice.accuweather.com');}
});
test('unavailable weather values stay null, not zero',async()=>{
 const mockFetch=async url=>url.pathname.includes('geoposition')?ok({Key:'1'}):url.pathname.includes('currentconditions')?ok([{}]):ok({});
 const result=await createWeatherService({apiKey:'key',fetchImpl:mockFetch}).getWeather(20,90);
 assert.equal(result.weather.visibility_km,null);
 assert.equal(result.weather.wind_direction_degrees,null);
 assert.equal(result.weather.precipitation,null);
});
test('missing key fails closed',async()=>{
 await assert.rejects(createWeatherService({apiKey:''}).getWeather(22,90),{status:503});
});
test('upstream errors preserve status code',async()=>{
 const mockFetch=async()=>({ok:false,status:429});
 await assert.rejects(createWeatherService({apiKey:'key',fetchImpl:mockFetch}).getWeather(22,90),{status:429});
});
