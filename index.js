const core = require('@actions/core');
const fs = require('fs');
const globby = require('globby');

async function getPath() {
  // const filePath = core.getInput('path');
  const filePath = "./districts.geojson"
  try {
    await fs.promises.access(filePath);
    return filePath;
  } catch (error) {
    throw new Error(`File already exists at ${filePath}`);
  }
}

async function compile(dir) {
  // core.info("Compiling GeoJSON Objects into FeatureCollection");
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
  const compiledPath = await getPath()
  fs.writeFile(compiledPath, JSON.stringify(featureCollection), (err) => {
    throw new Error(`Couldn't write into the file. Error:\n${err}`);
  });
  // core.info(`Dumped file at ${compiledPath}`);
  // core.setOutput("filePath", compiledPath);
}

async function run1() {
  try {
    // core.info("Downloading the repository: unitedstates/districts");
    // const url = core.getInput("link");
    const url = 'https://github.com/unitedstates/districts/archive/gh-pages.zip'
    if (!url.endsWith(".zip")) {
      core.setFailed("Link must be a zip file");
      return;
    }
    // const dir = await download.getDistrictsRepo(url);
    // await compile(dir);
    // fs.unlink(dir, () => {});
  } catch (error) {
    // core.setFailed(error.message);
  }
}

const simpleGit = require('simple-git');

async function run() {
  const clonedDir = `.district-${Math.random().toString(16)}`;
  await fs.mkdir(clonedDir, () => {});
  const git = simpleGit(clonedDir);
  let repo = "git@github.com:unitedstates/district";
  try {
    await git.init()
    await git.clone(repo);
  } catch (e) {
  }
  await fs.readdir(clonedDir, (err, files) => {
    files.forEach(file => {
      console.log(file);
    });
  });
}

run();
