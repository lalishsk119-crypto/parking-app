// 🧠 Smart Suggestion
function suggestSlot(bookings) {
    const allSlots = ["A1","A2","A3","B1","B2","B3"];
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

        slots.forEach(slotDiv => {
            const slot = slotDiv.getAttribute("data-slot");
            const booking = bookings.find(b => b.slotNumber === slot);

            if (booking) {
                slotDiv.classList.remove("available");
                slotDiv.classList.add("booked");

                // ⏱ LIVE TIMER
                const now = new Date();
                const minutes = Math.floor((now - new Date(booking.bookedAt)) / 60000);

                slotDiv.innerText = `${slot}\n${booking.user}\n⏱ ${minutes} min`;

                slotDiv.onclick = () => cancelSlot(slot);

                bookedCount++;
            } else {
                slotDiv.classList.remove("booked");
                slotDiv.classList.add("available");

                slotDiv.innerText = slot;
                slotDiv.onclick = () => bookSlot(slot);
            }
        });

        const available = total - bookedCount;

        // 🧠 Smart Suggestion
        const suggested = suggestSlot(bookings);

        document.getElementById("stats").innerText =
            `Total: ${total} | Available: ${available} | Booked: ${bookedCount}` +
            (suggested ? ` | 💡 Best Slot: ${suggested}` : "");

    } catch (error) {
        console.log("Error:", error);
    }
}

// 🚗 Book
async function bookSlot(slotNumber) {
    const user = localStorage.getItem("user");

    if (!user) {
        alert("Login first!");
        window.location.href = "/login.html";
        return;
    }

    const res = await fetch('/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber, user })
    });

    const data = await res.json();

    alert(data.message);
    loadSlots();
}

// ❌ Cancel + BILL
async function cancelSlot(slotNumber) {
    if (!confirm("Cancel booking?")) return;

    const res = await fetch(`/cancel-slot/${slotNumber}`, {
        method: 'DELETE'
    });

    const data = await res.json();

    alert(data.message);
    loadSlots();
}

// 🔄 Auto refresh every 5 sec
setInterval(loadSlots, 5000);

window.onload = loadSlots;