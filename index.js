const core = require('@actions/core');
const fs = require('fs');
import {globby} from 'globby';
const simpleGit = require('simple-git');
const path = require('path');
const utils = require('./utils');

async function getPath() {
    let givenPath = core.getInput("path");
    givenPath = path.isAbsolute(givenPath) ? givenPath :
        // need parent directory using ".." since we're in dist folder
        path.join(__dirname, "..", core.getInput("path"));
    return fs.promises.access(givenPath, fs.constants.F_OK)
        .then(() => {throw new Error(`File already exists at ${givenPath}`)})
        .catch(() => givenPath); // File doesn't exist or we manually threw
}

async function compile(dir) {
    core.info("Compiling GeoJSON Objects into FeatureCollection");
    let featureCollection = {
        "type": "FeatureCollection",
        "features": [],
    }
    let paths = utils.prunePaths(await globby(`${dir}/cds/**/shape.geojson`));
    // format: state: {year: last year seen, data: []}
    const statesSeen = {}, pathsLength = paths.length;
    let i = 0;  // completion counter... never programming in JS with files again
    core.info(`Computing ${pathsLength} GeoJSON file districts...`);
    for (let el of paths) {
        fs.readFile(el, "utf-8", (err, data) => {
            if (err) {
                i++;
                throw err;
            }
            el = el.split("/");
            const fileLength = el.length,
                year = el[fileLength - 3],
                state = el[fileLength - 2].split("-")[0];
            let val = statesSeen[state];
            if (val === undefined || val.year !== year) {
                statesSeen[state] = {year: year, data: [JSON.parse(data)]};
            } else {
                statesSeen[state].data.push(JSON.parse(data));
            }
            i++;
            core.debug(`Processed: ${state} at ${year} (counter: ${i} / ${pathsLength})`);
        });
    }
    let waitMax = 3600, waitCounter = 0;
    while (i !== paths.length) {
        await new Promise(r => {
            if (waitCounter++ > waitMax) throw new Error("Exceeded an hour of trying");
            return setTimeout(r, 1000);
        });
    }
    for (const x of Object.values(statesSeen)) {
        featureCollection.features.push(...x.data);
    }
    const compiledPath = await getPath();
    await fs.writeFile(compiledPath, JSON.stringify(featureCollection), (err) => {
        if (err) throw new Error(`Couldn't write into the file. Error:\n${err}`);
        core.info(`Dumped file at ${compiledPath}`);
        core.setOutput("filePath", compiledPath);
    });
}

async function run() {
    const clonedDir = path.join(__dirname, `.district-${Math.random().toString(16)}`);
    const git = simpleGit();
    let repo = `https://:${core.getInput("token")}@github.com/${core.getInput("districts-repo")}.git`;
    core.info("Cloning...");
    try {
        await git.clone(repo, clonedDir, ["--depth", "1", "-b", core.getInput("tag-branch"), "--single-branch"]);
    } catch (e) {
        core.error(e);
        core.setFailed("Failed to clone repository");
        return;
    }
    await git.cwd({path: clonedDir, root: true});
    await compile(clonedDir);
    await fs.rmdir(clonedDir, {recursive: true}, () => {});
}

run();
