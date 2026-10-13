import { NextResponse } from "next/server";
import { verifyPaymentSchema } from "../../../../lib/validators";
import { verifyPaymentConfirmation } from "../../../../lib/payments";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid verification payload" },
        { status: 400 }
      );
    }

    const result = await verifyPaymentConfirmation(validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderStatus: result.orderStatus,
      paymentStatus: result.paymentStatus,
      message: "Payment successfully verified.",
    });
  } catch (error) {
    console.error("Payment verification route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
