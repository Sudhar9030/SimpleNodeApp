//import Document from 'b'

import { BSON, Document } from "mongodb";

export function getCurrentSequenceNumberAggregate(): Document[]  {
    return [
        {
          $sort:
            {
              seqNo: -1,
            },
        },
        {
          $limit:
            1,
        },
        {
          $project:
            {
              seqNo: 1,
              _id: 0,
            },
        },
      ]
}

export function getPagenatedResults(match: any, sort: any | null, page: number, limit: number): Document[] {

  if(!sort){
    sort = {$sort: {_id : 1}}
  }

  return [
    match,
    sort,
    {
      $facet: {
        data: [
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
          $arrayElemAt: ["$totalCount.count", 0],
        },
      },
    },
  ]
}

export function getTransactionTotalByMonth(month = 1) {
  const query = [
    {
      '$addFields': {
        'transactionMonth': {
          '$month': '$transactionDate'
        }
      }
    }, {
      '$match': {
        'amount': {
          '$gt': 0
        }, 
        'transactionMonth': month
      }
    }, {
      '$group': {
        '_id': {
          'transactionMonth': '$transactionMonth'
        }, 
        'totalSpent': {
          '$sum': '$amount'
        }
      }
    }, {
      '$project': {
        'month': '$_id.transactionMonth', 
        'totalSpent': 1, 
        '_id': 0
      }
    }
  ]

  return query
}