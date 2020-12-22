const JTW = require ('jsonwebtoken');
const createError = require('http-errors');
const client = require('./init_redis.js')

module.exports ={
  signAccessToken: (Userid, Username) => {
    return new Promise((resolve, reject)=> {     

      const payload ={}   
      const secret = process.env.ACCESS_TOKEN_SECRET
      const options = {
        expiresIn: '10s',
        issuer:'eliezerjunior.com.br',
        audience: Userid

      }
      JTW.sign(payload, secret, options, (err, token)=> {
        if (err) {
          reject(createError.InternalServerError())
        }
        
        resolve(token)
      })
    })
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers ['authorization']) return  next(createError.Unauthorized())
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token =  bearerToken[1]
    JTW.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>
    {
      if (err) {
        const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      next()
    })
  },
  singinRefreshToken : (Userid) => {
    return new Promise((resolve, reject)=> {     

      const payload ={}   
      const secret = process.env.REFRESH_ACCESS_TOKEN
      const options = {
        expiresIn: '2y',
        issuer:'eliezerjunior.com.br',
        audience: Userid

      }
      JTW.sign(payload, secret, options, (err, token)=> {
        if (err) {
          reject(createError.InternalServerError())
        }
        client.SET(Userid, token, 'EX', 63070000, (err, reply)=> {
          if (err) {
            reject(createError.InternalServerError())
            return
            }
            resolve(token)
        })
        
      })
    })
  },
  verifyrefreshToken: (RefreshToken) =>{
    return new Promise((resolve, reject) =>{
      JTW.verify(RefreshToken, process.env.REFRESH_ACCESS_TOKEN, (err, payload) =>{
        if (err) return reject(createError.Unauthorized("teste"))
        const Userid = payload.aud
        client.GET(Userid, (err, result) =>{
          if (err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          if (RefreshToken === result) return resolve(Userid)
          reject(createError.Unauthorized())
        } )
      })
    })
  }
}