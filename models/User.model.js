const mongoose = require ('mongoose');
const bcrypt = require ('bcrypt');


const UserSchema = new mongoose.Schema({
  name:{
    type: String,
    require: false,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthdate:{
    type: Date,
    default: '01/01/2000'
  },
  RegisterDate:{
  type: Date,
  default: Date.now(),
  },
})

UserSchema.pre('save', async function (next) {
    try {
      const salt = await bcrypt.genSalt(10)
      const hashedpass= await bcrypt.hash(this.password, salt)
      this.password = hashedpass

      next()

    } catch (error) {
      next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password) {
  try {
   return await bcrypt.compare(password, this.password)
  } catch (error) {
    throw error
  }
}


const User = mongoose.model('User', UserSchema);
module.exports = User