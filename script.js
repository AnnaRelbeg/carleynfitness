// Import the necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

// DOM Elements
const calendarElement = document.getElementById('calendar');
const calendarHeader = document.getElementById('calendar-header');
const bookingForm = document.getElementById('booking-form');
const bookingDateInput = document.getElementById('booking-date');
const form = document.getElementById('form');
const contactForm = document.getElementById("contactForm");

// Calendar Initialization
document.addEventListener('DOMContentLoaded', async function () {
    const calendarElement = document.getElementById('calendar');
    const monthSelect = document.getElementById('month-select');
    const yearDisplay = document.getElementById('year-display');
    const bookingForm = document.getElementById('booking-form');
    const bookingDateInput = document.getElementById('booking-date');

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

    // Weekday names (Sunday, Monday, etc.)
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Function to generate the calendar
    async function generateCalendar(month, year) {
        calendarElement.innerHTML = "";
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

            calendarElement.appendChild(dayCell);
        }

        await fetchBookings(); // Ensure bookings are reloaded
    }

    // Handle month selection change
    monthSelect.addEventListener("change", async function () {
        selectedMonth = parseInt(this.value);
        generateCalendar(selectedMonth, selectedYear);
    });

    // Event Delegation: Attach a single event listener to the calendar
    calendarElement.addEventListener('click', function (event) {
        if (event.target.classList.contains('date') && !event.target.classList.contains('booked')) {
            document.querySelectorAll('.date').forEach(d => d.classList.remove('highlight'));
            event.target.classList.add('highlight');

            bookingForm.style.display = 'block';
            bookingDateInput.value = event.target.dataset.date;
        }
    });

// Handle booking form submission
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const time = document.getElementById('time').value;
    const date = bookingDateInput.value;

    try {
        // Add booking to Firestore
        await addDoc(collection(db, 'bookings'), { name, email, date, time, status: 'pending' });

        // Display success message
        alert(`Booking Confirmed! Name: ${name}, Email: ${email}, Date: ${date}, Time: ${time}`);

        // Reset form and hide it
        form.reset();
        bookingForm.style.display = 'none';

        // Mark the booked date on the calendar
        const dayCell = document.querySelector(`[data-date="${date}"]`);
        if (dayCell) {
            dayCell.classList.add('booked');
            dayCell.style.pointerEvents = 'none';
        }

        // Optionally, reload the bookings
        await fetchBookings(); 

    } catch (error) {
        console.error("Error adding booking: ", error);
    }
});

    // Fetch and mark booked dates
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

    // Initial render
    await generateCalendar(selectedMonth, selectedYear);
});

// Handle contact form submission
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

// Slideshow
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].style.display = "block";
    setTimeout(showSlides, 200000);
}
showSlides();

// Mobile Navbar
document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded!"); // Check if this appears in the console
    const menuToggle = document.querySelector(".menu-button");
    const navMenu = document.querySelector(".navbar ul");
    const navLinks = document.querySelectorAll(".navbar ul li a");

    // Ensure both menuToggle and navMenu are available before adding the event listener
    if (menuToggle && navMenu) {
        console.log("Menu button and nav menu found!");
        menuToggle.addEventListener("click", () => {
            console.log("Menu button clicked!");
            navMenu.classList.toggle("active");
        });

        // Close the menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });

    } else {
        console.error("Menu button or navMenu not found");
    }
});

