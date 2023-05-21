
const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    password:{type: String, required: true},
    birthday:{type: String, required: true},
    phoneNum:{type:String, required: true},
    accountNum:{type:Number},
    id:{type:String,required: true},
    balance:{type:Number}
});




exports.model = mongoose.model('model', StudentSchema);
