import express from "express"
import {isAuthenticated,authorizedRoles} from "../middlewares/authMiddleware.js"
import { createProduct,deleteProduct,deleteReview,fetchAIFilteredProducts,fetchAllProducts, fetchSingleProduct, postProductReview, updateProduct } from "../controllers/productController.js"

const router = express.Router()

router.post("/admin/create",isAuthenticated,authorizedRoles("Admin"),createProduct)
router.get("/",fetchAllProducts)
router.put("/admin/update/:productID",isAuthenticated,authorizedRoles("Admin"),updateProduct)
router.delete("/admin/delete/:productID",isAuthenticated,authorizedRoles("Admin"),deleteProduct)
router.get("/singleproduct/:productID",fetchSingleProduct)
router.put("/post-new/review/:productID",isAuthenticated,postProductReview)
router.delete("/delete/review/:productID",isAuthenticated,deleteReview)
router.get("/aisearch",fetchAIFilteredProducts)

export default router
