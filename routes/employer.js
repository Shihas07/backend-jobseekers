const express = require("express");
const router = express.Router();
const employerController = require("../controller/employer");

router.post("/employer/signup", employerController.signup);
router.post("/employer/login", employerController.Login);
router.get("/employer/fetchTokenPrice", employerController.fetchTokenPrice);

router.post("/employer/payment", employerController.Payment);
router.post("/employer/verify", employerController.verifyPayment);
router.get("/employer/tokenCount/:id", employerController.tokenCount);
router.get("/employer/fetchCategory", employerController.categoryFetch);
router.post("/employer/postJob/:id", employerController.postJobData);
router.get("/employer/fetchJob/:id", employerController.fetchJob);
router.post("/employer/editJobPost", employerController.editJob);

router.delete("/employer/delete/:id", employerController.postdelete);












module.exports = router;
