import { Expense } from "../../types/Expense";
import { Request, Response } from 'express'

export default class TransactionLoaderService {
    async loadTransactionsFromFile(req: Request): Promise<Expense[] | undefined> {
        let expenses: Expense[] | undefined;



        return new Promise(resolve => expenses);
    }
}