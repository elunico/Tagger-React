const express = require('express');
const app = express();

const fs = require('fs');
const port = process.env.PORT || 5001;

const filename = process.env.enviroment === 'production' ? '.roster.json' : 'roster.json';

function getDirectoryData(dirname) {
  const rosterName = `${dirname}/${filename}`;

  let data;
  if (!fs.existsSync(rosterName)) {
    data = {};
    for (let filename of fs.readdirSync(dirname)) {
      let kind = (fs.statSync(`${dirname}/${filename}`).isDirectory() ? 'directory' : 'file');
      // console.log(`${dirname}/${filename} is ${kind}`);
      data[filename] = { kind: kind, tags: [] };
    }
    fs.writeFileSync(rosterName, JSON.stringify(data));
  } else {
    data = JSON.parse(fs.readFileSync(rosterName));
    for (let filename of fs.readdirSync(dirname)) {
      if (!data[filename] && filename !== 'roster.json' && filename !== '.roster.json') {
        let kind = (fs.statSync(`${dirname}/${filename}`).isDirectory() ? 'directory' : 'file');
        // console.log(`${dirname}/${filename} is ${kind}`);
        data[filename] = { kind: kind, tags: [] };
      }
    }
    fs.writeFileSync(rosterName, JSON.stringify(data));
  }
  return data;
}

async function recursiveSearch(directory, allConditions, anyConditions, avoidConditions, results = {}) {
  const data = getDirectoryData(directory);
  for (let filename of Object.keys(data)) {
    const entry = data[filename];
    filename = filename.toLowerCase();

    // TODO: search dotfiles optionally but not by default or for now at least
    if (filename.startsWith('.')) {
      continue;
    }
    if (entry.kind === 'directory' && !avoidConditions.some(condition => filename.includes(condition))) {
      await recursiveSearch(`${directory}/${filename}`, allConditions, anyConditions, avoidConditions, results);
    } else {
      const tags = entry.tags;
      const allMatch = allConditions.every(condition => tags.includes(condition.toLowerCase()) || filename.includes(condition.toLowerCase()));
      const anyMatch = (anyConditions.length === 0) || (anyConditions.some(condition => tags.includes(condition.toLowerCase()) || filename.includes(condition.toLowerCase())));
      const avoidMatch = avoidConditions.some(condition => tags.includes(condition.toLowerCase()) || filename.includes(condition.toLowerCase()));
      if (allMatch && anyMatch && !avoidMatch) {
        results[`${directory}/${filename}`] = { tags: tags, kind: entry.kind };
      }
    }
  }
  return results;
}

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.ip, req.socket.remoteAddress);
  if (req.ip === '::ffff:' || req.socket.remoteAddress === '::1' || req.ip === '::ffff:127.0.0.1') {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
});

// create a GET route
app.get('/directory/:dirname', (req, res) => {
  let dirname = req.params.dirname;
  dirname = dirname.replace(/%2F/g, '/');
  console.log('Listing for ' + dirname);

  try {
    if (!fs.existsSync(dirname)) {
      res.status(404).json({ success: false, status: 404, message: "Directory not found" });
    } else {
      const data = getDirectoryData(dirname);

      res.json({ status: 200, ...data });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, status: 500, message: "Internal server error" });
  }
});

app.put('/directory/:dirname', (req, res) => {
  let dirname = req.params.dirname;
  dirname = dirname.replace(/%2F/g, '/');
  const rosterName = `${dirname}/${filename}`;

  let data = req.body;
  console.log(`Writing ${rosterName} with data ${JSON.stringify(data)}`);
  fs.writeFileSync(rosterName, JSON.stringify(data));
});

app.post('/recursive-search', async (req, res) => {
  let { directory: dir, allConditions, anyConditions, avoidConditions } = req.body;
  dir = dir.replace(/%2F/g, '/');
  console.log(`Searching ${dir} for ${allConditions} and ${anyConditions}`);

  try {
    if (!fs.existsSync(dir)) {
      res.status(404).json({ success: false, status: 404, message: "Directory not found" });
    } else {
      recursiveSearch(dir, allConditions, anyConditions, avoidConditions).then(results => {
        console.log(results);
        res.json({ status: 200, results: results });
      }).catch(err => {
        console.log(err);
        res.status(500).json({ success: false, status: 500, message: "Internal server error" });
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, status: 500, message: "Internal server error" });
  }

});

if (process.env.environment !== 'TEST')
  app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = { getDirectoryData, recursiveSearch };
