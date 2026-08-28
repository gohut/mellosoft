import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "../../../../../lib/razorpay";
import { getDb, schema } from "../../../../../db";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature." },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const db = getDb();

      if (db && razorpayOrderId) {
        await db
          .update(schema.orders)
          .set({
            paymentStatus: "Paid",
            razorpayPaymentId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.orders.razorpayOrderId, razorpayOrderId));
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
