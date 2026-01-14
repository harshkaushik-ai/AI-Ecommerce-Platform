


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
      event = Stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message || error}`);
    }

    // Handling the Event

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentId = event.data.object.id;
      try {
        // FINDING AND UPDATED PAYMENT
        const updatedPaymentStatus = "Paid";
        const paymentTableUpdateResult = await database.query(
          `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
          [updatedPaymentStatus, paymentIntentId]
        );
        await database.query(
          `UPDATE orders SET paid_at = NOW() WHERE id = $1 RETURNING *`,
          [paymentTableUpdateResult.rows[0].order_id]
        );

        // Reduce Stock For Each Product
        const orderId = paymentTableUpdateResult.rows[0].order_id;

        const { rows: orderedItems } = await database.query(
          `
            SELECT product_id, quantity FROM order_items WHERE order_id = $1
          `,
          [orderId]
        );

        // For each ordered item, reduce the product stock
        for (const item of orderedItems) {
          await database.query(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      } catch (error) {
        return res
          .status(500)
          .send(`Error updating paid_at timestamp in orders table.`);
      }
    }
    res.status(200).send({ received: true });
  }
);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://nexza.netlify.app"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.options("*", cors()); // Enable pre-flight for all routesnom

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
