import mongoose from "mongoose";

const {Schema} = mongoose;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    accepted: {
      type: Boolean,
      default: false
    },
    rejected: {
      type: Boolean,
      default: false
    }
  },
  completed: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

export default mongoose.model("Order", orderSchema)
