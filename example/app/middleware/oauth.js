function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
  }

module.exports = async function(request, reply) {
	
	// throw new Error(`错误oauth`);

	console.log("oauth")

// console.log('开始啦')
//   await sleep(3000)
//   console.log('这是来自3s之后的问好')

	// done();
}

