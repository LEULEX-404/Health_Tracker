import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  message: String,

  appointmentTime: Date,

  isSent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Reminder", reminderSchema);
