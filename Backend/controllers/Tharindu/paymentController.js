import Stripe from "stripe";

// Initialize Stripe with the test secret key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe PaymentIntent (Generic endpoint for any module).
 * Expects amount (in smallest currency unit, e.g. cents), currency,
 * description, and an optional metadata object.
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = "usd", description, metadata = {} } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required to create a payment intent." });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount, 10),
            currency,
            payment_method_types: ["card"],
            description: description || "PulseNova Services Payment",
            metadata: {
                userId: req.user ? req.user._id.toString() : "guest",
                ...metadata,
            },
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        });
    } catch (error) {
        console.error("Stripe Generic PaymentIntent Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
