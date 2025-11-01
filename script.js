// Import the necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// =========================
// FULLY BOOKED MODE TOGGLE
// =========================
// This calendar is for Milton Keynes, which is NOT fully booked.
const FULLY_BOOKED = false; 

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpju8JIedURVxBJgmZ1yBuRzd4CEdFDVY",
    authDomain: "carleynfitnesscalendar.firebaseapp.com",
    projectId: "carleynfitnesscalendar",
    storageBucket: "carleynfitnesscalendar.appspot.com",
    messagingSenderId: "1013642078015",
    appId: "1:1013642078015:web:e8bcff9d1559f1c1d5158a",
    measurementId: "G-VJSQ9P5NLW"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Get the contact form (it's outside the calendar logic)
const contactForm = document.getElementById("contactForm");

// =========================
// Calendar Initialization
// =========================
document.addEventListener('DOMContentLoaded', async function () {
    
    // --- All calendar-related elements defined *inside* here ---
    const calendarElement = document.getElementById('calendar');
    const monthSelect = document.getElementById('month-select');
    const yearDisplay = document.getElementById('year-display');
    const bookingForm = document.getElementById('booking-form');
    const bookingDateInput = document.getElementById('booking-date');
    const form = document.getElementById('form');

    // Check if we are on a page with the calendar
    if (!calendarElement) {
        console.log("No calendar found on this page.");
        // Stop running calendar code if there's no calendar
        return; 
    }

    let selectedMonth = new Date().getMonth();
    let selectedYear = new Date().getFullYear();

    // Populate month dropdown
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthNames.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        if (index === selectedMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });

    yearDisplay.textContent = selectedYear; // Show current year

    // Function to generate the calendar
    async function generateCalendar(month, year) {
        calendarElement.innerHTML = ""; // Clear old calendar
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Set header
        yearDisplay.textContent = year;

        // Add empty cells before the 1st day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('empty');
            calendarElement.appendChild(emptyCell);
        }

        // Populate days
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
        
            // Get the day name
            const date = new Date(year, month, day);
            const dayName = dayNames[date.getDay()];
        
            // Display day name with the date
            dayCell.innerHTML = `${day}<br>${dayName}`; // Using innerHTML for line break;
            dayCell.classList.add('date');

            const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            dayCell.dataset.date = dateString;

            // Disable past dates
            const today = new Date();
            if (new Date(dateString) < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                dayCell.classList.add('disabled');
                dayCell.style.pointerEvents = 'none';
            }
            
            // --- NEW CODE: Disable specific days of the week ---
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu
        if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
            dayCell.classList.add('disabled');
            dayCell.style.pointerEvents = 'none';
            dayCell.title = 'Unavailable';
        }
        // --- END OF NEW CODE ---

            // FULLY BOOKED: mark every day as booked/disabled
            if (FULLY_BOOKED) {
                dayCell.classList.add('booked');
                dayCell.style.pointerEvents = 'none';
                dayCell.title = 'Fully booked';
            }

            calendarElement.appendChild(dayCell);
        }

        // Only fetch real bookings if we are NOT fully booked
        if (!FULLY_BOOKED) {
            await fetchBookings();
        } else {
            // Add a badge the first time we render
            addFullyBookedBadge();
            // Hide booking form just in case
            if (bookingForm) bookingForm.style.display = 'none';
        }
    }
 
    // Month change
    monthSelect.addEventListener("change", async function () {
        selectedMonth = parseInt(this.value);
        generateCalendar(selectedMonth, selectedYear);
    });

    // Date click
    calendarElement.addEventListener('click', function (event) {
        if (FULLY_BOOKED) {
            alert('No slots available – currently fully booked. Please use the contact form to join the waitlist.');
            return;
        }
        if (event.target.classList.contains('date') && !event.target.classList.contains('booked')) {
            document.querySelectorAll('.date').forEach(d => d.classList.remove('highlight'));
            event.target.classList.add('highlight');

            bookingForm.style.display = 'block';
            bookingDateInput.value = event.target.dataset.date;
        }
    });

    // Handle booking form submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Only need one preventDefault

        if (FULLY_BOOKED) {
            alert('I am fully booked at the moment. Please reach out via the contact form to join the waitlist 🙏');
            return;
        }

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const time = document.getElementById('time').value;
        const date = bookingDateInput.value;

        // --- ADD THESE NEW LINES ---
    const phone = document.getElementById('phone').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const location = document.getElementById('location').value;
    const fitnessLevel = document.getElementById('fitness-level').value;
    const goals = document.getElementById('goals').value;
    const conditions = document.getElementById('conditions').value;
    // --- END OF NEW LINES ---

        try {
            // Add booking to Firestore
            await addDoc(collection(db, 'bookings'), { name, email, date, time, phone, age, gender, location, fitnessLevel, goals, conditions, status: 'pending' });

            // Display success message
            // A simpler alert
            alert(`Booking request for ${date} at ${time} sent! I'll be in touch soon. 😊`);

            // Reset form and hide it
            form.reset();
            bookingForm.style.display = 'none';

            // Mark the booked date on the calendar
            const dayCell = document.querySelector(`[data-date="${date}"]`);
            if (dayCell) {
                dayCell.classList.add('booked');
                dayCell.style.pointerEvents = 'none';
            }
            
            // No need to fetch all bookings again, we just marked it

        } catch (error) {
            console.error("Error adding booking: ", error);
        }
    });

    // Fetch and mark existing booked dates
    async function fetchBookings() {
        try {
            const querySnapshot = await getDocs(collection(db, 'bookings'));
            querySnapshot.forEach((doc) => {
                const { date } = doc.data();
                const bookedCell = document.querySelector(`[data-date="${date}"]`);
                if (bookedCell) {
                    bookedCell.classList.add('booked');
                    bookedCell.style.pointerEvents = 'none';
                }
            });
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    }

    // Add a subtle "Fully booked" badge next to the header controls
    function addFullyBookedBadge() {
        const header = document.getElementById('calendar-header');
        if (!header || header.querySelector('.fully-booked-badge')) return;
        const badge = document.createElement('div');
        badge.className = 'fully-booked-badge';
        badge.textContent = 'Fully booked';
        badge.style.cssText = 'margin-left:12px;padding:6px 10px;border-radius:8px;background:#f1f3f5;display:inline-block;font-weight:600;';
        header.appendChild(badge);
    }

    // Initial render
    await generateCalendar(selectedMonth, selectedYear);
});

// =========================
// Contact Form Submission
// =========================
contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    try {
        // Add the message to Firestore
        await addDoc(collection(db, "contactMessages"), { name, email, message, timestamp: new Date() });

        // Display the success message
        document.getElementById("responseMessage").textContent = "Message sent successfully!😊";

        // Show the social media links
        document.getElementById("socialLinks").style.display = "block";

        // Reset the form
        contactForm.reset();
    } catch (error) {
        console.error("Error sending message:", error);
        document.getElementById("responseMessage").textContent = "Failed to send message. Try again!";
    }
});

// =========================
// Slideshow
// =========================
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    // Check if slides exist on the page
    if (slides.length === 0) return; 

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].style.display = "block";
    setTimeout(showSlides, 200000); // 200 seconds is a long time, just checking
}
showSlides();

// =========================
// Mobile Navbar
// =========================
// Run this listener separately, it's fine
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-button");
    const navMenu = document.querySelector(".navbar ul");
    const navLinks = document.querySelectorAll(".navbar ul li a");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        // Close the menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                // Only remove 'active' if the menu is open
                if (navMenu.classList.contains("active")) {
                    navMenu.classList.remove("active");
                }
            });
        });

    } else {
        console.error("Menu button or navMenu not found");
    }
});


//Redirecting from index.html to a Cleaner URL
if (window.location.pathname.endsWith('index.html')) {
    window.location.replace(window.location.pathname.replace('index.html', ''));
}