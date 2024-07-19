const BASE_ARG_INDEX = 2; // first arg when calling script

const getArgAtIndex = (idx) => {
  return process.argv[BASE_ARG_INDEX + idx];
}

const parseArgs = (argNames) => {
  return argNames.reduce((argsObj, argName, idx) => {
    return {
      ...argsObj,
      [argName]: getArgAtIndex(idx)
    }
  }, {})
}

module.exports = {
  parseArgs,
}
