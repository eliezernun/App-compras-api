const redis = require('redis')


const client = redis.createClient(
  /*{
    port: 6379,
    host: "127.0.0.1"
}*/
)

client.on('connect', () => {
  console.log('Client Conected REDIS')
})

client.on('ready', () => {
  console.log('Client Conected ready to use')

})


client.on('error', (err) => {
  console.log('Client Conected REDIS')
})
/*
client.end('end', () => {
  console.log('Client disconected REDIS')
})

//process.on('SIGINT', () => {
 // client.quit()
//})
*/

module.exports = client