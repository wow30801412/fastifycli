const Sequelize = require("sequelize");
const fp = require("fastify-plugin");
const unit = require("./unit");

module.exports = fp(
  function (fastify, opts, next) {
    const conf = opts.client[0];
    const sequelizeLog = fastify.log.child({ theme: "sequelizeModel" });
    const sequelize = new Sequelize(conf.dbName, conf.user, conf.pass, {
      ...conf.option,
      benchmark: true,
      timezone: "+08:00",
      logging: function (sql, time) {
        if (opts.logging) {
          const str = sql.split(":")[1];
          sequelizeLog.info(`${str} (${time}ms)`);
        }
      },
    });
    sequelize
      .authenticate()
      .then(() => {
        fastify.log.info("Connection has been established successfully.");
        const Model = {
          sequelize,
        };
        const app = {
          Sequelize,
          model: sequelize,
        };
        unit.getFilesList("app/model/", (r) => {
          if (r.failList && r.failList.length) {
            fastify.log.warn("model file", err);
          }
          r.list.forEach((item) => {
            const j = require(item.path);
            Model[item.RelativeName] = j(app);
          });
        });

        // console.log(Model);

        fastify.decorate("Model", Model);
        fastify.decorate("Sequelize", Sequelize);
        sequelize.sync();
      })
      .catch((err) => {
        console.error("Unable to connect to the database:", err);
      });
    next();
  },
  {
    fastify: ">=2.x",
    name: "fastify-sequelize",
  }
);
