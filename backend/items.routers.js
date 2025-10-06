import express from 'express'
import Item from './item.models.js'

const router = express.Router()

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Add new item
router.post('/', async (req, res) => {
  const { itemName, itemPrice } = req.body

  if (!itemName || itemPrice == null) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const newItem = new Item({ itemName, itemPrice })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ message: 'Failed to save item' })
  }
})

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Item not found' })
    res.json({ message: 'Item deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item' })
  }
})

export default router
