import { useEffect, useState } from "react";
import { getMyBookings } from "../api/services";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    getMyBookings().then(setBookings);
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.map((booking) => (
        <div key={booking.id}>
          <p>Service: {booking.service}</p>
          <p>Date: {booking.date || booking.appointment_date}</p>
          <p>Time: {booking.time || booking.appointment_time}</p>
        </div>
      ))}
    </div>
  );
}
