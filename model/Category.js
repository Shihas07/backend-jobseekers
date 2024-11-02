
 
 const mongoose=require("mongoose")

   
 const CategorySchema=new mongoose.Schema({
    
       categoryName:{
         type:String,

       }
 })


 const Category=mongoose.model("Category",CategorySchema)

 module.exports=Category

