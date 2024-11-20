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

export async function getTransactionByUserId(req: Request, res: Response) {
  const query: Filter<Expense> | any = {};
  var response:
    | ApiResponse<{ data: Array<Expense>; count: number }>
    | undefined = undefined;
  try {
    query.userId = req.params.userId;

    if (req.query?.institutionName) {
      query.institutionName = req.query?.institutionName;
    }

    const account: string = "" + req.query?.institutionName;

    const page: number = req.query.page ? Number(req.query.page) : 0
    const limit: number = req.query.limit ? Number(req.query.limit) : 10

    console.log(query);

    const transactionsCollections = mongoClient
      .db("finances")
      .collection<Expense>("transactions");

    const transactions: { data: Array<Expense>; count: number } | null =
      await transactionsCollections
        .aggregate<{ data: Array<Expense>; count: number }>([
          {
            $match: {
              institutionName: query.institutionName,
            },
          },
          {
            $facet: {
              transactions: [
                {
                  $skip: page,
                },
                {
                  $limit: limit,
                },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
          {
            $addFields: {
              totalCount: {
                $arrayElemAt: ["$totalCount.count", 0]
              } 
            }
          },
        ])
        .next();

    //  transactionsCollections
    //   .find(query, {
    //     projection: {
    //       _id: 0,
    //     },
    //   })
    //   .toArray();
    console.log(transactions);

    response = { data: transactions };
    res.send(response);
    return;
  } catch (err) {
    console.log(err);
    res.send({ status: "success" });
    return;
  }
}

export async function addTransactions(req: Request, res: Response) {
  if (!req.file) {
    console.log("no file recieved");
  }

  req.query.institutionName;

  let transactionLoader: TransactionLoaderService =
    new TransactionLoaderService();

  const institutionName = req.query.institutionName?.toString().toUpperCase();

  if (institutionName === "CIBC") {
    transactionLoader = new CIBCTransactionLoaderService();
  } else if (institutionName === "CanadianTier".toUpperCase()) {
    transactionLoader = new CanadianTierLoaderService();
  }

  console.log("Calling transaction Prser");
  const transactions = await transactionLoader.loadTransactionsFromFile(req);

  console.log("Parsed Transactions");

  const transactionsCollection = mongoClient
    .db("finances")
    .collection<Expense>("transactions");

  const result = await transactionsCollection.insertMany(transactions!);

  result.insertedCount;

  const response: ApiResponse<Expense[] | undefined> = {
    data: transactions,
    message: `${result.insertedCount} Transactions successfully saved`,
  };

  res.send(response);
}
