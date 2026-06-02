import request from "@/utils/request.js";

export function getCourses() {
	return request({url: '/course'})
}