import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.route.js"

const app = express()

app.use(cors({
     origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit:"100kb"
}))
app.use(express.urlencoded({
    limit:"100kb",
    extended: true
}))
app.use(cookieParser())
app.use(express.static("public"))
app.use("/api/v1/user",userRouter)

export default app