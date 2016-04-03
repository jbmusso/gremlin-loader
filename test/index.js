import loader from '../src/loader';
import { assert } from 'chai';

import { test, runLoader, getEvaluated } from './helpers';

const gremlinQuery = `
def fetchAll= { userName ->
  g.V().has('name', userName)
}

def noArg = { ->
  v = g.V().has('name', userName)
  v.limit(1)
}

  fetchOne    =    {   userName, unused ->
  g.V().has('name', userName).limit(1)
}
`;


describe('Loader', () => {
  it('should return a map of query builders', (done) => {
    runLoader(loader, gremlinQuery, undefined, {}, (err, output) => {
      const evaluated = getEvaluated(output);

      assert.property(evaluated, 'fetchAll');
      assert.isFunction(evaluated.fetchAll);

      assert.property(evaluated, 'noArg');
      assert.property(evaluated, 'fetchOne');

      const query = evaluated.fetchAll('Alice');
      assert.property(query, 'gremlin');
      assert.property(query, 'bindings');

      done();
    });
  });
});
