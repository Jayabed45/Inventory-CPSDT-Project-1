import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minStock: { type: Number, default: 10 },
    maxStock: { type: Number },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    image: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema)
export default Item
