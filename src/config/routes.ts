import { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from 'body-parser'
import userRouter from "../routes/users/UserRouter";
import transactionsRouter from "../routes/transactions/TransactionsRouter";
import uploadsRouter from "../routes/UploadsRouter"

export default function configure(app: Application) {
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json())

  app.get("/", (req: Request, res: Response) => {
    res.send({ Status: "OK" });
  });

  app.use("/users", userRouter)
  app.use("/transactions", transactionsRouter)
  app.use("/uploads", uploadsRouter)

  
}
