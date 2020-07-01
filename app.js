const fs = require("fs");
const xml = fs.readFileSync("./values.xml");
const util = require("util");
const cassandra = require("cassandra-driver");
const config = require(".config.json");
const { convertXmlToJson } = require("./functions");

const cassandra_client = new cassandra.Client({
  cloud: {
    secureConnectBundle: config.cassandra_secure_connect_bundle,
  },
  credentials: {
    username: config.cassandra_username,
    password: config.cassandra_password,
  },
  keyspace: config.cassandra_keyspace,
});

cassandra_client.connect().then(async (res) => {
  console.log(
    `Connected to ${
      cassandra_client.hosts.length
    } nodes in the cluster: ${cassandra_client.hosts.keys().join(", ")}`
  );
});

convertXmlToJson(xml).then(async (DatapointsArray) => {
  await Promise.all(
    DatapointsArray.map(async (dp) => {
      return await cassandra_client.execute(
        "INSERT INTO homematicdata (devicename, date, ise_id, value, valuetype, valueunit, timestamp, operations) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          dp.deviceName,
          new Date(),
          parseInt(dp.ise_id),
          dp.value,
          dp.valuetype,
          dp.valueunit,
          parseInt(dp.timestamp),
          parseInt(dp.operations),
        ],
        {
          hints: [
            "text",
            "timestamp",
            "int",
            "text",
            "text",
            "text",
            "int",
            "int",
          ],
        }
      );
    })
  );
  console.log("DONE!");
  process.exit();
  //fs.writeFileSync("./out.json", JSON.stringify(value));
});
