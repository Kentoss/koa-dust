"use strict";

const request = require('supertest');
const assert = require('assert');
const Dust = require('..');
const Koa = require('koa');

const streamCheck = (res,cb)=>{
	let nChunks = 0;
	let data="";
	res.on('data', (chunk)=>{ data += chunk.toString(); nChunks++; });
	res.on('error', (error)=>{ cb(error); });
	res.on('end', ()=>{ cb(null, {chunks: nChunks, text: data}); });
};

describe('render', function(){
	describe('with streaming enabled', function() {
		it('should stream the rendered template', function(done) {
			const app = new Koa();
			app.use(Dust('test/views'));
			app.use((ctx,next)=>{ ctx.render('stream-test', {title:"test", body:()=>{return new Promise((resolve)=>{ resolve('test body'); }); }}); });
			request(app.listen())
			.get('/')
			.expect(200)
			.parse(streamCheck)
			.end(function(err, res) {
				if (err) return done(err);
				assert.ok(res.body.chunks > 1);
				assert.ok(/<title>test<\/title>/.test(res.body.text));
				assert.ok(/<body>test body<\/body>/.test(res.body.text));
				assert.ok(/html/.test(res.body.text));
				done();
			});
		});
	});

	describe('with streaming disabled', function() {
		it('should render the template before responding', function(done) {
			const app = new Koa();
			app.use(Dust('test/views', {stream:false}));
			app.use(async (ctx,next)=>{ await ctx.render('stream-test', {title:"test", body:()=>{return new Promise((resolve)=>{ resolve('test body'); }); }}); });
			request(app.listen())
			.get('/')
			.expect(200)
			.parse(streamCheck)
			.end(function(err, res) {
				if (err) return done(err);
				assert.ok(res.body.chunks < 2);
				assert.ok(/<title>test<\/title>/.test(res.body.text));
				assert.ok(/<body>test body<\/body>/.test(res.body.text));
				assert.ok(/html/.test(res.body.text));
				done();
			});
		});
	});

	describe('with a custom extension', function() {
		it('should render the template with an .html extension', function(done) {
			const app = new Koa();
			app.use(Dust('test/views', {ext:'html'}));
			app.use((ctx,next)=>{ ctx.render('extension-test', {title:"test", body:"test body"}); });
			request(app.listen())
			.get('/')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				assert.ok(/<title>test<\/title>/.test(res.text));
				assert.ok(/<body>test body<\/body>/.test(res.text));
				assert.ok(/html/.test(res.text));
				done();
			});
		});
	});

	describe('with compile enabled', function() {
		it('should compile the template before rendering', function(done) {
			const app = new Koa();
			app.use(Dust('test/views', {compile:true, ext:'dust'}));
			app.use((ctx,next)=>{ ctx.render('compile-test', {title:"test", body:"test body"}); });
			request(app.listen())
			.get('/')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				assert.ok(/<title>test<\/title>/.test(res.text));
				assert.ok(/<body>test body<\/body>/.test(res.text));
				assert.ok(/html/.test(res.text));
				done();
			});
		});
	});
});