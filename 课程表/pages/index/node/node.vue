<template>
	<view class="container">
		<!-- 头部 -->
		<view class="top">
			<text class="title">笔记</text>
			<view class="actions">
				<view class="file" @click="showCreateFolderDialog">
					<image class="file-btn" src="/static/node/folder-add.png" mode="aspectFill"></image>
					<text>新建文件夹</text>
				</view>
				<view class="file" @click="showCreateFileDialog">
					<image class="file-btn" src="/static/node/file.png" mode="aspectFill"></image>
					<text>新建笔记</text>
				</view>
			</view>
		</view>

		<!-- 面包屑导航 - 搜索模式下隐藏 -->
		<view class="breadcrumb" v-if="currentPath.length > 0 && !isSearchMode">
			<view class="breadcrumb-item" @click="navigateToPath(-1)">
				<text>📁 根目录</text>
			</view>
			<view class="breadcrumb-separator">></view>
			<view class="breadcrumb-item" v-for="(folder, idx) in currentPath" :key="idx" @click="navigateToPath(idx)">
				<text>{{ folder }}</text>
				<view class="breadcrumb-separator" v-if="idx < currentPath.length - 1">></view>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input class="search-input" type="text" placeholder="搜索全部笔记..." v-model="searchKeyword"
					@confirm="searchNotes" />
			</view>
			<button class="search-btn" @click="searchNotes">搜索</button>
		</view>

		<!-- 搜索模式提示 -->
		<view v-if="isSearchMode" class="search-info">
			<text class="search-info-text">
				找到 <text class="search-count">{{ searchResults.length }}</text> 个相关笔记
			</text>
			<text class="search-cancel" @click="exitSearchMode">返回全部</text>
		</view>

		<!-- 内容列表 -->
		<view class="note-list">
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-state">
				<text>加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="displayItems.length === 0" class="empty-state">
				<image src="/static/node/empty.png" mode="aspectFill" class="empty-image"></image>
				<text class="empty-text">{{ isSearchMode ? '没有找到相关笔记~' : '暂无内容，点击新建吧~' }}</text>
			</view>

			<!-- 内容列表 -->
			<view v-else class="note-items">
				<!-- 文件夹列表（搜索模式下不显示文件夹） -->
				<block v-for="(item, index) in displayItems" :key="'item-' + index">
					<view v-if="!isSearchMode && item && item.type === 'folder'" class="folder-item"
						@click="enterFolder(item)">
						<view class="folder-info">
							<view class="folder-icon-wrapper">
								<text class="folder-icon">📁</text>
							</view>
							<view class="folder-details">
								<text class="folder-name">{{ item.name || '' }}</text>
								<text class="folder-count">{{ item.fileCount || 0 }}个笔记</text>
							</view>
						</view>
						<view class="folder-actions">
							<text class="rename-btn" @click.stop="showRenameDialog(item)">重命名</text>
							<text class="delete-btn" @click.stop="confirmDelete(item)">删除</text>
						</view>
					</view>

					<!-- 笔记列表（只显示 .md 文件） -->
					<view v-if="item && item.type === 'file' && isMarkdownFile(item.name)" class="note-item"
						@click="viewNote(item)">
						<!-- 左侧：文件名 -->
						<view class="note-left">
							<view class="note-icon-wrapper">
								<text class="note-icon">📝</text>
							</view>
							<view class="note-name-wrapper">
								<text class="note-name"
									v-html="isSearchMode ? highlightKeyword(getNoteName(item.name)) : getNoteName(item.name)"></text>
								<!-- 搜索模式下显示文件所在路径 -->
								<text v-if="isSearchMode && item.displayPath"
									class="note-path">{{ item.displayPath }}</text>
							</view>
						</view>

						<!-- 右侧：信息区域 -->
						<view class="note-right">
							<!-- 上方：修改时间和文件大小 -->
							<view class="note-meta-top">
								<text class="note-time">{{ formatTime(item.modifyTime) }}</text>
								<text class="note-size">{{ formatSize(item.size) }}</text>
							</view>
							<!-- 下方：编辑和删除按钮 -->
							<view class="note-actions-bottom">
								<text class="edit-btn" @click.stop="editNote(item)">编辑</text>
								<text class="delete-btn" @click.stop="confirmDelete(item)">删除</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getDirectoryContent,
		getFileContent,
		createFolder,
		createFile,
		renameItem,
		deleteItem
	} from '@/utils/file.js';

	export default {
		data() {
			return {
				allItems: [], // 当前目录内容
				allFiles: [], // 所有笔记文件（用于全局搜索）
				loading: false, // 加载状态
				searchKeyword: '', // 搜索关键词
				currentPath: [], // 当前路径（文件夹数组）
				currentPathStr: '', // 当前路径字符串
				isSearchMode: false // 是否搜索模式
			}
		},

		computed: {
			// 搜索结果（从全部文件中搜索）
			searchResults() {
				if (!this.searchKeyword.trim()) {
					return [];
				}
				const keyword = this.searchKeyword.toLowerCase().trim();
				return this.allFiles.filter(item => {
					const fileName = this.getNoteName(item.name).toLowerCase();
					return fileName.includes(keyword);
				});
			},

			// 显示的内容（根据是否搜索模式）
			displayItems() {
				if (this.isSearchMode) {
					return this.searchResults;
				}
				return this.allItems;
			}
		},

		onLoad() {
			this.loadContentList();
			this.loadAllFiles(); // 加载所有文件用于搜索
		},

		methods: {
			// 判断是否为 Markdown 文件
			isMarkdownFile(filename) {
				if (!filename) return false;
				return filename.endsWith('.md') || filename.endsWith('.markdown');
			},

			// 获取笔记名称（去掉 .md 后缀）
			getNoteName(filename) {
				if (!filename) return '';
				return filename.replace(/\.md$/, '').replace(/\.markdown$/, '');
			},

			// 高亮关键词
			highlightKeyword(text) {
				if (!this.isSearchMode || !this.searchKeyword || !text) {
					return text;
				}
				const keyword = this.searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const regex = new RegExp(`(${keyword})`, 'gi');
				return text.replace(regex, '<span class="highlight">$1</span>');
			},

			// 递归获取所有子目录中的文件
			async loadAllFiles() {
				try {
					const res = await getDirectoryContent('');
					if (res && res.code === 200) {
						const items = res.data.items || [];
						const files = [];

						// 递归遍历收集所有文件
						const traverse = async (itemList, parentPath = '') => {
							for (const item of itemList) {
								if (item.type === 'folder') {
									// 获取子目录内容
									const subRes = await getDirectoryContent(parentPath ?
										`${parentPath}/${item.name}` : item.name);
									if (subRes && subRes.code === 200) {
										const subItems = subRes.data.items || [];
										await traverse(subItems, parentPath ? `${parentPath}/${item.name}` :
											item.name);
									}
								} else if (item.type === 'file' && this.isMarkdownFile(item.name)) {
									files.push({
										name: item.name,
										fullPath: parentPath ? `${parentPath}/${item.name}` : item
											.name,
										type: 'file',
										size: item.size,
										modifyTime: item.modifyTime,
										displayPath: parentPath || '根目录'
									});
								}
							}
						};

						await traverse(items);
						this.allFiles = files;
						console.log('已加载全部文件数量:', this.allFiles.length);
					}
				} catch (error) {
					console.error('加载全部文件失败:', error);
				}
			},

			// 刷新全部文件列表（创建/删除/重命名后调用）
			async refreshAllFiles() {
				await this.loadAllFiles();
			},

			// 加载当前目录内容
			async loadContentList() {
				this.loading = true;
				try {
					const res = await getDirectoryContent(this.currentPathStr);
					console.log('API响应:', res);

					if (res && res.code === 200) {
						let items = [];
						if (res.data && Array.isArray(res.data.items)) {
							items = res.data.items;
						} else if (Array.isArray(res.data)) {
							items = res.data;
						}

						this.allItems = items
							.filter(item => item && typeof item === 'object')
							.map(item => {
								return {
									name: item.name || '',
									fullPath: item.fullPath || item.name || '',
									type: item.type || (item.isDirectory ? 'folder' : 'file'),
									size: item.size || 0,
									modifyTime: item.modifyTime || new Date().toISOString(),
									fileCount: item.fileCount || 0
								};
							});

						console.log('当前目录数据数量:', this.allItems.length);
					} else {
						console.error('API错误:', res?.message);
						this.allItems = [];
						if (res?.message) {
							uni.showToast({
								title: res.message,
								icon: 'none'
							});
						}
					}
				} catch (error) {
					console.error('请求失败:', error);
					this.allItems = [];
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			// 进入文件夹
			enterFolder(folder) {
				if (!folder || !folder.name) return;
				this.currentPath.push(folder.name);
				this.currentPathStr = this.currentPath.join('/');
				this.searchKeyword = '';
				this.isSearchMode = false;
				this.loadContentList();
			},

			// 导航到指定路径
			navigateToPath(index) {
				if (index === -1) {
					this.currentPath = [];
					this.currentPathStr = '';
				} else {
					this.currentPath = this.currentPath.slice(0, index + 1);
					this.currentPathStr = this.currentPath.join('/');
				}
				this.searchKeyword = '';
				this.isSearchMode = false;
				this.loadContentList();
			},

			// 搜索笔记（搜索全部目录）
			async searchNotes() {
				if (!this.searchKeyword.trim()) {
					if (this.isSearchMode) {
						this.exitSearchMode();
					}
					return;
				}

				// 显示加载状态
				uni.showLoading({
					title: '搜索中...'
				});

				// 重新加载所有文件确保最新
				await this.refreshAllFiles();

				uni.hideLoading();

				this.isSearchMode = true;

				// 显示搜索结果数量
				const count = this.searchResults.length;
				if (count === 0) {
					uni.showToast({
						title: '未找到相关笔记',
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: `找到 ${count} 个相关笔记`,
						icon: 'success',
						duration: 1500
					});
				}
			},

			// 退出搜索模式
			exitSearchMode() {
				this.isSearchMode = false;
				this.searchKeyword = '';
			},

			// 显示创建文件夹对话框
			showCreateFolderDialog() {
				uni.showModal({
					title: '新建文件夹',
					editable: true,
					placeholderText: '请输入文件夹名称',
					success: (res) => {
						if (res.confirm && res.content) {
							this.createFolderItem(res.content);
						}
					}
				});
			},

			// 创建文件夹
			async createFolderItem(folderName) {
				if (!folderName) return;

				try {
					uni.showLoading({
						title: '创建中...'
					});
					const res = await createFolder(folderName, this.currentPathStr);

					if (res.code === 200) {
						uni.showToast({
							title: '创建成功',
							icon: 'success'
						});
						this.loadContentList();
						this.refreshAllFiles(); // 更新全部文件列表
					} else {
						uni.showToast({
							title: res.message || '创建失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('创建失败:', error);
					uni.showToast({
						title: '创建失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 显示创建文件对话框
			showCreateFileDialog() {
				uni.showModal({
					title: '新建笔记',
					editable: true,
					placeholderText: '请输入笔记名称',
					success: (res) => {
						if (res.confirm && res.content) {
							this.createFileItem(res.content);
						}
					}
				});
			},

			// 创建文件
			async createFileItem(fileName) {
				if (!fileName) return;

				let finalFileName = fileName;
				if (!fileName.endsWith('.md') && !fileName.endsWith('.markdown')) {
					finalFileName = fileName + '.md';
				}

				const defaultContent = `# ${fileName.replace(/\.md$/, '')}\n\n## 介绍\n\n在这里写下你的笔记内容...\n\n## 详细内容\n\n`;

				try {
					uni.showLoading({
						title: '创建中...'
					});
					const res = await createFile(finalFileName, defaultContent, this.currentPathStr);

					if (res.code === 200) {
						uni.showToast({
							title: '创建成功',
							icon: 'success'
						});
						this.loadContentList();
						this.refreshAllFiles(); // 更新全部文件列表
					} else {
						uni.showToast({
							title: res.message || '创建失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('创建失败:', error);
					uni.showToast({
						title: '创建失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 显示重命名对话框
			showRenameDialog(item) {
				if (!item || !item.name) return;

				uni.showModal({
					title: '重命名',
					editable: true,
					placeholderText: '请输入新名称',
					success: (res) => {
						if (res.confirm && res.content) {
							this.renameItem(item, res.content);
						}
					}
				});
			},

			// 重命名
			async renameItem(item, newName) {
				if (!item || !item.fullPath) return;

				let finalNewName = newName;
				if (item.type === 'file' && !newName.endsWith('.md') && !newName.endsWith('.markdown')) {
					finalNewName = newName + '.md';
				}

				try {
					uni.showLoading({
						title: '重命名中...'
					});
					const res = await renameItem(item.fullPath, finalNewName);

					if (res.code === 200) {
						uni.showToast({
							title: '重命名成功',
							icon: 'success'
						});
						this.loadContentList();
						this.refreshAllFiles(); // 更新全部文件列表
					} else {
						uni.showToast({
							title: res.message || '重命名失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('重命名失败:', error);
					uni.showToast({
						title: '重命名失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 确认删除
			confirmDelete(item) {
				if (!item || !item.name) return;

				const type = item.type === 'folder' ? '文件夹' : '笔记';
				uni.showModal({
					title: '提示',
					content: `确定要删除${type}"${item.name}"吗？${item.type === 'folder' ? '删除后无法恢复！' : ''}`,
					success: async (res) => {
						if (res.confirm) {
							await this.deleteItem(item);
						}
					}
				});
			},

			// 删除文件或文件夹
			async deleteItem(item) {
				if (!item || !item.fullPath) return;

				try {
					uni.showLoading({
						title: '删除中...'
					});
					const result = await deleteItem(item.fullPath);

					if (result.code === 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						this.loadContentList();
						this.refreshAllFiles(); // 更新全部文件列表
					} else {
						uni.showToast({
							title: result.message || '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('删除失败:', error);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 查看笔记详情
			async viewNote(note) {
				if (!note || !note.fullPath) return;

				try {
					uni.showLoading({
						title: '加载中...'
					});
					const res = await getFileContent(note.fullPath);

					if (res.code === 200 && res.data) {
						uni.navigateTo({
							url: `/pages/index/node/noteDetail?filename=${encodeURIComponent(res.data.filename)}&content=${encodeURIComponent(res.data.content)}`
						});
					} else {
						uni.showToast({
							title: res.message || '读取失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('读取失败:', error);
					uni.showToast({
						title: '读取失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 编辑笔记
			editNote(note) {
				if (!note || !note.fullPath) return;
				uni.navigateTo({
					url: `/pages/index/node/noteEdit?filename=${encodeURIComponent(note.fullPath)}`
				});
			},

			// 格式化文件大小
			formatSize(bytes) {
				if (!bytes || bytes === 0) return '0 B';
				if (bytes < 1024) return bytes + ' B';
				if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
				return (bytes / 1024 / 1024).toFixed(2) + ' MB';
			},

			// 格式化时间
			formatTime(time) {
				if (!time) return '';
				try {
					const date = new Date(time);
					const now = new Date();
					const diff = now - date;

					if (diff < 60000) return '刚刚';
					if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
					if (date.toDateString() === now.toDateString()) {
						return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
					}
					if (date.getFullYear() === now.getFullYear()) {
						return `${date.getMonth() + 1}月${date.getDate()}日`;
					}
					return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
				} catch (e) {
					return '';
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f3f3f3;
		min-height: 100vh;

		.top {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			height: 100rpx;
			background-color: #ffffff;
			border-bottom: 1px solid #f0f0f0;

			.title {
				font-size: 50rpx;
				font-weight: 600;
				color: #333333;
			}

			.actions {
				display: flex;
				gap: 20rpx;
			}

			.file {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8rpx;
				padding: 8rpx 16rpx;
				border-radius: 40rpx;
				background-color: #f5f5f5;
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.95);
					background-color: #e8e8e8;
				}

				.file-btn {
					height: 32rpx;
					width: 32rpx;
				}

				text {
					font-size: 24rpx;
					color: #667eea;
					font-weight: 500;
				}
			}
		}

		.breadcrumb {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			padding: 20rpx 30rpx;
			background-color: #ffffff;
			border-bottom: 1px solid #f0f0f0;
			font-size: 26rpx;

			.breadcrumb-item {
				display: flex;
				align-items: center;
				color: #667eea;

				&:active {
					opacity: 0.7;
				}
			}

			.breadcrumb-separator {
				margin: 0 8rpx;
				color: #999999;
			}
		}

		.search-bar {
			display: flex;
			align-items: center;
			padding: 20rpx 30rpx;
			background-color: #ffffff;
			border-bottom: 1px solid #f0f0f0;

			.search-input-wrapper {
				flex: 1;
				position: relative;
				display: flex;
				align-items: center;

				.search-icon {
					position: absolute;
					left: 24rpx;
					font-size: 32rpx;
					color: #999999;
					pointer-events: none;
					z-index: 1;
				}

				.search-input {
					flex: 1;
					height: 72rpx;
					padding: 0 20rpx 0 68rpx;
					background-color: #f5f5f5;
					border-radius: 36rpx 0 0 36rpx;
					font-size: 28rpx;
					color: #333333;
					box-sizing: border-box;
					border: none;

					&:focus {
						background-color: #ffffff;
						outline: none;
					}
				}
			}

			.search-btn {
				width: 120rpx;
				height: 72rpx;
				line-height: 72rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #ffffff;
				font-size: 28rpx;
				border-radius: 0 36rpx 36rpx 0;
				padding: 0;
				margin: 0;
				border: none;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
				transition: all 0.3s ease;

				&::after {
					border: none;
				}

				&:active {
					opacity: 0.8;
					transform: scale(0.98);
					box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
				}
			}
		}

		// 搜索信息
		.search-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16rpx 30rpx;
			background-color: #e8f4e8;
			border-bottom: 1px solid #d0e8d0;

			.search-info-text {
				font-size: 26rpx;
				color: #2c3e50;

				.search-count {
					color: #27ae60;
					font-weight: 600;
					margin: 0 8rpx;
				}
			}

			.search-cancel {
				font-size: 26rpx;
				color: #667eea;

				&:active {
					opacity: 0.7;
				}
			}
		}

		.note-list {
			padding: 20rpx 30rpx;
			min-height: 500rpx;

			.loading-state,
			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 120rpx 0;

				.empty-image {
					width: 200rpx;
					height: 200rpx;
					margin-bottom: 30rpx;
					opacity: 0.6;
				}

				.empty-text {
					font-size: 28rpx;
					color: #999999;
				}
			}

			.note-items {

				// 文件夹样式
				.folder-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
					border-radius: 20rpx;
					padding: 24rpx 30rpx;
					margin-bottom: 20rpx;
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.98);
					}

					.folder-info {
						flex: 1;
						display: flex;
						align-items: center;
						gap: 20rpx;

						.folder-icon-wrapper .folder-icon {
							font-size: 48rpx;
						}

						.folder-details {
							flex: 1;

							.folder-name {
								font-size: 32rpx;
								font-weight: 500;
								color: #333333;
								display: block;
							}

							.folder-count {
								font-size: 24rpx;
								color: #999999;
								margin-top: 8rpx;
								display: block;
							}
						}
					}

					.folder-actions {
						display: flex;
						gap: 20rpx;

						.rename-btn,
						.delete-btn {
							font-size: 26rpx;
							padding: 8rpx 16rpx;
							border-radius: 8rpx;
							transition: all 0.2s ease;

							&:active {
								transform: scale(0.95);
							}
						}

						.rename-btn {
							color: #667eea;
							background-color: rgba(102, 126, 234, 0.1);

							&:active {
								background-color: rgba(102, 126, 234, 0.2);
							}
						}

						.delete-btn {
							color: #ff6b6b;
							background-color: rgba(255, 107, 107, 0.1);

							&:active {
								background-color: rgba(255, 107, 107, 0.2);
							}
						}
					}
				}

				// 笔记样式
				.note-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					background-color: #ffffff;
					border-radius: 20rpx;
					padding: 24rpx 30rpx;
					margin-bottom: 20rpx;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.98);
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
					}

					.note-left {
						flex: 1;
						display: flex;
						align-items: center;
						gap: 16rpx;
						min-width: 0;

						.note-icon-wrapper {
							flex-shrink: 0;

							.note-icon {
								font-size: 44rpx;
							}
						}

						.note-name-wrapper {
							flex: 1;
							min-width: 0;

							.note-name {
								font-size: 30rpx;
								font-weight: 500;
								color: #333333;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
								flex: 1;

								::v-deep .highlight {
									background-color: #ffeb3b;
									color: #333;
									padding: 0 4rpx;
									border-radius: 4rpx;
								}
							}

							.note-path {
								display: block;
								font-size: 22rpx;
								color: #999999;
								margin-top: 6rpx;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}
						}



					}

					.note-right {
						flex-shrink: 0;
						display: flex;
						flex-direction: column;
						align-items: flex-end;
						gap: 12rpx;

						.note-meta-top {
							display: flex;
							gap: 16rpx;

							.note-time,
							.note-size {
								font-size: 24rpx;
								color: #999999;
							}
						}

						.note-actions-bottom {
							display: flex;
							gap: 16rpx;

							.edit-btn,
							.delete-btn {
								font-size: 24rpx;
								padding: 6rpx 16rpx;
								border-radius: 8rpx;
								transition: all 0.2s ease;

								&:active {
									transform: scale(0.95);
								}
							}

							.edit-btn {
								color: #667eea;
								background-color: rgba(102, 126, 234, 0.1);

								&:active {
									background-color: rgba(102, 126, 234, 0.2);
								}
							}

							.delete-btn {
								color: #ff6b6b;
								background-color: rgba(255, 107, 107, 0.1);

								&:active {
									background-color: rgba(255, 107, 107, 0.2);
								}
							}
						}
					}
				}
			}
		}
	}
</style>