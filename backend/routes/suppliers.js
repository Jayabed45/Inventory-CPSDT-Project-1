import { Router } from 'express'
import Supplier from '../models/Supplier.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'name', sortOrder = 'asc' } = req.query
    
    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (status) {
      query.status = status
    }

    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const suppliers = await Supplier.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Supplier.countDocuments(query)

    res.json({
      suppliers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single supplier
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json(supplier)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new supplier
router.post('/', authenticateToken, async (req, res) => {
  try {
    const supplier = new Supplier(req.body)
    await supplier.save()
    res.status(201).json(supplier)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update supplier
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json(supplier)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete supplier
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get supplier statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const total = await Supplier.countDocuments()
    const active = await Supplier.countDocuments({ status: 'active' })
    const inactive = await Supplier.countDocuments({ status: 'inactive' })

    res.json({
      total,
      active,
      inactive
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
