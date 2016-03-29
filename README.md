# koa-dust

Koa middleware for rendering Dustjs templates using dustjs-linkedin. Supports compiling, caching, helpers, globals, & streaming.

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
app.use((ctx, next) => {
	ctx.render('index', {foo:"bar"});
});

http.createServer(app.callback()).listen(process.env.PORT || 5000);
```

**Globals & Before Render Example**

```js
const crypto = require('crypto');
const http = require('http');
const koa = require('koa');
const dust = require('koa-dust');
const app = new koa();

let options = {
	globals: {
		"critical-css": fs.readFileSync(__dirname + '/critical.css') // Load in critical CSS from a local file
	},
	beforeRender: (view, locals) => {
		// Adds a unique page ID based on the view name for use in the template
		// You would want to cache the result of this instead of running it every request
		let MD5 = crypto.createHash('md5');
		locals.pageID = MD5.update(view).digest('hex');
	}
};

app.use(dust(__dirname + '/views', options));
app.use((ctx, next) => {
	ctx.render('index', {foo:"bar"});
});

http.createServer(app.callback()).listen(process.env.PORT || 5000);
```

> Critical CSS and Page ID can then be applied using `{critical-css}` and `{pageID}` respectively inside any view template

## API

#### `dust(folder, options)`

* `folder` [String]: Location where views are stored
* `options` [Object (Optional)]
* `options.ext` [String]: Default extension for view files
* `options.compile` [Boolean]: Compile template files
* `options.stream` [Boolean]: Stream result
* `options.cache` [Boolean]: Cache result
* `options.globals` [Object]: Object containing global template variables
* `options.beforeRender` [Function (ctx, view, locals)]: Called before render output, allows transforming the locals object to inject additional view-specific data

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
app.use((ctx, next) => { ctx.render('index', {foo:'bar'}); });
```