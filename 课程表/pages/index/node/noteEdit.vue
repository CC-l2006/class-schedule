<template>
	<view class="container">
		<view class="editor-header">
			<button class="back-btn" @click="goBack">返回</button>
			<input class="title-input" v-model="title" placeholder="请输入标题" />
			<button class="save-btn" @click="saveNote">保存</button>
		</view>
		<textarea class="editor-content" v-model="content" placeholder="请输入内容..."></textarea>
	</view>
</template>

<script>
import { getFileContent, updateFile, createFile } from '@/utils/file.js';

export default {
	data() {
		return {
			filename: '',
			title: '',
			content: '',
			isEdit: false
		}
	},
	onLoad(options) {
		if (options.filename) {
			this.filename = decodeURIComponent(options.filename);
			this.isEdit = true;
			this.loadContent();
		} else if (options.path) {
			this.parentPath = decodeURIComponent(options.path);
		}
	},
	methods: {
		async loadContent() {
			try {
				uni.showLoading({ title: '加载中...' });
				const res = await getFileContent(this.filename);
				if (res.code === 200) {
					this.content = res.data.content;
					// 从内容中提取标题（第一行）
					const lines = this.content.split('\n');
					const firstLine = lines[0];
					if (firstLine.startsWith('# ')) {
						this.title = firstLine.substring(2);
					} else {
						this.title = this.filename.split('/').pop().replace(/\.md$/, '');
					}
				}
			} catch (error) {
				console.error('加载失败:', error);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		async saveNote() {
			if (!this.title && !this.content) {
				uni.showToast({
					title: '请输入内容',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '保存中...' });
				const fullContent = `# ${this.title}\n\n${this.content}`;
				
				if (this.isEdit) {
					const res = await updateFile(this.filename, fullContent);
					if (res.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 500);
					}
				} else {
					const fileName = this.title.replace(/[\\/:*?"<>|]/g, '') + '.md';
					const res = await createFile(fileName, fullContent, this.parentPath || '');
					if (res.code === 200) {
						uni.showToast({
							title: '创建成功',
							icon: 'success'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 500);
					}
				}
			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		goBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
	
	.editor-header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		gap: 20rpx;
		
		.back-btn, .save-btn {
			width: 120rpx;
			height: 60rpx;
			line-height: 60rpx;
			font-size: 28rpx;
			border-radius: 30rpx;
			padding: 0;
			margin: 0;
			
			&::after {
				border: none;
			}
		}
		
		.back-btn {
			background-color: #f0f0f0;
			color: #666;
		}
		
		.save-btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #ffffff;
		}
		
		.title-input {
			flex: 1;
			height: 60rpx;
			font-size: 32rpx;
			font-weight: 500;
			padding: 0 20rpx;
			border: 1px solid #e0e0e0;
			border-radius: 30rpx;
			background-color: #fafafa;
		}
	}
	
	.editor-content {
		flex: 1;
		padding: 30rpx;
		font-size: 30rpx;
		line-height: 1.6;
		background-color: #ffffff;
	}
}
</style>