var elasticsearch = require('elasticsearch'),
    _ = require('underscore'),
    async = require('async'),
    Hapi = require('hapi'),
    server = new Hapi.Server(3000);

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var getExperiment = function (id, callback) {
  client.getSource({
    index: 'experiments',
    type: 'experiment',
    id: id
  }).then(function (body) {
    callback(body);
  }, function (error) {
    console.trace(error.message);
  });
};

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
          var experimentIds = _.map(body.matches, function (match) {
            return match._id;
          });

         async.concat(experimentIds, function (experimentId, callback) {
          getExperiment(experimentId, function (experiment) {
            callback(null, experiment);
          });
         },
         function (err, matchedExperiments) {
          var experimentsWithTrafficAllocation = _.filter(matchedExperiments, function (experiment) {
            return experiment.percentage > 0;
          });

          reply(experimentsWithTrafficAllocation);
         });
        }, function (error) {
          console.trace(error.message);
        });
    }
});

server.route({
    method: 'PUT',
    path: '/experiments/{id}',
    handler: function (request, reply) {
        request.payload._id = request.params.id;

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