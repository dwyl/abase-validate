'use strict';

var Joi = require('joi');

var typeMap = require('./create_joi_object.js').typeMap;

// non empty, alphanumeric, no leading number, less than 64
var dbNameRegEx = /^[A-Za-z_]\w{0,62}$/;
var fieldTypes = Object.keys(typeMap);

var typeSchema = Joi.any()
  .valid(fieldTypes)
  .required();

var fieldSchema = Joi.object()
  .keys({ type: typeSchema })
  .unknown();

var tableSchema = Joi.object().keys({
  tableName: Joi.string()
    .regex(dbNameRegEx)
    .required(),
  fields: Joi.object()
    .pattern(dbNameRegEx, fieldSchema)
    .required()
});

var configSchema = [tableSchema, Joi.array().items(tableSchema)];

module.exports = function (config) {
  return Joi.assert(config, configSchema);
};

module.exports.dbNameRegEx = dbNameRegEx;
