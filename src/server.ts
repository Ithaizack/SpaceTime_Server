import "dotenv/config";
import {fastify}  from 'fastify'
import cors from '@fastify/cors'
import jwt from "@fastify/jwt";
import multipart from '@fastify/multipart'
import { memoriesRouter } from "./routes/memories";
import { Oauth } from "./routes/oauth";
import { upload } from "./routes/upload";
import { resolve } from "node:path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fastifyStatic from '@fastify/static'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = fastify()
const secret:string = process.env.JWT_SECRET ? String(process.env.JWT_SECRET) : "SPACETIME_SECRET"

app.register(fastifyStatic,{
  root: resolve(__dirname,'../uploads'),
  prefix: '/uploads',
})
app.register(multipart)
app.register(cors,{
  origin: true
})
app.register(jwt,{
  secret
})

app.register(Oauth)
app.register(memoriesRouter)
app.register(upload)

const PORT:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 5000
app.listen({
  port: PORT,
  host: '0.0.0.0'
}).then((params)=>{
  console.log("🚀 server is running on port "+params)
})