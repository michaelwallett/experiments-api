var elasticsearch = require('elasticsearch'),
    _ = require('underscore'),
    Hapi = require('hapi'),
    server = new Hapi.Server(3000);

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var getExperiment = function(id, callback) {
  client.getSource({
    index: 'experiments',
    type: 'experiment',
    id: id
  }).then(function (body) {
    callback(body);
  }, function (error) {
    console.trace(error.message);
  });
}

server.route({
    method: 'GET',
    path: '/environments/{environment}/sessions/{session}/running-experiments',
    handler: function (request, reply) {
        client.percolate({
          index: 'targeting',
          type: 'request',
          body: {
            doc: _.extend(request.params, request.query)
          }
        }).then(function (body) {
          reply(body);
        }, function (error) {
          console.trace(error.message);
        });
    }
});

server.route({
    method: 'PUT',
    path: '/experiments/{id}',
    handler: function (request, reply) {
        client.index({
          index: 'experiments',
          type: 'experiment',
          id: request.params.id,
          body: request.payload
        }).then(function (body) {
          client.index({
            index: 'targeting',
            type: '.percolator',
            id: request.params.id,
            body: request.payload.targeting
          })

          reply();
        }, function (error) {
          console.trace(error.message);
        });
    }
});

server.route({
    method: 'GET',
    path: '/experiments/{id}',
    handler: function (request, reply) {
      getExperiment(request.params.id, function(experiment) {
        reply(experiment);
      });
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});