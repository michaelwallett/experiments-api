var elasticsearch = require('elasticsearch'),
    _ = require('underscore'),
    Hapi = require('hapi'),
    server = new Hapi.Server(3000);

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

server.route({
    method: 'GET',
    path: '/environments/{environment}/sessions/{session}/running-experiments',
    handler: function (request, reply) {
        client.percolate({
          index: 'targeting',
          type: 'request',
          body: {
            doc: _.extend(request.query, request.params)
          }
        }).then(function (body) {
          reply(body);
        }, function (error) {
          console.trace(error.message);
        });
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});