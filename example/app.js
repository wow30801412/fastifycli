const f= require('fastify-start');
// const f= require('../../../mypackage/fastify-cli/index.js');

f({
  config:require('./config/index'),
  routers:require('./app/routers'),
  before(fastify){
    fastify.decorateReply("error", function (
      check,
      code = 500,
      message = "异常"
    ) {
      if (!check) {
        const res = {
          code,
          error: message,
        };
        this.log.warn(res);
        throw Error(`${message}code:${code}`);
      }
    });
  
    fastify.setErrorHandler(function (error, request, reply) {
      const msg = (error.message || "").split("code:");
      let code = 500;
      let message = error.message || "网络异常";
      if (msg.length == 2) {
        code = Number(msg[1]);
        message = msg[0];
      }
      const res = {
        code,
        error: message,
      };
      request.log.warn(res);
      reply.code(code).send(res);
    });
  }
})