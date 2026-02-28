import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        symptoms: { type: [String], required: true },
        aiSuggestedDiagnosis: { type: String, default: "" },
        aiConfidence: { type: String, default: "" },
        aiRecommendations: { type: [String], default: [] },
        finalDiagnosis: { type: String, default: "" },
        notes: { type: String, default: "" },
        severity: {
            type: String,
            enum: ["mild", "moderate", "severe", "critical"],
            default: "mild",
        },
    },
    { timestamps: true }
);

const DiagnosisModel = mongoose.model("Diagnosis", diagnosisSchema);
export default DiagnosisModel;
