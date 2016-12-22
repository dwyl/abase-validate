'use strict';

var Hapi = require('hapi');
var hoek = require('hoek');
var AbaseValidate = require('../lib/');
var routes = require('./routes.js');
var dbSchema = require('./schema.js');

var server = new Hapi.Server();

var abaseValidateOptions = { schema: dbSchema };

server.connection({ port: 8000 });

server.register([
  { register: AbaseValidate, options: abaseValidateOptions }
], function (err) {
  hoek.assert(!err, err);

  server.route(routes);

  server.start(function (error) {
    hoek.assert(!error, error);

    console.log('Visit: http://localhost:' + server.info.port + '/'); // eslint-disable-line
  });
});

module.exports = server;
