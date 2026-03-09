import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  parameter: String,

  minValue: Number,

  maxValue: Number,

  escalationTime: Number, // in minutes
});

export default mongoose.model("Threshold", thresholdSchema);
