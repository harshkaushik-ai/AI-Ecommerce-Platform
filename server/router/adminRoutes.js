import express from "express"
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js"
import { dashboardStats, deleteUser, getAllUsers } from "../controllers/adminController.js"

const router = express.Router()

router.get("/getallusers",isAuthenticated,authorizedRoles("Admin"),getAllUsers)
router.delete("/deleteuser/:id",isAuthenticated,authorizedRoles("Admin"),deleteUser)
router.get("/fetch/dashboard-stats",isAuthenticated,authorizedRoles("Admin"),dashboardStats)


export default router