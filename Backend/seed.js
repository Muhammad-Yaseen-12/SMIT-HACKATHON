import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ENV } from "./src/constants/index.js";
import UserModel from "./src/models/UserModel.js";

await mongoose.connect(ENV.MONGO_URL);
console.log("Connected to MongoDB");

const password = await bcrypt.hash("Admin12345!", 10);

const users = [
    { name: "Admin User", email: "admin@clinic.com", password, role: "admin" },
    { name: "Dr. Sarah Khan", email: "doctor@clinic.com", password, role: "doctor", specialization: "General Medicine", consultationFee: 1500 },
    { name: "Ali Receptionist", email: "receptionist@clinic.com", password, role: "receptionist" },
    { name: "John Patient", email: "patient@clinic.com", password, role: "patient", gender: "male", bloodGroup: "O+" },
];

for (const u of users) {
    const exists = await UserModel.findOne({ email: u.email });
    if (exists) { console.log(`⏭  ${u.email} already exists`); continue; }
    await UserModel.create(u);
    console.log(`✅ Created ${u.role}: ${u.email}`);
}

console.log("\n🔑 All demo accounts use password: Admin12345!");
await mongoose.disconnect();
process.exit(0);
