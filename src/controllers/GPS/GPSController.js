const moment = require('moment');
const axio = require('axios');
const { pool } = require('../../config/database')

const url = 'http://67.231.248.74:12056/api/v1/basic/gps/detail'

const getGPS = async () => {
    try {
        let data = {
            "terid": "00980000EC",
            "key": "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
            "starttime": "2022-06-30 00:00:00",
            "endtime": "2022-06-30 23:59:59"
        }
        axio.post(url, data).then(response => {
            calculate(response.data.data);
        });
    } catch (error) {
        console.log(error);
    }
};

const calculate = (data) =>{
    const {gpstime, terid } = data;
    let auxEncendido =0;
    let auxApagado=0;
    const timeDefault = moment(data[0].gpstime).startOf("day");
    const difference = 9.22;
    const entryHour = moment(timeDefault, 'YYYY-MM-DD HH:mm:ss');
    const exitHour = moment(data[0].gpstime, 'YYYY-MM-DD HH:mm:ss');
    let minutesFirst = moment.duration(exitHour.diff(entryHour)).asSeconds();
    console.log(minutesFirst);
    for (let i=1; i<data.length; i++) {
        const fecha1 = moment(data[i].gpstime, 'ss').format('ss');
        const fecha2 = moment(minutesFirst, 'ss').format('ss');
        console.log(fecha1,fecha2);
        //duration = minutes;
        /* if (minutes > 0 && minutes <=difference) {
            auxEncendido += duration; 
            console.log("ENCENDIDO");
        }
        else{
            auxApagado += duration;
            console.log("APAGADO");
        }
    }    
    createReport(gpstime, terid, auxEncendido, auxApagado, auxEncendido+auxApagado); */
    }
};

const createReport = async (gpstime, terid, encendido, apagado, total) => {
    try {
        const response = await pool.query('INSERT INTO public.details_GPS (fecha, terid, encendido, apagado, total) VALUES ($1, $2, $3, $4, $5)', [gpstime, terid, encendido, apagado, total]); 
        }
    catch (error) {
        console.log(error);
    }
};



module.exports = {
    getGPS,
    calculate
}