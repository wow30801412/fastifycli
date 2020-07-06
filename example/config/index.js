const env = process.env.APP_ENV || 'pro';
const prefix = process.env.prefix || '/api/app';
// const CONF = require('../../conf/index');

console.log('\x1B[31m%s\x1B[0m', `---------环境变量env => ${env} -----------`);
module.exports = {
	port: 3000,
	decorate: {
		// curl: require('../../cli/lib/curl'),
		// middleware: require('../app/middleware/index'),
	},
	conf: {
		prefix,
		global:'xxx'
	},
	// mongo: [
	// 	{
	// 		name: 'default',
	// 		client: CONF.mongoDB.app,
	// 	},
	// ],
	// redis: [CONF.redis.oauth],
	// sequelize: {
	// 	client: [CONF.mysqlDB.oauth],
	// },
};
