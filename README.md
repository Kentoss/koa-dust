# koa-dust

> **Note:** this is intended for koa v2

## Install

```
$ npm install koa-dust
```

## Usage

**Basic Example**

Note: by default koa-dust expects pre-compiled templates saved as js files. See API below to change this behavior.

```js
const http = require('http');
const koa = require('koa');
const dust = require('koa-dust');
const app = new koa();

app.use(dust(__dirname + '/views'));
app.use(async (ctx, next) => {
	await ctx.render('index', {foo:"bar"});
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

Note: `options` can also be used to set dust config values

**Examples**
```js
// Compile templates as they are needed
app.use(dust(__dirname + '/views', {ext: 'dust', compile: true}));
// Disable cache during development
app.use(dust(__dirname + '/views', {cache: false}));
```

#### `ctx.render(view, data)`

* `view` [String]: Name of the template file; can be absolute path; does not require extension
* `data` [Object]: Variables to be passed to the template

**Example**
```js
// Render template file 'index.js' with data
app.use(async (ctx, next) => { await ctx.render('index', {foo:'bar'}); });
```