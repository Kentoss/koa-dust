# koa-dust

Koa middleware for rendering Dustjs templates using dustjs-linkedin. Supports compiling, caching, helpers, globals, & streaming.

> **Note:** this is intended for koa v2

## Install

```
$ npm install koa-dust
```

## Usage

`koa-dust` adds a new method `ctx.render(view, locals)` to the Koa context which renders template files using DustJS via `dustjs-linkedin`. For more information on DustJS templates please see the [official DustJS website](http://www.dustjs.com/). Global template variables can be passed to DustJS via the `options.globals` setting for `koa-dust`, as well as through the Koa context using `ctx.globals`. Similarly, template local variables may also be set through the Koa context using `ctx.locals` in addition to being set using `ctx.render`. Locals set using `ctx.render` will overwrite those set using `ctx.locals`.

Locals may also be transformed or added to using `options.beforeRender(ctx, view, locals)`. This is useful when you need to run a function with a unique result for each template. You can also use `options.afterRender(ctx, view, locals)` which fires immediately after calling the DustJS render function (**note:** if you are using streams, the function calls after initializing the stream as opposed to when the stream ends). This is intended for global post-render functions that can wait until after the client starts receiving a response to run, such as HTTP/2 PUSH_PROMISE frames.

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

**Disabling Streaming**

If for some reason you decide to disable template streaming, you will need to run the `render` function asyncronously, otherwise the page will return 404

```js
const http = require('http');
const koa = require('koa');
const dust = require('koa-dust');
const app = new koa();

app.use(dust(__dirname + '/views', {stream:false}));
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
* `options.globals` [Object]: Object containing global template variables
* `options.helpers` [Object]: Object containing helper functions
* `options.filters` [Object]: Object containing filter functions
* `options.beforeRender` [Function (ctx, view, locals)]: Called BEFORE dust render, allows transforming the locals object to inject additional view-specific data
* `options.afterRender` [Function (ctx, view, locals)]: Called AFTER dust render, allows the render process to move ahead asyncronously while you do some other things (like HTTP/2 push_promise)

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

## Using Helpers & Filters

The API for creating helpers and filters is identical to their DustJS implementation. However, instead of attaching them to the `dust` object, they are passed via the `options` parameter when initializing `koa-dust`.

**Example**

```js
const options = {
	helpers: {
		myHelper: (chunk, context, bodies, params) => {
			/* logic here */
			return chunk;
		}
	},
	filters: {
		myFilter: (value) => {
			/* modify the value */
			return value;
		}
	}
}

app.use(dust(__dirname + 'views', options));
```