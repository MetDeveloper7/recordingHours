const { Pool } = require('pg')
const moment = require('moment');
const axio = require('axios');
const { response } = require('express');

const pool = new Pool({
    user: 'si18_master',
    host: '209.240.107.6',
    database: 'si18data_production',
    password: '9v29KW9xr6gNuXPys64aJLwVJEsJHXUg',
    port: 5432,
});

const getData = async (req, res) => {

    return await pool.query("SELECT terid, max(endtime) FROM public.recordign_hours GROUP BY terid").then(res => res.rows)

    return response.rows

    /* res.status(200).json(response.rows); */

};

const getVehicles = async (req, res) => {

    const response = await pool.query("SELECT work_mvr, internal_code FROM public.vehicles")

    return response.rows
    /* res.status(200).json(response.rows); */
};

const createRecording = async (req, res) => {
    console.log("llegaaa");
    console.log(req.body);
    const {name, filetype, chn, starttime, endtime, minutos, terid} = req.body;
    const response = await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos, terid) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, filetype, chn, starttime, endtime, minutos, terid]);
    console.log(response);
    res.status(200).json({status: 200, message: 'Bien'})
};

const createRecordingVehicles = async (req) => {
    const {internal_code, work_mvr} = req;
    const starttime = '2022-06-01 00:00:00'

    console.log(internal_code, '1', '1', starttime, 10, work_mvr);
    /* const response = await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos, terid) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, '1', '1', starttime, endtime, 10, work_mvr]);
    console.log(response);
    res.status(200).json({status: 200, message: 'Bien'}) */
};

const createRecordingAPI = async (data) => {
    const {name, filetype, chn, starttime, endtime, terid} = data;
    const response = await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, terid) VALUES ($1, $2, $3, $4, $5, $6)', [name, filetype, chn, starttime, endtime, terid]);
    console.log(response);
    //res.status(200).json({status: 200, message: 'Bien'})
};

const callAPI = async (data)=>{
    const url = 'http://67.231.248.74:12056/api/v1/basic/record/filelist';
    const starttimeDefault = '2022-06-01 00:00:00'
    const endtimeDefault = moment().format("YYYY-MM-DD HH:mm:ss");
    let params = {
        key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
        terid: data.work_mvr,
        starttime: starttimeDefault,
        endtime: endtimeDefault,
        chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
        ft: '0',
        st: '1'
      }
      axio.get(url, { params }).then(response => {
        for (let i in response.data.data){
            createRecordingAPI({...response.data.data[i], terid: data.work_mvr});
        }
    });
};

const callAPIExit = async (data)=>{
    const url = 'http://67.231.248.74:12056/api/v1/basic/record/filelist';
    const starttimeDefault = '2022-06-01 00:00:00'
    const endtimeDefault = moment().format("YYYY-MM-DD HH:mm:ss");
    let params = {
        key: 'zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D',
        terid: data.work_mvr,
        starttime: data.max,
        endtime: endtimeDefault,
        chl: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
        ft: '0',
        st: '1'
    }
    axio.get(url, { params }).then(response => {
        for (let i in response.data.data){
            createRecordingAPI({...response.data.data[i], terid: data.work_mvr});
        }
    });

};

module.exports = {
    getData,
    createRecording,
    getVehicles,
    createRecordingVehicles,
    callAPI,
    callAPIExit
}