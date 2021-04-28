const mock = require('mock-fs');
const download = require('./download');

// test("generate random path intersects", async () => {
//     const first = 1, second = 2, third = 3;
//     jest.spyOn(global.Math, "floor")
//         .mockReturnValueOnce(1)
//         .mockReturnValueOnce(2)
//         .mockReturnValueOnce(3);
//     mock({
//         '_districts-1': {/* Empty dir */},
//         '_districts-2.zip': 'blank'
//     })
//     await download.generateRandomPath();
// })
//
// test("successfully generates path", async () => {
//     await download.generateRandomPath();
// });

test('fetch error', async () => {
    const url = 'https://blahmcblahface-123lsafd.io/123dk-129843aksl/45983dsl';
    await expect(download.getDistrictsRepo(url)).rejects.toThrow();
});

afterEach(() => {
    mock.restore();
})
