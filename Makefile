
REPORTER = dot

build:
	@coffee --compile --output lib/ src/

build-watch:
	@coffee -o lib -cw src

test: test-scenario

test-scenario:
	@NODE_ENV=test ./node_modules/.bin/mocha \
			--require "expect.js" \
			--reporter "dot" \
			test/scenario.js