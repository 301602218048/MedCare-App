const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(`mongodb://localhost:27017/medCareApp`).then(() => {
    console.log(`Database connected `);
  });
};

module.exports = connectDB;
