const mock = require('mock-fs');
const utils = require('./utils');

afterEach(() => {
    mock.restore();
})

const listOut = (year, state="NC", n=13) => {
    let _a = (new Array(n + 1)).fill(1).map(
        (x, i) => `/Users/blah/districts/cds/${year}/${state}-${i}/shape.geojson`
    );
    _a.shift();
    return _a;
};

test("test only one year", async () => {
    const nc2020 = listOut(2020, "MI", 13);
    nc2020.sort();
    expect(utils.prunePaths(nc2020)).toEqual(nc2020);
});

test("test unique years", async () => {
    const nc2020 = listOut(2020, "NC", 13);
    let testPaths = [...listOut(2012, "NC", 13), ...nc2020];
    let newPaths = utils.prunePaths(testPaths);
    newPaths.sort();
    nc2020.sort();
    expect(newPaths).toEqual(nc2020);
    expect(newPaths.length).toEqual(13);
});

test("test unique years and states", async () => {
    const nc2012 = listOut(2012, "NC", 13);
    const mi2012 = listOut(2012, "MI", 13); // it's 14 ik
    let combined2012 = [];
    const nc2020 = listOut(2020, "NC", 13);
    for (let i = 0; i < 13; i++) {
        combined2012.push(nc2012[i], mi2012[i]);
    }
    const allArray = [...combined2012, ...nc2020],
        expectedArray = [...mi2012, ...nc2020];
    expectedArray.sort()
    expect(utils.prunePaths(allArray)).toEqual(expectedArray);
});
