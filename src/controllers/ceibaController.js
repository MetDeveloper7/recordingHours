const moment = require('moment');
const { getHoursTerid } = require('../config/services/hours')
const { searchDateVehicle } = require('../controllers/consulta')
const { pool } = require('../config/database');


const callAPI = async (data) => {
    try {
        const { work_mvr } = data
        const starttimeDefault = '2022-06-01 00:00:00'
        const endtimeDefault = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
        let params = {
            key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
            terid: work_mvr,
            starttime: starttimeDefault,
            endtime: endtimeDefault,
            chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
            ft: '0',
            st: '1'
        }

        return await getHoursTerid(params)

    } catch (error) {
        console.log('Tiempo acabado por registro nuevo', data.work_mvr);
    }

};

const callAPIExit = async (data) => {
    try {
        const { terid, max } = data

        const formatString = "YYYY-MM-DD HH:mm:ss"

        const maxBaseDatos = moment(max).format(formatString)

        const endtimeDefault = moment().endOf('day').subtract(1, 'days').format(formatString);


        // console.log(endtimeDefault);
        // console.log(new Date());
        // console.log(new Date(endtimeDefault).toLocaleString('en-us'));

        //si la fecha es menor a la actual este sumara un dia}
        if (new Date(maxBaseDatos) < new Date(endtimeDefault)) {
            const dayParam = moment(max).startOf('day').add('1', 'days').format(formatString)
            let params = {
                key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
                terid,
                starttime: dayParam,
                endtime: endtimeDefault,
                chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
                ft: '0',
                st: '1'
            }

            const respuesta = await getHoursTerid(params)

            await createRecordingAPI({
                terid,
                ...respuesta

            })
            // console.log(dayParam, terid);
            // console.log(terid);
            // console.log(dayParam);

            /* const [fecha] = dayParam.split(' ')
            const resultado = await searchDateVehicle(fecha, terid)
            if (resultado.length == 0) {
                const respuesta =  await getHoursTerid(params)
                if (respuesta.data.length == 0) {
                    await createRecordingAPI({
                        terid,
                        
                    })
                }
            } */

        }

    } catch (error) {
        console.log(error);
    }


};

const createRecordingAPI = async (res) => {
    try {
        const { data, terid } = res
        for (const teridRegister of data) {

            const { name, filetype, chn, starttime, endtime } = teridRegister;
            const fecha1 = moment(starttime, "YYYY-MM-DD HH:mm:ss");
            const fecha2 = moment(endtime, "YYYY-MM-DD HH:mm:ss")
            let minutos = fecha2.diff(fecha1, 'minutes');




            await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos, terid) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, filetype, chn, starttime, endtime, minutos, terid]);
        }

        //console.log(`El Proceso para ${terid} terminó`);
    } catch (error) {
        console.log(error);
        //console.log('Tiempo acabado', res.data);
    }


};

module.exports = {
    callAPI,
    callAPIExit,
    createRecordingAPI
}