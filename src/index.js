const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');




const { getData, getVehicles, createRecordingVehicles, callAPI, callAPIExit } = require('./controllers/consulta')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(3000);
console.log(`Server on port 3000`);


cron.schedule('57 * * * *', async () => {
  const registros = await getData()
  const vehiculos = await getVehicles()
  vehiculos.map(item => {
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
    if(resultado){
      callAPIExit(registroEncontrado);
    }else{
      callAPI(item);
    }
  })
});