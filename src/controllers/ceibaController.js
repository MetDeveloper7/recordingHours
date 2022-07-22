const moment = require('moment');
const axio = require('axios');
const { pool } = require('../config/database')

const url = 'http://67.231.248.74:12056/api/v1/basic/record/filelist'

const callAPI = async (data) => {
    try {
        const { work_mvr } = data
        const starttimeDefault = '2022-06-01 00:00:00'
        const endtimeDefault = moment().format("YYYY-MM-DD HH:mm:ss");
        let params = {
            key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
            terid: work_mvr,
            starttime: starttimeDefault,
            endtime: endtimeDefault,
            chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
            ft: '0',
            st: '1'
        }
        axio.get(url, { params }).then(response => {
            if (response.data.data.length > 0) {
                createRecordingAPI(response.data.data, work_mvr)
            }
        });
    } catch (error) {
        console.log(error);
    }

};

const callAPIExit = async (data) => {
    try {
        const { terid } = data
        //no se puede usar la ultima que nos proporciona la base de datos, ya que el startime todo por default el dia, es decir, no tendriamos registros nuevos
        const endtimeDefault = moment().format("YYYY-MM-DD HH:mm:ss");
        const startTime = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss")
        let params = {
            key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
            terid: terid,
            starttime: startTime,
            endtime: endtimeDefault,
            chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
            ft: '0',
            st: '1'
        }
        axio.get(url, { params }).then(response => {
            if (response.data.data.length > 0) {
                createRecordingAPI(response.data.data, terid)
            }
        });
    } catch (error) {
        console.log(error);
    }


};

const createRecordingAPI = async (data, terid) => {
    try {
        for (const teridRegister of data) {

            const { name, filetype, chn, starttime, endtime } = teridRegister;
            const fecha1 = moment(starttime, "YYYY-MM-DD HH:mm:ss");
            const fecha2 = moment(endtime, "YYYY-MM-DD HH:mm:ss")
            let minutos = fecha2.diff(fecha1, 'minutes');

            /* console.log({...teridRegister, minutos, terid}); */
            const response = await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos, terid) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, filetype, chn, starttime, endtime, minutos, terid]); 

            //console.log({ ...teridRegister, terid });
        }
    } catch (error) {
        console.log(error);
    }


};

module.exports = {
    callAPI,
    callAPIExit,
    createRecordingAPI
}