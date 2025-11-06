

import express from 'express';
import mongoose from 'mongoose';
import Item from './inven.model.js';

const router = express.Router();


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Utility: validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Item.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }
    const item = await Item.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const item = await Item.create({
      itemName: payload.itemName,
      itemPrice: payload.itemPrice,
      quantity: payload.quantity,
      category: payload.category,
      lowStockThreshold: payload.lowStockThreshold
    });
    res.status(201).json(item.toJSON());
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const updates = req.body || {};
  
    const numericFields = ['itemPrice', 'quantity', 'lowStockThreshold'];
    numericFields.forEach((f) => {
      if (updates[f] != null && Number(updates[f]) < 0) {
        throw Object.assign(new Error(`${f} cannot be negative`), { status: 400 });
      }
    });

    const updated = await Item.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ message: 'Item not found' });
    res.json(updated.toJSON());
  })
);


router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  })
);


router.use((err, _req, res, _next) => {
  const status = err.status || 500;

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', details });
  }
  res.status(status).json({ message: err.message || 'Server error' });
});

export default router;

