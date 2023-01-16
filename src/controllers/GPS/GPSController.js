const moment = require("moment");
const axio = require("axios");
const cron = require("node-cron");

const { getGPSExternal } = require("../../config/services/gps");
const { pool } = require("../../config/database");
const { getVehicles, getDataGPS, searchGPSTerid } = require("../consulta");

async function getAllDevicesGPS() {
  const fechaEjecucion = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  console.log(
    "\n----- Fecha de inicio de ejecucion",
    fechaEjecucion + "-----\n"
  );
  const [vehiculos, registros] = await Promise.all([
    getVehicles(),
    getDataGPS(),
  ]);
  console.log(vehiculos.length, registros.length);
  for await (const vehiculo of vehiculos) {
    let finVehicle = [];
    let registroEncontrado = null;
    for (const registro of registros) {
      if (vehiculo.work_mvr != registro.terid) {
        finVehicle.push(false);
      } else {
        finVehicle.push(true);
        registroEncontrado = registro;
      }
    }
    const resultado = finVehicle.includes(true);
    if (resultado) {
      await callAPIWhenTeridExist(registroEncontrado);
    } else {
      console.log("NO ESTA", vehiculo.work_mvr);
      await callAPIExternal(vehiculo);
    }
  }
  console.log("-----------------TERMINADO-----------------");
}

const getGPS = async () => {
  try {
    const starttime = "2022-12-01 00:00:00";
    const terid = "00980006C6";
    let data = {
      terid: terid,
      key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
      starttime: starttime,
      endtime: "2022-12-01 23:59:59",
    };
    const [fechaSig] = starttime.split(" ");
    const resultado = await searchGPSTerid(fechaSig, terid);
    if (resultado.length === 0) {
      const result = await getGPSExternal(data);
      if (result.data.length > 1) {
        console.log("AQUI**");
        calculate(result.data);
      } else {
        console.log("NO HAY DATA");
      }
    } else {
      console.log("YA EXISTE REGISTRO");
    }
  } catch (error) {
    console.log(error);
  }
};

const calculate = async (data) => {
  let gpstime = "";
  let terid = "";
  let auxEncendido = 0;
  let auxApagado = 0;
  const difference = 9.22 * 60;
  for (let i = 1; i < data.length; i++) {
    gpstime = moment(data[1].gpstime).format("YYYY-MM-DD");
    terid = data[1].terid;
    const fecha1 =
      moment(data[i].gpstime, "YYYY-MM-DD HH:mm:ss").get("hour") * 60 * 60 +
      moment(data[i].gpstime, "YYYY-MM-DD HH:mm:ss").get("minutes") * 60 +
      moment(data[i].gpstime, "YYYY-MM-DD HH:mm:ss").get("seconds");
    const fecha2 =
      moment(data[i - 1].gpstime, "YYYY-MM-DD HH:mm:ss").get("hour") * 60 * 60 +
      moment(data[i - 1].gpstime, "YYYY-MM-DD HH:mm:ss").get("minutes") * 60 +
      moment(data[i - 1].gpstime, "YYYY-MM-DD HH:mm:ss").get("seconds");
    let minutes = fecha1 - fecha2;
    minutesFirst = minutes;
    if (minutes >= 0 && minutes <= difference) {
      auxEncendido += minutes;
      //console.log("ENCENDIDO");
    } else {
      auxApagado += minutes;
      //console.log("APAGADO");
    }
  }
  console.log(
    "Fecha:",
    gpstime,
    "Terid:",
    terid,
    "Informe:",
    (auxEncendido / 3600).toFixed(4),
    (auxApagado / 3600).toFixed(4),
    ((auxEncendido + auxApagado) / 3600).toFixed(4)
  );
  await createReport(
    gpstime,
    terid,
    (auxEncendido / 3600).toFixed(4),
    (auxApagado / 3600).toFixed(4),
    ((auxEncendido + auxApagado) / 3600).toFixed(4)
  );
};

const createReport = async (gpstime, terid, encendido, apagado, total) => {
  try {
    const response = await pool.query(
      "INSERT INTO public.details_GPS (fecha, terid, encendido, apagado, total) VALUES ($1, $2, $3, $4, $5)",
      [gpstime, terid, encendido, apagado, total]
    );
  } catch (error) {
    console.log(error);
  }
};

const callAPIExternal = async (data) => {
  try {
    let band = true;
    const { work_mvr } = data;
    const starttime = "2022-12-01 00:00:00";
    const endtime = "2022-12-01 23:59:59";
    const dateNow = moment()
      .startOf("day")
      .subtract(1, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    let params = {
      key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
      terid: work_mvr,
      starttime: starttime,
      endtime: endtime,
    };
    const [fechaSig] = starttime.split(" ");
    const resultado = await searchGPSTerid(fechaSig, work_mvr);
    if (resultado.length == 0) {
      const result = await getGPSExternal(params);
      if (result.data.length > 1) {
        calculate(result.data);
      } else {
        let dayStart = moment(starttime)
          .startOf("day")
          .add("1", "days")
          .format("YYYY-MM-DD HH:mm:ss");
        let dayEnd = moment(endtime)
          .endOf("day")
          .add("1", "days")
          .format("YYYY-MM-DD HH:mm:ss");
        console.log("TERID SIN INFO: ", work_mvr, dayStart, "final: ", dayEnd);
        while (band) {
          if (new Date(dayStart) < new Date(dateNow)) {
            let params = {
              key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
              terid: work_mvr,
              starttime: dayStart,
              endtime: dayEnd,
            };
            const [fechaSig] = dayStart.split(" ");
            const resultado = await searchGPSTerid(fechaSig, work_mvr);
            if (resultado.length == 0) {
              const result = await getGPSExternal(params);
              if (result.data.length > 1) {
                calculate(result.data);
                band = false;
              } else {
                dayStart = moment(dayStart)
                  .startOf("day")
                  .add("1", "days")
                  .format("YYYY-MM-DD HH:mm:ss");
                dayEnd = moment(dayEnd)
                  .endOf("day")
                  .add("1", "days")
                  .format("YYYY-MM-DD HH:mm:ss");
                band = true;
              }
            }
          } else {
            band = false;
          }
        }
      }
    } else {
      console.log("YA EXISTE REGISTRO DE ", work_mvr, starttime);
    }
  } catch (error) {
    console.log(error);
  }
};

const callAPIWhenTeridExist = async (data) => {
  try {
    let band = true;
    const { terid, max } = data;
    const fechaTerid = moment(max).format("YYYY-MM-DD HH:mm:ss");
    const endtime = moment()
      .startOf("day")
      .subtract(1, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    if (new Date(fechaTerid) < new Date(endtime)) {
      const dayParamStart = moment(max)
        .startOf("day")
        .add("1", "days")
        .format("YYYY-MM-DD HH:mm:ss");
      const dayParamEnd = moment(max)
        .endOf("day")
        .add("1", "days")
        .format("YYYY-MM-DD HH:mm:ss");
      let params = {
        key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
        terid,
        starttime: dayParamStart,
        endtime: dayParamEnd,
      };
      const [fechaSig] = dayParamStart.split(" ");
      const resultado = await searchGPSTerid(fechaSig, terid);
      if (resultado.length == 0) {
        const result = await getGPSExternal(params);
        if (result.data.length > 1) {
          calculate(result.data);
        } else {
          let dayStart = moment(dayParamStart)
            .startOf("day")
            .add("1", "days")
            .format("YYYY-MM-DD HH:mm:ss");
          let dayEnd = moment(dayParamEnd)
            .endOf("day")
            .add("1", "days")
            .format("YYYY-MM-DD HH:mm:ss");
          console.log("TERID SIN INFO: ", terid, dayStart, "final: ", dayEnd);
          while (band) {
            if (new Date(dayStart) < new Date(endtime)) {
              let params = {
                key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
                terid,
                starttime: dayStart,
                endtime: dayEnd,
              };
              const [fechaSig] = dayStart.split(" ");
              const resultado = await searchGPSTerid(fechaSig, terid);
              if (resultado.length == 0) {
                const result = await getGPSExternal(params);
                if (result.data.length > 1) {
                  calculate(result.data);
                  band = false;
                } else {
                  dayStart = moment(dayStart)
                    .startOf("day")
                    .add("1", "days")
                    .format("YYYY-MM-DD HH:mm:ss");
                  dayEnd = moment(dayEnd)
                    .endOf("day")
                    .add("1", "days")
                    .format("YYYY-MM-DD HH:mm:ss");
                  band = true;
                }
              }
            } else {
              band = false;
            }
          }
        }
      } else {
        console.log("YA EXISTE REGISTRO DE ", terid, fechaTerid);
      }
    }
  } catch (error) {
    console.log("PROBLEMAS DE EJECUCIÓN CON LA API EXTERNA");
  }
};

const getSiguiente = async (data) => {
  try {
    const { terid, max } = data;
    max = moment(max)
      .startOf("day")
      .add("1", "days")
      .format("YYYY-MM-DD HH:mm:ss");
    console.log(max);
    return { terid, max };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getGPS,
  calculate,
  getAllDevicesGPS,
  getSiguiente,
};
