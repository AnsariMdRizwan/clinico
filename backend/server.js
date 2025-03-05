require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")
const cookieparser = require("cookie-parser")
const cors = require("cors")
const authRouter = require("./routes/auth/auth-route.js")
const clinicRouter = require("./routes/clinic/clinic-route.js")
const commonRouter = require('./routes/common/common-route.js')
const userRouter = require('./routes/user/user-route.js')

const app = express()

const CLIENT_URL = "https://cliniico.netlify.app"
app.use(
    cors({
        origin: CLIENT_URL,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma"
        ],
        credentials: true
    })
)

const PORT = process.env.PORT || 5000

const MONGO_URI = process.env.MONGO_URI
app.use(cookieparser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/doctors', clinicRouter);
app.use('/api/commons', commonRouter);
app.use('/api/users', userRouter);






mongoose.connect(
    MONGO_URI
).then(() => {
    console.log("Connected To the dataBase Successfully")
}).catch((error) => {
    console.log("facing an error while connecting the dataBase " + error)
})



app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})
