import mongoose from "mongoose";

const healthDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    heartRate: {
      type: Number,
      min: 20,
      max: 250,
    },

    bloodPressure: {
      systolic: { type: Number, min: 50, max: 250 },
      diastolic: { type: Number, min: 30, max: 150 },
    },

    oxygenLevel: {
      type: Number,
      min: 50,
      max: 100,
    },

    temperature: {
      type: Number,
      min: 30,
      max: 45,
    },

    glucoseLevel: {
      type: Number,
      min: 20,
      max: 600,
    },

    source: {
      type: String,
      enum: ["manual", "pdf", "simulator"],
      required: true,
      index: true,
    },

    pdfFilePath: {
      type: String, // stored only if source = pdf
    },

    metadata: {
      reportName: String,
      hospitalName: String,
      doctorName: String,
      extractedAt: Date,
    },

    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

healthDataSchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model("HealthData", healthDataSchema);
