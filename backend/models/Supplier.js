import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    paymentTerms: { type: String, default: 'Net 30' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
)

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema)
export default Supplier
