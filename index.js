"use strict";
const fs = require('fs');
const _ = require('lodash');
const dust = require('dustjs-helpers');
const Readable = require('stream').Readable;
const resolve = require('path').resolve;
const extname = require('path').extname;
const isAbsolute = require('path').isAbsolute;
const defaults = {
	ext: 'js',
	compile: false,
	cache: true,
	stream: true,
	globals: {}
};

module.exports = (viewsPath, options) => {
	options = _.defaults({}, options, defaults);

	_.each(options, (v,k) => {
		if (typeof v === 'object') dust.config[k] = _.defaults(v, dust.config[k]); return; // Combine objects instead of replacing them - overwrite where there is a collision
		dust.config[k] = v;
	});

	dust.onLoad = (templatePath, opts, cb) => {
		let readTemplate = (err, file, name) => {
			if (err) return cb(err);
			fs.readFile(file, 'utf-8', (err, data) => {
				if (err) return cb(err);
				if (options.compile) {
					try { cb(null, dust.loadSource(dust.compile(data, name || file))); }
					catch(e) { cb(e); }
				} else {
					cb(null, dust.loadSource(data)); 
				}
			});
		};

		if (isAbsolute(templatePath)) {
			let cached = dust.cache[opts.name];
			if (typeof cached !== 'undefined') {
				if (!dust.isTemplateFn(cached)) return cb(new VError("cached value for '%s' was not a template function", options.name));
				return cb(null, cached);
			}
			readTemplate(null, templatePath, opts.name);
		} else {
			let f = resolve(viewsPath, templatePath);
			if (extname(f) != options.ext) {
				f += '.'+options.ext;
			}
			fs.stat(f, (err, stat) => {
				if (err) return cb(err);
				readTemplate(err, f, templatePath);
			});
		}
	};

	return (ctx, next) => {
		if (ctx.render) return next();
		ctx.globals = _.defaults({}, ctx.globals, options.globals); // Initialize globals object
		ctx.render = (view, locals) => {
			if (typeof view === 'undefined') { return ctx.throw('No view file specified'); }
			locals = _.defaults({}, locals, ctx.locals); // Combine locals

			let ext = (extname(view) || '.' + options.ext).slice(1);

			let context = dust.context(ctx.globals).push(locals);
			context.templateName = view.slice(-ext.length) === ext ? view.slice(0, -ext.length) : view;

			if (typeof options.beforeRender === 'function') {
				options.beforeRender(ctx, view, locals);
			}

			return new Promise((resolve, reject) => {
				if (options.stream === true) {
					let stream = dust.stream(view, context);
					ctx.type = "html";
					let body = ctx.body = new Readable({read: ()=>{}}); // Ensure body is readable stream
					stream.on('data', (d)=>{ if (d.trim().length > 0) { body.push(d); } }); // Filter out chunks that are just whitespace
					stream.on('end', ()=>{ body.push(null); resolve(); }); // Ensure the response is terminated and the render is resolved
				} else {
					dust.render(view, context, (err, data) => {
						if (err) return reject(err);
						ctx.body = data;
						resolve();
					});
				}
				if (typeof options.afterRender === 'function') {
					options.afterRender(ctx, view, locals);
				}
			});
		};
		return next();
	};
};