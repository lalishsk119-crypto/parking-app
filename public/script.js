function predictBusy() {
    const hour = new Date().getHours();

    if (hour >= 9 && hour <= 12) return "🔥 Peak Time";
    if (hour >= 17 && hour <= 20) return "🚗 Evening Rush";
    return "🟢 Low Traffic";
}
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

// 🎯 Lucky Slot
function luckySlot() {
    const slots = [
        "A1","A2","A3","A4","A5",
        "B1","B2","B3","B4","B5",
        "C1","C2","C3","C4","C5"
    ];
    return slots[Math.floor(Math.random() * slots.length)];
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
        const lucky = luckySlot();

        slots.forEach(slotDiv => {
            const slot = slotDiv.getAttribute("data-slot");
            const booking = bookings.find(b => b.slotNumber === slot);

            slotDiv.classList.remove("available", "booked", "suggested");

            if (booking) {
                slotDiv.classList.add("booked");

                const now = new Date();
                const minutes = Math.floor((now - new Date(booking.bookedAt)) / 60000);

                // 🎨 SLOT MOOD SYSTEM
                if (minutes < 5) slotDiv.style.background = "#00c853";
                else if (minutes < 15) slotDiv.style.background = "orange";
                else slotDiv.style.background = "#d50000";

                slotDiv.innerText = `${slot}\n${booking.user}\n🔥 ${minutes} min`;

                slotDiv.onclick = () => cancelSlot(slot);

                bookedCount++;
            } else {
                slotDiv.style.background = ""; // reset
                slotDiv.classList.add("available");

                slotDiv.innerText = slot;

                slotDiv.onclick = () => bookSlot(slot);
                document.getElementById("ai").innerText = predictBusy();

                // 💡 Suggested slot
                if (slot === suggested) {
                    slotDiv.classList.add("suggested");
                }

                // ⭐ Lucky slot
                if (slot === lucky) {
                    slotDiv.style.border = "4px solid gold";
                    slotDiv.innerText += "\n⭐ Lucky";
                }
            }
        });

        const available = total - bookedCount;

        // 📊 Dashboard
        document.getElementById("total").innerText = total;
        document.getElementById("available").innerText = available;
        document.getElementById("booked").innerText = bookedCount;

    } catch (error) {
        console.log("Error:", error);
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

    playSound();

    const res = await fetch('/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber, user })
    });

    const data = await res.json();

    alert(data.message);
    loadSlots();
}

// ❌ Cancel slot
async function cancelSlot(slotNumber) {
    if (!confirm("Cancel booking?")) return;

    const res = await fetch(`/cancel-slot/${slotNumber}`, {
        method: 'DELETE'
    });

    const data = await res.json();

    alert(data.message);
    loadSlots();
}

// 🔊 Sound
function playSound() {
    document.getElementById("clickSound").play();
}

// ⏰ Clock
setInterval(() => {
    document.getElementById("clock").innerText =
        new Date().toLocaleTimeString();
}, 1000);

// 🔄 Auto refresh
setInterval(loadSlots, 5000);

window.onload = loadSlots;