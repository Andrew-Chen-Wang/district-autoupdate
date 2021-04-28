const util = require('util')
const fs = require('fs');
const streamPipeline = util.promisify(require('stream').pipeline)

const fetch = require('node-fetch');
const unzip = require('yauzl');

async function generateRandomPath() {
    const randomNum = Math.floor(Math.random() * 100000000 + 10000000);
    const path = `./_districts-${randomNum}.zip`;
    try {
        await fs.promises.access(`./_districts-${randomNum}`);
        await fs.promises.access(path);
        return path;
    } catch (error) {
        return await generateRandomPath();
    }
}

async function getDistrictsRepo(
    url='https://github.com/unitedstates/districts/archive/gh-pages.zip'
) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response: ${response.statusText}`);
    const path = await generateRandomPath();
    await streamPipeline(response.body, fs.createWriteStream(path));
    unzip.open(path, {autoClose: true, lazyEntries: true});
    fs.unlink(path, () => {});
    return path.slice(0, -4);
}

module.exports = {generateRandomPath, getDistrictsRepo};
