import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/db";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const razorpaySignature = request.headers.get("x-razorpay-signature");
    const stripeSignature = request.headers.get("stripe-signature");

    // 1. RAZORPAY WEBHOOK
    if (razorpaySignature) {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret unconfigured" }, { status: 500 });
      }

      const expectedSig = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
      if (expectedSig !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }

      const event = JSON.parse(rawBody);
      const eventName = event.event;
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;

      if (orderId && (eventName === "payment.captured" || eventName === "order.paid")) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: "Confirmed", paymentStatus: "Paid" },
          }),
          prisma.paymentAttempt.create({
            data: {
              paymentId: orderId, // or link to payment
              event: eventName,
              status: "captured",
              payload: event,
            },
          }),
        ]);
      }

      return NextResponse.json({ received: true });
    }

    // 2. STRIPE WEBHOOK
    if (stripeSignature) {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret unconfigured" }, { status: 500 });
      }

      // Basic payload parse
      const event = JSON.parse(rawBody);
      if (event.type === "payment_intent.succeeded") {
        const intent = event.data?.object;
        const orderId = intent?.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: "Confirmed", paymentStatus: "Paid" },
          });
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ error: "Unrecognized webhook signature header" }, { status: 400 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
