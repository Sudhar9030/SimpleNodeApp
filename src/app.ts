import express, { Application, Request, Response} from "express";
import cors from "cors";
import configure from "./config/routes"

const app = express()

configure(app)

app.listen(8080)