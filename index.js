var Hapi = require('hapi');
var server = new Hapi.Server(3000);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        var runningExperiments = [
          {
            name: "conversionIsBetterWithComicSansFont"
          }
        ];

        reply(runningExperiments);
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});