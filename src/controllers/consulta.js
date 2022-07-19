const { Client } = require('pg')
const { Pool } = require('pg')

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

module.exports = {
    getData,
    createRecording,
    getVehicles,
    createRecordingVehicles
}

/*
const datos = async() => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'recording',
        password: 'postgres',
        port: 5432,
    })
    await client.connect();
    const res = await client.query('SELECT * FROM public.recording_hours');
    const result = res.rows;
    await client.end();
    return result;
};

datos().then((result) => {
    console.log(result);
});
*/