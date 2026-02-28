import bcrypt from 'bcrypt';
import findEmail from "../services/findEmail.js";
import postData from "../services/post.js";
import { uploadFileToCloudinary } from "../../../config/cloudinary.js";
import fileDelete from '../services/fileDelete.js';
import { INTERNAL_SERVER_ERROR_MESSAGE, EMAIL_ALREADY_REGISTERED_MESSAGE, ALL_FIELDS_REQUIRED_MESSAGE, REGISTERED_SUCCESS_MESSAGE } from '../../../constants/index.js';

const registerUserController = async (req, res) => {
    try {
        const filePath = req.file?.path;
        const { name, email, password, role, phone, specialization, qualification, experience, consultationFee, dateOfBirth, gender, bloodGroup, address } = req.body;

        if (!name || !email || !password) {
            if (filePath) await fileDelete(filePath);
            return res.status(400).json({ success: false, message: ALL_FIELDS_REQUIRED_MESSAGE });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await findEmail(normalizedEmail);
        if (existingUser) {
            if (filePath) await fileDelete(filePath);
            return res.status(409).json({ success: false, message: EMAIL_ALREADY_REGISTERED_MESSAGE });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profileImageUrl = "";
        if (filePath) {
            const result = await uploadFileToCloudinary(filePath);
            await fileDelete(filePath);
            profileImageUrl = result.secure_url;
        }

        const newUser = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role || "patient",
            phone: phone || "",
            profileImageUrl,
            specialization: specialization || "",
            qualification: qualification || "",
            experience: experience ? Number(experience) : 0,
            consultationFee: consultationFee ? Number(consultationFee) : 0,
            dateOfBirth: dateOfBirth || null,
            gender: gender || "male",
            bloodGroup: bloodGroup || "",
            address: address || "",
        };

        const data = await postData(newUser);
        const { password: _, ...safeData } = data;
        res.status(201).json({ success: true, message: REGISTERED_SUCCESS_MESSAGE, data: safeData });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: error.message });
    }
}
export default registerUserController;
