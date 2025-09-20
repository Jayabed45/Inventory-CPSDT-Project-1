import mongoose from 'mongoose'

const stockTransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    type: { 
      type: String, 
      enum: ['inbound', 'outbound', 'adjustment'], 
      required: true 
    },
    quantity: { type: Number, required: true },
    reason: { type: String, trim: true },
    reference: { type: String, trim: true }, // PO number, customer order, etc.
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    customer: { type: String, trim: true },
    unitCost: { type: Number, min: 0 },
    totalCost: { type: Number, min: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

const StockTransaction = mongoose.models.StockTransaction || mongoose.model('StockTransaction', stockTransactionSchema)
export default StockTransaction
