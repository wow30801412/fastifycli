module.exports = function (fastify) {

	const routesConf = [
		{
			url: 'GET:/test',
			controller: 'dianping.list.test',
			option: {
				middlewares:['oauth','test']
			},
		},
	];

	return routesConf;
};
