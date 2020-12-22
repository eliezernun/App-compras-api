const express = require('express');
const morgan = require('morgan')
const createError = require('http-errors');
const client = require ('./helpers/init_redis.js')
const {verifyAccessToken, verifyrefreshToken} = require('./helpers/jwt_helper.js')
require('dotenv').config();
require ('./helpers/init_mongodb.js')

client.SET('foo', 'bar')
client.GET('foo', (err, value)=> {
  if (err) console.log(err.message)
  console.log(value)
})

const AuthRoute = require('./routes/Auth.route.js')

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', verifyAccessToken, async (req, res, next)=> {
  res.send('Hello to express')
});

app.use('/auth', AuthRoute)

app.use(async (req, res, next) =>{
  next(createError.NotFound())
});
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    }
  })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`Server Running on port ${PORT}`)
});