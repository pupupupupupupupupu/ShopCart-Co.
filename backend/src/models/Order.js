const mongoose = require("mongoose");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_TRANSITIONS = {
  pending:    ["processing", "cancelled"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped:    ["delivered"],
  delivered:  ["refunded"],
  cancelled:  [],
  refunded:   [],
};

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    qty:       { type: Number, required: true, min: 1 },
    image:     String,
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    label:   String,
    street:  String,
    city:    String,
    state:   String,
    zip:     String,
    country: { type: String, default: "US" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:     { type: String, required: true },
    items:    [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax:      { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    totalAmount:     { type: Number, required: true, min: 0 },
    shippingAddress: shippingAddressSchema,
    status: {
      type:    String,
      enum:    ORDER_STATUSES,
      default: "pending",
    },
    paymentMethod:         { type: String, default: "card" },
    paymentStatus:         { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    stripePaymentIntentId: { type: String },   // NO unique:true here — index below handles it
    transactionId:         String,
    couponCode:            String,
    couponDiscount:        { type: Number, default: 0 },
    adminNote:             String,
  },
  { timestamps: true }
);

// All indexes in one place — no duplicates
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true, unique: true });

orderSchema.methods.canTransitionTo = function (newStatus) {
  return STATUS_TRANSITIONS[this.status]?.includes(newStatus) ?? false;
};

module.exports = mongoose.model("Order", orderSchema);
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
