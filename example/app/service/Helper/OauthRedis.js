module.exports = app => {
	class RedisService extends app {
		async save(key, data, time = '') {
			const {
				oauthConf: { app_key }
			} = this.request;
			const { redis } = this.app;
			const r = await redis.save(`${app_key}_${key}`, data, time);
			return r;
		}
		// 获取
		async gain(key) {
			const {
				oauthConf: { app_key }
			} = this.request;
			const { redis } = this.app;
			const data = await redis.gain(`${app_key}_${key}`);
			return data;
		}
	}

	return RedisService;
};
