import { Request, Response } from "express";
import mongoClient from "../config/MongoDbConfig";
import { Expense } from "../types/Expense";
import { Upload } from "../types/Upload";
import * as queries from "../dao/Queries";
import { ApiResponse } from "../types/common/ApiResponse";
import { AggregationCursor, Filter } from "mongodb";
import logger from "../config/Logger";
import * as transactionController from "./TransactionsController";

const uploadsCollection = mongoClient.db("finances").collection<Upload>("uploads");
const transactionsCollection = mongoClient.db("finances").collection<Expense>("transactions");

export async function uploadStatements(req: Request, res: Response) {
  var response: ApiResponse<Expense[] | undefined>;
  var uploadDocuments: Array<Upload> | undefined;
  try {
    if (!req.file) {
      console.log("no file recieved");
      throw new Error("no file recieved")
    }

    var cursor: AggregationCursor<{ seqNo: number }> = uploadsCollection.aggregate<{ seqNo: number }>(queries.getCurrentSequenceNumberAggregate());

    var nextSeq: number = 1;

    if (await cursor.hasNext()) {
      var seqDocument: { seqNo: number } | null = await cursor.next();

      if (seqDocument?.seqNo) {
        nextSeq = seqDocument?.seqNo + 1;
      }
    }

    var statementStartDate: Date = new Date(String(req.query.statementStartDate));
    var statementEndDate: Date = new Date(String(req.query.statementEndDate));

    uploadDocuments = [
      {
        seqNo: nextSeq,
        accountName: req.query.institutionName?.toString(),
        fileName: req.file?.originalname,
        userId: req.params.userId,
        statementStartDate,
        statementEndDate,
        uploadTime: new Date(),
      },
    ];

    var insertResult = await uploadsCollection.insertMany(uploadDocuments);

    req.query.uploadId = nextSeq.toString();

    transactionController.addTransactions(req, res);
  } catch (err) {
    logger.error("Unable to Uplaod the documents ", uploadDocuments);
    response = {
      message: `Unable To upload transactions at this time`,
    };
    res.status(400).send(response);
  }
}

export async function getUploadsByUser(req: Request, res: Response) {
  var response: ApiResponse<{ uploads: Upload[]; totalCount: number }> | undefined = undefined;
  try {
    const userId = req.params.userId;

    var page: number = req.query.page ? Number(req.query.page) : 0;
    var limit: number = req.query.limit ? Number(req.query.limit) : 10;

    if(page && page > 0){
      page = page * limit
    }

    logger.silly(`Page => ${page} , Limit ==> ${limit}`)

    var uploads: { data: Upload[]; totalCount: number } | null = await uploadsCollection
      .aggregate<{ data: Upload[]; totalCount: number }>(queries.getPagenatedResults({ $match: { userId: userId } }, {$sort: {statementStartDate: 1}}, page, limit))
      .next();

    logger.silly(uploads)

    response = {
      data: {
        uploads: uploads!.data,
        totalCount: uploads!.totalCount,
      },
    }
  } catch (err) {
    logger.error("Unable to retrieve uploads", err);
    response = { message: "Error Retrieving Uploads " };
  }

  res.send(response);
}

export async function deleteAlldata(req: Request, res: Response) {

  const uploadId = req.query.uploadId

  if(uploadId){
     var deleteResult = await transactionsCollection.deleteMany({uploadId: Number(uploadId)});
     var uploadsDeleteResult = await uploadsCollection.deleteMany({seqNo: Number(uploadId)})
  }

  
  res.send({ message: `deleted all uploads and transactions for uploadId  ${uploadId}` });
}
