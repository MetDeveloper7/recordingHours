const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');


const { getData } = require('./controllers/consulta')


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(require('./routes/index'));



app.listen(3000);
console.log(`Server on port 3000`);



cron.schedule('* * * * * *', () => {
  getData()
  console.log('running every minute 1, 2, 4 and 5');

});