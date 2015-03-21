#28.io Website [![Build Status](https://travis-ci.org/28msec/www.28.io.svg?branch=master)](https://travis-ci.org/28msec/www.28.io)

## Installation

*Windows Users*:
We advice you to run any commands in the Git Bash.
Otherwise, the decryption of config.json won't work and you will have to setup the config.json manually.

```bash
$ gem install sass
$ npm install gulp -g
$ npm install && bower install
```

## Development

### Environment Variables
You need to set the following environment variable for convenience:
```bash
$ export TRAVIS_SECRET_KEY=<secret> # to decrypt / encrypt config files
```

```bash
$ gulp server
```

## Deployment

```bash
$ gulp 28:setup --build-id=test
```
