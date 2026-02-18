const mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "clients"
});
if(!db){console.log('db failed to connnect')}
else{console.log('db connected')}

module.exports = db;
