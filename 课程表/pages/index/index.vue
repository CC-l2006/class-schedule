<template>
	<view class="content">
		<!-- 固定 -->
		<view class="fixed-top">
			<!-- 顶部行 -->
			<view class="toprow">
				<!-- 左侧：课表选择 -->
				<view class="left">
					<view @click="switchSchedule" class="schedule-item">
						{{ currentSchedule.name }}
					</view>
					<!-- 选择当前的课表 -->
					<view v-if="showOptions" class="options-list">
						<view v-for="item in classScheduleName" :key="item.id" @click="selectSchedule(item)"
							class="option-item">
							{{ item.name }}
						</view>
					</view>
				</view>

				<!-- 右侧：设置按钮 -->
				<view class="right">
					<view @click="openSettings" class="settings-btn">
						<image src="@/static/index/tap/setting.png" mode="aspectFit" style="width: 100%; height: 100%;">
						</image>
					</view>
				</view>
			</view>

			<!-- 显示时间，日期 -->
			<view class="time">
				<!-- 显示第几周 -->
				<view class="time-week">
					<text class="time-week-num">14</text>
					<text class="time-week-text">周</text>
				</view>
				<!-- 显示日期和星期几 -->
				<view class="time-data">
					<view class="day-item" v-for="(day, index) in weekList" :key="index">
						<text class="day-name">{{ day.name }}</text>
						<text class="day-date">{{ day.date }}</text>
					</view>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="scroll-body">
			<!-- 主体部分 -->
			<view class="body">
				<!-- 显示时间 -->
				<view class="body-time">
					<view class="time-group">
						<view class="time-item" v-for="item in timeSlots.slice(0,4)" :key="item.num">
							<text class="time-num">{{ item.num }}</text>
							<text class="time-start">{{ item.start }}</text>
							<text class="time-end">{{ item.end }}</text>
						</view>
					</view>
					<view class="time-group">
						<view class="time-item" v-for="item in timeSlots.slice(4,8)" :key="item.num">
							<text class="time-num">{{ item.num }}</text>
							<text class="time-start">{{ item.start }}</text>
							<text class="time-end">{{ item.end }}</text>
						</view>
					</view>
					<view class="time-group">
						<view class="time-item" v-for="item in timeSlots.slice(8,11)" :key="item.num">
							<text class="time-num">{{ item.num }}</text>
							<text class="time-start">{{ item.start }}</text>
							<text class="time-end">{{ item.end }}</text>
						</view>
					</view>
				</view>
				<!-- 显示课程 -->
				<view class="body-course">

				</view>
			</view>

			<!-- 下一周，上一周 -->
			<view class="nav-btn">
				<view class="btn-last">
					<text class="btn-text">上一周</text>
				</view>
				<view class="btn-this">
					<text class="btn-text">本周</text>
				</view>
				<view class="btn-next">
					<text class="btn-text">下一周</text>
				</view>
			</view>
		</scroll-view>




	</view>
</template>

<script>
	export default {
		data() {
			return {
				classScheduleName: [{
						id: 1,
						name: "大二下"
					},
					{
						id: 2,
						name: "大三上"
					}
				],
				// 当前显示的课表
				currentSchedule: {
					id: 1,
					name: "大二下"
				},
				// 是否显示选项列表
				showOptions: false,

				// 存储周一到周日
				weekList: [],
				// 存储时间段
				timeSlots: []
			}
		},
		onLoad() {
			// 页面加载时生成日期数据
			this.getWeekData()
			// 加载时间
			this.initTimeSlots()
		},
		methods: {
			// 点击切换显示
			switchSchedule() {
				this.showOptions = !this.showOptions;
			},

			// 选择具体的课表
			selectSchedule(item) {
				this.currentSchedule = item;
				this.showOptions = false;
			},

			// 设置按钮点击事件
			openSettings() {
				uni.navigateTo({
					url: '/pages/index/setting/setting'
				})
			},

			getWeekData() {
				// 获取日期
				const today = new Date()

				// 计算日期，判断当前是周几
				const todayDayOfWeek = today.getDay()
				const monday = new Date(today)
				const diff = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek
				monday.setDate(today.getDate() + diff)

				// 定义数据
				const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

				this.weekList = weekDays.map((name, index) => {
					// 计算当前天的日期
					const date = new Date(monday)
					date.setDate(monday.getDate() + index)

					// 格式化月份和日期
					const month = String(date.getMonth() + 1).padStart(2, '0')
					const day = String(date.getDate()).padStart(2, '0')

					// 返回每一天的数据
					return {
						name: name, // 周几名称
						date: `${month}-${day}` // 日期
					}
				})
			},
			initTimeSlots() {
				// 定义所有课程时间段数据
				this.timeSlots = [{
						num: 1,
						start: "08:30",
						end: "09:15"
					},
					{
						num: 2,
						start: "09:20",
						end: "10:05"
					},
					{
						num: 3,
						start: "10:25",
						end: "11:10"
					},
					{
						num: 4,
						start: "11:15",
						end: "12:00"
					},
					{
						num: 5,
						start: "14:00",
						end: "14:45"
					},
					{
						num: 6,
						start: "14:55",
						end: "15:40"
					},
					{
						num: 7,
						start: "16:00",
						end: "16:45"
					},
					{
						num: 8,
						start: "16:55",
						end: "17:40"
					},
					{
						num: 9,
						start: "18:30",
						end: "19:15"
					},
					{
						num: 10,
						start: "19:20",
						end: "20:05"
					},
					{
						num: 11,
						start: "20:10",
						end: "21:00"
					}
				]
			}


		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f3f3f3;
	}
</style>

<style lang="scss" scoped>
	.content {
		background-color: #f3f3f3;
		min-height: 100vh;

		.fixed-top {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			background-color: #f3f3f3;
			padding-top: 100rpx;
			padding-bottom: 20rpx;
			z-index: 999;

			.toprow {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;

				.left {
					flex: 1;
					position: relative;

					.schedule-item {
						width: 150rpx;
						height: 50rpx;
						font-size: 36rpx;
						font-weight: 700;
						line-height: 50rpx;
						margin-right: 20rpx;
						margin-top: 5rpx;
						text-align: center;
						position: relative;
					}

					.options-list {
						position: absolute;
						top: 90rpx;
						left: 0;
						width: 200rpx;
						background-color: #f5f5f5;
						border-radius: 10rpx;
						overflow: hidden;
						z-index: 100;

						.option-item {
							padding: 25rpx;
							text-align: center;
							border-bottom: 1px solid #ddd;
							color: #333;

							&:active {
								background-color: #e0e0e0;
							}

							&:last-child {
								border-bottom: none;
							}
						}
					}
				}

				.right {
					display: flex;
					align-items: center;

					.settings-btn {
						margin-right: 20rpx;
						width: 60rpx;
						height: 60rpx;
					}
				}
			}

			.time {
				margin-top: 20rpx;
				height: 100rpx;
				display: flex;
				gap: 15rpx;

				.time-week {
					height: 100rpx;
					background-color: #ffffff;
					flex: 1;
					border-radius: 15rpx;
					display: flex;
					flex-direction: column; // 垂直排列
					align-items: center;
					justify-content: center;

					.time-week-num {
						line-height: 50rpx;
						font-size: 44rpx;
					}

					.time-week-text {
						line-height: 40rpx;
						font-size: 20rpx;
					}
				}


				.time-data {
					height: 100rpx;
					background-color: #ffffff;
					flex: 7;
					border-radius: 15rpx;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-around;

					.day-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						flex: 1;

						.day-name {
							font-size: 26rpx;
							color: #2c2c2c;
							margin-bottom: 8rpx;
						}

						.day-date {
							font-size: 24rpx;
							color: #5d5d5d;
						}
					}
				}
			}
		}

		// 滚动区域
		.scroll-body {
			margin-top: 20rpx;
			height: 100vh;
			padding-top: 260rpx; 
			box-sizing: border-box;

			.body {
				display: flex;
				margin-top: 20rpx;
				gap: 15rpx;

				.body-time {
					flex-shrink: 0;
					display: flex;
					flex-direction: column;
					flex: 1;
					gap: 10rpx;

					.time-group {
						display: flex;
						flex-direction: column;
						gap: 2rpx;

						.time-item {
							background-color: #ffffff;
							padding: 15rpx 0;
							display: flex;
							flex-direction: column;
							align-items: center;

							.time-num {
								font-size: 26rpx;
								font-weight: bold;
							}

							.time-start,
							.time-end {
								font-size: 20rpx;
								color: #666;
							}

							.time-start {
								margin-top: 4rpx;
							}
						}
					}
				}

				.body-course {
					flex: 7;
				}
			}
			
			.nav-btn {
			  display: flex;
			  justify-content: space-around;
			  align-items: center;
			  padding-bottom: 30rpx;
			  border-radius: 16rpx;
			  margin: 25rpx 0;
			  margin-bottom: 20rpx;
			
			  [class^="btn-"] {
			    flex: 1;
			    text-align: center;
			    padding: 10rpx 0;
			    margin: 0 10rpx;
			    border-radius: 20rpx;
			    background-color: #ffffff;
			    transition: all 0.3s ease;
			
			    &:active {
			      opacity: 0.7;
			      transform: scale(0.96);
			    }
			  }
			
			  .btn-text {
			    font-size: 28rpx;
			    color: #333;
			  }
			}
		}
	}
</style>