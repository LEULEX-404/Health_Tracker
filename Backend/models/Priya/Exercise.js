import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        type: { type: String, required: true, trim: true },
        duration: { type: Number, required: true },
        calories: { type: Number, required: true },
        date: { type: String, required: true, trim: true }
    },
    { timestamps: true }
);

export default mongoose.model('Exercise', exerciseSchema);
