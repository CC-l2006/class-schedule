<template>
	<view class="container">
		<!-- 文件 -->
		<view class="top">
			<text>笔记</text>
			<view class="file">
				<image class="file-btn" src="/static/node/file.png" mode="aspectFill"></image>
				<text>新建</text>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input class="search-input" type="text" placeholder="搜索笔记..." />
			</view>
			<button class="search-btn">搜索</button>
		</view>
		
		<!-- 笔记列表 -->
		
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #f3f3f3;
		min-height: 100vh;

		.top {
			display: flex;
			/* 水平排列 */
			flex-direction: row;
			/* 垂直居中对齐 */
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;

			text {
				font-size: 50rpx;
			}

			.file {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 10rpx;

				.file-btn {
					height: 50rpx;
					width: 50rpx;
				}

				text {
					font-size: 30rpx;
				}
			}
		}

		.search-bar {
			display: flex;
			align-items: center;
			padding: 20rpx 30rpx;
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
					background-color: #ffffff;
					border-radius: 36rpx 0 0 36rpx;
					font-size: 28rpx;
					color: #333333;
					box-sizing: border-box;
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
		
				&::after {
					border: none;
				}
		
				&:active {
					opacity: 0.8;
					transform: scale(0.98);
				}
			}
		}
		
	}
</style>