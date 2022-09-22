const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  username: { type: String },
  requestedBy: { type: String },
  requestedById: { type: String },
  status: { type: Boolean },
  statusUpdateBy: { type: String },
  statusUpdateById: { type: String },
  statusUpdateTime: { type: String },
});

const UserModel = model("UserModel", UserSchema, "users");

module.exports = {
  UserModel,
};