const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reportType: {
      type: String,
      enum: ["weekly", "monthly", "nutrition", "risk", "appointment"],
      required: true,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    summary: {
      type: Object, // aggregated JSON
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    exportedPdfPath: {
      type: String,
    },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, reportType: 1, generatedAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
