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
    const response = await pool.query('SELECT * FROM public.recordign_hours');
    console.log(response.rows);
    res.status(200).json(response.rows);
};

const createRecording = async (req, res) => {
    console.log("llegaaa");
    console.log(req.body.data);
    const {name, filetype, chn, starttime, endtime, minutos} = req.body.data;
    const response = await pool.query('INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos) VALUES ($1, $2, $3, $4, $5, $6)', [name, filetype, chn, starttime, endtime, minutos]);
    console.log(response);
    res.send('RecordingHours create');
};

module.exports = {
    getData,
    createRecording
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