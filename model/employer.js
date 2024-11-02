
const mongoose=require("mongoose")

const EmployerSchema=new mongoose.Schema({
 name: {
   type: String,
 },
 email: {
   type: String,
 },
 phone:{
   type:Number
 },
 password: {
   type: String,
 },
 isBlocked:{
   type:Boolean,
   default:false,
  },
  tokenCount: {
    type: Number,
    default: 0, 
  },
  payments: [
    {
      paymentId: String,
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],
})

      const Employer=mongoose.model("Employer",EmployerSchema)

      module.exports=Employer
      