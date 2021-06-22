const core = require('@actions/core');
const fs = require('fs');
const globby = require('globby');
const simpleGit = require('simple-git');
const path = require('path');

async function getPath() {
    const filePath = path.join(__dirname, core.getInput("path"));
    return fs.promises.access(filePath, fs.constants.F_OK)
        .then(() => {throw new Error(`File already exists at ${filePath}`)})
        .catch(() => filePath);
}

async function compile(dir) {
    core.info("Compiling GeoJSON Objects into FeatureCollection");
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
    let i = 1;  // completion counter... never programming in JS with files again
    for (let el of paths) {
        await fs.readFile(el, "utf-8", (err, data) => {
            if (err) {
                i++;
                throw err;
            }
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
            i++;
            core.info(`Processed: ${state} at ${year} (counter: ${i} / ${paths.length})`)
        });
    }
    while (i !== paths.length) {
        await new Promise(r => setTimeout(r, 2000));
    }
    for (const x of Object.values(statesSeen)) {
        featureCollection.features.concat(x.data);
    }
    const compiledPath = await getPath();
    await fs.writeFile(compiledPath, JSON.stringify(featureCollection), (err) => {
        throw new Error(`Couldn't write into the file. Error:\n${err}`);
    });
    core.info(`Dumped file at ${compiledPath}`);
    core.setOutput("filePath", compiledPath);
}

async function run() {
    const clonedDir = path.join(__dirname, `.district-${Math.random().toString(16)}`);
    const git = simpleGit();
    let repo = `https://:${core.getInput("token")}@github.com/${core.getInput("districts-repo")}.git`;
    core.info("Cloning...");
    try {
        await git.clone(repo, clonedDir);
    } catch (e) {
        core.error(e);
        core.setFailed("Failed to clone repository");
        return;
    }
    await git.cwd({path: clonedDir, root: true});
    await compile(clonedDir);
}

run();
