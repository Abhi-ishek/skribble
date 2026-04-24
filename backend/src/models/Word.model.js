import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    default: "general",
  },
});

const Word = mongoose.model("Word", wordSchema);
export default Word;
