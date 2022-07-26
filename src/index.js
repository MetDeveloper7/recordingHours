const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');




const { getData, getVehicles } = require('./controllers/consulta')
const { callAPI, callAPIExit, createRecordingAPI } = require('./controllers/ceibaController')
const { getGPS, calculate } = require('./controllers/GPS/GPSController')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(3000);
console.log(`Server on port 3000`);

const teridPrueba = [
  { terid: '0098000833', max: '2022-06-02 23:59:59' },
  { terid: '0098000795', max: '2022-06-02 23:59:59' },
  { terid: '00980002EF', max: '2022-06-02 23:59:59' },
  { terid: '0098000189', max: '2022-06-02 23:59:59' },
  { terid: '00980001DA', max: '2022-06-02 23:59:59' },
  { terid: '0098000274', max: '2022-06-02 23:59:59' }
]
/* const getDispositivos = () => {
  return new Promise(async (resolve, reject) => {
    const registros = await getData()
    const vehiculos = await getVehicles()
    vehiculos.map((item, i) => {
      const finVehicle = []
      let registroEncontrado = null
      registros.map(registro => {
        if (!(item.work_mvr == registro.terid)) {
          finVehicle.push(false)
        } else {
          finVehicle.push(true)
          registroEncontrado = registro
        }
      })
      const resultado = finVehicle.includes(true)
      if (resultado) {
        setTimeout(async () => {
            const result = await callAPIExit(teridPrueba[i])
            createRecordingAPI(result)
        }, 5000)
      } else {
        //await callAPI(item);
      }
      registroEncontrado = null
      resolve();
    })
  })

} */



function getDispositivos() {
  return new Promise(async (resolve, reject) => {
    const vehiculos = await getVehicles()
    const registros = await getData()

    for (const vehiculo of vehiculos) {
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
      setTimeout(async () => {
        if (resultado) {
          const result = await callAPIExit(registroEncontrado)
          createRecordingAPI(result)

        } else {
          console.log('No está');
        }
        resolve();
        ;
      }, 5000
      );
    }

    /* setTimeout(async () => {
      for (const iterator of teridPrueba) {
        const result = await callAPIExit(iterator)
        createRecordingAPI(result)
      }
      resolve();
      ;
    }, 5000
    ); */
  });
}

async function callerFun() {
  console.log("Caller");
  await getDispositivos();
  console.log("After waiting");
}

callerFun()

/* cron.schedule('20 * * * * *', async () => {
  await getDispositivos()
})
 */




//getGPS();