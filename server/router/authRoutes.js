import express from "express"
import {register,login,getuser,logout, forgotPassword, resetPassword, updatePassword, updateProfile} from "../controllers/authController.js"
import { isAuthenticated } from "../middlewares/authMiddleware.js"

const router = express.Router()


router.post("/register",register,)
router.post("/login",login)
router.get("/me",isAuthenticated,getuser)
router.get("/logout",isAuthenticated,logout)
router.post("/password/forgot",forgotPassword)
router.put("/password/reset/:token",resetPassword)
router.put("/password/update",isAuthenticated,updatePassword)
router.put("/profile/update",isAuthenticated,updateProfile)

export default router