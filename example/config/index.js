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
	sequelize: [{
		name:'default',
		client: CONF.mysqlDB.oauth
	},
	{
		name:'test', //文件夹     /model/router@test/xxx.js     router@test :文件路径  router  @test:使用 test数据库
		client: CONF.mysqlDB.oauth
	}]
};
