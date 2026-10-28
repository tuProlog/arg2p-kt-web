import { equal, deepEqual } from 'assert';

import * as queryService from '../app/service/queryService.mjs';

const service = queryService.default;

describe('Syntax errors', function () {

  it('should find nothing in a correct theory or query', function () {
    equal(service.checkTheory('d1(X) : bird(X) => flies(X).\nf1 :=> penguin(tweety).'), null);
    equal(service.checkQuery('arg2p::solve(flies(tweety))'), null);
    equal(service.checkQuery('  '), null);
  });

  it('should place an error of a theory, without the position in its message', function () {
    deepEqual(service.checkTheory('a :=> b.\nc :=> d.\ne :=> f(g.\nh :=> i.'), {
      line: 3, column: 10, length: 1, message: "Unexpected token '.'; expected right parenthesis"
    });
  });

  it('should place an error of a query', function () {
    const error = service.checkQuery('foo(');
    equal(error.line, 1);
    equal(error.column, 5);
  });

  it('should tell the theory from the flags when solving', function () {
    const where = (theory, flags, query = 'arg2p::solve') => {
      try { service.solve(theory, query, flags, () => { }); return null; } catch (e) { return e.syntax && e.syntax.where; }
    };
    equal(where('a :=> b', 'queryMode.'), 'theory');
    equal(where('a :=> b.', 'queryMode'), 'flags');
    equal(where('a :=> b.', 'queryMode.', 'foo('), 'query');
  });
});
