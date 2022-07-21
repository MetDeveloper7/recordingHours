const { Pool } = require('pg')

const pool = new Pool({
    user: 'si18_master',
    host: '209.240.107.6',
    database: 'si18data_production',
    password: '9v29KW9xr6gNuXPys64aJLwVJEsJHXUg',
    port: 5432,
});


module.exports = {
    pool
}