const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

/* =========================
   🔐 USER MODEL
========================= */
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

/* =========================
   🚗 BOOKING MODEL
========================= */
const bookingSchema = new mongoose.Schema({
    slotNumber: String,
    user: String,
    bookedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "booked"
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

/* =========================
   📝 SIGNUP
========================= */
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ message: "Username & password required ❌" });
        }

        const existing = await User.findOne({ username });

        if (existing) {
            return res.json({ message: "User already exists ❌" });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.json({ message: "Signup successful ✅", user: newUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* =========================
   🔐 LOGIN
========================= */
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (!user) {
            return res.json({ message: "Invalid credentials ❌" });
        }

        res.json({ message: "Login successful ✅", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* =========================
   🚗 BOOK SLOT
========================= */
app.post('/book-slot', async (req, res) => {
    try {
        const { slotNumber, user } = req.body;

        if (!slotNumber || !user) {
            return res.json({ message: "slotNumber & user required ❌" });
        }

        const existing = await Booking.findOne({ slotNumber });

        if (existing) {
            return res.json({ message: "❌ Slot already booked!" });
        }

        const newBooking = new Booking({ slotNumber, user });
        await newBooking.save();

        res.json({ message: "Slot booked successfully ✅" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* =========================
   📦 GET BOOKINGS
========================= */
app.get('/get-bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   ❌ CANCEL SLOT
========================= */
app.delete('/cancel-slot/:slotNumber', async (req, res) => {
    try {
        const { slotNumber } = req.params;

        await Booking.deleteOne({ slotNumber });

        res.json({ message: "Booking cancelled ❌" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});