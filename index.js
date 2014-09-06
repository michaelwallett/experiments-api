var elasticsearch = require('elasticsearch'),
    Hapi = require('hapi'),
    server = new Hapi.Server(3000);

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        client.percolate({
          index: 'targeting',
          type: 'request',
          body: {
            doc: {
              metroId: "72"
            }
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