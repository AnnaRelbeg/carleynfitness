// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpju8JIedURVxBJgmZ1yBuRzd4CEdFDVY",
  authDomain: "carleynfitnesscalendar.firebaseapp.com",
  projectId: "carleynfitnesscalendar",
  storageBucket: "carleynfitnesscalendar.firebasestorage.app",
  messagingSenderId: "1013642078015",
  appId: "1:1013642078015:web:e8bcff9d1559f1c1d5158a",
  measurementId: "G-VJSQ9P5NLW"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Initialize Firestore
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', function () {
    const calendarElement = document.getElementById('calendar');
    const calendarHeader = document.getElementById('calendar-header');
    const bookingForm = document.getElementById('booking-form');
    const bookingDateInput = document.getElementById('booking-date');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get current month
    const currentYear = currentDate.getFullYear(); // Get current year
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get total days in current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // Get the first day of the month

    // Set the calendar header dynamically
    calendarHeader.innerText = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    // Clear previous calendar content
    calendarElement.innerHTML = '';

    // Create empty spaces for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        calendarElement.appendChild(emptyCell);
    }

    // Create the calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.innerText = day;
        dayCell.classList.add('date');
        dayCell.dataset.date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        if (day === currentDate.getDate()) {
            dayCell.classList.add('today');  // Highlight today's date
        }
        calendarElement.appendChild(dayCell);
    }

    // Event listener for date clicks
    calendarElement.addEventListener('click', function (event) {
        if (event.target.classList.contains('date')) {
            const selectedDate = event.target.dataset.date;
            const dayCell = event.target;

            if (!dayCell.classList.contains('booked')) {
                // Show the booking form
                bookingForm.style.display = 'block';
                bookingDateInput.value = selectedDate;
            }
        }
    });

    // Handle form submission to save booking to Firebase
    document.getElementById('form').addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const time = document.getElementById('time').value;
        const date = document.getElementById('booking-date').value;

        // Save booking to Firestore
        addDoc(collection(db, 'bookings'), {
            name: name,
            email: email,
            date: date,
            time: time,
            status: 'pending'
        })
        .then(() => {
            alert(`Booking Confirmed! \nName: ${name} \nEmail: ${email} \nDate: ${date} \nTime: ${time}`);
            document.getElementById('form').reset();
            bookingForm.style.display = 'none';

            // Mark the date as booked
            const dayCell = document.querySelector(`[data-date="${date}"]`);
            if (dayCell) {
                dayCell.classList.add('booked');
            }
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    });

    // Fetch existing bookings and mark dates as booked
    async function fetchBookings() {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        querySnapshot.forEach((doc) => {
            const bookingData = doc.data();
            const bookedDate = bookingData.date;
            const bookedCell = document.querySelector(`[data-date="${bookedDate}"]`);
            if (bookedCell) {
                bookedCell.classList.add('booked');
                bookedCell.style.pointerEvents = 'none';  // Disable booking for these dates
            }
        });
    }

    // Fetch bookings and mark booked dates
    fetchBookings();  // Fetch bookings to mark dates as booked
});
