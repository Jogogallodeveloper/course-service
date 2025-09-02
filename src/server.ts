import { server } from "./app.ts"

const port = Number(process.env.PORT) || 3333
server.listen({ host: '0.0.0.0', port }).then(() => {
  console.log(`HTTP server running on ${port}`)
})