import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, resolve, extname } from "path";
import { tmpdir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.VERCEL) {
      cb(null, tmpdir());
    } else {
      cb(null, resolve(__dirname, "../../uploads/slips"));
    }
  },
  filename: (req, file, cb) => {
    const uid = req.user?.uid || "unknown";
    const ts = Date.now();
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `slip_${uid}_${ts}${ext}`);
  },
});


const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
