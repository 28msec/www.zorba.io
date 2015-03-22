#Zorba Website [![Circle CI](https://circleci.com/gh/28msec/www.zorba.io/tree/master.svg?style=svg)](https://circleci.com/gh/28msec/www.zorba.io/tree/master)

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
