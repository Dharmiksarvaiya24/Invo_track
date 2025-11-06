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


  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  
 
});

export default mongoose.model('Item', itemSchema);
