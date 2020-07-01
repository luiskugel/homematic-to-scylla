var xml2js = require("xml2js");
exports.convertXmlToJson = (xml_string) => {
  return new Promise((resolve, reject) => {
    xml2js
      .parseStringPromise(xml_string)
      .then(function (result) {
        try {
          const devices = result.stateList.device;
          const channels = devices
            .map((dev) => {
              return dev.channel;
            })
            .flat();
          const datapointGroups = channels
            .map((chan) => {
              const chanName = chan["$"].name;
              if (chan.datapoint) {
                const datapoint = chan.datapoint.map((dp) => {
                  dp["$"].chanName = chanName;
                  return dp;
                });
                return datapoint;
              }
            })
            .flat();
          const datapoints = datapointGroups.map((dpgs) => {
            if (dpgs) {
              return dpgs["$"];
            }
          });
          var filtered = datapoints.filter(function (el) {
            return el != null;
          });
          let values = filtered.map((dps) => {
            const dp_channel_name_arr = dps.name.split(".");
            dps.deviceName =
              dps.chanName +
              ":" +
              dp_channel_name_arr[dp_channel_name_arr.length - 1];
            if (dps.value != "") return dps;
          });
          values = values.filter(function (el) {
            return el != null;
          });
          resolve(values);
          console.log("Done");
        } catch (error) {
          reject(error);
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
