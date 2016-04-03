import vm from 'vm';
import { assert } from 'chai';
import gremlinLoader from '../src/loader';


export const getEvaluated = (output, modules) => {
  try {
    const fn = vm.runInThisContext('(function(module, exports, require) {' + output + '})', 'testcase.js');
    var m = { exports: {}, id: 1 };

    fn(m, m.exports, (module) => {
      if (modules && modules[module]) {
        return modules[module];
      }

      return '{' + module + '}';
    });
  } catch(e) {
    throw e;
  }

  delete m.exports.toString;
  delete m.exports.i;

  return m.exports;
}

export const assetEvaluated = (output, result, modules) => {
  const exports = getEvaluated(output, modules);

  assert.equal(result, exports);

  exports.should.be.eql(result);
}


export const runLoader = (loader, input, map, addOptions, callback) => {
  const opt = {
    options: {
      context: ''
    },
    callback,
    async: () => callback,
    loaderIndex: 0,
    context: '',
    resource: 'queries.gremlin',
    resourcePath: 'queries.gremlin',
    request: 'gremlin-loader!queries.gremlin',
    emitError: (message) => {
      throw new Error(message);
    },
    ...addOptions
  };

  loader.call(opt, input, map);
}


export const test = (name, input, result, query, modules) =>{
  it(name, (done) => {
    runLoader(gremlinLoader, input, undefined, !query || typeof query === 'string'
      ? { query } : query, (err, output) => {
      if (err) {
        return done(err)
      };

      assetEvaluated(output, result, modules);
      done();
    });
  });
};
