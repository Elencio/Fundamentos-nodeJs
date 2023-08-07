import http from 'http'
import { Json } from './middlewares/json.js'
import { routes } from './routes.js'
import { extractQueryParams } from './utils/extract-query-params.js'



const server = http.createServer( async (req, res)=>{
   const { method, url} = req

   await Json(req, res)

   const route = routes.find(route => {
    return method.route === route && method.path.test(url) 
   })

   if(route){
    const routeParams = req.url.match(route.path)

    const { query, ...params } = routeParams.groups

    req.params = params
    req.query = query ? extractQueryParams(query) : {}

    return route.handler(res, req)
   }

   return res.writeHead(404).end()

})
//criando o servidor

server.listen(3333) //informando o servidor para rodar na porta 3333, sempre que acessar o localhost vai entrar no servidor