module.exports = function(fastify, _opts, next) {

	// const a = require('./routers/dianping')(fastify);

	fastify.addRouters(require('./routers/dianping'), { prefix:'/v1' })
	// console.log(a)

	// console.log('prefix',prefix)

	// fastify.register(require('./routers/dianping'), { prefix });

	next();
};
