import { resolve } from "path";
import { Expense } from "../../types/Expense";
import TransactionLoaderService from "./TransactionLoaderService";
import fs from 'fs'
import { Request, Response} from 'express';
import { parse } from 'csv-parse'

export default class CIBCTransactionLoaderService extends TransactionLoaderService {
 async loadTransactionsFromFile(req: Request): Promise<Expense[] | undefined> {
    let expenses: Expense[] | undefined;

    console.log("Processing CIBC transacions")

    const parser = fs.createReadStream(req.file?.path!).pipe(parse({
        delimiter: ',',
        columns: false
      }))
    
      let transactions: Expense[] = [] 
    
    
      for await (const record of parser){
        transactions.push({
          expense: record[1],
          description: record[1],
          amount: record[2],
          institutionName: 'CIBC',
          userId: req.params.userId,
          type: undefined
        })
      }

    // console.log(transactions)


    return new Promise((resolve, reject) => resolve(transactions));
  }
}
