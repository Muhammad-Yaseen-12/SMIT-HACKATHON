import { Router } from "express";
import tokenVerification from "../../../middlewares/tokenVerification.js";
import authorizeRoles from "../../../middlewares/authorizeRoles.js";
import uploadFile from "../../../middlewares/multer.js";
import {
    getDoctors, getReceptionists, getAllPatients, getAllUsers,
    createStaff, updateUser, toggleUserStatus, deleteUser, getAnalytics,
    getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan,
    toggleSubscriptionPlan, deleteSubscriptionPlan, getSystemUsage,
} from "../controllers/adminController.js";

const router = Router();
const protect = [tokenVerification, authorizeRoles("admin")];

router.get("/admin/analytics", ...protect, getAnalytics);
router.get("/admin/system-usage", ...protect, getSystemUsage);
router.get("/admin/users", ...protect, getAllUsers);
router.get("/admin/doctors", ...protect, getDoctors);
router.get("/admin/receptionists", ...protect, getReceptionists);
router.get("/admin/patients", ...protect, getAllPatients);
router.post("/admin/staff", ...protect, uploadFile, createStaff);
router.patch("/admin/users/:id", ...protect, uploadFile, updateUser);
router.patch("/admin/users/:id/toggle", ...protect, toggleUserStatus);
router.delete("/admin/users/:id", ...protect, deleteUser);

// Subscription plans
router.get("/admin/subscriptions", ...protect, getSubscriptionPlans);
router.post("/admin/subscriptions", ...protect, createSubscriptionPlan);
router.patch("/admin/subscriptions/:id", ...protect, updateSubscriptionPlan);
router.patch("/admin/subscriptions/:id/toggle", ...protect, toggleSubscriptionPlan);
router.delete("/admin/subscriptions/:id", ...protect, deleteSubscriptionPlan);

export default router;
