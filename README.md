# koa-dust

## Usage

**Basic Example**

Note: by default koa-dust expects pre-compiled templates saved as js files. See API below to change this behavior.

```js
const http = require('http');
const koa = require('koa');
const dust = require('koa-dust');
const app = new koa();

app.use(dust(__dirname + 'views'));
app.use(async (ctx, next) => {
	await ctx.renderPage('index', {foo:"bar"});
});

http.createServer(app.callback()).listen(process.env.PORT || 5000);
```

## API

#### `dust(folder, options)`

* `folder` [String]: Location where views are stored
* `options` [Object (Optional)]
* `options.ext` [String]: Default extension for view files
* `options.compile` [Boolean]: Compile template files
* `options.stream` [Boolean]: Stream result
* `options.cache` [Boolean]: Cache result

**Examples**
```js
app.use(dust(__dirname + 'views', {ext: 'dust', compile: true})); // Compile templates as they are needed

app.use(dust(__dirname + 'views', {cache: false})); // Disable cache during development
```

#### `ctx.renderPage(view, data)`

* `view` [String]: Name of the template file; can be absolute path; does not require extension
* `data` [Object]: Variables to be passed to the template

**Example**
```js
app.use(async (ctx, next) => { await ctx.renderPage('index', {foo:'bar'}); }); // Render template file 'index.js' with data `foo: 'bar'`
```