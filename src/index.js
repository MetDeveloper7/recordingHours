const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');




const { getData, getVehicles } = require('./controllers/consulta')
const { callAPI, callAPIExit } = require('./controllers/ceibaController')
const { getGPS, getAllDevicesGPS } = require('./controllers/GPS/GPSController')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(4000);
console.log(`Server on port 4000`);


async function getDispositivos() {

  const [vehiculos, registros] = await Promise.all([getVehicles(), getData()]);

  for await (const vehiculo of vehiculos) {
    let finVehicle = []
    let registroEncontrado = null
    for (const registro of registros) {
      if (!(vehiculo.work_mvr == registro.terid)) {
        finVehicle.push(false)
      } else {
        finVehicle.push(true)
        registroEncontrado = registro
      }
    }
    const resultado = finVehicle.includes(true)
    if (resultado) {
      await callAPIExit(registroEncontrado)
    } else {
      await callAPI(vehiculo)
    }
  }

}



// cron.schedule('0 */45 * * * *', () => {
//   getDispositivos()
// })

getDispositivos()


// ACTUALIZA LA CONTABILIDAD DE ACTIVIDAD DEL GPS DE CADA VEHICULO A LAS 2 AM TODOS LOS DIAS
/* cron.schedule('* 2 * * *', () => {
  getAllDevicesGPS();
}); */


// ACTUALIZA LA CONTABILIDAD DE ACTIVIDAD DEL GPS DE CADA VEHICULO CADA 2 MIN
//cron.schedule('*/2 * * * *', () => {
//    getAllDevicesGPS();
//});