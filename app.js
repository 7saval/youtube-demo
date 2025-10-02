// express 모듈 셋팅
const express = require('express')
const app = express()
const port = 7777
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// app.use(express.json()) // http 외 모듈 'json'


const userRouter = require('./routes/users')    // user-demo -> users
const channelRouter = require('./routes/channels')// channel-demo -> channels

app.use("/", userRouter)
app.use("/channels", channelRouter)