import axios from "axios";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function Oauth(app:FastifyInstance) {
  app.post('/register/web', async(request)=>{
    const bodySchema = z.object({
      code: z.string()
    })

    const { code } = bodySchema.parse(request.body)

    const RequestAcessToken = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID_WEB,
          client_secret: process.env.GITHUB_CLIENT_SECRET_WEB,
          code
        },
        headers:{
          Accept: 'application/json'
        }
      })

      const { access_token } = RequestAcessToken.data

      const ResponseOauth = await axios.get('https://api.github.com/user',{
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string(),
        avatar_url: z.string().url()
      })

      const UserInfo = userSchema.parse(ResponseOauth.data)

      let User = await prisma.users.findUnique({
        where:{
          githubId: UserInfo.id
        }
      }) 

      if(!User){
        User = await prisma.users.create({
          data:{
            githubId: UserInfo.id,
            login: UserInfo.login,
            name: UserInfo.name,
            avatarUrl: UserInfo.avatar_url,
          }
        })
      }

      const Tokem = app.jwt.sign({
        name: User.name,
        avatarUrl: User.avatarUrl
      },{
        sub: User.id,
        expiresIn: '30 days'
      })

      return {
        Tokem
      }
  })

  app.post('/register/mobile', async(request)=>{
    const bodySchema = z.object({
      code: z.string()
    })

    const { code } = bodySchema.parse(request.body)

    const RequestAcessToken = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID_MOBILE,
          client_secret: process.env.GITHUB_CLIENT_SECRET_MOBILE,
          code
        },
        headers:{
          Accept: 'application/json'
        }
      })

      const { access_token } = RequestAcessToken.data

      const ResponseOauth = await axios.get('https://api.github.com/user',{
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string(),
        avatar_url: z.string().url()
      })

      const UserInfo = userSchema.parse(ResponseOauth.data)

      let User = await prisma.users.findUnique({
        where:{
          githubId: UserInfo.id
        }
      }) 

      if(!User){
        User = await prisma.users.create({
          data:{
            githubId: UserInfo.id,
            login: UserInfo.login,
            name: UserInfo.name,
            avatarUrl: UserInfo.avatar_url,
          }
        })
      }

      const Tokem = app.jwt.sign({
        name: User.name,
        avatarUrl: User.avatarUrl
      },{
        sub: User.id,
        expiresIn: '30 days'
      })

      return {
        Tokem
      }
  })
}