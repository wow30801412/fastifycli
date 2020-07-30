const mongoose = require('mongoose');
const fp = require('fastify-plugin');
const unit = require('./unit');

module.exports = fp(
	function (fastify, opts, next) {
		let actions = [];
		const mongo = {};
		const mongooseList = {};
		opts.forEach((item) => {
			const conf = item.client;
			let action = () => {
				return new Promise((resolve, reject) => {
					const db = mongoose.createConnection(conf.url, conf.options || {});
					db.on('error', () => {
						console.log('Mongoose connection error', conf.url);
						fastify.log.error('mongoDB', err);
						resolve();
					});
					db.on('connected', () => {
						resolve();
					});
					mongooseList[item.name] = db;
				});
			};
			actions.push(action());
		});

		Promise.all(actions).then(() => {
			unit.getFilesList('app/mongo/', (r) => {
				if (r.failList && r.failList.length) {
					fastify.log.error('mongo', err);
				}
				r.list.forEach((item) => {
					const j = require(item.path);
					mongo[item.RelativeName] = j({
						mongoose: mongooseList[item.genre],
						Schema: mongoose.Schema,
					});
				});
			});
			fastify.decorate('mongo', mongo);
			// fastify.decorate('mongoose', mongoose);
			console.log('Mongoose connection success!');
			next();
		});
	},
	{
		fastify: '>=2.x',
		name: 'fastify-mongo',
	}
);
