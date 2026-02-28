import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "doctor", "receptionist", "patient"],
            required: true,
            default: "patient",
        },
        profileImageUrl: { type: String, default: "" },
        phone: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        // Doctor-specific fields
        specialization: { type: String, default: "" },
        qualification: { type: String, default: "" },
        experience: { type: Number, default: 0 },
        consultationFee: { type: Number, default: 0 },
        availableDays: { type: [String], default: [] },
        availableTimeStart: { type: String, default: "09:00" },
        availableTimeEnd: { type: String, default: "17:00" },
        // Patient-specific fields
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"], default: "male" },
        bloodGroup: { type: String, default: "" },
        address: { type: String, default: "" },
        emergencyContact: { type: String, default: "" },
    },
    { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
