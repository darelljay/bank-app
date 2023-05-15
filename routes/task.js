const express = require('express');
const app = express();
const router = express.Router();
const session = require("express-session");
const { model } = require("../database/model");
const {signUp,deleteAll,checkUsers, checkBank} = require('../controllers/controller');

app.use(session({
   secret: 'kimdarell@1234',
   resave: false,
   saveUninitialized: true,
   cookie:{
       httpOnly:true,
   },
   name:'connect.sid'
}))

router.get('/',(req,res)=>{
    res.status(200).json("server openend");
})

router.get('/delete',(req,res)=>{
   const id = req.body.id;
   deleteAll(id);
   res.status(200).json("ok");
});

// 사용자 인증 미들웨어 
const auth = async (req, res, next) => {
   if (req.session && req.session.user) {
     return checkBank();
   } else {
     return res.sendStatus(401);
   }
 }

router.get('/task123',(req,res)=>{
   auth();
});


router.post('/signUp',(req,res)=>{
const {name,id,password,phoneNum,birthday} = req.body; 
   signUp(name,id,password,phoneNum,birthday).then((msg)=>{
      if (msg === "succeded") {
         console.log(msg);
         res.status(200).json(`${msg}`);
       } else if (msg === "existing User") {
         console.log(msg);
         res.status(400).json(`${msg}`);
       } else {
         console.log(msg);
         res.status(500).json(`${msg}`);
       }
   });
});

router.post('/signIn',(req,res)=>{
   const { id, password } = req.body;
   model.findOne({id,password}).then((docs,err)=>{
      if(err){
         return res.status(500).send("sever error");
      }
      
      if(!docs){
         return res.status(401).send("wrong id or password");
      }
   
        req.session= id;
        console.log(req.session.id);

      return res.status(200).send('login succeded');
   })
});



// router.get('/index',auth,(req,res)=>{
//    return res.status(200);
// });


// router.get('/checkUsers',(req,res)=>{
//    checkUsers();
//    res.status(200).json(checkUsers())
// })//

module.exports = router;