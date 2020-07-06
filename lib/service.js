const fp = require("fastify-plugin");
const unit = require("./unit");
const service = {};

unit.getFilesList("app/service/", (r) => {
  if (r.failList && r.failList.length) {
    fastify.log.error("service", err);
  }
  r.list.forEach((item) => {
    service[item.RelativeName] = require(item.path);
  });
});

const insertServer = (fastify, request) => {
  const app = function () {
    this.request = request;
    this.app = fastify;
    return this;
  };

  const ctx = {};
  Object.keys(service).map((key) => {
    ctx[key] = new (service[key](app, fastify))();
    return key;
  });
  return ctx;
};

module.exports = fp(
  function (fastify, opts, next) {
    fastify.addHook("preHandler", function (request, reply, callback) {
      this.service = insertServer(this, request);
      callback();
    });
    next();
  },
  {
    fastify: ">=2.x",
    name: "fastify-service",
  }
);
