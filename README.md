# gremlin-loader

A Gremlin (Groovy) webpack loader.

`gremlin-loader` allows you to define Gremlin queries in Groovy files and load them within your Node.js environment as JavaScript functions.

This loader is meant to be used server-side with [babel-plugin-webpack-loaders](https://github.com/istarkov/babel-plugin-webpack-loaders).

This is highly experimental and shouldn't be used in production.

## Installation

```shell
npm install gremlin-loader --save
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
