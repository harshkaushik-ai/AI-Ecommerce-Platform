import database from "../database/db.js";
import Stripe from "stripe";

export  async function generatePaymentIntent(order_id,total_price) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount:total_price * 100,
            currency:"USD"
        })

        await database.query(`INSERT INTO payments (order_id,payment_type,payment_status,payment_intent_id) VALUES ($1,$2,$3,$4)RETURNING *`,[order_id,"Online","Pending",paymentIntent.id])

    return {success:true,client_secret:paymentIntent.client_secret}
    }catch(error){
        console.error("Payment Error:", error.message || error);
        return { success: false, message: "Payment Failed." };
    }
}