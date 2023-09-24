const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

let counter = 0;

function incrementCounter() {
  counter++;
  if (counter > 3) {
    counter = 0;
  }
  console.log(counter);
}

setInterval(incrementCounter, 5000);

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
}));
let data = {
    "id": "0",
    "address": "0xC723a0067b39d7099743266A4B33939f01b30a69",
    "state": "0",
};

app.get('/:id/:address', (req, res) => {
    console.log(`Data received: ID: ${req.params.id}, ADDRESS: ${req.params.address}`)
    data = { 
        "id": req.params.id, 
        "address": req.params.address,
        "state": "0",
    }
})

app.get('/data', (req, res) => {
    data.state = counter;
    res.send(data)
})
  
app.listen(port, () => {
    console.log(`LuggageServer listening on port ${port}`)
})