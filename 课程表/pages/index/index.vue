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
					<text class="time-week-num">{{ currentWeekNum }}</text>
					<text class="time-week-text">周</text>
				</view>
				<!-- 显示日期和星期几 -->
				<view class="time-data">
					<view class="day-item" v-for="(day, index) in weekList" :key="index"
						:class="{ 'today-highlight': day.isToday }">
						<text class="day-name">{{ day.name }}</text>
						<text class="day-date">{{ day.date }}</text>
					</view>
				</view>
			</view>
		</view>

		<scroll-view scroll-y="true" class="scroll-body">
			<!-- 主体部分：课表网格 -->
			<view class="body">
				<!-- 左侧时间列 -->
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

				<!-- 右侧课程网格 -->
				<view class="body-course">
					<!-- 上午 -->
					<view class="course-group">
						<view class="course-day" v-for="(day, dayIndex) in weekList" :key="dayIndex">
							<!-- 使用 v-for 但跳过跨行的第二格 -->
							<template v-for="(timeSlot, slotIndex) in timeSlots.slice(0,4)">
								<view v-if="!isSecondSpanCell(dayIndex + 1, timeSlot.num)" :key="timeSlot.num"
									:class="getCellClass(dayIndex + 1, timeSlot.num)">
									<template v-if="getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0">
										<view v-for="course in getCoursesByDayAndTime(dayIndex + 1, timeSlot.num)"
											:key="course.name + course.timeSlot" class="course-item"
											:style="{ backgroundColor: getCourseColor(course.name) }"
											@click="showCourseDetail(course)">
											<text class="course-name">{{ course.name }}</text>
											<text class="course-location">{{ course.location }}</text>
										</view>
									</template>
									<view v-else class="course-empty"></view>
								</view>
							</template>
						</view>
					</view>
					<!-- 下午 -->
					<view class="course-group">
						<view class="course-day" v-for="(day, dayIndex) in weekList" :key="dayIndex">
							<template v-for="(timeSlot, slotIndex) in timeSlots.slice(4,8)">
								<view v-if="!isSecondSpanCell(dayIndex + 1, timeSlot.num)" :key="timeSlot.num"
									:class="getCellClass(dayIndex + 1, timeSlot.num)">
									<template v-if="getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0">
										<view v-for="course in getCoursesByDayAndTime(dayIndex + 1, timeSlot.num)"
											:key="course.name + course.timeSlot" class="course-item"
											:style="{ backgroundColor: getCourseColor(course.name) }"
											@click="showCourseDetail(course)">
											<text class="course-name">{{ course.name }}</text>
											<text class="course-location">{{ course.location }}</text>
										</view>
									</template>
									<view v-else class="course-empty"></view>
								</view>
							</template>
						</view>
					</view>
					<!-- 晚上 -->
					<view class="course-group">
						<view class="course-day" v-for="(day, dayIndex) in weekList" :key="dayIndex">
							<template v-for="(timeSlot, slotIndex) in timeSlots.slice(8,11)">
								<view v-if="!isSecondSpanCell(dayIndex + 1, timeSlot.num)" :key="timeSlot.num"
									:class="getCellClass(dayIndex + 1, timeSlot.num)">
									<template v-if="getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0">
										<view v-for="course in getCoursesByDayAndTime(dayIndex + 1, timeSlot.num)"
											:key="course.name + course.timeSlot" class="course-item"
											:style="{ backgroundColor: getCourseColor(course.name) }"
											@click="showCourseDetail(course)">
											<text class="course-name">{{ course.name }}</text>
											<text class="course-location">{{ course.location }}</text>
										</view>
									</template>
									<view v-else class="course-empty"></view>
								</view>
							</template>
						</view>
					</view>
				</view>
			</view>

			<!-- 下一周，上一周 -->
			<view class="nav-btn">
				<view class="btn-last" @click="lastWeek">
					<text class="btn-text">上一周</text>
				</view>
				<view class="btn-this" @click="thisWeek">
					<text class="btn-text">本周</text>
				</view>
				<view class="btn-next" @click="nextWeek">
					<text class="btn-text">下一周</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getCourseData
	} from '@/utils/courses.js';

	export default {
		data() {
			return {
				classScheduleName: [],
				currentSchedule: {
					id: null,
					name: ""
				},
				showOptions: false,
				weekList: [],
				timeSlots: [],
				weekOffset: 0,
				currentWeekNum: 1,
				startDate: null,
				courseList: [],
				currentWeekCourses: []
			}
		},
		onLoad() {
			this.loadStartDate()
			this.listenStartDateChange()
			this.listenCourseDataChange()
			this.loadScheduleList()
			this.loadCourseData()
			this.getWeekData()
			this.initTimeSlots()
		},
		onShow() {
			this.updateStartDateOnly()
			this.loadScheduleList()
		},
		beforeDestroy() {
			uni.$off('startDateChanged')
			uni.$off('courseDataChanged')
		},
		methods: {
			// 根据课程名称生成固定颜色
			getCourseColor(courseName) {
				const colorPool = [
					'#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
					'#fee140', '#30cfd0', '#a18cd1', '#fbc2eb', '#ff9a9e',
					'#a6c1ee', '#84fab0', '#fad0c4', '#ffd3a5', '#ff758c',
					'#42e695', '#3b8d99', '#b621fe', '#1fd1f9', '#ff6b6b'
				]
				let hash = 0
				for (let i = 0; i < courseName.length; i++) {
					hash = ((hash << 5) - hash) + courseName.charCodeAt(i)
					hash |= 0
				}
				const index = Math.abs(hash) % colorPool.length
				return colorPool[index]
			},

			// 判断是否是跨行课程的第二格（应该完全跳过不渲染）
			isSecondSpanCell(dayOfWeek, timeSlot) {
				return this.currentWeekCourses.some(course => {
					return course.dayOfWeek === dayOfWeek && 
					       course.timeSlot % 2 === 1 &&
					       timeSlot === course.timeSlot + 1
				})
			},

			// 获取单元格样式类
			getCellClass(dayOfWeek, timeSlot) {
				// 检查是否是跨行课程的第一格
				const isFirstSpanCell = this.currentWeekCourses.some(course => {
					return course.dayOfWeek === dayOfWeek && 
					       course.timeSlot === timeSlot && 
					       course.timeSlot % 2 === 1
				})
				
				if (isFirstSpanCell) {
					return 'course-cell-span2'
				}
				
				return 'course-cell'
			},

			loadScheduleList() {
				const savedList = uni.getStorageSync('classScheduleName')
				if (savedList && savedList.length > 0) {
					this.classScheduleName = savedList
					if (!this.currentSchedule.id && savedList[0]) {
						this.currentSchedule = savedList[0]
					}
				}
			},

			async loadCourseData() {
				try {
					const res = await getCourseData()
					if (res.code === 200 && res.data) {
						this.courseList = res.data.courses || []
						uni.setStorageSync('courseData', res.data)
						const scheduleItem = {
							id: 1,
							name: res.data.name || "我的课表",
							courses: this.courseList
						}
						uni.setStorageSync('classScheduleName', [scheduleItem])
						uni.setStorageSync('courseData_我的课表', res.data)
						this.classScheduleName = [scheduleItem]
						this.currentSchedule = scheduleItem
						this.loadCurrentWeekCourses()
					}
				} catch (error) {
					console.error('加载课表数据失败:', error)
				}
			},

			listenCourseDataChange() {
				uni.$on('courseDataChanged', (data) => {
					if (data.courseData) {
						this.courseList = data.courseData.courses || []
						uni.setStorageSync('courseData', data.courseData)
						this.loadCurrentWeekCourses()
					}
				})
			},

			loadCurrentWeekCourses() {
				const currentWeek = this.currentWeekNum
				this.currentWeekCourses = this.courseList.filter(course => {
					return course.weekNum && course.weekNum.includes(currentWeek)
				})
			},

			// 根据星期和节次获取课程
			getCoursesByDayAndTime(dayOfWeek, timeSlot) {
				return this.currentWeekCourses.filter(course => {
					return course.dayOfWeek === dayOfWeek && course.timeSlot === timeSlot
				})
			},

			showCourseDetail(course) {
				uni.showModal({
					title: course.name,
					content: `时间：第${course.timeSlot}-${course.timeSlot+1}节\n地点：${course.location || '未指定'}\n教师：${course.teacher || '未指定'}`,
					showCancel: false,
					confirmText: '知道了'
				})
			},

			updateStartDateOnly() {
				const savedDate = uni.getStorageSync('startDate')
				if (savedDate !== this.startDate) {
					this.startDate = savedDate
					if (this.startDate) {
						this.updateWeekData()
					} else {
						this.calculateWeekNumber(new Date())
						this.getWeekData()
					}
				}
			},

			loadStartDate() {
				const savedDate = uni.getStorageSync('startDate')
				if (savedDate) {
					this.startDate = savedDate
					this.calculateWeekNumberFromStartDate()
				} else {
					this.calculateWeekNumber(new Date())
				}
			},

			listenStartDateChange() {
				uni.$on('startDateChanged', (data) => {
					this.startDate = data.startDate
					this.weekOffset = 0
					this.calculateWeekNumberFromStartDate()
					this.getWeekData()
				})
			},

			calculateWeekNumberFromStartDate() {
				if (!this.startDate) {
					this.currentWeekNum = 1
					return
				}
				const start = new Date(this.startDate)
				const today = new Date()
				const diffTime = today - start
				const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))
				let weekNum = Math.floor(diffDays / 7) + 1
				if (weekNum < 1) weekNum = 1
				this.currentWeekNum = weekNum
			},

			calculateTargetWeekNumber(targetDate) {
				if (this.startDate) {
					const start = new Date(this.startDate)
					const diffTime = targetDate - start
					const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))
					let weekNum = Math.floor(diffDays / 7) + 1
					if (weekNum < 1) weekNum = 1
					return weekNum
				} else {
					const year = targetDate.getFullYear()
					const firstDayOfYear = new Date(year, 0, 1)
					let firstDayWeek = firstDayOfYear.getDay()
					firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek
					const startOfYear = new Date(year, 0, 0)
					const dayOfYear = Math.floor((targetDate - startOfYear) / (24 * 60 * 60 * 1000))
					let weekNum = Math.ceil((dayOfYear + firstDayWeek - 1) / 7)
					if (weekNum === 0) {
						const lastYear = year - 1
						const lastDayOfLastYear = new Date(lastYear, 11, 31)
						return this.getWeekNumber(lastDayOfLastYear)
					}
					return weekNum
				}
			},

			canGoLastWeek() {
				if (!this.startDate) return true
				const start = new Date(this.startDate)
				const today = new Date()
				const lastWeekDate = new Date(today)
				lastWeekDate.setDate(today.getDate() + ((this.weekOffset - 1) * 7))
				const lastWeekDayOfWeek = lastWeekDate.getDay()
				const lastWeekMonday = new Date(lastWeekDate)
				const diff = lastWeekDayOfWeek === 0 ? -6 : 1 - lastWeekDayOfWeek
				lastWeekMonday.setDate(lastWeekDate.getDate() + diff)
				const startDate = new Date(start)
				startDate.setHours(0, 0, 0, 0)
				const mondayDate = new Date(lastWeekMonday)
				mondayDate.setHours(0, 0, 0, 0)
				return mondayDate >= startDate
			},

			switchSchedule() {
				this.showOptions = !this.showOptions;
			},

			selectSchedule(item) {
				this.currentSchedule = item;
				this.showOptions = false;
				const savedData = uni.getStorageSync(`courseData_${item.name}`)
				if (savedData) {
					this.courseList = savedData.courses || []
					this.loadCurrentWeekCourses()
				}
			},

			openSettings() {
				uni.navigateTo({
					url: '/pages/index/setting/setting'
				})
			},

			lastWeek() {
				if (!this.canGoLastWeek()) {
					uni.showToast({
						title: '已经是第一周啦，没有更早了_(:з」∠)_',
						icon: 'none',
						duration: 2000
					})
					return
				}
				this.weekOffset--
				this.updateWeekData()
			},

			nextWeek() {
				this.weekOffset++
				this.updateWeekData()
			},

			thisWeek() {
				this.weekOffset = 0
				this.updateWeekData()
			},

			updateWeekData() {
				const today = new Date()
				const targetDate = new Date(today)
				targetDate.setDate(today.getDate() + (this.weekOffset * 7))
				this.currentWeekNum = this.calculateTargetWeekNumber(targetDate)
				this.getWeekData()
				this.loadCurrentWeekCourses()
			},

			getWeekData() {
				const today = new Date()
				const targetDate = new Date(today)
				targetDate.setDate(today.getDate() + (this.weekOffset * 7))
				const todayStr =
					`${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
				const targetDayOfWeek = targetDate.getDay()
				const monday = new Date(targetDate)
				const diff = targetDayOfWeek === 0 ? -6 : 1 - targetDayOfWeek
				monday.setDate(targetDate.getDate() + diff)
				const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
				this.weekList = weekDays.map((name, index) => {
					const date = new Date(monday)
					date.setDate(monday.getDate() + index)
					const month = String(date.getMonth() + 1).padStart(2, '0')
					const day = String(date.getDate()).padStart(2, '0')
					const dateStr = `${month}-${day}`
					return {
						name: name,
						date: dateStr,
						isToday: this.weekOffset === 0 && dateStr === todayStr
					}
				})
			},

			calculateWeekNumber(targetDate) {
				this.currentWeekNum = this.calculateTargetWeekNumber(targetDate)
			},

			getWeekNumber(date) {
				const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
				let firstDayWeek = firstDayOfYear.getDay()
				firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek
				const startOfYear = new Date(date.getFullYear(), 0, 0)
				const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))
				return Math.ceil((dayOfYear + firstDayWeek - 1) / 7)
			},

			initTimeSlots() {
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
					width: 90rpx;
					background-color: #ffffff;
					flex: 1;
					border-radius: 15rpx;
					display: flex;
					flex-direction: column;
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

						&.today-highlight {
							.day-name {
								color: #667eea;
								font-weight: 600;
							}

							.day-date {
								color: #667eea;
								font-weight: 500;
								background-color: rgba(102, 126, 234, 0.1);
								padding: 4rpx 12rpx;
								border-radius: 20rpx;
							}
						}

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
					min-height: 120rpx;
					flex-shrink: 0;
					display: flex;
					flex-direction: column;
					width: 90rpx;
					gap: 24rpx;

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
							min-height: 100rpx;
							border-radius: 12rpx;

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
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 24rpx;
					overflow-x: auto;
					min-width: 0;

					.course-group {
						display: flex;
						flex-direction: row;
						gap: 2rpx;
						min-width: 0;

						.course-day {
							flex: 1;
							display: flex;
							flex-direction: column;
							gap: 2rpx;
							min-width: 0;

							.course-cell {
								min-height: 114rpx;
								background-color: #ffffff;
								border-radius: 12rpx;
								padding: 8rpx;
								overflow: hidden;

								.course-item {
									height: 100%;
									padding: 12rpx;
									border-radius: 12rpx;
									display: flex;
									flex-direction: column;
									justify-content: center;
									overflow: hidden;
								

									.course-name {
										font-size: 24rpx;
										font-weight: 500;
										color: #fff;
										display: block;
										overflow: hidden;
										text-overflow: ellipsis;
										white-space: nowrap;
									}

									.course-location {
										font-size: 18rpx;
										color: rgba(255, 255, 255, 0.8);
										display: block;
										margin-top: 6rpx;
										overflow: hidden;
										text-overflow: ellipsis;
										white-space: nowrap;
									}
								}

								.course-empty {
									height: 100%;
									min-height: 80rpx;
								}
							}

							// 跨行课程样式（占2格高度）
							.course-cell-span2 {
								min-height: 245rpx;
								background-color: #ffffff;
								border-radius: 12rpx;
								padding: 8rpx;
								overflow: hidden;
								
								.course-item {
									height: 100%;
									padding: 12rpx;
									border-radius: 12rpx;
									display: flex;
									flex-direction: column;
									justify-content: center;
									overflow: hidden;
									border-radius: 8rpx;

									.course-name {
										font-size: 24rpx;
										font-weight: 500;
										color: #fff;
										display: block;
										overflow: hidden;
										text-overflow: ellipsis;
										white-space: nowrap;
									}

									.course-location {
										font-size: 18rpx;
										color: rgba(255, 255, 255, 0.8);
										display: block;
										margin-top: 6rpx;
										overflow: hidden;
										text-overflow: ellipsis;
										white-space: nowrap;
									}
								}
							}
						}
					}
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