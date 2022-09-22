const { Schema, model } = require("mongoose");

const SuspendedUserSchema = new Schema({
  username: { type: String },
  status: { type: Boolean },
  statusUpdateBy: { type: String },
  statusUpdateById: { type: String },
  statusUpdateTime: { type: String },
});

const SuspendedUserModel = model("SuspendedUserModel", SuspendedUserSchema, "suspendedusers");

module.exports = {
  SuspendedUserModel,
};