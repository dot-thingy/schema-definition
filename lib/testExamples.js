const assert = require('node:assert/strict');
const { readFileSync, statSync } = require('node:fs');
const { resolve, relative, join } = require('path');
const ohm = require('ohm-js');
const { parseArgs } = require('./argParser');
const { listExampleFiles } = require('./listExampleFiles');

const processPath = resolve(process.cwd());
console.log('Starting test at path:', processPath, '\n');

const FILE_MATCHER_RX = /\.example\.thingy$/

const loadExamples = () => {
  return listExampleFiles(processPath).reduce((acc, dirent) => {
    if (!dirent.isFile()) {
      return acc
    }

    if (!dirent.name.match(FILE_MATCHER_RX)) {
      return acc
    }

    const path = join(dirent.path, dirent.name)

    return [
      ...acc,
      {
        path,
        value: readFileSync(path, 'utf-8'),
      }
    ]
  }, [])
}

const runTests = (grammar, examples) => {
  return examples.reduce((errors, { path, value }) => {
    console.log('  Testing example:', relative(process.cwd(), path))
    const m = grammar.match(value);
    try {
      if (m.failed()) {
        throw new Error(m.message);
      }

      console.log('    Passed!', '\n');

      return errors
    } catch (error) {
      const failureMessage = error?.message || error || 'Unknown reason';
      const printMessage = `    Failed: ${failureMessage}`;
      console.error(printMessage);

      return {
        ...errors,
        [path]: failureMessage
      }
    }
  }, {});
}

const reportResultsAndExit = (examples, errors) => {
  const numTotalTests = examples.length;
  const numFailedTests = Object.keys(errors).length;
  const numPassedTests = numTotalTests - numFailedTests;

  console.log('\n');
  console.log('Test run complete! Let\'s see how it went:');
  console.log(`${numPassedTests}/${numTotalTests} passed`, '\n');

  if (numFailedTests) {
    console.error('Oh no! The example test run failed! See below for details:');
    console.table(errors);
    process.exit(1);
  }

  process.exit(0);
}

const testExamples = async (builtPath) => {
  console.log('Loading schema file:', builtPath);

  // load contents from schema file
  const contents = readFileSync(builtPath, 'utf-8');

  console.log('Creating grammar from schema...');

  // create new grammar
  const myGrammar = ohm.grammar(contents);

  console.log('Loading example files...');

  const examples = loadExamples();

  const errors = runTests(myGrammar, examples);

  reportResultsAndExit(examples, errors);
}

// parse args for script call
const { schemaFilePath } = parseArgs(['schemaFilePath']);
// get schema file path and build full path
const builtPath = resolve(processPath, schemaFilePath);

if (!statSync(builtPath).isFile()) {
  console.error('Could not find a .thingy schema file at path:', builtPath);
  process.exit(1);
}

testExamples(builtPath);
