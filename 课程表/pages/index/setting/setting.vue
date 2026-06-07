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
							<text class="option-desc">支持 .json 格式</text>
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

		<!-- 开学时间设置 -->
		<view class="settings-card">
			<view class="card-title">学期设置</view>
			<view class="card-options">
				<view class="option-item" @click="showDatePicker">
					<view class="option-left">
						<image src="/static/setting/calendar.png" mode="aspectFit" class="option-icon"></image>
						<view class="option-info">
							<text class="option-title">开学时间</text>
							<text class="option-desc">{{ startDateText || '请选择开学日期' }}</text>
						</view>
					</view>
					<view class="option-right">
						<text class="arrow">›</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 日期选择器弹窗 -->
		<view class="date-picker-mask" v-if="showPicker" @click="hideDatePicker">
			<view class="date-picker-container" @click.stop>
				<view class="picker-header">
					<text class="picker-cancel" @click="hideDatePicker">取消</text>
					<text class="picker-title">选择开学时间</text>
					<text class="picker-confirm" @click="confirmDate">确定</text>
				</view>
				
				<!-- 日期选择器 -->
				<view class="date-picker-wrapper">
					<picker-view :value="pickerValue" @change="onPickerChange" class="picker-view" indicator-style="height: 80rpx;">
						<picker-view-column>
							<view v-for="(year, idx) in years" :key="idx" class="picker-item">
								{{ year }}年
							</view>
						</picker-view-column>
						<picker-view-column>
							<view v-for="(month, idx) in months" :key="idx" class="picker-item">
								{{ month }}月
							</view>
						</picker-view-column>
						<picker-view-column>
							<view v-for="(day, idx) in days" :key="idx" class="picker-item">
								{{ day }}日
							</view>
						</picker-view-column>
					</picker-view>
				</view>
				
				<!-- 星期显示 -->
				<view class="weekday-info" v-if="selectedDate">
					<text class="weekday-text">开学当天为：{{ selectedWeekday }}</text>
				</view>
				
				<!-- 提示信息 -->
				<view class="picker-tip">
					<text>请选择开学第一周的周一日期</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				startDate: '',           // 存储开学时间
				startDateText: '',       // 显示用的开学时间文本
				showPicker: false,       // 是否显示日期选择器
				
				// 日期选择器数据
				years: [],
				months: [],
				days: [],
				pickerValue: [0, 0, 0],
				selectedYear: 2024,
				selectedMonth: 9,
				selectedDay: 2,
				selectedDate: null,
				selectedWeekday: ''
			}
		},
		onLoad() {
			// 初始化日期数据
			this.initDateData()
			// 加载本地存储的开学时间
			this.loadStartDate()
		},
		methods: {
			// 初始化日期数据
			initDateData() {
				const currentYear = new Date().getFullYear()
				// 生成年份（当前年-2 到 当前年+2）
				for (let i = currentYear - 2; i <= currentYear + 2; i++) {
					this.years.push(i)
				}
				
				// 生成月份 1-12
				for (let i = 1; i <= 12; i++) {
					this.months.push(i)
				}
				
				// 设置默认选中位置
				const defaultYearIndex = this.years.indexOf(currentYear)
				if (defaultYearIndex !== -1) {
					this.pickerValue[0] = defaultYearIndex
					this.selectedYear = currentYear
				}
				
				this.pickerValue[1] = 8 // 9月（索引8）
				this.selectedMonth = 9
				
				this.updateDays()
				this.updateSelectedDate()
			},
			
			// 更新天数（根据年月）
			updateDays() {
				const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate()
				this.days = []
				for (let i = 1; i <= daysInMonth; i++) {
					this.days.push(i)
				}
				
				// 确保选中的日期不超过当月最大天数
				if (this.selectedDay > daysInMonth) {
					this.selectedDay = daysInMonth
					this.pickerValue[2] = daysInMonth - 1
				}
			},
			
			// 更新选中日期
			updateSelectedDate() {
				this.selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay)
				const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				const weekdayIndex = this.selectedDate.getDay()
				this.selectedWeekday = weekdays[weekdayIndex]
			},
			
			// 选择器变化事件
			onPickerChange(e) {
				const val = e.detail.value
				this.pickerValue = val
				
				const year = this.years[val[0]]
				const month = this.months[val[1]]
				
				this.selectedYear = year
				this.selectedMonth = month
				
				// 更新天数（月份变化时重新计算当月天数）
				this.updateDays()
				
				// 获取当前选中的天数
				let dayIndex = val[2]
				if (dayIndex >= this.days.length) {
					dayIndex = this.days.length - 1
				}
				this.selectedDay = this.days[dayIndex]
				this.pickerValue[2] = dayIndex
				
				// 更新选中日期
				this.updateSelectedDate()
			},
			
			// 显示日期选择器
			showDatePicker() {
				// 重置选择器值为当前保存的日期
				if (this.startDate) {
					const parts = this.startDate.split('-')
					if (parts.length === 3) {
						const year = parseInt(parts[0])
						const month = parseInt(parts[1])
						const day = parseInt(parts[2])
						
						const yearIndex = this.years.indexOf(year)
						if (yearIndex !== -1) {
							this.pickerValue[0] = yearIndex
							this.selectedYear = year
						}
						
						this.pickerValue[1] = month - 1
						this.selectedMonth = month
						
						this.updateDays()
						
						const dayIndex = this.days.indexOf(day)
						if (dayIndex !== -1) {
							this.pickerValue[2] = dayIndex
							this.selectedDay = day
						}
						
						this.updateSelectedDate()
					}
				}
				this.showPicker = true
			},
			
			// 隐藏日期选择器
			hideDatePicker() {
				this.showPicker = false
			},
			
			// 确认选择日期
			confirmDate() {
				const year = this.selectedYear
				const month = String(this.selectedMonth).padStart(2, '0')
				const day = String(this.selectedDay).padStart(2, '0')
				const dateStr = `${year}-${month}-${day}`
				
				// 验证是否为周一
				const weekDay = this.selectedDate.getDay()
				if (weekDay !== 1) {
					uni.showToast({
						title: '请选择周一作为开学时间',
						icon: 'none'
					})
					return
				}
				
				// 保存开学时间
				this.startDate = dateStr
				this.startDateText = dateStr
				uni.setStorageSync('startDate', dateStr)
				
				// 发送事件通知其他页面更新
				uni.$emit('startDateChanged', { startDate: dateStr })
				
				uni.showToast({
					title: '设置成功',
					icon: 'success'
				})
				
				this.hideDatePicker()
			},
			
			// 加载开学时间
			loadStartDate() {
				const savedDate = uni.getStorageSync('startDate')
				if (savedDate) {
					this.startDate = savedDate
					this.startDateText = savedDate
					
					// 设置选中日期为保存的日期
					const parts = savedDate.split('-')
					if (parts.length === 3) {
						const year = parseInt(parts[0])
						const month = parseInt(parts[1])
						const day = parseInt(parts[2])
						
						const yearIndex = this.years.indexOf(year)
						if (yearIndex !== -1) {
							this.pickerValue[0] = yearIndex
							this.selectedYear = year
						}
						
						this.pickerValue[1] = month - 1
						this.selectedMonth = month
						
						this.updateDays()
						
						const dayIndex = this.days.indexOf(day)
						if (dayIndex !== -1) {
							this.pickerValue[2] = dayIndex
							this.selectedDay = day
						}
						
						this.updateSelectedDate()
					}
				}
			},
			
			// 文件导入
			importFromFile() {
			    // #ifdef H5
			    const input = document.createElement('input')
			    input.type = 'file'
			    input.accept = '.doc,.docx'
			    input.onchange = async (e) => {
			        const file = e.target.files[0]
			        if (!file) return
			        
			        uni.showLoading({ title: '解析中...', mask: true })
			        
			        const formData = new FormData()
			        formData.append('file', file)
			        
			        try {
			            const res = await new Promise((resolve, reject) => {
			                const xhr = new XMLHttpRequest()
			                xhr.open('POST', 'http://localhost:3000/api/parse-schedule')
			                xhr.onload = () => {
			                    try {
			                        const result = JSON.parse(xhr.responseText)
			                        resolve(result)
			                    } catch (e) {
			                        reject(e)
			                    }
			                }
			                xhr.onerror = () => reject(new Error('请求失败'))
			                xhr.send(formData)
			            })
			            
			            uni.hideLoading()
			            
			            if (res.code === 200) {
			                this.saveCourseData(res.data)
			                uni.showToast({
			                    title: '导入成功',
			                    icon: 'success'
			                })
			                uni.$emit('courseDataChanged', { courseData: res.data })
			            } else {
			                uni.showToast({
			                    title: res.message || '导入失败',
			                    icon: 'none'
			                })
			            }
			        } catch (error) {
			            uni.hideLoading()
			            console.error('上传失败:', error)
			            uni.showToast({
			                title: '网络请求失败',
			                icon: 'none'
			            })
			        }
			    }
			    input.click()
			    // #endif
			},
			
			// 保存课表数据
			saveCourseData(courseData) {
			    let scheduleList = uni.getStorageSync('classScheduleName')
			    if (!scheduleList || !Array.isArray(scheduleList)) {
			        scheduleList = []
			    }
			    
			    const existingIndex = scheduleList.findIndex(item => item.name === courseData.name)
			    if (existingIndex !== -1) {
			        scheduleList[existingIndex] = { ...scheduleList[existingIndex], ...courseData }
			    } else {
			        const newId = scheduleList.length > 0 ? Math.max(...scheduleList.map(item => item.id), 0) + 1 : 1
			        scheduleList.push({
			            id: newId,
			            name: courseData.name,
			            ...courseData
			        })
			    }
			    
			    uni.setStorageSync('classScheduleName', scheduleList)
			    uni.setStorageSync(`courseData_${courseData.name}`, courseData)
			},
			
			// 验证课表数据格式
			validateCourseData(data) {
				// 检查必要字段
				if (!data || typeof data !== 'object') return false
				if (!data.name || typeof data.name !== 'string') return false
				if (!data.courses || !Array.isArray(data.courses)) return false
				
				// 验证课程数据
				for (const course of data.courses) {
					if (!course.name || !course.dayOfWeek || !course.weekNum || !course.timeSlot) {
						return false
					}
				}
				return true
			},
			
			// 保存课表数据
			saveCourseData(courseData) {
				// 获取当前课表列表
				const scheduleList = uni.getStorageSync('classScheduleName') || [
					{ id: 1, name: "大二下" },
					{ id: 2, name: "大三上" }
				]
				
				// 检查是否已存在同名课表
				const existingIndex = scheduleList.findIndex(item => item.name === courseData.name)
				if (existingIndex !== -1) {
					// 更新已有课表
					scheduleList[existingIndex] = { ...scheduleList[existingIndex], ...courseData }
				} else {
					// 添加新课表
					const newId = Math.max(...scheduleList.map(item => item.id), 0) + 1
					scheduleList.push({
						id: newId,
						name: courseData.name,
						...courseData
					})
				}
				
				// 保存课表列表
				uni.setStorageSync('classScheduleName', scheduleList)
				
				// 保存具体课表数据
				uni.setStorageSync(`courseData_${courseData.name}`, courseData)
			},
			
			// 教务导入
			importFromEdu() {
				uni.showToast({
					title: '教务导入功能开发中',
					icon: 'none'
				})
			}
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
			margin-bottom: 20rpx;
	
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
							
							.option-desc {
								font-size: 24rpx;
								color: #999;
							}
						}
					}
					
					.option-right {
						.arrow {
							font-size: 40rpx;
							color: #ccc;
						}
					}
				}
			}
		}
	}
	
	// 日期选择器样式
	.date-picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		
		.date-picker-container {
			background-color: #ffffff;
			border-radius: 30rpx 30rpx 0 0;
			width: 100%;
			
			.picker-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1rpx solid #f0f0f0;
				
				.picker-cancel {
					font-size: 30rpx;
					color: #999;
				}
				
				.picker-title {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
				}
				
				.picker-confirm {
					font-size: 30rpx;
					color: #667eea;
					font-weight: 500;
				}
			}
			
			.date-picker-wrapper {
				height: 400rpx;
				padding: 0 30rpx;
				
				.picker-view {
					width: 100%;
					height: 100%;
					
					.picker-item {
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						color: #333;
						height: 80rpx;
						line-height: 80rpx;
					}
				}
			}
			
			.weekday-info {
				text-align: center;
				padding: 20rpx 30rpx;
				background-color: #f8f8f8;
				margin: 20rpx 30rpx;
				border-radius: 20rpx;
				
				.weekday-text {
					font-size: 28rpx;
					color: #667eea;
					font-weight: 500;
				}
			}
			
			.picker-tip {
				text-align: center;
				padding: 20rpx 30rpx 40rpx;
				
				text {
					font-size: 24rpx;
					color: #ff6b6b;
				}
			}
		}
	}
</style>