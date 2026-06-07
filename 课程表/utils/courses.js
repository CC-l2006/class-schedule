// utils/course.js
import request from "@/utils/request.js";

// 获取课程列表
export function getCourses() {
	return request({
		url: '/course',
		method: 'GET'
	});
}

// 获取课表数据（静态数据）
export function getCourseData() {
	return request({
		url: '/api/get-course-data',
		method: 'GET'
	});
}

// 获取指定周次的课程
export function getCoursesByWeek(weekNum) {
	return request({
		url: `/api/courses-by-week?week=${weekNum}`,
		method: 'GET'
	});
}