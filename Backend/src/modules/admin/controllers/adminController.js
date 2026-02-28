import mongoose from "mongoose";
import UserModel from "../../../models/UserModel.js";
import AppointmentModel from "../../../models/AppointmentModel.js";
import PrescriptionModel from "../../../models/PrescriptionModel.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../../../constants/index.js";
import bcrypt from "bcrypt";
import { uploadFileToCloudinary } from "../../../config/cloudinary.js";
import os from "os";

// ---------- Simulated subscription plans (in-memory store) ----------
let subscriptionPlans = [
    { id: "1", name: "Basic", price: 4999, billingCycle: "monthly", maxDoctors: 2, maxPatients: 200, features: ["Appointments", "Prescriptions", "Basic Analytics"], isActive: true, popular: false },
    { id: "2", name: "Pro", price: 12999, billingCycle: "monthly", maxDoctors: 10, maxPatients: 1000, features: ["All Basic", "AI Diagnosis", "Advanced Analytics", "PDF Reports"], isActive: true, popular: true },
    { id: "3", name: "Enterprise", price: 29999, billingCycle: "monthly", maxDoctors: -1, maxPatients: -1, features: ["All Pro", "Unlimited Staff", "Priority Support", "Custom Branding"], isActive: true, popular: false },
];

// Get all doctors
export const getDoctors = async (req, res) => {
    try {
        const doctors = await UserModel.find({ role: "doctor", isActive: true }).select("-password");
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get all receptionists
export const getReceptionists = async (req, res) => {
    try {
        const receptionists = await UserModel.find({ role: "receptionist", isActive: true }).select("-password");
        res.status(200).json({ success: true, data: receptionists });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get all patients
export const getAllPatients = async (req, res) => {
    try {
        const patients = await UserModel.find({ role: "patient" }).select("-password");
        res.status(200).json({ success: true, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get all users (any role)
export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await UserModel.find(filter).select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Create doctor or receptionist
export const createStaff = async (req, res) => {
    try {
        const { name, email, password, role, phone, specialization, qualification, experience, consultationFee } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (!["doctor", "receptionist"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

        let profileImageUrl = "";
        if (req.file) {
            const result = await uploadFileToCloudinary(req.file.path);
            profileImageUrl = result.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            name, email, password: hashedPassword, role, phone,
            profileImageUrl, specialization, qualification,
            experience: experience || 0, consultationFee: consultationFee || 0,
        });
        const { password: _, ...safeUser } = user.toObject();
        res.status(201).json({ success: true, message: "Staff created successfully", data: safeUser });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Update user (doctor / receptionist)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ["name", "phone", "specialization", "qualification", "experience", "consultationFee", "availableDays", "availableTimeStart", "availableTimeEnd"];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        if (req.file) {
            const result = await uploadFileToCloudinary(req.file.path);
            updates.profileImageUrl = result.secure_url;
        }

        const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Analytics overview
export const getAnalytics = async (req, res) => {
    try {
        const [totalDoctors, totalPatients, totalReceptionists, totalAppointments, completedAppointments, cancelledAppointments, pendingAppointments] = await Promise.all([
            UserModel.countDocuments({ role: "doctor", isActive: true }),
            UserModel.countDocuments({ role: "patient" }),
            UserModel.countDocuments({ role: "receptionist", isActive: true }),
            AppointmentModel.countDocuments(),
            AppointmentModel.countDocuments({ status: "completed" }),
            AppointmentModel.countDocuments({ status: "cancelled" }),
            AppointmentModel.countDocuments({ status: "pending" }),
        ]);

        // Monthly appointments for chart
        const monthlyData = await AppointmentModel.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$appointmentDate" }, year: { $year: "$appointmentDate" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 },
        ]);

        // Revenue estimate (consultationFee * completed appointments per doctor)
        const revenueData = await AppointmentModel.aggregate([
            { $match: { status: "completed" } },
            { $lookup: { from: "users", localField: "doctor", foreignField: "_id", as: "doctorInfo" } },
            { $unwind: "$doctorInfo" },
            { $group: { _id: null, totalRevenue: { $sum: "$doctorInfo.consultationFee" } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalDoctors, totalPatients, totalReceptionists,
                totalAppointments, completedAppointments, cancelledAppointments, pendingAppointments,
                estimatedRevenue: revenueData[0]?.totalRevenue || 0,
                monthlyAppointments: monthlyData,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// ────────── Subscription Plans ──────────
export const getSubscriptionPlans = (_req, res) => {
    res.status(200).json({ success: true, data: subscriptionPlans });
};

export const createSubscriptionPlan = (req, res) => {
    const { name, price, billingCycle, maxDoctors, maxPatients, features } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: "Name and price are required" });
    const plan = { id: Date.now().toString(), name, price: Number(price), billingCycle: billingCycle || "monthly", maxDoctors: Number(maxDoctors) || -1, maxPatients: Number(maxPatients) || -1, features: features || [], isActive: true, popular: false };
    subscriptionPlans.push(plan);
    res.status(201).json({ success: true, message: "Plan created", data: plan });
};

export const updateSubscriptionPlan = (req, res) => {
    const { id } = req.params;
    const idx = subscriptionPlans.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Plan not found" });
    subscriptionPlans[idx] = { ...subscriptionPlans[idx], ...req.body, id };
    res.status(200).json({ success: true, message: "Plan updated", data: subscriptionPlans[idx] });
};

export const toggleSubscriptionPlan = (req, res) => {
    const { id } = req.params;
    const plan = subscriptionPlans.find(p => p.id === id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    plan.isActive = !plan.isActive;
    res.status(200).json({ success: true, message: `Plan ${plan.isActive ? "activated" : "deactivated"}`, data: plan });
};

export const deleteSubscriptionPlan = (req, res) => {
    const { id } = req.params;
    subscriptionPlans = subscriptionPlans.filter(p => p.id !== id);
    res.status(200).json({ success: true, message: "Plan deleted" });
};

// ────────── System Usage ──────────
export const getSystemUsage = async (_req, res) => {
    try {
        const [totalUsers, activeUsers, totalAppointments, todayAppointments, totalPrescriptions, dbStats] = await Promise.all([
            UserModel.countDocuments(),
            UserModel.countDocuments({ isActive: true }),
            AppointmentModel.countDocuments(),
            AppointmentModel.countDocuments({ appointmentDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            PrescriptionModel.countDocuments(),
            mongoose.connection.db.stats(),
        ]);

        const uptimeSeconds = process.uptime();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const recentActivity = await AppointmentModel.find()
            .sort({ createdAt: -1 }).limit(5)
            .populate("patient", "name").populate("doctor", "name")
            .select("patient doctor status createdAt appointmentDate");

        res.status(200).json({
            success: true,
            data: {
                server: {
                    uptime: uptimeSeconds,
                    uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
                    memoryUsedMB: Math.round(usedMem / 1024 / 1024),
                    memoryTotalMB: Math.round(totalMem / 1024 / 1024),
                    memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
                    platform: os.platform(),
                    nodeVersion: process.version,
                },
                database: {
                    collections: dbStats.collections,
                    totalDocuments: dbStats.objects,
                    dataSizeMB: Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100,
                    storageSizeMB: Math.round(dbStats.storageSize / 1024 / 1024 * 100) / 100,
                },
                stats: { totalUsers, activeUsers, totalAppointments, todayAppointments, totalPrescriptions },
                recentActivity,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};
