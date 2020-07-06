const mongoose = require("mongoose");
const fp = require("fastify-plugin");
const unit = require("./unit");

module.exports = fp(
  function (fastify, opts, next) {
    const conf = opts[0].client;
    mongoose
      .connect(conf.url, conf.options || {})
      .then(() => {
        console.log("mongoDB success");
        const app = {
          mongoose,
        };
        const mongo = {};
        unit.getFilesList("app/mongo/", (r) => {
          if (r.failList && r.failList.length) {
            fastify.log.error("mongo", err);
          }
          r.list.forEach((item) => {
            const j = require(item.path);
            mongo[item.RelativeName] = j(app);
          });
        });
        fastify.decorate("mongo", mongo);
        fastify.decorate("mongoose", mongoose);
      })
      .catch((err) => {
        fastify.log.error("mongoDB", err);
      });
    next();
  },
  {
    fastify: ">=2.x",
    name: "fastify-mongo",
  }
);
