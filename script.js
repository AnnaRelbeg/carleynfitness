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

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function () {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Create the calendar
    function createCalendar() {
        const calendar = document.getElementById('calendar');
        const header = document.getElementById('calendar-header');
        header.innerText = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        // Clear previous calendar content
        calendar.innerHTML = '';

        // Create empty spaces for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            calendar.appendChild(emptyCell);
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
            calendar.appendChild(dayCell);
        }
    }

    // Event listener for date clicks
    document.getElementById('calendar').addEventListener('click', function (event) {
        if (event.target.classList.contains('date')) {
            const selectedDate = event.target.dataset.date;
            const dayCell = event.target;

            if (!dayCell.classList.contains('booked')) {
                // Show the booking form
                document.getElementById('booking-form').style.display = 'block';
                document.getElementById('booking-date').value = selectedDate;
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
            document.getElementById('booking-form').style.display = 'none';

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

    // Initialize the calendar and fetch existing bookings
    createCalendar();
    fetchBookings();  // Fetch bookings to mark dates as booked
});

document.addEventListener('DOMContentLoaded', function() {
    const calendarElement = document.getElementById('calendar');
    const currentMonth = new Date(2025, 2); // March 2025 (month is 0-indexed)
  
    const monthHeader = document.getElementById('month');
    monthHeader.textContent = currentMonth.toLocaleString('default', { month: 'long' }) + ' ' + currentMonth.getFullYear();
  
    // Clear previous calendar if any
    calendarElement.innerHTML = '';
  
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    
    // Create empty slots for the days before the 1st day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyCell = document.createElement('div');
      calendarElement.appendChild(emptyCell);
    }
  
    // Add each day of the month to the calendar
    for (let i = 1; i <= daysInMonth; i++) {
      const dateCell = document.createElement('div');
      dateCell.classList.add('date');
      dateCell.textContent = i;
      calendarElement.appendChild(dateCell);
    }
  });
  