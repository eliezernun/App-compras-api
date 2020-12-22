const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const createError = require('http-errors')
const User = require('../models/User.model')
const {authSchema} = require('../helpers/Validation_Schemas_user.js')
const {authSchemaL} = require('../helpers/Validation_Schemas_user_login.js')
const {signAccessToken, singinRefreshToken, verifyrefreshToken} = require('../helpers/jwt_helper.js')
const client = require('../helpers/init_redis.js')
router.post('/register', async (req, res, next) => {
  try {
   const {name, email, password, birthdate } = req.body

    //if (!name || !email || !password) throw createError.badRequest()

    const result = await authSchema.validateAsync(req.body)
    
    const doesExist = await User.findOne({email: result.email})

    if (doesExist) throw createError.Conflict(`${email} is Already been registed`)

    const user = new User(result)

    const savedUser = await user.save()

    const acessToken = await signAccessToken(savedUser.id, savedUser.name)

    const RefreshToken = await singinRefreshToken(savedUser.id, savedUser.name)

    res.send({acessToken, RefreshToken})
    
  } catch (error) {
    if (error.isJoi === true) error.status = 422
    next(error)
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await authSchemaL.validateAsync(req.body)

    const user = await User.findOne({email: result.email})

     if (!user) throw createError.NotFound('User not Registred')

    const isMatch = await user.isValidPassword(result.password)

     if (!isMatch) throw createError.Unauthorized('Username/Password no Valid!!')  

     const accessToken = await signAccessToken(user.id)
     const RefreshToken = await singinRefreshToken(user.id)
      
      res.send({accessToken, RefreshToken})

  } catch (error) {
    if (error.isJoi === true) return  (createError.BadRequest('Invalid Username/Password'))
    next(error)
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { RefreshToken } = req.body
    if (!RefreshToken) throw createError.BadRequest()
    const Userid = await verifyrefreshToken(RefreshToken)

    const accToken = await signAccessToken(Userid)
    const RefToken = await singinRefreshToken(Userid)
    res.send({accessToken: accToken, RefreshToken: RefToken})
  }
   catch (error) {
     next(error)
   }
});

router.delete('/logout', async (req, res, next) => {
  try {
    const {RefreshToken} = req.body
    if (!RefreshToken) throw createError.BadRequest()
    const Userid = await verifyrefreshToken(RefreshToken)
    client.DEL(Userid, (err, value) => {
      if(err) {
        console.log(err.message)
        throw createError.InternalServerError()
      }
      console.log(value)
      res.sendStatus(204)
    })
    } catch (error) {
    next(error)
  }
})


module.exports = router;