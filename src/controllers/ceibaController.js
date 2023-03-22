const moment = require("moment");
const { getHoursTerid } = require("../config/services/hours");
const { searchDateVehicle } = require("../controllers/consulta");
const { pool } = require("../config/database");

const formatString = "YYYY-MM-DD HH:mm:ss";
const fechaInicio = "2023-01-01 00:00:00";
const fechaLimite = moment(new Date())
  .endOf("day")
  .subtract("2", "days")
  .format(formatString);

const callAPI = async (data) => {
  try {
    const { work_mvr } = data;
    const starttimeDefault = fechaInicio;
    const endtimeDefault = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
    let params = {
      key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
      terid: work_mvr,
      starttime: starttimeDefault,
      endtime: endtimeDefault,
      chl: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",
      ft: "0",
      st: "1",
    };

    const resultado = await getHoursTerid(params);

    console.log(
      "****Terid que no se ha guardado**** ",
      work_mvr + " con ",
      resultado
    );

    if (resultado.data.length > 0) {
      await createRecordingAPI({
        terid: work_mvr,
        ...resultado,
      });
    }
  } catch (error) {
    console.log("Tiempo acabado por registro nuevo", data.work_mvr);
  }
};

const callAPIExit = async (data) => {
  try {
    const { terid, max } = data;

    const maxBaseDatos = moment(max).format(formatString);

    //const endtimeDefault = moment().endOf('day').subtract(1, 'days').format(formatString);

    //si la fecha es menor a la actual este sumara un dia}
    if (new Date(maxBaseDatos) < new Date(fechaLimite)) {
      let dayParams = "";

      const checkDateDB = new Date(maxBaseDatos) < new Date(fechaInicio);

      if (checkDateDB) {
        dayParams = fechaInicio;
      } else {
        dayParams = moment(max)
          .startOf("day")
          .add("1", "days")
          .format(formatString);
      }

      respuesta = await saveRecording(dayParams, terid);
      let conditionRepeat = 1;

      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      while (
        conditionRepeat < 3 &&
        respuesta.errorcode === 200 &&
        respuesta.data.length === 0
      ) {
        respuesta = await saveRecording(dayParams, terid);
        if (respuesta.errorcode === 200 && respuesta.data.length === 0) {
          await timeout(10000);
          conditionRepeat++;
        } else {
          break;
        }
        console.log(
          `Esperando respuesta del terid ${terid} con ${dayParams} - intento: ${conditionRepeat}`
        );
      }

      if (conditionRepeat == 3) {
        if (checkDateDB) {
          dayParams = moment(fechaInicio)
            .startOf("day")
            .add("1", "days")
            .format(formatString);
        } else {
          dayParams = moment(max)
            .startOf("day")
            .add("2", "days")
            .format(formatString);
        }
        if (new Date(dayParams) < new Date(fechaLimite)) {
          respuesta = await saveRecording(dayParams, terid);
          let conditionNewDay = 1;

          while (
            conditionNewDay < 30 &&
            respuesta.errorcode == 200 &&
            respuesta.data.length == 0
          ) {
            if (new Date(maxBaseDatos) < new Date(fechaInicio)) {
              dayParams = moment(dayParams)
                .startOf("day")
                .add("1", "days")
                .format(formatString);
            } else {
              dayParams = moment(dayParams)
                .startOf("day")
                .add("2", "days")
                .format(formatString);
            }
            if (new Date(dayParams) > new Date(fechaLimite)) break;

            respuesta = await saveRecording(dayParams, terid);
            if (respuesta.errorcode === 200 && respuesta.data.length === 0) {
              await timeout(10000);
              conditionNewDay++;
            } else {
              break;
            }
            console.log(
              `Esperando respuesta del terid ${terid} con fecha ${dayParams} - intento: ${conditionNewDay}`
            );
          }
        } else {
          console.log(
            `El terid ${terid} no se ha podido procesar por limite de fecha`
          );
        }
      }

      if (respuesta.data.length > 0) {
        await createRecordingAPI({
          terid,
          ...respuesta,
        });
      } else {
        console.log(
          `El terid ${terid} ha dado respuesta ${JSON.stringify(respuesta)}`
        );
      }
    } else {
      console.log(`El terid ${terid} ha culminado el mes ${max}`);
    }
  } catch (error) {
    console.log(error);
    console.log("Tiempo acabado por registro antiguo", data.terid);
  }
};

const saveRecording = async (dayParams, terid) => {
  let params = {
    key: "zT908g2j9nhN588DYZDrFmmN3P7FllzEfBoN%2FLOMx%2FDq9HouFc7CwA%3D%3D",
    terid,
    starttime: dayParams,
    endtime: fechaLimite,
    chl: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",
    ft: "0",
    st: "1",
  };

  const dayBase = dayParams.split(" ")[0];

  const resultado = await searchDateVehicle(dayBase, terid);

  if (resultado.length == 0) {
    const respuesta = await getHoursTerid(params);
    return respuesta;
  } else {
    return `Ya hay registro en la base de datos para el terid ${terid}`;
  }
};

const createRecordingAPI = async (res) => {
  try {
    const { data, terid } = res;
    for (const teridRegister of data) {
      const { name, filetype, chn, starttime, endtime } = teridRegister;
      const fecha1 = moment(starttime, "YYYY-MM-DD HH:mm:ss");
      const fecha2 = moment(endtime, "YYYY-MM-DD HH:mm:ss");
      let minutos = fecha2.diff(fecha1, "minutes");

      await pool.query(
        "INSERT INTO public.recordign_hours (name, filetype, chn, starttime, endtime, minutos, terid) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [name, filetype, chn, starttime, endtime, minutos, terid]
      );
    }

    console.log(
      `El proceso para el terid ${terid} fue terminado con fecha ${JSON.stringify(
        data[data.length - 1].starttime
      )}`
    );
  } catch (error) {
    console.log(error);
    //console.log('Tiempo acabado', res.data);
  }
};

module.exports = {
  callAPI,
  callAPIExit,
  createRecordingAPI,
};
