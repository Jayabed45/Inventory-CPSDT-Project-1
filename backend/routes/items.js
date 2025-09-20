import { Router } from 'express'
import Item from '../models/Item.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get all items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, sortBy = 'name', sortOrder = 'asc' } = req.query
    
    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }
    if (category) {
      query.category = category
    }

    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const items = await Item.find(query)
      .populate('supplier', 'name contactPerson email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Item.countDocuments(query)

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('supplier')
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.json(item)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = new Item(req.body)
    await item.save()
    await item.populate('supplier', 'name contactPerson email')
    res.status(201).json(item)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' })
    }
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier', 'name contactPerson email')
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.json(item)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' })
    }
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get low stock items
router.get('/alerts/low-stock', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    }).populate('supplier', 'name contactPerson email')
    
    res.json(items)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
