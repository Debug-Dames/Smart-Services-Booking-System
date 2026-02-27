import { useState } from "react";

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    interest: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Appointment request submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">First</p>
              </div>

              <div>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">Last</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Preferred Date of Appointment{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Please note that this is not confirmed.
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Preferred Time of Appointment{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Please note that this is not confirmed.
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Let us know what you're interested in{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="interest"
              rows="4"
              required
              value={formData.interest}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-md"
          >
            Submit Appointment Request
          </button>

        </form>
      </div>
    </div>
  );
}