import { Request, Response } from "express";
import util from "util";
import Stripe from "stripe";
import Order from "../infrastructure/db/entities/Order";
import stripe from "../infrastructure/stripe";
import Product from "../infrastructure/db/entities/Product";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

interface ProductType {
  _id: string;
  stock: number;
  stripePriceId: string;
  name: string;
  image?: string;        // ✅ Added
  description?: string;  // ✅ Added
}


// 🔧 FIXED: Webhook Logic - Only deduct stock once
// File: src/application/payment.ts

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session " + sessionId);
  console.log("🔔 WEBHOOK TRIGGERED - Session:", sessionId);
  console.log("🕐 Timestamp:", new Date().toISOString());


  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const order = await Order.findById(
      checkoutSession.metadata?.orderId
    ).populate<{
      items: { productId: ProductType; quantity: number }[];
    }>("items.productId");

    if (!order) {
      throw new Error("Order not found");
    }

    // Prevent duplicate processing
    if (order.paymentStatus !== "PENDING") {
      console.log("Payment is not pending, skipping fulfillment");
      return;
    }

    if (order.orderStatus !== "PENDING") {
      console.log("Order is not pending, skipping fulfillment");
      return;
    }

    if (checkoutSession.payment_status === "paid") {
      console.log("💳 Payment successful - Processing online order");

      // 🔧 KEY FIX: Only deduct stock here for online payments
      // COD orders already had stock deducted during order creation
      if (order.paymentMethod !== "COD") {
        console.log("📦 Deducting stock for online payment order");

        for (const item of order.items) {
          const product = item.productId;

          // Check if stock is still available
          const currentProduct = await Product.findById(product._id);
          if (!currentProduct || currentProduct.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          // Deduct stock
          await Product.findByIdAndUpdate(product._id, {
            $inc: {
              stock: -item.quantity,
              salesCount: item.quantity
            }
          });

          console.log(`📦 Stock deducted for ${product.name}: -${item.quantity}`);
        }
      } else {
        console.log("💰 COD order - stock already deducted during creation");
      }

      // Update order status
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        updatedAt: new Date()
      });

      console.log("✅ Order fulfilled successfully:", order._id);
    }
  } catch (error) {
    console.error("❌ Error in fulfillCheckout:", error);

    // 🔧 FIXED: Get checkoutSession in catch block scope
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (checkoutSession.metadata?.orderId) {
        await Order.findByIdAndUpdate(
          checkoutSession.metadata.orderId,
          {
            orderStatus: 'CANCELLED',
            paymentStatus: 'FAILED',
            updatedAt: new Date()
          }
        );
        console.log("📝 Order cancelled due to payment processing error");
      }
    } catch (retrieveError) {
      console.error("❌ Error retrieving session for cancellation:", retrieveError);
    }

    throw error;
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook signature verified successfully");
    console.log(`🔔 Received event: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("🎉 Payment successful for session:", session.id);
        console.log("🔄 Webhook processing started");

        if (session.payment_status === 'paid') {
          await fulfillCheckout(session.id);
        }
        break;

      case 'checkout.session.async_payment_succeeded':
        const asyncSession = event.data.object as Stripe.Checkout.Session;
        console.log("🎉 Async payment successful for session:", asyncSession.id);
        await fulfillCheckout(asyncSession.id);
        break;

      case 'checkout.session.async_payment_failed':
        const failedSession = event.data.object as Stripe.Checkout.Session;
        console.log("❌ Async payment failed for session:", failedSession.id);

        if (failedSession.metadata?.orderId) {
          await Order.findByIdAndUpdate(
            failedSession.metadata.orderId,
            {
              orderStatus: 'CANCELLED',
              paymentStatus: 'FAILED',
              updatedAt: new Date()
            }
          );
          console.log("📝 Order cancelled due to payment failure");
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log("⏰ Payment session expired:", expiredSession.id);

        if (expiredSession.metadata?.orderId) {
          await Order.findByIdAndUpdate(
            expiredSession.metadata.orderId,
            {
              orderStatus: 'CANCELLED',
              updatedAt: new Date()
            }
          );
          console.log("📝 Order cancelled due to payment expiry");
        }
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("❌ Error handling webhook event:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  res.json({ received: true });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    console.log("Creating checkout session for order:", orderId);

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findById(orderId).populate<{
      items: { productId: ProductType; quantity: number; price: number }[]; // ✅ Added price type
    }>("items.productId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderStatus !== "PENDING") {
      return res.status(400).json({ error: "Order is not in pending status" });
    }

    // Stock validation
    for (const item of order.items) {
      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.productId.name} (Available: ${item.productId.stock}, Requested: ${item.quantity})`
        });
      }
    }

    // ✅ NEW: Price validation - Verify order totals match item prices
    console.log("🔍 Validating order prices before Stripe session...");

    let calculatedTotal = 0;
    for (const item of order.items) {
      const itemTotal = item.price * item.quantity;
      calculatedTotal += itemTotal;

      console.log(`📦 ${item.productId.name}: $${item.price.toFixed(2)} × ${item.quantity} = $${itemTotal.toFixed(2)}`);
    }

    // Check if calculated total matches order total (allow 1 cent difference for rounding)
    if (Math.abs(calculatedTotal - order.totalAmount) > 0.01) {
      console.error("❌ Price mismatch detected!", {
        calculated: calculatedTotal.toFixed(2),
        orderTotal: order.totalAmount.toFixed(2),
        difference: Math.abs(calculatedTotal - order.totalAmount).toFixed(2)
      });

      return res.status(400).json({
        error: "Price validation failed. Order total doesn't match item prices.",
        details: {
          calculated: calculatedTotal.toFixed(2),
          orderTotal: order.totalAmount.toFixed(2)
        }
      });
    }

    console.log("✅ Price validation passed: $" + calculatedTotal.toFixed(2));

    // ✅ FIXED: Create Stripe session with dynamic prices (not stripePriceId)
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: order.items.map((item) => ({
        // ✅ CRITICAL CHANGE: Use price_data instead of stripePriceId
        price_data: {
          currency: 'usd',  // Change to 'lkr' if you want Sri Lankan Rupees
          product_data: {
            name: item.productId.name,
            images: item.productId.image ? [item.productId.image] : [],
            description: item.productId.description || undefined,
          },
          // ✅ CRITICAL: Use the discounted price from ORDER, not from product
          unit_amount: Math.round(item.price * 100), // Convert dollars to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      return_url: `${FRONTEND_URL}/payment-complete?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      payment_method_types: ['card'],
      customer_email: req.body.customerEmail,
    });

    console.log("✅ Checkout session created successfully:", session.id);
    console.log("💰 Total amount in Stripe session: $" + (session.amount_total! / 100).toFixed(2));

    res.json({ clientSecret: session.client_secret });

  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession.metadata?.orderId) {
      return res.status(400).json({ error: "No order ID found in session" });
    }

    const order = await Order.findById(checkoutSession.metadata.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Add detailed logging for debugging
    console.log("🔍 Session Status Response:", {
      sessionId,
      sessionStatus: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      orderId: order._id,
      orderStatus: order.orderStatus,
      orderPaymentStatus: order.paymentStatus
    });

    res.status(200).json({
      orderId: order._id,
      status: checkoutSession.status, // Frontend expects 'status' property
      paymentStatus: checkoutSession.payment_status,
      customer_email: checkoutSession.customer_details?.email,
      orderStatus: order.orderStatus,
      orderPaymentStatus: order.paymentStatus,
      amount_total: checkoutSession.amount_total,
      currency: checkoutSession.currency,
    });

  } catch (error: any) {
    console.error("❌ Error retrieving session status:", error);
    res.status(500).json({
      error: "Failed to retrieve session status",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};