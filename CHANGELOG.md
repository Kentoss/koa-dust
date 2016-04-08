#### v0.0.4 - `Pending`
* Exposed Koa context to `beforeRender` function
* Merge objects being passed to Dustjs config from options variable instead of replacing them, fixes default helpers
* Allow locals to be passed from other middleware through the koa context through `ctx.locals`
* Allow globals to be passed from other middleware through the koa context through `ctx.globals`
* Added `afterRender` function called after dust has begun rendering the template (useful for post-render http/2 push_promises)
* Added testing and updated package to be more in line with other koa middleware

#### v0.0.3 - `March 24th, 2016`
* Added option for passing global variables to template context
* Added `beforeRender` option for transforming local variables before rendering
* Switch to dustjs-helpers to support the pre-made dust helpers
* Fixed readme showing incorrect examples

#### v0.0.2 - `March 19th, 2016`
* Renamed `ctx.renderPage` to `ctx.render` 
* Pass config variables through to dust instance, allows helpers to be defined

#### v0.0.1 - `March 18th, 2016`
* Initial Release