// imports
import mongoose from "mongoose";

const {Schema} = mongoose;

const menuSchema = new Schema({
  item: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  menuImage: {
    type: String,
    required: true
  }
},
{
  timestamps: true
});

export default mongoose.model("Menu", menuSchema);
