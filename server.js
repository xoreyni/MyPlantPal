import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Endpoint to create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.PRICE_ID, // your 4.99€ price ID
          quantity: 1,
        },
      ],
      success_url: "https://xoreyni.github.io/MyPlantPal/success.html",
      cancel_url: "https://xoreyni.github.io/MyPlantPal/cancel.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
