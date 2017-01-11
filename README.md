# abase-validate - A work in progress

[![Build Status](https://travis-ci.org/dwyl/abase-validate.svg?branch=master)](https://travis-ci.org/dwyl/abase-validate)
[![codecov](https://codecov.io/gh/dwyl/abase-validate/branch/master/graph/badge.svg)](https://codecov.io/gh/dwyl/abase-validate)
[![Code Climate](https://codeclimate.com/github/dwyl/abase-validate/badges/gpa.svg)](https://codeclimate.com/github/dwyl/abase-validate)
[![dependencies Status](https://david-dm.org/dwyl/abase-validate/status.svg)](https://david-dm.org/dwyl/abase-validate)
[![devDependencies Status](https://david-dm.org/dwyl/abase-validate/dev-status.svg)](https://david-dm.org/dwyl/abase-validate?type=dev)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/abase-validate/issues)

### What?

abase-validate is a [hapi](https://github.com/hapijs/hapi) plugin that provides an easy way to validate payloads by declaring a schema object which is heavily influenced by [joi](https://github.com/hapijs/joi). You will also be able to perform asynchronous validation and ability to redirect with errors to new url.

It can be used alone but is most powerful when used as part of [abase](https://github.com/dwyl/abase) or with your select few abase plugins.

Note if you are totally new to Hapi.js see: https://github.com/dwyl/learn-hapi
And/or if you are new to joi check out: https://github.com/dwyl/learn-joi

### Why?

`abase-validate` provides the mapping between a config (inspired by joi schema) to a joi object which can used for validation! What's the point?! In tandem with other abase modules we will only need a single config object and one source of truth.

You will also be able to add asynchronous validation which is not yet supported with joi and you can also provide a redirect with info rather than just throw a validation error.

For more understanding of *why* see the parent module [abase]((https://github.com/dwyl/abase)) as this provides just the validation part.


### How?

1. Install `npm install abase-validate --save`
2. Write a schema for your tables like so:
```js
  var schema = {
    tableName: 'users',
    fields: {
      name: { type: 'string' }
    }
  }
```
3. Register Plugin
```js
server.register([
    { register: require('abase-db'), options: { schema } }
], function () {
    ...
});
```
4. Set up validation and handle errors on routes like so:
```js
  var routes = [{
    method: 'GET',
    path: '/user/fail',
    handler: function (request, reply) {
      var errorInfo = request.plugins['abase-validate'];

      return reply(handleError(errorInfo));
    }
  }, {
    method: 'POST',
    path: '/user',
    handler: function (request, reply) {
      return reply('success');
    },
    config: {
      plugins: {
        'abase-validate': {
          tableName: 'users',
          fields: ['name'],
          redirect: '/user/fail'
        }
      }
    }
  }];
  server.route(routes);
```
5. Use without hapi. See API section below.

### API

#### Plugin: `require('abase-validate')`

##### Registration
When registered with Hapi takes options of the form:
`{ schema }` or `{ schemaPath }`

###### schemaPath

The path where the schema object (described below) can be found.

###### schema

The schema is in align with the requirements made by [abase]((https://github.com/dwyl/abase)) and as stated before is inspired by joi and will try to provide a one to one mapping.

The schema must be an object (or an array of objects for multiple tables) of the form: `{ tableName, fields }`.

`fields` is of the form `{ [fieldName]: { type, rest: optional }`

Table and field names must be valid postgres table and column names. (non empty, alphanumeric, no leading number, less than 64)

Each field must be given a type prop. tableypes we support are: `string`, `number`, `date`, `time -> date`, `boolean`.

More information can be inferred from `lib/config_validator.js`

Each field can also take more properties most of which will be used by other abase modules and have no effect but the ones we care about right now are.

To provide the properties that are to do with joi with arguments simply pass an array of them as the value and we will spread them into the joi method.

##### Under the hood

###### Validation Step

Validation is done on the `preHandler` stage of the request life cycle. If unsuccessful an error is thrown if no redirect otherwise the info is set in an expiring cookie and you are redirected.

###### Request decoration

The cookie is then picked up again at the `preHandler` stage and given to the plugin state.

##### Use

Configure the validation settings on a given route as shown above and in example.

Access any error info in the redirect by using `request.plugins['abase-validate']`.

#### createJoiObject: `require('abase-db').createJoiObject`

Helper that you can use to create the raw joi object from the schema without using the hapi plugin.

#### validate: `require('abase-db').validate`

Helper that you can use to check your schema outside of hapi. Takes in a schema object and will throw if it fails.

### Simple example

To see a simple example in action type `npm run example` into your command line. You can see how the plugin is used in the `example` folder.

### Questions and Suggestions

We hope you find this module useful!

If you need something cleared up, have any requests or want to offer any improvements then please create an issue or better yet a PR!
