import { Request, Response } from "express";
//import sequelize from "../config/dbconfig";
import sql from "mssql";

import mongoClient from "../config/MongoDbConfig";
import { Collection, WithId } from "mongodb";
import { User } from "../types/User";
import { Institution } from "../types/Institution";
import { Expense } from "../types/Expense";
import { ApiResponse } from "../types/common/ApiResponse";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const usersCollection = mongoClient
      .db("finances")
      .collection<User>("users");

    const users = await usersCollection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    console.log(users);

    res.send(users);
  } catch (err) {
    console.log(err);
    res.send(err); 
  }
}

export async function addUser(req: Request, res: Response) {
  const user = req.body as User;

  const response: ApiResponse<null> = {data: undefined, message: undefined};
  var status = 200
  if(!user.name){
    response.message = 'Invalid name. name required'
    status = 400
  }else 
  if(!user.userId){
    response.message = 'Invalid userId. userId required'
    status = 400
  }else 
  if(!user.email){
    response.message = 'Invalid email. email required'
    status = 400
  }else
  if(!user.password){
    response.message = 'Invalid Password. Password required'
    status = 400
  } else {

    try{
      const usersCollection =  mongoClient.db("finances").collection<User>("users")

      const existingUser = await usersCollection.findOne({userId: user.userId, name: user.name, email: user.email, password: user.password})

      if(existingUser){
        response.message = "User already exists"
        status = 400
      }else{
        const insertResult = await usersCollection.insertOne(user)
        insertResult.acknowledged

        response.message = "User created";
      }

    }catch(err){
      console.log(err)
      response.message = 'Internal Server error'
    }
  }
  
  res.status(status).send(response)
}

export async function authenticateUser(req: Request, res: Response) {
  const body = req.body as User
  const response: ApiResponse<User> = {data: undefined, message: undefined};
  var status = 200
  try {
    console.log(body)
   const usersCollection = mongoClient.db("finances").collection<User>('users')

   const user = await usersCollection.findOne({userId: body.userId},{projection: {_id: 0}})
   
   console.log(user)
   if(!user || user.password != body.password){
    response.message = 'Incorrect User Id or Password'
    status = 400
   }else  {
    user.password = undefined
    response.data = user
    response.message = 'Login Success'
   }

  } catch (err) {
    console.log(err);
    response.message = 'Login failed. Please try again later'
  } finally {
  }

  res.status(status).send(response)
}

export async function getUserAccounts(req: Request, res: Response){
console.log('***************')
  const userId = req.params.userId;

  const query: any = {}

  console.log(userId)

  query.userId = userId;

  console.log(query)

 const userAccountsCollection =  mongoClient.db('finances').collection('user_accounts')

 const userAccounts = await userAccountsCollection.findOne(query)

 console.log(userAccounts)

 res.send(userAccounts)
}
