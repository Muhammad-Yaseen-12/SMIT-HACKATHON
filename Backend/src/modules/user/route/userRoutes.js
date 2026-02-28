import { Router } from "express";
import getController from "../controllers/get.js";
import deleteController from "../controllers/delete.js";
import updateController from "../controllers/update.js";
import tokenVerification from "../../../middlewares/tokenVerification.js";
const router = Router();

router.get("/user", tokenVerification, getController)
router.delete("/user/:id", tokenVerification, deleteController)
router.put("/user/:id", tokenVerification, updateController)

export default router;