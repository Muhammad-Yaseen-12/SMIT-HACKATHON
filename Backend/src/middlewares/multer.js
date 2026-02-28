import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/");
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + unique + path.extname(file.originalname)
        );
    }
});

const upload = multer({ storage: storage });
const uploadFile = upload.single("image")
export default uploadFile;