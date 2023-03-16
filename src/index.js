const express = require("express");
const cors = require("cors");
const app = express();
const moment = require("moment");

const cron = require("node-cron");
const notifier = require("node-notifier");

const { getData, getVehicles } = require("./controllers/consulta");
const { callAPI, callAPIExit } = require("./controllers/ceibaController");
const { getGPS, getAllDevicesGPS } = require("./controllers/GPS/GPSController");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require("./routes/index"));

app.listen(4000);
console.log(`Server on port 4000`);

async function getDispositivos() {
  const fechaEjecucion = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  console.log(
    "\n----- Fecha de inicio de ejecucion",
    fechaEjecucion + " -----\n"
  );

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
      await callAPI(vehiculo);
    }
  }
  notifier.notify({
    title: "*/*/*/HG/*/*/*",
    message: "Se ha terminado el ciclo",
  });
  const fechaFin = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  console.log("\n\n****** - T E R M I N A D O - ******", fechaFin);
}

// *******************************************************
// *******************************************************
//Se ejecuta a las x de la mañana de cada dia
cron.schedule("0 7 * * *", () => {
  console.log("\n** Se está ejecutando cada día a las x **");
  getDispositivos();
});
// *******************************************************
// *******************************************************

// *******************************************************
//Despues de ejecutarse una vez a las x de la mañana, es necesario
//ejecutarlo unas cuantas veces más porque hay algunos vehículos (terid)
//que no procesaron el día y deben seguir procesando. Este ciclo demora aproximadamente
//una hora y tipo 10 o 11 de la mañana se debe descomentar la línea 73 y correr el programa.
//para posterior activar la ejecución cada x minutos, esto puede variar entre 15 y 20 min (línea 79)
console.log("\n** Se está ejecutando solo **");
//getDispositivos();
// *******************************************************

// *******************************************************
// *******************************************************
//Se ejecuta cada x minutos
cron.schedule("*/15 * * * *", () => {
  console.log("\n** Se está ejecutando cada x minutos **");
  getDispositivos();
});
// *******************************************************
// *******************************************************
