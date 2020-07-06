
module.exports = app => {
	class DianpingService extends app {
		
        async test(item) {
			console.log('server test',this.app.addd)
			return {
				't':'2'
			};
		}
	}

	return DianpingService;
};
