const fp = require("fastify-plugin");
const path = require("path");
const fs = require("fs-extra");
const unit = require("./unit");
function _path(dir) {
  return path.join(process.cwd(), dir);
}

function fsExistsSync(path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

const middlewaresCache = {};
unit.getFilesList("app/middleware/", (r) => {
  r.list.forEach((item) => {
    const name = item.RelativeName.toUpperCase();
    middlewaresCache[name] = require(item.path);
  });
});

const getController = function ({ url, controller, option = {} }) {
  const _u = url.match(/([a-zA-Z]+)(:)(.+)/);
  if (_u.length !== 4) {
    throw new Error(`路由配置错误 ：${url}`);
  }
  const method = _u[1].toUpperCase();
  const u = _u[3];

  const opt = {
    method,
    url: u,
  };

  const arr = controller.split(".");
  const fun = arr.pop();
  arr.unshift(`/app/controller`);
  const pathConf = _path(arr.join("/"));
  if (!fsExistsSync(`${pathConf}.js`)) {
    throw new Error(`controller 不存在 ：${url}`);
  }
  const i = require(pathConf);
	const c = new i();
  if (!c[fun]) {
    throw new Error(`controller 方法不存在 ：${url}`);
  }
  const middlewares = (option.middlewares || []).map((k) => k.toUpperCase());
  const preHandler = [];
  middlewares.forEach((key) => {
    const item = middlewaresCache[key];
    if (item) {
      preHandler.push(item);
    }
  });
  const a = c[fun];

  if (a.schema) {
    opt.schema = a.schema;
  }
  if (preHandler.length) {
    opt.preHandler = preHandler;
  }

  opt.handler = async function (request, reply) {
    this.request = request;
    this.reply = reply;
    await a.handler.call(this);
  };
  return opt;
};

module.exports = fp(
  function (fastify, opts, next) {
    fastify.decorate("addRouters", (routers, opt) => {
      if (typeof routers === "function") {
        const prefix = [fastify.config.prefix || "", opt.prefix || ""]
          .join("/")
          .replace(/\/+/g, "/");
        const _routers = routers(fastify);
        fastify.register(
          (fastify, opts, callback) => {
            _routers.forEach((item) => {
              fastify.route(getController.call(fastify, item));
            });

            callback();
          },
          { prefix }
        );
      }
      // something very useful
    });

    next();
  },
  {
    fastify: ">=2.x",
    name: "fastify-mongo",
  }
);
