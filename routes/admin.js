
  const express=require("express")
  const router=express.Router()
  const AdminController=require("../controller/admin")


  router.post("/admin/login",AdminController.login)
  router.get("/admin/getUsers",AdminController.getUsers)
  router.post("/admin/BlockUser",AdminController.BlockUser)
  router.post("/admin/addCategory",AdminController.addCategory)
  router.get("/admin/getCategory",AdminController.getCategory)
  router.delete("/admin/deleteCategory",AdminController.DeleteCategory)
  router.post("/admin/editCategory",AdminController.editCategory)
  router.get("/admin/getEmployer",AdminController.getEmployer)
  router.post("/admin/BlockEmployer",AdminController.BlockEmployer)
  router.post("/admin/addtoken",AdminController.postToken)
  router.get("/admin/fetchToken",AdminController.fetchToken)
  router.delete("/admin/deleteToken/:id", AdminController.deleteToken);
  router.get("/admin/fetchPayments",AdminController.paymentDetails)









  module.exports=router;