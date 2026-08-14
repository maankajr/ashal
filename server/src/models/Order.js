import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    region: String,
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "cod" },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
