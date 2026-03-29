// 🧠 Smart Suggestion
function suggestSlot(bookings) {
    const allSlots = [
"A1","A2","A3","A4","A5",
"B1","B2","B3","B4","B5",
"C1","C2","C3","C4","C5"
];
    const booked = bookings.map(b => b.slotNumber);
    const free = allSlots.filter(s => !booked.includes(s));
    return free.length ? free[0] : null;
}

// 🔄 Load slots
async function loadSlots() {
    try {
        const res = await fetch('/get-bookings');
        const bookings = await res.json();

        const slots = document.querySelectorAll(".slot");

        let total = slots.length;
        let bookedCount = 0;

        const suggested = suggestSlot(bookings);

        slots.forEach(slotDiv => {
            const slot = slotDiv.getAttribute("data-slot");
            const booking = bookings.find(b => b.slotNumber === slot);

            // 🔄 RESET classes first
            slotDiv.classList.remove("available", "booked", "suggested");

            if (booking) {
                // 🔴 BOOKED
                slotDiv.classList.add("booked");

                const now = new Date();
                const minutes = Math.floor((now - new Date(booking.bookedAt)) / 60000);

                slotDiv.innerText = `${slot}\n${booking.user}\n⏱ ${minutes} min`;

                slotDiv.onclick = () => cancelSlot(slot);

                bookedCount++;
            } else {
                // 🟢 AVAILABLE
                slotDiv.classList.add("available");

                slotDiv.innerText = slot;

                slotDiv.onclick = () => bookSlot(slot);

                // 💡 HIGHLIGHT BEST SLOT
                if (slot === suggested) {
                    slotDiv.classList.add("suggested");
                }
            }
        });

        const available = total - bookedCount;

        // 📊 UPDATE DASHBOARD (IMPORTANT)
        document.getElementById("total").innerText = total;
        document.getElementById("available").innerText = available;
        document.getElementById("booked").innerText = bookedCount;

    } catch (error) {
        console.log("Error loading slots:", error);
    }
}

// 🚗 Book slot
async function bookSlot(slotNumber) {
    const user = localStorage.getItem("user");

    if (!user) {
        alert("Login first!");
        window.location.href = "/login.html";
        return;
    }

    try {
        const res = await fetch('/book-slot', {
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
    if (!confirm("Cancel booking?")) return;

    try {
        const res = await fetch(`/cancel-slot/${slotNumber}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        alert(data.message);

        loadSlots();

    } catch (error) {
        console.log("Cancel error:", error);
    }
}

// 🔄 AUTO REFRESH (LIVE FEEL)
setInterval(loadSlots, 5000);

// 🚀 First load
window.onload = loadSlots;