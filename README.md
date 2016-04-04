# gremlin-loader

A Gremlin (Groovy) webpack loader.

`gremlin-loader` allows you to define Gremlin queries in Groovy files and load them within your Node.js environment as JavaScript functions.
Think about Webpack [css-loader](https://github.com/webpack/css-loader) in module mode, but for loading Groovy files instead of CSS flles.

The loader returns an `Object` where `keys` are names of all the functions found in the parsed file and `values` are JavaScript functions that, when called, return an `Object` with two properties:
* `bindings`: an `Object` where `keys` are argument names of the function as defined in the Groovy file and `values` are all values passed when calling the JavaScript function
* `gremlin`: the full string representation of the function as defined in the Groovy file, with an extra line appended responsible for immediately calling that Groovy function with the above `bindings` when sent to Gremlin Server for execution

This loader is meant to be used server-side with [babel-plugin-webpack-loaders](https://github.com/istarkov/babel-plugin-webpack-loaders).

This is highly experimental and shouldn't be used in production.

## Installation

```shell
npm install gremlin-loader babel-plugin-webpack-loaders --save
```

To make `babel-plugin-webpack-loaders` work, your `.babelrc` file should resemble the following:

```json
{
  "presets": ["es2015"],
  "plugins": [
    ["babel-plugin-webpack-loaders", {
      "config": "./webpack.config.babel.js",
      "verbose": false,
    }]
  ]
}
```

And the corresponding `webpack.config.babel.js` file:

```javascript
const config = {
  output: {
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['', '.js', '.gremlin']
  },
  module: {
    loaders: [
      {
        test: /\.gremlin$/,
        loader: 'gremlin'
      }
    ]
  }
};

export default config;
```

### Usage

Once configured, you can do the following:

queries.gremlin file:
```groovy
def fetchAllByName = { userName ->
  g.V().has('name', userName)
}
```

application.js file:
```javascript
import { fetchAllByName } from './queries';

const byNameQuery = fetchAllByName('Alice');
// byNameQuery is an object with 'gremlin' and 'bindings' keys:
// {
//   gremlin: 'def fetchAllByName = { userName ->  g.V().has(\'name\', userName)}\n;fetchAllByName(userName)',
//   bindings: { userName: 'Alice' }
// }

```

When used in conjunction with [gremlin-javascript](https://github.com/jbmusso/gremlin-javascript):

```javascript
import { createClient } from 'gremlin';

const client = createClient();

const query = fetchAllByName('Alice');
client.execute(query, (err, results) => {
  // handle err or results
});
```

### Benefits
- full reusability of your Gremlin queries: anything you write in `.gremlin` (or `.groovy`) files is valid Gremlin-Groovy and can be copy/pasted in the Gremlin console or used in any other application
- automatic parameter bindings with explicit names by extracting the function signature, for better Gremlin server performance (no query recompilation) and security (no injection)
- you do not have to write/escape fat strings of Gremlin in your application, and you also get proper syntax highlighting for free in your IDE (because Gremlin is just Groovy)
- automatic reloading of your Node.js application on `.gremlin` file change


