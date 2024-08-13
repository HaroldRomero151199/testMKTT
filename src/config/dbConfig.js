require('dotenv').config();

//'mongodb://localhost:27017/kryosMQTT'
const configDB = `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}` 
module.exports = configDB
