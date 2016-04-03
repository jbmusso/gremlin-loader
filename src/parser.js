import _ from 'lodash';


const getMatches = (string, regex) => {
  let match = regex.exec(string);

  if (!match) {
    return [];
  }

  let [, ...m] = match
  let matches = [m];

  while (match !== null) {
    match = regex.exec(string);

    if (!match) {
      break;
    }

    let [, ...m] = match;
    matches.push(m);
  }

  return matches;
}

export const parseGroovy = (content) => {
  const groovyFunctions = /(\b(?:def)?\s*(\w+)\s*=\s*{(?:\s*([\w\s,]*\b)\s*(?:->))?\n?([\s\S]*?)})/gm;
  const matches = getMatches(content, groovyFunctions);

  return _(matches)
    .map(([full, name, signature = '', body]) => ({
      full,
      name,
      signature: signature.split(',').map((s) => s.trim()),
      body
    }))
    .keyBy('name')
    .value();
}
