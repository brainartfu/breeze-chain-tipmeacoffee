const mongoose = require("mongoose");
const { UserModel } = require("./user");
const { SuspendedUserModel } = require("./suspendedUser");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error("Couldn't connect to MongoDB instance!", err);
    process.exit(1);
  }
}

const fetchUser = async (username) => {
  try {
    const user = await UserModel.findOne({ username });
    return user;
  } catch (err) {
    console.error(err);
    return false;
  }
}

const fetchSuspended = async (username) => {
  try {
    const user = await SuspendedUserModel.findOne({ username });
    return user;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  connectDatabase,
  fetchUser,
  fetchSuspended
};