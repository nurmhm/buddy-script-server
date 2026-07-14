import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(_, __, cb) {
    cb(null, "uploads");
  },
  filename(_, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random()}${ext}`);
  },
});

export const upload = multer({ storage });