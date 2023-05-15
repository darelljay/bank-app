const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const { model, bank } = require("../database/model");

// 상태메시지 object 
let Msg = { 400: "existing User",401:"id or password does not exist", 500: "server error", 200: "succeded" };

// database 연결함수
const conn = async (DB_URL) => {
  try {
    const connection = mongoose.connection;
    connection.once("open", () => {
      console.log("MongoDB datebase connection established successfully.");
    });
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useUnifiedTopology: true,
    });
    console.log("connected to database");
    express.response.status(200);
  } catch (err) {
    console.log(err);
    express.response.status(400);
  }
};
exports.deleteAll = (id) =>{
  model.deleteMany({name:"darell"}).then(model.find({id:`${id}`}).then((docs)=>{console.log(docs)}));
}

exports.deafultBankSetting = () =>{
  bank.insertMany([{
    balance:100000000,
    nameL:"디지텍 뱅크"
  }]);
};


exports.checkBank = () =>{
   bank.find({balance:100000000}).then((docs)=>{console.log(docs)});
  // console.log('?//')
}

// 회원가입 함수

exports.signUp = async (name, id, password, phoneNum, birthday) => {
  return new Promise((resolve,reject)=>{
  
    let checkUser = [];
  
    model
      .find({ id: `${id}` })
      .then((docs) => {
        for (let item of docs) {
          checkUser.push(item.accountNum);
        }
      })
      .then(() => {
        try {
          console.log(checkUser.length);
          if (checkUser.length > 0) {
            resolve(Msg[400]);
            return 0;
          }

          const accountNum = Math.floor(
            Math.random() * (1000000000 - 1) + 1 + 9000000000
          );

          // const balance =  bankMoney-1000000;


          model.insertMany([
            {
              name: name,
              id: id,
              password: password,
              phoneNum: phoneNum,
              birthday: birthday,
              accountNum: accountNum,
              balance: balance,
            },
          ]);
          console.log(Msg[200]);
          resolve(Msg[200]);
        } catch (error) {
          console.error(error.message);
          resolve(Msg[500]);
        }
      });
  })
};

// 유저 확인 함수
// exports.checkUsers  = () =>{
//   model.find({}).then((docs)=>{
//    res.send(docs);
//   })
// }


exports.conn = conn;

// module.exports = signUp
