const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const { model, bank } = require("../database/model");
const { MongoClient, ObjectId, Code } = require("mongodb");
const cron = require('node-cron');

let BANKBALANCE;

// 상태메시지 object 
let Msg = { 400: "existing User" ,401:"id or password does not exist", 500: "server error", 200: "succeded",404:"wrong request" };


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

// 은행 collection 에서 돈을 가져와 서버에 넣는 함수
const connClient = async (DB_URL) =>{
  const client = new MongoClient(DB_URL);

  const database = client.db();
  const collection = database.collection('bank');
  const documents = await collection.find({}).toArray();
  documents.forEach(element=>{BANKBALANCE=element._id.balance});
  console.log('Documents:', documents);
  console.log(BANKBALANCE);
}

// 10초에 한번씩 서버에 있는 돈을 collection에 update하는 함수 함수
exports.UpdateBank =  (DB_URL) =>{
  setInterval( async ()=>{
    const client = new MongoClient(DB_URL);

    const database = client.db();
    const collection = database.collection('bank');
    await collection.updateOne({_id:ObjectId},{$set:{balance2:`${BANKBALANCE}`}});
    await collection.updateOne({name:'디지텍뱅크'},{$set:{balance:BANKBALANCE}});
  },10000);
};

// 유저 잔액조회 함수 
exports.checkBalance = (aN) =>{
  return model.find({accountNum:aN}).then((docs)=>{return [...docs]});
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
              accountPw: null,
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

// 하루적금 함수 
exports.daySavings = async (accountNum,amount) =>{
  let lefOver = (await model.findOne({accountNum:accountNum})).balance-amount;
  let savNO = 0;
  console.log('잔고 '+lefOver)
 
  model.findOne({accountNum:accountNum}).then((docs)=>console.log('left balance'+docs.balance));
 

  cron.schedule('0 9 * * *',()=>{
    model.updateOne({accountNum:accountNum},{$set:{balance:`${lefOver}`}}).then(console.log('success'));
    savNO+=amount;
  });

  cron.schedule('0 17 * * *',()=>{
    model.updateOne({accountNum:accountNum},{$set:{balance:`${lefOver}`}}).then(console.log('success'));
    savNO+=amount;
  });

  cron.schedule('59 23',()=>{
    model.updateOne({accountNum:accountNum},{$set:{balance:savNO*0.05}}).then(console.log('success'));
  });
};

exports.weekSavings = async (accountNum,amount)=>{
  let count;
  if(count === 7) return 'code Finished'; 
  let lefOver = (await model.findOne({accountNum:accountNum})).balance-amount;

  if(count===undefined){
    model.updateOne({accountNum:accountNum},{$set:{balance:`${lefOver}`}}).then(console.log('success'));
    BANKBALANCE += amount;
  }

  cron.schedule('0 21 * * *',()=>{
    model.updateOne({accountNum:accountNum},{$set:{balance:amount*0.10}}).then(console.log('success'));
    count++;
  });
};


exports.deposit = async (myAccountNum,urAccountNum,amount) =>{
 await model.find({accountNum:myAccountNum}).then((docs)=>{
    if(docs.length<=0) return console.log("check your account Number");
    console.log(docs);
  });
  await model.find({accountNum:urAccountNum}).then((docs)=>{
    if(docs.length<=0) return console.log("check the account Number your depositing tor");
    console.log(docs);
  });

  let lefOver = (await model.findOne({accountNum:myAccountNum})).balance-amount;
  let bal = (await model.findOne({accountNum:urAccountNum})).balance;

  // console.log(bal )
  await model.updateOne({accountNum:myAccountNum},{$set:{balance:lefOver}});
  await model.updateOne({accountNum:urAccountNum},{$set:{balance:bal+amount}});

  model.find({}).then((docs)=>{console.log(docs.toString())})
  // console
};


// 유저 확인 함수
// exports.checkUsers  = () =>{
//   model.find({}).then((docs)=>{
//    res.send(docs);
//   })
// }

exports.conn = conn;
exports.connClient = connClient;

// module.exports = signUp
