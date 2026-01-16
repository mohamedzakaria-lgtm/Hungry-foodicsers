const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Office name is required'],
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: [true, 'Office location is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Office', officeSchema);
