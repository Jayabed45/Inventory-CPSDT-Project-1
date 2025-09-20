import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email, and password are required' })
    }
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ fullName, email, passwordHash, role: role || 'admin' })
    return res.status(201).json({ id: user._id, fullName: user.fullName, email: user.email, role: user.role })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' })
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router


