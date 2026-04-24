import express from "express";
import { 
  getRoomByCode, 
  getAllPublicRooms 
} from "../controllers/roomController.js";

const router = express.Router();

// GET /api/rooms - List public rooms
router.get("/", getAllPublicRooms);

// GET /api/rooms/:code - Get room info by code
router.get("/:code", getRoomByCode);

export default router;
