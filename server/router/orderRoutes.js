import express from "express"
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js"
import { deleteOrder, fetchAllOrders, fetchMyOrders, fetchSingleOrder, placeNewOrder, updateOrderStatus, confirmPayment } from "../controllers/orderController.js"

const router = express.Router()

router.post("/new",isAuthenticated,placeNewOrder)
router.post("/confirm-payment",isAuthenticated,confirmPayment)
router.get("/:orderId",isAuthenticated,fetchSingleOrder)
router.get("/orders/me",isAuthenticated,fetchMyOrders)
router.get("/admin/getall",isAuthenticated,authorizedRoles("Admin"),fetchAllOrders)
router.put("/admin/updateorder/:orderId",isAuthenticated,authorizedRoles("Admin"),updateOrderStatus)
router.delete("/admin/deleteorder/:orderId",isAuthenticated,authorizedRoles("Admin"),deleteOrder)

export default router