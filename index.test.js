const mock = require('mock-fs');
const utils = require('./utils');
const constants = require('./test_utils/consts');

afterEach(() => {
    mock.restore();
})

test("test current 2012 and only 2012", async() => {
    // 435 districts + 6 non voting
    expect(utils.prunePaths(constants.cds2012).length).toEqual(441);
});

const permutator = (permutation) => {
    // https://stackoverflow.com/a/37580979
    let length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }
    return result;
}

describe("test current paths permuted", () => {
    it.each(permutator([2012, 2016, 2018, 2020]))(
        "expect 441 regardless of order of paths inputted",
        (a, b, c, d) => {
            const allPaths = [];
            [a, b, c, d].forEach(year => allPaths.push(...constants[`cds${year}`]));
            expect(utils.prunePaths(allPaths).length).toEqual(441)
    });
});

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
