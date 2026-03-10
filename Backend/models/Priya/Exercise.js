import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true, trim: true },
        duration: { type: Number, required: true },
        calories: { type: Number, required: true },
        date: { type: String, required: true, trim: true }
    },
    { timestamps: true }
);

export default mongoose.model('Exercise', exerciseSchema);
