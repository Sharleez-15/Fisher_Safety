'use strict';
require('dotenv').config();
const express=require('express');
const path=require('path');
const {createWeatherService}=require('./weather-service');
function createApp({apiKey=process.env.ACCUWEATHER_API_KEY,fetchImpl}={}){
  const app=express();
  const weather=createWeatherService({apiKey,...(fetchImpl?{fetchImpl}:{})});
  app.disable('x-powered-by');
  // Existing GitHub project has index.html at root. Serve it until a reviewed UI migration.
  app.get('/',(_req,res)=>res.sendFile(path.join(__dirname,'index.html')));
  app.use(express.static(path.join(__dirname,'public')));
  app.get('/api/health',(_req,res)=>res.json({
    ok:true,accuWeatherConfigured:Boolean(apiKey&&!apiKey.includes('PASTE_YOUR_')),
    aiConfigured:false,emergencyDispatchEnabled:false
  }));
  app.get('/api/weather',async(req,res)=>{
    res.set('Cache-Control','no-store');
    const lat=Number(req.query.lat),lon=Number(req.query.lon);
    if(!req.query.lat||!req.query.lon||!Number.isFinite(lat)||!Number.isFinite(lon)||lat< -90||lat>90||lon< -180||lon>180)
      return res.status(400).json({error:'Valid latitude and longitude are required.'});
    try{res.json(await weather.getWeather(lat,lon));}
    catch(error){
      console.error('AccuWeather request failed:',error.message);
      const status=[401,403,404,429,503].includes(error.status)?error.status:502;
      const messages={
        401:'AccuWeather rejected the API key (401).',
        403:'AccuWeather denied this endpoint (403). Check subscription access.',
        404:'AccuWeather could not identify this location.',
        429:'AccuWeather quota exceeded (429).',
        503:'AccuWeather API key not configured.'
      };
      res.status(status).json({error:messages[status]||'AccuWeather temporarily unavailable.'});
    }
  });
  app.post('/api/assistant',express.json({limit:'8kb'}),(_req,res)=>{
    res.status(503).json({error:'Live AI is not configured. Offline guidance only.'});
  });
  return app;
}
if(require.main===module){
  const PORT=process.env.PORT||3000;
  createApp().listen(PORT,()=>{
    console.log('Fisher Safety running at http://localhost:'+PORT);
    console.log('AccuWeather API key: '+(process.env.ACCUWEATHER_API_KEY?'configured (not verified)':'NOT configured'));
    console.log('Live AI and SOS dispatch: not configured (demo only)');
  });
}
module.exports={createApp};
