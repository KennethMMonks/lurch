
# The Lurch Deductive Engine (LDE)

This branch is a rebooting of the entire LDE repository.  There's nothing to
see here yet.  Once this branch has made greater progress, it will be usable.
Right now, it's stripped to the studs.

## Running the tests

Tests run only in a browser, but you can launch them from the command line.

 * To run a local web server and open the test suite in your default browser:
   `npm run test-server`
 * To run the tests in a headless Chromium and report the results in the
   terminal, imitating mocha output: `npm test`

## Building the documentation

 * To run JSDoc to build the source code documentation, use `npm run docs`.
 * To view the resulting documentation, use `npm run show-docs`.

<!--
[![Build Status](https://travis-ci.org/lurchmath/lde.svg?branch=master)](https://travis-ci.org/lurchmath/lde)

[See documentation on the project website.](http://lurchmath.github.io/lde)

## Getting started with development

 * Install [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/).
 * Install [gulp](https://gulpjs.com/) globally
   (`npm install gulp-cli -g`).
 * Clone this repo.
 * In the repo, run `npm install`.

## Repository structure

 * `src/` folder is where the source code lives, written in
   [Literate CoffeeScript](http://coffeescript.org/#literate).
 * `release/` folder stores the sources that have been compiled to
   JavaScript.
    * To compile everything in your own copy of the repo, run `gulp build`.
    * If you make changes to the source code, be sure to compile to the
      release folder before committing and pushing, so that the two folders
      are always consistent in the repo online.
 * `docs/` is where the documentation source files are written in Markdown.
 * `site/` contains the documentation, compiled to a static site.
    * To rebuild the docs in your own copy of the repo, run `gulp docs`.
    * This requires you to have [mkdocs](http://www.mkdocs.org/) installed.
    * Pushing changes in this folder to GitHub will update the main site
      documentation, linked to above.
    * Any time you change the content of the `docs/` folder, you should
      rebuild them into `site/` before committing and pushing, so that the
      two folders (and, more importantly, the docs site online) stay
      consistent.
 * `tests/` contains the source code for the unit tests.
    * To run all tests in your own copy of the repo, run `gulp test`.

To control how the docs are built, edit [mkdocs.yml](mkdocs.yml).

To control all build processes, edit
[gulpfile.litcoffee](gulpfile.litcoffee).
-->

## License

[![LGPLv3](https://www.gnu.org/graphics/lgplv3-147x51.png)](https://www.gnu.org/licenses/lgpl-3.0.en.html)

