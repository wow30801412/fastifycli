module.exports = function ({ config = {}, routers, option = {}, swagger = false, before,swaggerOpt={} }) {
	const env = process.env.APP_ENV || 'pro';
	let ENV_PRO = env === 'pro';

	const fopt = {
		...{
			ajv: {
				removeAdditional: true,
				useDefaults: true,
				coerceTypes: true,
			},
			logger: !ENV_PRO
				? {
						level: ENV_PRO ? 'error' : 'info',
						prettyPrint: {
							colorize: true,
							translateTime: 'SYS:yyyy-mm-dd HH:MM:ss,l',
							ignore: 'pid,hostname,theme',
						},
						//启用漂亮的打印日志日志
						//Default: 'info'
						// One of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
				  }
				: false,
		},
		...option,
	};

	const fastify = require('fastify')(fopt);
	// ------------装饰器 -------------
	// 全局变量
	fastify.decorate('ENV', env);
	fastify.decorate('config', config.conf);
	// fastify.decorate('routes', require('./lib/routes'));

	if (config.decorate)
		Object.keys(config.decorate).forEach((name) => {
			fastify.decorate(name, config.decorate[name]);
		});
	// ------------ 装饰器 end------------
	// ------------  注册功能 begin ------
	// fastify.register(require("./lib/middleware"));
	fastify.register(require('./lib/service'));
	fastify.register(require('./lib/controller'));
	//   ------------  注册功能 end ------

	// ---------- 注册数据库 -------------
	if (config.mongo && config.mongo.length) {
		fastify.register(require('./lib/mongoose'), config.mongo);
	}
	if (config.sequelize) {
		fastify.register(require('./lib/sequelize'), {
			...{ logging: !ENV_PRO },
			clients: config.sequelize,
		});
	}
	if (config.redis && config.redis.length) {
		fastify.register(require('./lib/redis'), config.redis);
	}
	// ---------- 注册数据库 end-----------
	// require('./middleware/oauth')(fastify);
	fastify.register(routers);

	//   fastify.register(require("./lib/routes"), routers);

	if (before) {
		before(fastify);
	}

	if (!ENV_PRO && swagger) {
		fastify.register(require('fastify-swagger'), {
			routePrefix: '/doc/api',
			exposeRoute: true,
			swagger: {
				info: {
					title: 'Test swagger',
					description: 'testing the fastify swagger api',
					version: '0.1.0',
				},
				externalDocs: {
					url: 'https://swagger.io',
					description: 'Find more info here',
				},
				host: '127.0.0.1:3000',
				schemes: ['http'],
				consumes: ['application/json'],
				produces: ['application/json'],
				...swaggerOpt,
			},
		});
	}

	fastify.ready((err) => {
		if (err) throw err;
		if (!ENV_PRO && swagger) {
			console.log('fastify swagger');
			fastify.swagger();
		}
	});
	fastify.listen(config.port, function (err) {
		if (err) throw err;
		console.log(`server listening on ${fastify.server.address().port}`);
	});
};
