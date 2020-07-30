const Sequelize = require('sequelize');
const fp = require('fastify-plugin');
const unit = require('./unit');

module.exports = fp(
	function async(fastify, opts, next) {
		let actions = [];
		const Model = {};
		const modelList = {};

		opts.clients.forEach((item) => {
			const conf = item.client;

			let action = () => {
				return new Promise((resolve, reject) => {
					const sequelizeLog = fastify.log.child({ theme: 'sequelizeModel' });
					const db = new Sequelize(conf.dbName, conf.user, conf.pass, {
						...conf.option,
						benchmark: true,
						timezone: '+08:00',
						logging: function (sql, time) {
							if (opts.logging) {
								const str = sql.split(':')[1];
								sequelizeLog.info(`${str} (${time}ms)`);
							}
						},
					});
					db.authenticate()
						.then(() => {
							fastify.log.info('Connection has been established successfully.');
							modelList[item.name] = db;
							resolve();
						})
						.catch((err) => {
							console.error('Unable to connect to the database:', err);
							reject();
						});
				});
			};
			actions.push(action());
		});

		Promise.all(actions).then(() => {
			unit.getFilesList('app/model/', (r) => {
				if (r.failList && r.failList.length) {
					fastify.log.warn('model file', err);
				}
				r.list.forEach((item) => {
					const j = require(item.path);
					Model[item.RelativeName] = j({
						model: modelList[item.genre],
						Sequelize,
					});
				});
			});
			fastify.decorate('Model', Model);
			fastify.decorate('Sequelize', Sequelize);
			fastify.decorate('sequelize', modelList);
			Object.keys(modelList).map((key) => {
				const s = modelList[key];
				s.sync();
			});
			console.log('Sequelize connection success!');
			next();
		});
	},
	{
		fastify: '>=2.x',
		name: 'fastify-sequelize',
	}
);
