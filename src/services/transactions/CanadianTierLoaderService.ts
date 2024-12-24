import { resolve } from "path";
import { Expense } from "../../types/Expense";
import TransactionLoaderService from "./TransactionLoaderService";
import fs from 'fs'
import { Request, Response} from 'express';
import { parse } from 'csv-parse'

export default class CanadianTierLoaderService extends TransactionLoaderService {
 async loadTransactionsFromFile(req: Request): Promise<Expense[] | undefined> {
    let expenses: Expense[] | undefined;

    console.log("Processing Canadian Tier transacions")

    const parser = fs.createReadStream(req.file?.path!).pipe(parse({
        delimiter: ',',
        columns: false
      }))
    
      let transactions: Expense[] = [] 
    
    
      for await (const record of parser){
        transactions.push({
          expense: record[4],
          description: record[4],
          amount: record[6],
          institutionName: 'CanadianTier',
          userId: req.params.userId,
          type: record[3],
          category: record[3],
          uploadId: Number(req.query.uploadId)
        })
      }

     console.log(transactions)


    return new Promise((resolve, reject) => resolve(transactions));
  }
}
