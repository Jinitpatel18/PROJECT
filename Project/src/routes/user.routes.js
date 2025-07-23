import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
router.route('/register').post(
    upload.single({ avatar }, { coverImage }),
    registerUser);
export default router;