"use strict";
const fs = require('fs');
const _ = require('lodash');
const dust = require('dustjs-linkedin');
const resolve = require('path').resolve;
const extname = require('path').extname;
const isAbsolute = require('path').isAbsolute;
const Brook = require('./lib/brook');
const defaults = {
	ext: 'js',
	compile: false,
	cache: true,
	stream: true,
	helpers: {}
};

module.exports = (viewsPath, options) => {
	options = _.defaults({}, options, defaults);

	_.each(options, (v,k) => {
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
		if (ctx.renderPage) return next();
		ctx.renderPage = (view, locals) => {
			if (typeof view === 'undefined') { return ctx.throw('No view file specified'); }
			locals = locals || {};

			let ext = (extname(view) || '.' + options.ext).slice(1);
			let renderOptions = {
				name: view,
				ext: ext,
				locals: locals
			};

			let context = dust.context({}, renderOptions).push(locals);
			context.templateName = view.slice(-ext.length) === ext ? view.slice(0, -ext.length) : view;

			return new Promise((resolve, reject) => {
				if (options.stream === true) {
					let stream = dust.stream(view, context);
					ctx.set('Content-Type', 'text/html');
					ctx.body = new Brook(stream);
					return resolve();
				} else {
					dust.render(view, context, (err, data) => {
						if (err) return reject(err);
						ctx.body = data;
						return resolve();
					});
				}
			});
		};
		return next();
	};
};