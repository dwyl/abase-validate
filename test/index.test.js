'use strict';

var test = require('tape');
var Hapi = require('hapi');
var path = require('path');

var plugin = require('../lib/');

var exampleSchema = require('./example_schema.js');

test('Can register DB plugin with schemaPath and hit route', function (t) {
  var server = new Hapi.Server();

  server.connection();
  server.register({
    register: plugin,
    options: { schemaPath: path.resolve(__dirname, '..', 'example_schema.js') }
  }, function (err) {
    if (err) {
      t.fail(err);
    }

    server.route([{
      method: 'GET',
      path: '/',
      handler: function (request, reply) { return reply('success') }
    }]);

    server.inject({ method: 'GET', url: '/' }, function (response) {
      t.equal(response.statusCode, 200, 'plugin handles valid payload');
      server.stop(t.end);
    });
  });
});

test('Can register DB plugin with schema option and valid post', function (t) {
  var server = new Hapi.Server();

  server.connection();
  server.register({
    register: plugin,
    options: { schema: exampleSchema }
  }, function (err) {
    if (err) {
      t.fail(err);
    }

    server.route([{
      method: 'POST',
      path: '/',
      handler: function (request, reply) {
        return reply('success');
      },
      config: {
        plugins: {
          'abase-validate': {
            tableName: 'user_data',
            fields: ['email', 'username'],
            redirect: '/'
          }
        }
      }
    }]);

    server.inject({
      method: 'POST',
      url: '/',
      payload: { email: 'valid@email.com' }
    }, function (response) {
      t.equal(response.payload, 'success', 'plugin handles valid payload');
      server.stop(t.end);
    });
  });
});

test('invalid post redirected to url, cookie to plugin setting', function (t) {
  var server = new Hapi.Server();
  var cookie;

  server.connection();
  server.register({
    register: plugin,
    options: { schema: exampleSchema }
  }, function () {
    server.route([{
      method: 'POST',
      path: '/',
      handler: function (request, reply) {
        return reply('success');
      },
      config: {
        plugins: {
          'abase-validate': {
            tableName: 'user_data',
            fields: ['email', 'username'],
            redirect: '/'
          }
        }
      }
    }, {
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        return reply(request.plugins['abase-validate']);
      }
    }]);

    server.inject({
      method: 'POST',
      url: '/',
      payload: { email: 'notcool' }
    }, function (response) {
      cookie = response.headers['set-cookie'];
      t.equal(response.statusCode, 302, 'redirected');
      t.equal(response.headers.location, '/', 'to given url');
      t.ok(cookie, 'with cookie set');

      server.inject({
        method: 'GET',
        url: '/',
        headers: { Cookie: cookie[0].split(';')[0] }
      }, function (res) {
        t.deepEqual(
          JSON.parse(res.payload),
          {
            values: { email: 'notcool' },
            errors: [{
              field: 'email',
              message: '"email" must be a valid email'
            }]
          },
          'cookie passed to plugin state correctly'
        );
        server.stop(t.end);
      });
    });
  });
});
