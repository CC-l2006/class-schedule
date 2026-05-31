<template>
	<view class="settings-container">
		<!-- 所有的图标颜色为 #8a8a8a -->
		<!-- 课表导入 -->
		<view class="settings-card">
			<view class="card-title">课表导入</view>
			<!-- 选项 -->
			<view class="card-options">
				<!-- 文件导入 -->
				<view class="option-item" @click="importFromFile">
					<view class="option-left">
						<image src="/static/setting/file.png" mode="aspectFit" class="option-icon"></image>
						<view class="option-info">
							<text class="option-title">文件导入</text>
						</view>
					</view>
				</view>
				<!-- 教务导入 -->
				<view class="option-item" @click="importFromEdu">
					<view class="option-left">
						<image src="/static/setting/edu.png" mode="aspectFit" class="option-icon"></image>
						<view class="option-info">
							<text class="option-title">教务导入</text>
						</view>
					</view>
				</view>
			</view>
		</view>
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

<style lang="scss" scoped>
	.settings-container {
		padding: 10rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	
		.settings-card {
			background-color: #ffffff;
			border-radius: 24rpx;
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
			overflow: hidden;
	
			.card-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				padding: 30rpx 30rpx 20rpx;
				border-bottom: 1rpx solid #f0f0f0;
			}
	
			.card-options {
				.option-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 30rpx;
					border-bottom: 1rpx solid #f5f5f5;
					transition: background-color 0.2s;
	
					&:active {
						background-color: #f9f9f9;
					}
	
					&:last-child {
						border-bottom: none;
					}
	
					.option-left {
						display: flex;
						align-items: center;
						flex: 1;
	
						.option-icon {
							width: 44rpx;
							height: 44rpx;
							margin-right: 24rpx;
						}
	
						.option-info {
							display: flex;
							flex-direction: column;
							gap: 8rpx;
	
							.option-title {
								font-size: 30rpx;
								color: #333;
								font-weight: 500;
							}
						}
					}
				}
			}
		}
	}
</style>