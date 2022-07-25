const axios = require('axios');

const horasApi = axios.create({
    baseURL: 'http://67.231.248.74:12056/api/v1/',
    timeout: 30000,
});

module.exports = {
    horasApi
}