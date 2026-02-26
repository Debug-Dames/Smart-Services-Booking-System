const crypto = require("crypto");

const state = {
  users: [],
  customers: [],
  staff: [],
  services: [
    {
      id: "svc-1",
      name: "Haircut",
      durationMins: 45,
      price: 30,
      category: "hair",
    },
    {
      id: "svc-2",
      name: "Manicure",
      durationMins: 60,
      price: 40,
      category: "nails",
    },
  ],
  bookings: [],
  payments: [],
  availability: [],
};

const connectDatabase = async () => {
  return state;
};

const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

module.exports = {
  db: state,
  connectDatabase,
  createId,
};
