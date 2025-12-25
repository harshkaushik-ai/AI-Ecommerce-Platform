import {createUserTable} from "../models/userTable.js"
import {createOrderItemTable} from "../models/orderItemsTable.js"
import {createOrdersTable} from "../models/ordersTable.js"
import {createProductReviewsTable} from "../models/productReviewsTable.js"
import {createProductsTable} from "../models/productsTable.js"
import {createShippingInfoTable} from "../models/shippinginfoTable.js"
import {createPaymentsTable} from "../models/paymentTable.js"


export const createTables=async()=>{
try{
    await createUserTable()
    await createProductsTable()
    await createProductReviewsTable()
    await createOrdersTable()
    await createOrderItemTable()
    await createShippingInfoTable()
    await createPaymentsTable()
    console.log("All Tables created successfully")
}catch(error){
    console.log("error in creating tables:",error)
}
}