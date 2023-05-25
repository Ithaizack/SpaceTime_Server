import { randomUUID } from "node:crypto";
import { extname, resolve } from "node:path";
import { FastifyInstance } from "fastify";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pump = promisify(pipeline)

export async function upload(app:FastifyInstance) {
  app.post('/upload', async(request,reply)=>{
    const file = await request.file({
      limits:{
        fileSize: 10_242_800
      }
    })

    if(!file){
      return reply.status(400).send()
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(file.mimetype)
    
    if(!isValidFileFormat){
      return reply.status(400).send()
    }

    const fileId = randomUUID()
    const extension = extname(file.filename)

    const filename = fileId.concat(extension)

    const whiteStream = createWriteStream(
      resolve(__dirname, '../../uploads/',filename),
    )

    await pump(file.file, whiteStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl =  new URL(`/uploads/${filename}`,fullUrl).toString()
    return reply.send(fileUrl)
  })
}