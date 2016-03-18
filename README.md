# koa-dust

## Usage

**Basic Example**
Note: by default koa-dust expects pre-compiled templates saved as js files. See API below to change this behavior.

```
const http = require('http');
const koa = require('koa');
const dust = require('koa-dust');
const app = new koa();

app.use(dust(__dirname + 'views'));
app.use((ctx, next) => {
	ctx.renderPage('index', {foo:"bar"});
});

http.createServer(app.callback()).listen(process.env.PORT || 5000);
```

## API

#### `dust(viewsFolder, options)`

* `viewsFolder` [String]: Location where views are stored
* `options` (optional)
* `options.ext` [String]: Default extension for view files
* `options.compile` [Boolean]: Compile template files
* `options.stream` [Boolean]: Stream result
* `options.cache` [Boolean]: Cache result