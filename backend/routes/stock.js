import { Router } from 'express'
import StockTransaction from '../models/StockTransaction.js'
import Item from '../models/Item.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get all stock transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      startDate, 
      endDate,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query
    
    const query = {}
    if (type) query.type = type
    if (status) query.status = status
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const transactions = await StockTransaction.find(query)
      .populate('item', 'name sku')
      .populate('supplier', 'name contactPerson')
      .populate('createdBy', 'fullName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await StockTransaction.countDocuments(query)

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id)
      .populate('item', 'name sku')
      .populate('supplier', 'name contactPerson')
      .populate('createdBy', 'fullName email')
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    res.json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const transaction = new StockTransaction({
      ...req.body,
      createdBy: req.user._id
    })
    
    await transaction.save()
    await transaction.populate([
      { path: 'item', select: 'name sku' },
      { path: 'supplier', select: 'name contactPerson' },
      { path: 'createdBy', select: 'fullName email' }
    ])

    // Update item stock
    if (transaction.status === 'completed') {
      await updateItemStock(transaction.item, transaction.quantity, transaction.type)
    }

    res.status(201).json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    const oldStatus = transaction.status
    const newStatus = req.body.status

    // If status changed from pending to completed, update stock
    if (oldStatus === 'pending' && newStatus === 'completed') {
      await updateItemStock(transaction.item, transaction.quantity, transaction.type)
    }
    // If status changed from completed to pending, reverse stock change
    else if (oldStatus === 'completed' && newStatus === 'pending') {
      await updateItemStock(transaction.item, -transaction.quantity, transaction.type)
    }

    const updatedTransaction = await StockTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'item', select: 'name sku' },
      { path: 'supplier', select: 'name contactPerson' },
      { path: 'createdBy', select: 'fullName email' }
    ])

    res.json(updatedTransaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // If transaction was completed, reverse stock change
    if (transaction.status === 'completed') {
      await updateItemStock(transaction.item, -transaction.quantity, transaction.type)
    }

    await StockTransaction.findByIdAndDelete(req.params.id)
    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get stock statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const inboundToday = await StockTransaction.countDocuments({
      type: 'inbound',
      status: 'completed',
      createdAt: { $gte: today, $lt: tomorrow }
    })

    const outboundToday = await StockTransaction.countDocuments({
      type: 'outbound',
      status: 'completed',
      createdAt: { $gte: today, $lt: tomorrow }
    })

    const pendingOrders = await StockTransaction.countDocuments({
      status: 'pending'
    })

    const lowStockItems = await Item.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    })

    res.json({
      inboundToday,
      outboundToday,
      pendingOrders,
      lowStockItems
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to update item stock
async function updateItemStock(itemId, quantity, type) {
  const item = await Item.findById(itemId)
  if (!item) return

  if (type === 'inbound' || type === 'adjustment') {
    item.stock += quantity
  } else if (type === 'outbound') {
    item.stock -= quantity
  }

  // Ensure stock doesn't go below 0
  item.stock = Math.max(0, item.stock)
  await item.save()
}

export default router
