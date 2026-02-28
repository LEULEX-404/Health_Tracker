import express from "express";
const router = express.Router();
import doctorController from "../../controllers/Priya/doctorController.js";

router.get('/', doctorController.getDoctors);

export default router;