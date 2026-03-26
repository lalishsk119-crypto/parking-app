// 🔄 Load all slots + stats
async function loadSlots() {
    try {
        const res = await fetch('/get-bookings'); // ✅ FIXED
        const bookings = await res.json();

        const slots = document.querySelectorAll(".slot");

        let total = slots.length;
        let bookedCount = 0;

        slots.forEach(slotDiv => {
            const slot = slotDiv.getAttribute("data-slot");

            const booking = bookings.find(b => b.slotNumber === slot);

            if (booking) {
                // 🔴 Booked
                slotDiv.style.backgroundColor = "red";
                slotDiv.innerText = `${slot} (${booking.user})`;

                slotDiv.onclick = () => cancelSlot(slot);

                bookedCount++;
            } else {
                // 🟢 Available
                slotDiv.style.backgroundColor = "green";
                slotDiv.innerText = slot;

                slotDiv.onclick = () => bookSlot(slot);
            }
        });

        // 📊 Update stats
        const available = total - bookedCount;

        document.getElementById("stats").innerText =
            `Total: ${total} | Available: ${available} | Booked: ${bookedCount}`;

    } catch (error) {
        console.log("Error loading slots:", error);
    }
}

// 🚗 Book slot
async function bookSlot(slotNumber) {
    const user = prompt("Enter your name:");
    if (!user) return;

    try {
        const res = await fetch('/book-slot', { // ✅ FIXED
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slotNumber, user })
        });

        const data = await res.json();

        alert(data.message);

        loadSlots();

    } catch (error) {
        console.log("Booking error:", error);
    }
}

// ❌ Cancel slot
async function cancelSlot(slotNumber) {
    const confirmCancel = confirm("Cancel booking?");
    if (!confirmCancel) return;

    try {
        const res = await fetch(`/cancel-slot/${slotNumber}`, { // ✅ FIXED
            method: 'DELETE'
        });

        const data = await res.json();

        alert(data.message);

        loadSlots();

    } catch (error) {
        console.log("Cancel error:", error);
    }
}

// 🚀 Load when page opens
window.onload = loadSlots;