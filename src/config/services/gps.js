const { horasApi } = require('../axios')

const getGPSExternal = async (params) => {
    try {
        return await horasApi.post(`basic/gps/detail`, params).then(res => res.data)
    } catch (error) {
        console.log("PROBLEMAS DE EJECUCIÓN CON LA API EXTERNA");
    }
}

module.exports = {
    getGPSExternal
}