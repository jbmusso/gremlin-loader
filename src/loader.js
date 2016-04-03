import _ from 'lodash';
import loaderUtils from 'loader-utils';

import { parseGroovy } from './parser';


const processGroovy = (content, callback) => {
  callback(null, parseGroovy(content));
};

const buildQueryFunctionString = ({ signature, full, name }) => `
  ${name}: function (${signature || ''}) {
    return {
      gremlin: "${full
        .split('\n')
        .join('"+"')}\\n;${name}(${signature.join(', ')})",
      bindings: {${signature
        .filter(argument => argument.length)
        .map((argument) => `${argument}: ${argument}`).join(', ')}}
    }
  }`
  .trim();


module.exports = function (content) {
  const callback = this.async();

  processGroovy(content, (err, result) => {
    if (err) {
      return callback(err);
    }

    const exportJs = _.chain(result)
      .map(buildQueryFunctionString)
      .join(', ')
      .value();

    const output = `\n
      module.exports = { ${exportJs} };

      exports.locals = { ${exportJs} };
      `;

    callback(null, output);
  });
}
