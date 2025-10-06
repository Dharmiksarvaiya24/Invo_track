import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  itemPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  // Optional: Category of the item
  category: {
    type: String,
    trim: true,
    default: 'General', // Optional, default value
  },
  // Optional: Stock quantity
  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  // Optional: Description
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Item', itemSchema);
