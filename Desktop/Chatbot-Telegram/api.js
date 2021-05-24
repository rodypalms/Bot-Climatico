const express = require('express')

const app = express()
const port = 3000

app.use(express.json()); 

app.post('/apiRecebeWebhookBot', (req, res) => {
  console.log(req.body)
  
  /*
   * @TODO: Gravar estes dados em log (arquivo ou base de dados)
   */

  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Na porta: http://localhost:${port}`)
})
