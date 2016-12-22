/*
 * Abase Validate plugin
 */
'use strict';

var Joi = require('joi');

var configValidator = require('./config_validator.js');
var createJoiObject = require('./create_joi_object.js');

var tokenOptions = {
  isSecure: false,
  /* @TODO create https server
    https://github.com/air-supply/alpha/issues/254
  */
  ttl: 1000,
  path: '/',
  encoding: 'base64json'
};

exports.register = function (server, options, next) {
  var schema = server.app.abase
    || options.schema
    || require(options.schemaPath); // eslint-disable-line

  configValidator(schema);
  server.state('abase-validate', tokenOptions);
  server.ext('onPreHandler', function (request, reply) {
    var redirect, tableName, fields, table, payloadSchema;
    var routeOptions = request.route.settings.plugins['abase-validate'];
    var post = request.method === 'post';

    if (post && typeof routeOptions !== 'undefined') {
      redirect = routeOptions.redirect;
      tableName = routeOptions.tableName;
      fields = routeOptions.fields;
      table = [].concat(schema).filter(function (singleSchema) {
        return singleSchema.tableName === tableName;
      })[0];
      payloadSchema = createJoiObject(table, fields);

      Joi.validate(
        request.payload,
        payloadSchema,
        { abortEarly: false },
        function (err, values) {
          if (err) {
            return reply.redirect(redirect).state(
              'abase-validate',
              {
                values: values,
                errors: err.details.map(function (detail) {
                  return { field: detail.path, message: detail.message };
                })
              }
            );
          }

          return reply.continue();
        }
      );
    } else {
      reply.continue();
    }
  });

  return next();
};

exports.register.attributes = { name: 'abase-validate' };

exports.createJoiObject = createJoiObject;

exports.validate = configValidator;
