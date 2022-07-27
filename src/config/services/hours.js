const { horasApi } = require('../axios')

const getHoursTerid = async (params) => {
    try {
        const { data } = await horasApi.get(`basic/record/filelist`, { params })
        // console.log(respuesta);
        return await data
        // .then(res => res.data)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getHoursTerid
}