const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const DB_URL = "mongodb+srv://darell:jasonjdhh53@cluster0.8eazuil.mongodb.net/test";
const port = 3000;
const {model} = require('./database/model');
const {conn, signUp, deafultBankSetting} = require('./controllers/controller');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const task = require("./routes/task");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/task",task);



app.listen(process.env.port || port, (req, res) => {
  console.log("hi");
  conn(DB_URL);
  deafultBankSetting();
});



