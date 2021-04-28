const core = require('@actions/core');
const fs = require('fs');
const globby = require('globby');
const download = require('./download');

async function getPath() {
  const filePath = core.getInput('path');
  try {
    await fs.promises.access(filePath);
    return filePath;
  } catch (error) {
    throw new Error(`File already exists at ${filePath}`);
  }
}

async function compile(dir) {
  let featureCollection = {
    "type": "FeatureCollection",
    "features": [],
  }
  let paths = await globby(`${dir}/cds/**/shape.geojson`);
  // The format is typically in cds/year/STATE-DISTRICT-#/shape.geojson
  // which means the year is ordered first after sort
  paths.sort();
  // format: state: {year: last year seen, data: []}
  let statesSeen = {};
  let fileLength = null;
  paths.forEach((el) => {
    fs.readFile(el, (err, data) => {
      if (err) throw err;
      el = el.split("/");
      if (fileLength === null) fileLength = el.length;
      const year = el[fileLength - 3];
      const state = el[fileLength - 2].split("-")[0];
      let val = statesSeen[state];
      if (val === undefined || val.year !== year) {
        statesSeen[state] = {year: year, data: [JSON.parse(data)]};
      } else {
        statesSeen[state].data.push(JSON.parse(data));
      }
    })
  });
  statesSeen.forEach(x => {featureCollection.features.concat(x.data);});
  fs.writeFile(await getPath(), JSON.stringify(featureCollection), (err) => {
    throw new Error(`Couldn't write into the file. Error:\n${err}`);
  })
}

async function run() {
  try {
    core.info("Downloading the repository: unitedstates/districts");
    const url = core.getInput("link");
    if (!url.endsWith(".zip")) {
      core.setFailed("Link must be a zip file");
      return;
    }
    const dir = await download.getDistrictsRepo(url);
    await compile(dir);
    fs.unlink(dir, () => {});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
