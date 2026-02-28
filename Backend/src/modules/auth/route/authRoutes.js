import { Router } from "express";
import registerUserController from "../controllers/registerUserController.js";
import uploadFile from "../../../middlewares/multer.js";
import deleteImageController from "../controllers/deleteImage.js";
import loginUserController from "../controllers/loginUserController.js";
import logoutController from "../controllers/logoutController.js";
import getMeController from "../controllers/getMeController.js";
import tokenVerification from "../../../middlewares/tokenVerification.js";

const router = Router();

router.post("/auth/register", uploadFile, registerUserController);
router.post("/auth/login", loginUserController);
router.post("/auth/logout", logoutController);
router.get("/auth/me", tokenVerification, getMeController);
router.post("/deleteImage", deleteImageController);

export default router;
