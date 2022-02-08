const express = require('express');
const app = express();
const fs = require('fs');
const port = process.env.PORT || 5001;

app.use(express.json());

app.use((req, res, next) => {
  if (req.ip === '::ffff:' || req.socket.remoteAddress === '::1') {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
});

// create a GET route
app.get('/directory/:dirname', (req, res) => {
  let dirname = req.params.dirname;
  dirname = dirname.replace(/%2F/g, '/');

  if (!fs.existsSync(dirname)) {
    res.status(404).json({success: false, status: 404, message: "Directory not found"});
  } else {
    const rosterName = `${dirname}/.roster.json`;

    let data;
    if (!fs.existsSync(rosterName)) {
      data = {};
      for (let filename of fs.readdirSync(dirname)) {
        data[filename] = [];
      }
      fs.writeFileSync(rosterName, JSON.stringify(data));
    } else {
      data = JSON.parse(fs.readFileSync(rosterName));
    }

    res.json({status: 200, ...data});
  }
});

app.put('/directory/:dirname', (req, res) => {
  let dirname = req.params.dirname;
  dirname = dirname.replace(/%2F/g, '/');
  const rosterName = `${dirname}/.roster.json`;

  let data = req.body
  console.log(`Writing ${rosterName} with data ${JSON.stringify(data)}`);
  fs.writeFileSync(rosterName, JSON.stringify(data));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
