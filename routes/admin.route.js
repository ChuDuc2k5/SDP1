import express from "express";
import multer from "multer";
import {
  cloneCabin,
  listCabins,
  removeCabin,
  renderCreateCabin,
  renderEditCabin,
  renderOrders,
  renderSettings,
  saveCabin,
  saveSettings,
  storeCabin,
} from "../controllers/admin.controller.js";
import { requireCabinOwner } from "../middlewares/auth.middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/cabins");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.use(requireCabinOwner);

router.get("/cabins", listCabins);
router.get("/cabins/add", renderCreateCabin);
router.post("/cabins/add", upload.single("image"), storeCabin);
router.get("/cabins/edit/:id", renderEditCabin);
router.post("/cabins/edit/:id", upload.single("image"), saveCabin);
router.post("/cabins/delete/:id", removeCabin);
router.post("/cabins/clone/:id", cloneCabin);
router.get("/settings", renderSettings);
router.post("/settings", saveSettings);
router.get("/orders", renderOrders);

export default router;
