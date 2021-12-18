import { PrismaClient } from "@prisma/client";
import { sign, verify } from 'jsonwebtoken'
import { assert } from "./utils/assert";
import { prisma } from '../db';
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";

const { JWT_SECRET } = process.env;

export interface Context {
  req: IncomingMessage;
  res: ServerResponse;
  prisma: PrismaClient
  userId: string | null
}


export const tokens = {
    access: {
      name: 'ACCESS_TOKEN',
      expiry: '1d',
    },
  }

export function userIdentifier(ctx: Context): string {
  var ip = (ctx.req.headers['x-forwarded-for'] as string)?.split(',').shift() || 
        ctx.req.socket.remoteAddress
  console.log(`IP Address: ${ip} | user id: ${ctx.userId}`);
  return  ctx.userId ?? ip!;

}

export interface Token {
  userId: number
  type: string
  timestamp: number
}

interface IncomingContext {
  req: NextApiRequest// IncomingMessage;
  res: NextApiResponse// ServerResponse;
}

export const createContext = (ctx: IncomingContext): Context => {
    // let userId: number
    const {req, res} = ctx;
    const authorization = req?.headers?.authorization ?? "";
    
    // console.log(req.cookies);

    // console.log(`Authorization: ${authorization}`);

    // const token = authorization.replace('Bearer ', '')

    // assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');
    
    // const verifiedToken = verify(token, JWT_SECRET) as Token

    // if (!verifiedToken.userId && verifiedToken.type !== tokens.access.name)
    // userId = -1
    // else userId = verifiedToken.userId
    return {
        ...ctx,
        prisma,
        userId: "test-hello-world"
    }
}