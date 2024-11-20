import express, { Request, Response } from "express";
import * as userController from "../../controllers/UserController";
import * as transactionsController from '../../controllers/TransactionsController'

const userRouter = express.Router();

userRouter.get("/", userController.getAllUsers);

userRouter.post("/authenticate", userController.authenticateUser);

userRouter.post("/:userId", userController.addUser);

userRouter.get('/:userId/accounts', userController.getUserAccounts);

userRouter.get("/:userId/transactions", transactionsController.getTransactionByUserId)

export default userRouter;
