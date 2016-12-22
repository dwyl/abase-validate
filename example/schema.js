'use strict';

module.exports = {
  tableName: 'posts',
  fields: {
    title: { type: 'string', max: 10 },
    body: { type: 'string' },
    id: { type: 'number', integer: true }
  }
};
