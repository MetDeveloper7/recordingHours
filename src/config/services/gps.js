const { horasApi } = require('../axios')

const getGPSExternal = async (params) => {
    try {
        const { data } =  await horasApi.post(`basic/gps/detail`, params);
        return await data;
    } catch (error) {
        console.log("PROBLEMAS DE EJECUCIÓN CON LA API EXTERNA");
    }
}

module.exports = {
    getGPSExternal
}