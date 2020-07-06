"use strict";
const fp = require("fastify-plugin");
const Redis = require("ioredis");

const addClientFun = (client) => {
  client.save = function (name, data, time) {
    return new Promise((resolve, reject) => {
      let p = client.pipeline();
      if (time) {
        if (!/^\d+(\.\d+)?[smHDM]?$/.test(time)) {
          throw new Error("redis set 时间格式错误");
        }
        time = String(time);
        let t = time.match(/\d+(\.\d+)?/g)[0];
        let seconds = 0;
        let unit = time.split("").pop() || "s";
        t = Number(t);
        switch (unit.toLocaleLowerCase()) {
          case "m":
            seconds = t * 60;
            break;
          case "H":
            seconds = t * 3600;
            break;
          case "D":
            seconds = t * 3600 * 24;
            break;
          case "M":
            seconds = t * 3600 * 24 * 30;
            break;
          default:
            seconds = t * 1;
            break;
        }
        p.set(name, JSON.stringify({ d: data }), "EX", seconds);
      } else p.set(name, JSON.stringify({ d: data }));
      p.exec()
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };
  client.gain = function (name) {
    return new Promise((resolve) => {
      client
        .get(name)
        .then((ret) => {
          if (!ret) {
            resolve(null);
          } else {
            try {
              ret = JSON.parse(ret);
              ret = ret.d;
            } catch (error) {}
            resolve(ret);
          }
        })
        .catch((e) => {
          resolve(null);
        });
    });
  };
  client.clear = function (name) {
    return new Promise((resolve) => {
      client
        .set(name, " ", "EX", 1)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };
  return client;
};

function fastifyRedis(fastify, options, next) {
  options = options[0];
  const namespace = options.namespace;
  delete options.namespace;

  let client = options.client || null;

  if (namespace) {
    if (!fastify.redis) {
      fastify.decorate("redis", {});
    }

    if (fastify.redis[namespace]) {
      return next(
        new Error(
          `Redis '${namespace}' instance namespace has already been registered`
        )
      );
    }

    const closeNamedInstance = (fastify, done) => {
      fastify.redis[namespace].quit(done);
    };

    if (!client) {
      try {
        client = new Redis(options);
      } catch (err) {
        console.log(err);
        return next(err);
      }

      fastify.addHook("onClose", closeNamedInstance);
    }
    client = addClientFun(client);
    fastify.redis[namespace] = client;
  } else {
    if (fastify.redis) {
      return next(new Error("fastify-redis has already been registered"));
    } else {
      if (!client) {
        try {
          client = new Redis(options);
        } catch (err) {
          console.log(err);
          return next(err);
        }

        fastify.addHook("onClose", close);
      }

      client = addClientFun(client);
      fastify.decorate("redis", client);
    }
  }

  next();
}

function close(fastify, done) {
  fastify.redis.quit(done);
}

module.exports = fp(fastifyRedis, {
  fastify: ">=2.x",
  name: "fastify-redis",
});
