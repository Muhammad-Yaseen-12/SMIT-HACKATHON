import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // receptionist or patient
        appointmentDate: { type: Date, required: true },
        timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
        },
        type: {
            type: String,
            enum: ["general", "follow-up", "emergency", "consultation"],
            default: "general",
        },
        reason: { type: String, default: "" },
        notes: { type: String, default: "" },
        tokenNumber: { type: Number },
    },
    { timestamps: true }
);

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
export default AppointmentModel;
