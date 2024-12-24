import { resolve } from "path";
import { Expense } from "../../types/Expense";
import TransactionLoaderService from "./TransactionLoaderService";
import fs from 'fs'
import { Request, Response} from 'express';
import { parse } from 'csv-parse'
import logger from "../../config/Logger";

export default class CIBCTransactionLoaderService extends TransactionLoaderService {
 async loadTransactionsFromFile(req: Request): Promise<Expense[] | undefined> {
    let expenses: Expense[] | undefined;

    logger.info("Processing CIBC transacions")

    const parser = fs.createReadStream(req.file?.path!).pipe(parse({
        delimiter: ',',
        columns: false
      }))
    
      let transactions: Expense[] = [] 
    

      logger.log('debug', 'Upload Id =====> %s', req.query.uploadId)
    
      for await (const record of parser){

        var amount:number = record[2]? Number(record[2]) : Number('-'+record[3]);

        var transactionDate: Date = new Date(record[0]);

        var type:string = amount > 0 ? 'debited' : 'credited';

        transactions.push({
          expense: record[1],
          description: record[1],
          amount: amount,
          institutionName: 'CIBC',
          userId: req.params.userId,
          type,
          uploadId: Number(req.query.uploadId),
          transactionDate
        })
      }

    logger.silly(transactions)


    return new Promise((resolve, reject) => resolve(transactions));
  }
}
