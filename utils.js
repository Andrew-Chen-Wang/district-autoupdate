exports.prunePaths = (paths) => {
    // The format is typically in cds/year/STATE-DISTRICT-#/shape.geojson
    // which means the year is ordered first after sort
    paths.sort();

    // format: state <str>: path <str>
    const statesSeen = {}

    // The purpose of this is to not need to open all files.
    // The optimization comes down to "has the state shown up yet"
    // Example path: /Users/blah/.district-1/cds/2012/PA-17/shape.geojson
    for (const x of paths) {
        const el = x.split("/"),
            fileLength = el.length,
            year = el[fileLength - 3],
            state = el[fileLength - 2].split("-")[0];
        const val = statesSeen[state];
        if (val === undefined || year !== val.year) {
            statesSeen[state] = {year: year, paths: [x]};
        } else {
            statesSeen[state].paths.push(x);
        }
    }
    let newPaths = [];
    Object.values(statesSeen).forEach((x) => {
        newPaths.push(...x.paths);
    });
    return newPaths;
}
