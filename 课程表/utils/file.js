// utils/file.js
import request from "@/utils/request.js";

// 获取文件列表（根目录）
export function getFileList() {
	return request({
		url: '/node',
		method: 'GET'
	});
}

// 获取指定路径下的内容（用于文件夹导航）
export function getDirectoryContent(path = '') {
	return request({
		url: `/node/list?path=${encodeURIComponent(path)}`,
		method: 'GET'
	});
}

// 获取文件内容
export function getFileContent(filename) {
	return request({
		url: `/node/content/${encodeURIComponent(filename)}`,
		method: 'GET'
	});
}

// 创建文件夹
export function createFolder(folderName, parentPath = '') {
	return request({
		url: '/node/folder',
		method: 'POST',
		data: { folderName, parentPath }
	});
}

// 创建文件
export function createFile(fileName, content = '', parentPath = '') {
	return request({
		url: '/node/file',
		method: 'POST',
		data: { fileName, content, parentPath }
	});
}

// 更新文件内容
export function updateFile(filename, content) {
	return request({
		url: `/node/file/${encodeURIComponent(filename)}`,
		method: 'PUT',
		data: { content }
	});
}

// 重命名文件或文件夹
export function renameItem(oldPath, newName) {
	return request({
		url: '/node/rename',
		method: 'PUT',
		data: { oldPath, newName }
	});
}

// 删除文件或文件夹
export function deleteItem(itemPath) {
	return request({
		url: '/node/delete',
		method: 'DELETE',
		data: { itemPath }
	});
}