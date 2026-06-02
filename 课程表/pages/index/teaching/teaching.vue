<template>
	<view class="course-list">
		<view class="course-card" v-for="item in courseList" :key="item.id" @click="watchCourse(item.url)">
			<!-- 图片区域 -->
			<view class="course-image">
				<image class="course-img" :src="`${ API_CONFIG.baseUrl }${item.imgurl}`" mode="aspectFill"></image>
			</view>
			
			<!-- 课程信息区域 -->
			<view class="course-content">
				<view class="course-info">
					<text class="course-name">{{ item.CourseName }}</text>
					<text class="course-author">作者：{{ item.author }}</text>
					<text class="course-date">发布时间：{{ formatDate(item.ReleaseDate) }}</text>
				</view>
			</view>
			
			<view class="course-stats">
				<view class="stats">
					<image src="/static/teaching/viewCount.png" mode="aspectFill"></image>
					<text class="stat-item">{{ formatNumber(item['view count']) }}</text>
				</view>
				<view class="stats">
					<image src="/static/teaching/comment.png" mode="aspectFill"></image>
					<text class="stat-item">{{ formatNumber(item.comment) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getCourses } from '@/utils/courses.js'
	import { API_CONFIG } from '../../../config'
	
	export default {
		data() {
			return {
				API_CONFIG,
				courseList: []
			}
		},
		onLoad() {
			this.fetchCourses()
		},
		methods: {
			fetchCourses() {
				getCourses()
					.then(res => {
						console.log('获取到的数据', res)
						if (res.code === 200) {
							this.courseList = res.data
						}
					})
					.catch(err => {
						console.error('获取课程失败', err)
					})
			},
			
			formatDate(dateStr) {
				const date = new Date(dateStr)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			
			formatNumber(num) {
				if (!num) return '0'
				const n = parseInt(num)
				if (n >= 10000) {
					return (n / 10000).toFixed(1) + '万'
				}
				return n.toString()
			},
			
			watchCourse(url) {
				uni.navigateTo({
					url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.course-list {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
	
	.course-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		padding: 24rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
		
		&:active {
			transform: scale(0.98);
			background-color: #f9f9f9;
		}
		
		// 图片区域
		.course-image {
			width: 260rpx;
			height: 160rpx;
			flex-shrink: 0;
			border-radius: 12rpx;
			overflow: hidden;
			background-color: #f0f0f0;
			
			.course-img {
				width: 100%;
				height: 100%;
			}
		}

		.course-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			
			.course-info {
				width: 380rpx;
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.course-name {
					font-size: 28rpx;
					font-weight: bold;
					color: #333;
					line-height: 1.4;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
				
				.course-author {
					font-size: 24rpx;
					color: #666;
				}
				
				.course-date {
					font-size: 22rpx;
					color: #999;
				}
			}
		}
		
		.course-stats {
			width: 100%;
			display: flex;
			gap: 32rpx;
			padding-top: 8rpx;
			border-top: 1rpx solid #f0f0f0;
			
			.stats {
				display: flex;
				align-items: center;
				gap: 8rpx;
				
				image{
					width: 24rpx;
					height: 24rpx;
				}
				
				.stat-item {
					font-size: 24rpx;
					color: #ff6b6b;
					font-weight: 500;
				}
			}
		}
	}
}
</style>