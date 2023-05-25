import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRouter(app: FastifyInstance) {
  
  app.addHook('preHandler', async(request)=>{
    await request.jwtVerify()
  })
  
  app.get('/memories', async(request)=>{
  
    const memories = await prisma.memorys.findMany({
      where:{
        usersId: request.user.sub
      },
      orderBy:{
        createdAt: 'asc'
      }
    })



    return memories.map(memorie=>{
      return {
        id: memorie.id,
        coverUrl: memorie.coverUrl,
        excerpt: memorie.content.substring(0, 115).concat('...'),
        createdAt: memorie.createdAt
      }
    })
  })

  app.get('/memories/:id', async(request,response)=>{
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const memorie = await prisma.memorys.findUniqueOrThrow({
      where:{
        id
      }
    })

    if(!memorie.isPublic && memorie.usersId !== request.user.sub){
      return response.status(401).send("Error")
    }

    return memorie
  })

  app.post('/memories', async(request)=>{
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })
    
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memorie = prisma.memorys.create({
      data:{
        content,
        coverUrl,
        isPublic,
        usersId: request.user.sub
      }
    })

    return memorie
  }) 

  app.put('/memories/:id', async(request,response)=>{
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memorie = await prisma.memorys.findFirstOrThrow({
      where:{
        id
      }
    })

    if(memorie.id !== request.user.sub){
      response.status(401).send()
    }

    memorie = await prisma.memorys.update({
      where:{
        id,
      },
      data:{
        content,
        coverUrl,
        isPublic
      }
    })

    return memorie
  })

  app.delete('/memories/:id', async(request,response)=>{
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const memorie = await prisma.memorys.findFirstOrThrow({
      where:{
        id
      }
    })

    if(memorie.id !== request.user.sub){
      response.status(401).send()
    }

    await prisma.memorys.delete({
      where:{
        id
      }
    })
  })
}