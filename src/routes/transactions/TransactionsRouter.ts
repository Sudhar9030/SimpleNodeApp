import express from 'express';
import * as transactionsController from '../../controllers/TransactionsController'
import { upload } from "../../config/FileStorage";

const transactionsRouter = express.Router();

transactionsRouter.get('/:userId', transactionsController.getTransactionByUserId)
transactionsRouter.get('/:userId/summary', transactionsController.getTotalSpentbyMonth)

transactionsRouter.post('/:userId', upload.single('file'), transactionsController.addTransactions)

export default transactionsRouter;