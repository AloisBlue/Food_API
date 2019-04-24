import mongoose from "mongoose";

const {Schema} = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true
  },
  avatar: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
},
{
    timestamps: true
}
);

// userSchema.methods.checkPasswordValidity = (password) => {
//   return bcrypt.compareSync(password, this.passwordHash)
// }

// userSchema.methods.hashPassword = function hashPassword(password) {
//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (hash) => {
//       this.password = hash;
//     })
//   })
// }

export default mongoose.model("User", userSchema)
