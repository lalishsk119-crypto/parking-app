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
mongoose.connect('mongodb://localhost:27017/parkingDB')
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// ✅ Schema
const bookingSchema = new mongoose.Schema({
    slotNumber: String,
    user: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// ✅ Test route
app.get('/', (req, res) => {
    res.send("API is working 🚀");
});

// ✅ Book slot (WITH DOUBLE BOOKING PREVENTION)
app.post('/book-slot', async (req, res) => {
    try {
        const { slotNumber, user } = req.body;

        if (!slotNumber || !user) {
            return res.status(400).json({
                message: "slotNumber and user required"
            });
        }

        // 🔥 Check if already booked
        const existing = await Booking.findOne({ slotNumber });

        if (existing) {
            return res.status(400).json({
                message: "❌ Slot already booked!"
            });
        }

        const newBooking = new Booking({ slotNumber, user });
        await newBooking.save();

        res.json({
            message: "Slot booked successfully ✅",
            data: newBooking
        });

    } catch (error) {
        res.status(500).json({
            message: "Error booking slot",
            error: error.message
        });
    }
});

// ✅ Get all bookings
app.get('/get-bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Cancel booking
app.delete('/cancel-slot/:slotNumber', async (req, res) => {
    try {
        const { slotNumber } = req.params;

        await Booking.deleteOne({ slotNumber });

        res.json({
            message: "Booking cancelled ❌"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Start server
app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});