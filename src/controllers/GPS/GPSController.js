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
    let gpstime = ''; 
    let terid = '';
    let auxEncendido =0;
    let auxApagado=0;
    const difference = 9.22*60;
    for (let i=1; i< data.length ; i++) {
        gpstime = moment(data[1].gpstime).format("YYYY-MM-DD");
        terid = data[1].terid;
        const fecha1 = (moment(data[i].gpstime, 'YYYY-MM-DD HH:mm:ss').get('hour')*60*60 + moment(data[i].gpstime, 'YYYY-MM-DD HH:mm:ss').get('minutes')*60 + moment(data[i].gpstime, 'YYYY-MM-DD HH:mm:ss').get('seconds'));
        const fecha2 = (moment(data[i-1].gpstime, 'YYYY-MM-DD HH:mm:ss').get('hour')*60*60 + moment(data[i-1].gpstime, 'YYYY-MM-DD HH:mm:ss').get('minutes')*60 + moment(data[i-1].gpstime, 'YYYY-MM-DD HH:mm:ss').get('seconds'));
        let minutes = fecha1 - fecha2;
        minutesFirst = minutes;
        if (minutes >= 0 && minutes <=difference) {
            auxEncendido += minutes; 
            //console.log("ENCENDIDO");
        }
        else{
            auxApagado += minutes;
            //console.log("APAGADO");
        }
    }
    console.log((auxEncendido/3600),(auxApagado/3600), ((auxEncendido+auxApagado)/3600)); 
    createReport(gpstime, terid, (auxEncendido/3600),(auxApagado/3600), ((auxEncendido+auxApagado)/3600));
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