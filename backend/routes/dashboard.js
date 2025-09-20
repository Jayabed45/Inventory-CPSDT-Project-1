import { Router } from 'express'
import Item from '../models/Item.js'
import Supplier from '../models/Supplier.js'
import StockTransaction from '../models/StockTransaction.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get basic counts
    const totalItems = await Item.countDocuments({ isActive: true })
    const totalSuppliers = await Supplier.countDocuments({ status: 'active' })
    const lowStockItems = await Item.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    })

    // Get today's inbound transactions
    const inboundToday = await StockTransaction.aggregate([
      {
        $match: {
          type: 'inbound',
          status: 'completed',
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ])

    const inboundTodayCount = inboundToday.length > 0 ? inboundToday[0].totalQuantity : 0

    // Get recent activity
    const recentActivity = await StockTransaction.find()
      .populate('item', 'name sku')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get weekly movements for chart
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weeklyMovements = await StockTransaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$createdAt' },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ])

    res.json({
      metrics: {
        totalItems,
        lowStockItems,
        totalSuppliers,
        inboundToday: inboundTodayCount
      },
      recentActivity,
      weeklyMovements
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get inventory value trend
router.get('/inventory-value', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query
    let days = 30
    if (period === '7d') days = 7
    else if (period === '90d') days = 90
    else if (period === '1y') days = 365

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trend = await Item.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          itemCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    res.json(trend)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get category distribution
router.get('/category-distribution', authenticateToken, async (req, res) => {
  try {
    const distribution = await Item.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    res.json(distribution)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get top performing items
router.get('/top-items', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const topItems = await StockTransaction.aggregate([
      {
        $match: {
          type: 'outbound',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$item',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$quantity', '$unitCost'] } }
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $project: {
          name: '$item.name',
          sku: '$item.sku',
          totalSold: 1,
          totalRevenue: 1,
          profitMargin: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$totalRevenue', { $multiply: ['$totalSold', '$item.cost'] }] },
                  '$totalRevenue'
                ]
              },
              100
            ]
          }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ])

    res.json(topItems)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
