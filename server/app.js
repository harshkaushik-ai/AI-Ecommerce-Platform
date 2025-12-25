// import dotenv from "dotenv";
// dotenv.config({ path: "./config/config.env" });
// import express from "express";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import fileUpload from "express-fileupload";
// import { createTables } from "./utils/createTables.js";
// import { errorMiddleware } from "./middlewares/errorMiddleware.js";
// import authRouter from "./router/authRoutes.js"
// import productRouter from "./router/productRoutes.js"
// import adminRouter from "./router/adminRoutes.js"
// import orderRouter from "./router/orderRoutes.js"
// import Stripe from "stripe";
// import { generatePaymentIntent } from "./utils/generatePaymentIntent.js";
// import database from "./database/db.js";

// const app= express();


// app.use(cors({
//     origin: [process.env.FRONTEND_URL,process.env.DASHBOARD_URL],
//     methods: ["GET","POST","PUT","DELETE"],
//     credentials: true,
// }))


// app.post("/api/v1/payment/webhook",
//     express.raw({type:"application/json"}),
//     async (req,res)=>{
//         const sig = req.headers["stripe-signature"]
//         let event
//         try{
//             event = Stripe.webhooks.constructEvent(
//                 req.body,sig,process.env.STRIPE_WEBHOOK_SECRET
//             )
//         }catch(error){
//             return res.status(400).send(`Webhook error ${error.message || error}`)
//         }
        
//         //Handling Events
//         if(event.type === "payment_intent.succeeded"){
//             const paymentIntentId = event.data.object.id
            
//             try{
//                 const updatedPaymentStatus = "Paid"
//                 const paymentTableUpdateResult = await database.query(`UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,[updatedPaymentStatus,paymentIntentId])
//                 await database.query(`UPDATE orders SET paid_at = NOW() WHERE id = $1`,[paymentTableUpdateResult.rows[0].order_id])
                
//                 const orderId = paymentTableUpdateResult.rows[0].order_id
//                 const {rows:orderedItems} = await database.query(`SELECT product_id,quantity FROM order_items WHERE order_id = $1`,[orderId])
                
//                 for(const item of orderedItems){
//                     await database.query(`UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING *`,[item.quantity,item.product_id] )}
//                 }catch(error){
//                     res.status(500).send(`Error in updateing paid_at timestamp in orders table`)
//                 }
//             }
//             res.status(200).send({ received: true });
//         }
        
//     )

// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// app.use(cookieParser());
// app.use(fileUpload({
//     tempFileDir: "./uploads",
//     useTempFiles: true
// }))

// app.use("/api/v1/auth",authRouter)
// app.use("/api/v1/product",productRouter)
// app.use("/api/v1/admin",adminRouter)
// app.use("/api/v1/order",orderRouter)
// const today = new Date()
// // console.log(new Date(today.getFullYear(),today.getMonth(),1))
// // console.log(new Date(today.getFullYear(),today.getMonth()+1,0))
// // console.log(new Date(today.getFullYear(),today.getMonth()-1,1))
// // console.log(new Date(today.getFullYear(),today.getMonth(),0))
// // await createTables()
// app.use(errorMiddleware)

// export default app



import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import Stripe from "stripe";
import database from "./database/db.js";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import orderRouter from "./router/orderRoutes.js";

const app = express();

/* ✅ STRIPE WEBHOOK — MUST BE BEFORE express.json() */
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentId = event.data.object.id;

      try {
        const { rows } = await database.query(
          `UPDATE payments 
           SET payment_status = 'Paid' 
           WHERE payment_intent_id = $1 
           RETURNING order_id`,
          [paymentIntentId]
        );

        if (!rows.length) {
          return res.status(200).send({ received: true });
        }

        const orderId = rows[0].order_id;

        await database.query(
          `UPDATE orders SET paid_at = NOW() WHERE id = $1`,
          [orderId]
        );

        const { rows: orderedItems } = await database.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
          [orderId]
        );

        for (const item of orderedItems) {
          await database.query(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      } catch (err) {
        console.error(err);
        return res.status(500).send("Webhook error");
      }
    }

    res.status(200).send({ received: true });
  }
);

/* normal middleware AFTER webhook */
app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

app.use(errorMiddleware);

export default app;
