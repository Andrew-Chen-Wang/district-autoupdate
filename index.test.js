const mock = require('mock-fs');

afterEach(() => {
    mock.restore();
})
