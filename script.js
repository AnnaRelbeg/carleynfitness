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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore initialization

document.addEventListener('DOMContentLoaded', function () {
    const calendarElement = document.getElementById('calendar');
    const calendarHeader = document.getElementById('calendar-header');
    const bookingForm = document.getElementById('booking-form');
    const bookingDateInput = document.getElementById('booking-date');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Set calendar header
    calendarHeader.innerText = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;
    calendarElement.innerHTML = '';

    // Add empty cells before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        calendarElement.appendChild(emptyCell);
    }

    // Populate calendar days
for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.innerText = day;
    dayCell.classList.add('date');

    // Create date string for comparison
    const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    dayCell.dataset.date = dateString;

    // Disable dates before today
    const selectedDate = new Date(dateString);
    if (selectedDate < currentDate) {
        dayCell.classList.add('disabled'); // Add a "disabled" class
        dayCell.style.pointerEvents = 'none'; // Prevent clicking
    }

    if (day === currentDate.getDate()) {
        dayCell.classList.add('today'); // Mark today's date
    }

    calendarElement.appendChild(dayCell);
}

    // Handle date click events
    calendarElement.addEventListener('click', function (event) {
        if (event.target.classList.contains('date')) {
            // Remove the highlight class from all other dates
            document.querySelectorAll('.date').forEach(d => d.classList.remove('highlight'));
    
            // Add the highlight class to the clicked date
            event.target.classList.add('highlight');
    
            // Your existing logic for showing the booking form
            const selectedDate = event.target.dataset.date;
            if (!event.target.classList.contains('booked')) {
                bookingForm.style.display = 'block';
                bookingDateInput.value = selectedDate;
            }
        }
    });
    

    // Handle form submissions
    document.getElementById('form').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const time = document.getElementById('time').value;
        const date = document.getElementById('booking-date').value;

        addDoc(collection(db, 'bookings'), { name, email, date, time, status: 'pending' })
            .then(() => {
                alert(`Booking Confirmed! Name: ${name}, Email: ${email}, Date: ${date}, Time: ${time}`);
                document.getElementById('form').reset();
                bookingForm.style.display = 'none';
                const dayCell = document.querySelector(`[data-date="${date}"]`);
                if (dayCell) {
                    dayCell.classList.add('booked');
                }
            })
            .catch((error) => console.error("Error adding document: ", error));
    });

    // Fetch and mark booked dates
    async function fetchBookings() {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        querySnapshot.forEach((doc) => {
            const { date } = doc.data();
            const bookedCell = document.querySelector(`[data-date="${date}"]`);
            if (bookedCell) {
                bookedCell.classList.add('booked');
                bookedCell.style.pointerEvents = 'none';
            }
        });
    }

    fetchBookings();
});

// Slideshow background

let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 200000); // Change image every 2 seconds (adjust as needed)
}

//Navbar for mobiles

document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-button");
    const navMenu = document.querySelector(".navbar ul");
    const menuLinks = document.querySelectorAll(".navbar ul li a");

    if (!menuToggle || !navMenu) {
        console.error("Menu button or nav menu not found!");
        return;
    }

    // Toggle menu on button click
    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
        });
    });
});


