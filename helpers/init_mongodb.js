const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {dbName: process.env.DB_NAME,
useNewUrlParser: true, useUnifiedTopology: true, usecreateIndexes: true
 })

mongoose.connection.on('connected', ()=> {
  console.log('Mongoose connect to db')
})


mongoose.connection.on('Disconected', () => {
  console.log('Mongoose Disconected')
})

process.on('SIGINT', async () =>
await mongoose.conection.close('DC', () =>{process.exit(0)
}))