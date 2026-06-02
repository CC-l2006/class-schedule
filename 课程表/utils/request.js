import {
	API_CONFIG
} from "@/config.js";

const request = (options) => {
	return new Promise((resolve, reject) => {

		uni.request({
			// URl
			url: API_CONFIG.baseUrl + options.url,

			// 方法
			method: options.method || 'GET',

			// 请求参数
			data: options.data || {},

			// 超时时间
			timeout: API_CONFIG.timeout,

			// 请求头
			header: {
				...API_CONFIG.header,
				...options.header
			},

			//请求成功
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject(res); 
				}
			},

			// 请求失败
			fail: (err) => {
				reject(err); 
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			},
			
		});
	});
}

export default request;