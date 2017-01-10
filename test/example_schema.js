'use strict';

module.exports = {
  tableName: 'user_data', // eslint-disable-line
  fields: {
    email: {
      type: 'string',
      email: true
    },
    username: {
      type: 'string',
      min: 3,
      max: 20
    },
    dob: { type: 'date' }
  }
};
