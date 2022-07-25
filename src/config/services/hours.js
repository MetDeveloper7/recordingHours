const { horasApi } = require('../axios')

const getHoursTerid = async (params) => {
    try {
        return await horasApi.get(`basic/record/filelist`, { params }).then(res => res.data)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getHoursTerid
}