const { readdirSync } = require('fs');
const { resolve } = require('path');

const listExampleFiles = (basePath = process.cwd()) => {
  const exampleDirPath = resolve(basePath, './examples');
  return readdirSync(exampleDirPath, { withFileTypes: true });
}

module.exports = {
  listExampleFiles,
}
