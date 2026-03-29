const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

/* =========================
   USER MODEL
========================= */
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

/* =========================
   BOOKING MODEL
========================= */
const bookingSchema = new mongoose.Schema({
    slotNumber: String,
    user: String,
    bookedAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

/* =========================
   SIGNUP
========================= */
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existing = await User.findOne({ username });
        if (existing) {
            return res.json({ message: "User already exists ❌" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Signup successful ✅" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   LOGIN
========================= */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ message: "Invalid credentials ❌" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Invalid credentials ❌" });

    res.json({ message: "Login successful ✅", user });
});

/* =========================
   BOOK SLOT
========================= */
app.post('/book-slot', async (req, res) => {
    const { slotNumber, user } = req.body;

    const exists = await Booking.findOne({ slotNumber });
    if (exists) {
        return res.json({ message: "Slot already booked ❌" });
    }

    const booking = new Booking({ slotNumber, user });
    await booking.save();

    res.json({ message: "Booked successfully ✅" });
});

/* =========================
   GET BOOKINGS
========================= */
app.get('/get-bookings', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

/* =========================
   CANCEL + BILLING 💰
========================= */
app.delete('/cancel-slot/:slotNumber', async (req, res) => {
    const { slotNumber } = req.params;

    const booking = await Booking.findOne({ slotNumber });

    if (!booking) {
        return res.json({ message: "No booking found" });
    }

    const now = new Date();
    const hours = Math.ceil((now - booking.bookedAt) / (1000 * 60 * 60));

    const price = hours * 10; // ₹10/hour

    await Booking.deleteOne({ slotNumber });

    res.json({
        message: `Cancelled ❌ | Parking Fee: ₹${price}`
    });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Running on port ${PORT}`);
});