import express from "express";
import {
  listPublicCabins,
  showCabinDetail,
} from "../controllers/cabin.controller.js";

const router = express.Router();

router.get("/", listPublicCabins);
router.get("/detail/:id", showCabinDetail);

export default router;
