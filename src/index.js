const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');




const { getData, getVehicles } = require('./controllers/consulta')
const { callAPI, callAPIExit, createRecordingAPI } = require('./controllers/ceibaController')
const { getGPS, getAll } = require('./controllers/GPS/GPSController')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(3000);
console.log(`Server on port 3000`);



//getGPS();
getAll();