const express = require("express");
const cors = require("cors");
const app = express();
const cron = require("node-cron");
const moment = require("moment");

const { getData, getVehicles, getDataGPS } = require("./controllers/consulta");
const {
  callAPI,
  callAPIExit,
  createRecordingAPI,
} = require("./controllers/ceibaController");
const {
  getGPS,
  getAllDevicesGPS,
  getSiguiente,
} = require("./controllers/GPS/GPSController");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require("./routes/index"));

app.listen(3001);
console.log(`Server on port 3001`);

async function getDispositivos() {
  const [vehiculos, registros] = await Promise.all([getVehicles(), getData()]);

  for await (const vehiculo of vehiculos) {
    let finVehicle = [];
    let registroEncontrado = null;
    for (const registro of registros) {
      if (!(vehiculo.work_mvr == registro.terid)) {
        finVehicle.push(false);
      } else {
        finVehicle.push(true);
        registroEncontrado = registro;
      }
    }
    const resultado = finVehicle.includes(true);
    if (resultado) {
      await callAPIExit(registroEncontrado);
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


const fechaEjecucion = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
console.log("\n***Fecha de inicio", fechaEjecucion + "***\n");


// *******************************************************
// *******************************************************
//Se ejecuta una vez todos los dias a las 6 de mañana
cron.schedule("0 6 * * *", () => {
  console.log("\n**Se ejecuta una vez todos los dias a las 6 de mañana**", fecha + "**");
  getAllDevicesGPS();
 });
// *******************************************************
// *******************************************************


// *******************************************************
//Despues de ejecutarse una vez a las 7 de la mañana, es necesario
//ejecutarlo una o dos veces más porque quizá hay algunos vehículos (terid)
//que no procesaron el día. Se debe descomentar la línea 117 y correr el programa.
//getAllDevicesGPS();
// *******************************************************


// *******************************************************
// *******************************************************
//Se está ejecutando cada x horas
cron.schedule("0 */4 * * *", () => {
  console.log("\n**Se está ejecutando cada x horas**", fecha + "**");
  getAllDevicesGPS();
 });
// *******************************************************
// *******************************************************



