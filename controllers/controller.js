const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const { model, bank } = require("../database/model");
const { MongoClient } = require("mongodb");
const cron = require('node-cron');

let BANKBALANCE;

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
  bank.deleteMany({balance:10000000}).then(bank.find({balance:10000000}).then((docs)=>{console.log(docs)}));
  // bank.deleteOne({balance:10000000}).then(console.log('succsess'));
}

const connClient = async (DB_URL) =>{
  const client = new MongoClient(DB_URL);

  const database = client.db();
  const collection = database.collection('bank');
  const documents = await collection.find({}).toArray();
  documents.forEach(element=>{BANKBALANCE=element._id.balance});
  console.log('Documents:', documents);
  console.log(BANKBALANCE);
}

exports.UpdateBank =  (DB_URL) =>{
  setInterval( async ()=>{
    const client = new MongoClient(DB_URL);

    const database = client.db();
    const collection = database.collection('bank');

    // model.updateOne({accountNum:accountNum},{$set:{balance:`${lefOver}`}}).then(console.log('success'));
   await collection.updateOne({name:"디지텍뱅크"},{$set:{balance:`${BANKBALANCE}`}});

    const documents = await collection.find({}).toArray();
    documents.forEach(element=>{console.log(element._id.balance+' Bank '+BANKBALANCE)});
  },10000)
}



exports.checkBank = () =>{
   bank.find({balance:10000000}).then((docs)=>{console.log(docs)});
  // console.log('?//')
}



exports.checkBalance = (aN) =>{
  return model.find({accountNum:aN}).then((docs)=>{console.log(docs)});
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
          
          const balance = 1000000;
          BANKBALANCE -= balance;
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
          console.log(BANKBALANCE);
          resolve(Msg[200]);
        } catch (error) {
          console.error(error.message);
          resolve(Msg[500]);
        }
      });
  })
};

const deposit = async (accountNum,amount) =>{
  let count;
  // collection.updateOne({name:'디지텍뱅크'},{$set:{balance:`${BANKBALANCE}`}}).then( console.log(BANKBALANCE));
  let lefOver = (await model.findOne({accountNum:accountNum})).balance-amount;

  console.log('잔고 '+lefOver)
  model.updateOne({accountNum:accountNum},{$set:{balance:`${lefOver}`}}).then(console.log('success'));
  model.findOne({accountNum:accountNum}).then((docs)=>console.log('left balance'+docs.balance));
  console.log('은행 타입: '+typeof(Number(BANKBALANCE))+' 남은 잔고 타입 : '+typeof(lefOver));
  BANKBALANCE += amount;
  // console.log(`은행돈: ${BANKBALANCE} + 네돈: ${lefOver} = ${BANKBALANCE+lefOver}`);
  // cron.schedule('30 7 * * *',()=>{
  //      console.log('it works')
  // })
}

deposit(9751621386,200000);

// 유저 확인 함수
// exports.checkUsers  = () =>{
//   model.find({}).then((docs)=>{
//    res.send(docs);
//   })
// }

exports.conn = conn;
exports.connClient = connClient;

// module.exports = signUp
