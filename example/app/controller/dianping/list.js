class Phone  {
	test= {
		schema: {
			description: '测试列表',
			tags: ['client'],
			response: {
				200: {
					type: 'object',
					additionalProperties: true,
					properties: {},
				},
			},
		},
		async handler() {
			const { request, reply } = this;
			// const {id,bid} =request.params;
			// const {tid} =request.query;
			// // const {sid} =request.body;
			// console.log(id)
			// console.log(bid)

			// console.log(request.ddd)
			await this.service.Dianping.test();
			reply.send({ list: 'test22' });
			// reply.error('dd')
			// reply.error(false, 412, '每日验证码超限');

			console.log('11')
		},
	}
};

module.exports = Phone;
