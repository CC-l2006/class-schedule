<template>
	<view class="container">
		<view class="detail-header">
			<button class="back-btn" @click="goBack">返回</button>
			<text class="title">{{ title }}</text>
			<button class="edit-btn" @click="editNote">编辑</button>
		</view>
		<scroll-view class="detail-content" scroll-y>
			<view v-if="loading" class="loading">加载中...</view>
			<view v-else class="markdown-body" v-html="htmlContent"></view>
		</scroll-view>
	</view>
</template>

<script>
import { getFileContent } from '@/utils/file.js';

export default {
	data() {
		return {
			filename: '',
			title: '',
			content: '',
			htmlContent: '',
			loading: false
		}
	},
	onLoad(options) {
		console.log('noteDetail onLoad:', options);
		if (options.filename) {
			this.filename = decodeURIComponent(options.filename);
			this.loadContent();
		} else if (options.content) {
			this.content = decodeURIComponent(options.content);
			this.parseContent();
		}
	},
	methods: {
		async loadContent() {
			if (!this.filename) return;
			
			this.loading = true;
			try {
				uni.showLoading({ title: '加载中...' });
				const res = await getFileContent(this.filename);
				console.log('加载内容响应:', res);
				
				if (res && res.code === 200 && res.data) {
					this.content = res.data.content || '';
					this.parseContent();
				} else {
					this.htmlContent = '<p>暂无内容</p>';
					uni.showToast({
						title: res?.message || '加载失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加载失败:', error);
				this.htmlContent = '<p>加载失败</p>';
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
				uni.hideLoading();
			}
		},
		
		parseContent() {
			if (!this.content || this.content.trim() === '') {
				this.htmlContent = '<p>暂无内容</p>';
				this.title = this.filename ? this.filename.split('/').pop().replace(/\.md$/, '') : '笔记';
				return;
			}
			
			// 提取标题
			const lines = this.content.split('\n');
			const firstLine = lines[0] || '';
			if (firstLine.startsWith('# ')) {
				this.title = firstLine.substring(2).trim();
			} else {
				this.title = this.filename ? this.filename.split('/').pop().replace(/\.md$/, '') : '笔记';
			}
			
			// 安全的 Markdown 转 HTML
			let html = this.content;
			
			// 转义 HTML 特殊字符，防止 XSS 攻击
			html = this.escapeHtml(html);
			
			// 处理代码块（需要先处理，避免内部内容被转换）
			html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
				return `<pre><code>${code.trim()}</code></pre>`;
			});
			
			// 处理行内代码
			html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
			
			// 处理标题
			html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
			html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
			html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
			
			// 处理粗体
			html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			
			// 处理斜体
			html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
			
			// 处理换行
			html = html.replace(/\n/g, '<br/>');
			
			this.htmlContent = html;
		},
		
		// 转义 HTML 特殊字符
		escapeHtml(text) {
			if (!text) return '';
			const map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;'
			};
			return text.replace(/[&<>"']/g, function(m) {
				return map[m];
			});
		},
		
		editNote() {
			if (this.filename) {
				uni.navigateTo({
					url: `/pages/index/node/noteEdit?filename=${encodeURIComponent(this.filename)}`
				});
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
	
	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		
		.back-btn, .edit-btn {
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
		
		.edit-btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #ffffff;
		}
		
		.title {
			flex: 1;
			font-size: 36rpx;
			font-weight: 600;
			text-align: center;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 0 20rpx;
		}
	}
	
	.detail-content {
		flex: 1;
		padding: 30rpx;
		background-color: #ffffff;
		
		.loading {
			text-align: center;
			color: #999;
			padding: 60rpx;
		}
		
		.markdown-body {
			font-size: 30rpx;
			line-height: 1.8;
			color: #333;
			word-break: break-all;
			
			h1 {
				font-size: 48rpx;
				font-weight: 600;
				margin: 32rpx 0 24rpx;
				color: #2c3e50;
			}
			
			h2 {
				font-size: 40rpx;
				font-weight: 600;
				margin: 28rpx 0 20rpx;
				color: #34495e;
			}
			
			h3 {
				font-size: 36rpx;
				font-weight: 600;
				margin: 24rpx 0 16rpx;
				color: #4a5568;
			}
			
			p {
				margin: 16rpx 0;
			}
			
			pre {
				background-color: #f5f5f5;
				padding: 20rpx;
				border-radius: 10rpx;
				margin: 24rpx 0;
				overflow-x: auto;
				
				code {
					font-family: monospace;
					font-size: 28rpx;
					color: #d63369;
				}
			}
			
			code {
				background-color: #f5f5f5;
				padding: 4rpx 12rpx;
				border-radius: 8rpx;
				font-family: monospace;
				font-size: 28rpx;
				color: #d63369;
			}
			
			strong {
				font-weight: 600;
				color: #2c3e50;
			}
			
			em {
				font-style: italic;
			}
		}
	}
}
</style>