'use strict';

var newPost = function (values, errors) {
  return '<form action="/new" method="POST" >'
    + (errors.title ? '<span>' + errors.title + '</span>' : '')
    + '<input name = "title" '
    + (values.title ? 'value ="' + values.title + '" ' : '')
    + (errors.title ? 'style = "color:red;" ' : '')
    + '/>'
    + (errors.body ? '<span>' + errors.body + '</span>' : '')
    + '<input name = "body" '
    + (values.body ? 'value ="' + values.body + '" ' : '')
    + (errors.body ? 'style = "color:red;" ' : '')
    + '/>'
    + '<input type="submit" value="Create" />'
    + '</form>'
  ;
};

module.exports = [{
  method: 'GET',
  path: '/new',
  handler: function (request, reply) {
    var errors = {};
    var formCookie = request.state['abase-validate'];

    if (!formCookie) {
      return reply(newPost({}, {}));
    }

    formCookie.errors.forEach(function (error) {
      errors[error.field] = error.message;
    });

    return reply(newPost(formCookie.values, errors));
  }
}, {
  method: 'POST',
  path: '/new',
  handler: function (request, reply) {
    return reply('success');
  },
  config: {
    plugins: {
      'abase-validate': {
        tableName: 'posts',
        fields: ['title', 'body'],
        redirect: '/new'
      }
    }
  }
}];
