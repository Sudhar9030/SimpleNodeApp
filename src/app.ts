import express, { Application, Request, Response} from "express";
import cors from "cors";
import configure from "./config/routes"
import dotenv from 'dotenv'

dotenv.config();


const app = express()

configure(app)

app.listen(8080)