const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order creator is required'],
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Office',
      required: [true, 'Office is required'],
    },
    restaurant: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    restaurantPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'ordered', 'delivered', 'cancelled'],
      default: 'open',
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    orderedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
orderSchema.pre('save', async function (next) {
  if (this.items && this.items.length > 0) {
    const OrderItem = mongoose.model('OrderItem');
    const items = await OrderItem.find({ _id: { $in: this.items } });
    this.totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
