const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');




const { getData, getVehicles } = require('./controllers/consulta')
const { callAPI, callAPIExit, createRecordingAPI } = require('./controllers/ceibaController')
const { getGPS, getAllDevicesGPS } = require('./controllers/GPS/GPSController')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(3000);
console.log(`Server on port 3000`);


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
      // console.log('No está');
    }
  }
  // return new Promise(async (resolve, reject) => {
  //   const vehiculos = await getVehicles()
  //   const registros = await getData()

  //   for (const vehiculo of vehiculos) {
  //     let finVehicle = []
  //     let registroEncontrado = null
  //     for (const registro of registros) {
  //       if (!(vehiculo.work_mvr == registro.terid)) {
  //         finVehicle.push(false)
  //       } else {
  //         finVehicle.push(true)
  //         registroEncontrado = registro
  //       }
  //     }
  //     const resultado = finVehicle.includes(true)
  //     setTimeout(async () => {
  //       if (resultado) {
  //         const result = await callAPIExit(registroEncontrado)
  //         createRecordingAPI(result)

  //       } else {
  //         console.log('No está');
  //       }
  //       resolve();
  //       ;
  //     }, 5000
  //     );
  //   }

  //   /* setTimeout(async () => {
  //     for (const iterator of teridPrueba) {
  //       const result = await callAPIExit(iterator)
  //       createRecordingAPI(result)
  //     }
  //     resolve();
  //     ;
  //   }, 5000
  //   ); */
  // });
}

// async function callerFun() {
//   console.log("Caller");
//   await getDispositivos();
//   console.log("After waiting");
// }

// callerFun()



// cron.schedule('10 * * * * *', () => {
//   getDispositivos()
// })

//getDispositivos()


/* // ACTUALIZA LA CONTABILIDAD DE ACTIVIDAD DEL GPS DE CADA VEHICULO A LAS 2 AM TODOS LOS DIAS
cron.schedule('* 2 * * *', () => {
  getAllDevicesGPS();
});
 */

//ACTUALIZA LA CONTABILIDAD DE ACTIVIDAD DEL GPS DE CADA VEHICULO CADA 2 MIN
//cron.schedule('*/5 * * * *', () => {
//  getAllDevicesGPS();
//});

//getGPS();

getAllDevicesGPS();