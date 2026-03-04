import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./src/routes/index.js";
import dbConnect from "./src/config/db.js";
import cookieParser from 'cookie-parser';
import { ENV } from "./src/constants/index.js";

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aiclinicmanagementsystem.netlify.app/',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
        // Reject silently — don't pass an Error or Express will 500
        callback(null, false);
    },
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(ENV.COOKIE_SECRET));

const PORT = ENV.PORT || ENV.port || 8080;

dbConnect();

app.get("/", (req, res) => {
    res.json({ success: true, message: "AI Clinic Management API is running" });
});

app.use("/", routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
