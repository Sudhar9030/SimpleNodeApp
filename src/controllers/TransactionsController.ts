import { Request, Response } from "express";
import mongoClient from "../config/MongoDbConfig";
import { Expense } from "../types/Expense";
import { ApiResponse } from "../types/common/ApiResponse";
import { upload } from "../config/FileStorage";
import fs from "fs";
import { parse } from "csv-parse";
import CIBCTransactionLoaderService from "../services/transactions/CIBSTransactionLoaderService";
import TransactionLoaderService from "../services/transactions/TransactionLoaderService";
import CanadianTierLoaderService from "../services/transactions/CanadianTierLoaderService";
import { AggregationCursor, Filter } from "mongodb";
import { Upload } from "../types/Upload";
import * as queries from "../dao/Queries";
import logger from "../config/Logger";

const uploadsCollection = mongoClient.db("finances").collection<Upload>("uploads");
const transactionsCollection = mongoClient.db("finances").collection<Expense>("transactions");

export async function getTransactionByUserId(req: Request, res: Response) {
  const query: Filter<Expense> | any = {};
  var response: ApiResponse<{ transactions: Array<Expense>; totalCount: number }> | undefined = undefined;
  try {
    logger.info("Retrieving transactions for user %s and institution %s", req.params.userId, req.query.institutionName);

    query.userId = req.params.userId;

    if (req.query?.institutionName) {
      query.institutionName = req.query?.institutionName;
    }

    const currentDateTime = new Date()

    var startDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), 1)

    if(req.query?.startDate){
      startDate = new Date(String(req.query?.startDate))
    }

    var endDate: Date = new Date()

    if(req.query?.endDate){
      endDate = new Date(String(req.query?.endDate))
    }else{
      endDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth()+1, 0)
    }

    console.log(startDate)
    console.log(endDate)



    const account: string = "" + req.query?.institutionName;

    const page: number = req.query.page ? Number(req.query.page) : 0;
    const limit: number = req.query.limit ? Number(req.query.limit) : 10;

    const transactionsQuery = queries.getPagenatedResults(
      {
        $match: {
          institutionName: query.institutionName,
          userId: query.userId,
          transactionDate: {
            $gte: startDate,
            $lte: endDate
          }
        },
      },
      null,
      page,
      limit
    );

    logger.info(transactionsQuery);

    const transactions: { data: Array<Expense>; totalCount: number } | null = 
        await transactionsCollection.aggregate<{ data: Array<Expense>; totalCount: number }>(transactionsQuery).next();

    response = {
      data: {
        transactions: transactions!.data,
        totalCount: transactions!.totalCount,
      },
    };
    res.send(response);
    return;
  } catch (err) {
    logger.error("Unable to retrieve transactions for user %s and institution %s", req.params.userId, req.query.institutionName);
    res.send({
      status: "error",
      message: "Unable to process your request at this time. Please try again later",
    });
    return;
  }
}

export async function addTransactions(req: Request, res: Response) {
  var response: ApiResponse<Expense[] | undefined>;

  try {
    let transactionLoader: TransactionLoaderService = new TransactionLoaderService();

    const institutionName = req.query.institutionName?.toString().toUpperCase();

    if (institutionName === "CIBC") {
      transactionLoader = new CIBCTransactionLoaderService();
    } else if (institutionName === "CanadianTier".toUpperCase()) {
      transactionLoader = new CanadianTierLoaderService();
    }

    console.log("Calling transaction Prser");
    const transactions = await transactionLoader.loadTransactionsFromFile(req);

    console.log("Parsed Transactions");

    const result = await transactionsCollection.insertMany(transactions!);

    result.insertedCount;

    response = {
      data: transactions,
      message: `${result.insertedCount} Transactions successfully saved`,
    };
  } catch (err) {
    console.log(err);
    response = {
      message: `Unable To upload transactions at this time`,
    };
  }

  res.send(response);
}



export async function getTotalSpentbyMonth(req: Request, res: Response){

  var response: ApiResponse<{transactionSummary: {month: number, totalSpent: number}}>

  var month = 0

  if(req.query.month){
    month = Number(req.query.month)
  }


  var transactionSummary: {month: number, totalSpent: number} | null= await transactionsCollection.aggregate<{month: number, totalSpent: number}>(queries.getTransactionTotalByMonth(month)).next()


  response = {
    data: {
      transactionSummary: transactionSummary!
    }
  }

  

  if(month > 0){
    if((month % 2) == 0){
      setTimeout(() => {
        res.send(response)
      }, 4000)
    }else{
      res.send(response)
    }
  }else {
    res.send(response)
  }



  

}