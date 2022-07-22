const moment = require('moment');
const axio = require('axios');
//const { pool } = require('../../config/database')

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
            const result = response.data.data.map((item)=> {
                return item.gpstime;
            })
            calculate(result);
            console.log(result);
        });
    } catch (error) {
        console.log(error);
    }
};

const calculate = (gpstime) =>{
    const timeDefault = moment(gpstime[0]).startOf("day");
    const difference = 9.22;
    const fecha1 = new Date(gpstime[0]).getSeconds();
    const fecha2 = new Date(timeDefault).getSeconds();
    let minutos = fecha2-fecha1
    for (let i=1; i<gpstime.length; i++) { 
        const fecha1 = new Date(i).getSeconds();
        const fecha2 = minutos
        let minutes = fecha1-fecha2;
        console.log(minutes);
    }    
};



module.exports = {
    getGPS,
    calculate
}