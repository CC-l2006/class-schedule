if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const API_CONFIG = {
    baseUrl: "http://localhost:3000",
    timeout: 1e4,
    // 添加超时时间
    header: {
      // 添加请求头
      "Content-Type": "application/json"
    }
  };
  const request = (options) => {
    return new Promise((resolve, reject) => {
      uni.request({
        // URl
        url: API_CONFIG.baseUrl + options.url,
        // 方法
        method: options.method || "GET",
        // 请求参数
        data: options.data || {},
        // 超时时间
        timeout: API_CONFIG.timeout,
        // 请求头
        header: {
          ...API_CONFIG.header,
          ...options.header
        },
        //请求成功
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        // 请求失败
        fail: (err) => {
          reject(err);
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    });
  };
  function getCourses() {
    return request({
      url: "/course",
      method: "GET"
    });
  }
  function getCourseData() {
    return request({
      url: "/api/get-course-data",
      method: "GET"
    });
  }
  const _imports_0$3 = "/static/index/tap/setting.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$7 = {
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
      };
    },
    onLoad() {
      this.loadStartDate();
      this.listenStartDateChange();
      this.listenCourseDataChange();
      this.loadScheduleList();
      this.loadCourseData();
      this.getWeekData();
      this.initTimeSlots();
    },
    onShow() {
      this.updateStartDateOnly();
      this.loadScheduleList();
    },
    beforeDestroy() {
      uni.$off("startDateChanged");
      uni.$off("courseDataChanged");
    },
    methods: {
      // 根据课程名称生成固定颜色
      getCourseColor(courseName) {
        const colorPool = [
          "#667eea",
          "#f093fb",
          "#4facfe",
          "#43e97b",
          "#fa709a",
          "#fee140",
          "#30cfd0",
          "#a18cd1",
          "#fbc2eb",
          "#ff9a9e",
          "#a6c1ee",
          "#84fab0",
          "#fad0c4",
          "#ffd3a5",
          "#ff758c",
          "#42e695",
          "#3b8d99",
          "#b621fe",
          "#1fd1f9",
          "#ff6b6b"
        ];
        let hash = 0;
        for (let i = 0; i < courseName.length; i++) {
          hash = (hash << 5) - hash + courseName.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % colorPool.length;
        return colorPool[index];
      },
      // 判断是否是跨行课程的第二格（应该完全跳过不渲染）
      isSecondSpanCell(dayOfWeek, timeSlot) {
        return this.currentWeekCourses.some((course) => {
          return course.dayOfWeek === dayOfWeek && course.timeSlot % 2 === 1 && timeSlot === course.timeSlot + 1;
        });
      },
      // 获取单元格样式类
      getCellClass(dayOfWeek, timeSlot) {
        const isFirstSpanCell = this.currentWeekCourses.some((course) => {
          return course.dayOfWeek === dayOfWeek && course.timeSlot === timeSlot && course.timeSlot % 2 === 1;
        });
        if (isFirstSpanCell) {
          return "course-cell-span2";
        }
        return "course-cell";
      },
      loadScheduleList() {
        const savedList = uni.getStorageSync("classScheduleName");
        if (savedList && savedList.length > 0) {
          this.classScheduleName = savedList;
          if (!this.currentSchedule.id && savedList[0]) {
            this.currentSchedule = savedList[0];
          }
        }
      },
      async loadCourseData() {
        try {
          const res = await getCourseData();
          if (res.code === 200 && res.data) {
            this.courseList = res.data.courses || [];
            uni.setStorageSync("courseData", res.data);
            const scheduleItem = {
              id: 1,
              name: res.data.name || "我的课表",
              courses: this.courseList
            };
            uni.setStorageSync("classScheduleName", [scheduleItem]);
            uni.setStorageSync("courseData_我的课表", res.data);
            this.classScheduleName = [scheduleItem];
            this.currentSchedule = scheduleItem;
            this.loadCurrentWeekCourses();
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:269", "加载课表数据失败:", error);
        }
      },
      listenCourseDataChange() {
        uni.$on("courseDataChanged", (data) => {
          if (data.courseData) {
            this.courseList = data.courseData.courses || [];
            uni.setStorageSync("courseData", data.courseData);
            this.loadCurrentWeekCourses();
          }
        });
      },
      loadCurrentWeekCourses() {
        const currentWeek = this.currentWeekNum;
        this.currentWeekCourses = this.courseList.filter((course) => {
          return course.weekNum && course.weekNum.includes(currentWeek);
        });
      },
      // 根据星期和节次获取课程
      getCoursesByDayAndTime(dayOfWeek, timeSlot) {
        return this.currentWeekCourses.filter((course) => {
          return course.dayOfWeek === dayOfWeek && course.timeSlot === timeSlot;
        });
      },
      showCourseDetail(course) {
        uni.showModal({
          title: course.name,
          content: `时间：第${course.timeSlot}-${course.timeSlot + 1}节
地点：${course.location || "未指定"}
教师：${course.teacher || "未指定"}`,
          showCancel: false,
          confirmText: "知道了"
        });
      },
      updateStartDateOnly() {
        const savedDate = uni.getStorageSync("startDate");
        if (savedDate !== this.startDate) {
          this.startDate = savedDate;
          if (this.startDate) {
            this.updateWeekData();
          } else {
            this.calculateWeekNumber(/* @__PURE__ */ new Date());
            this.getWeekData();
          }
        }
      },
      loadStartDate() {
        const savedDate = uni.getStorageSync("startDate");
        if (savedDate) {
          this.startDate = savedDate;
          this.calculateWeekNumberFromStartDate();
        } else {
          this.calculateWeekNumber(/* @__PURE__ */ new Date());
        }
      },
      listenStartDateChange() {
        uni.$on("startDateChanged", (data) => {
          this.startDate = data.startDate;
          this.weekOffset = 0;
          this.calculateWeekNumberFromStartDate();
          this.getWeekData();
        });
      },
      calculateWeekNumberFromStartDate() {
        if (!this.startDate) {
          this.currentWeekNum = 1;
          return;
        }
        const start = new Date(this.startDate);
        const today = /* @__PURE__ */ new Date();
        const diffTime = today - start;
        const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1e3));
        let weekNum = Math.floor(diffDays / 7) + 1;
        if (weekNum < 1)
          weekNum = 1;
        this.currentWeekNum = weekNum;
      },
      calculateTargetWeekNumber(targetDate) {
        if (this.startDate) {
          const start = new Date(this.startDate);
          const diffTime = targetDate - start;
          const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1e3));
          let weekNum = Math.floor(diffDays / 7) + 1;
          if (weekNum < 1)
            weekNum = 1;
          return weekNum;
        } else {
          const year = targetDate.getFullYear();
          const firstDayOfYear = new Date(year, 0, 1);
          let firstDayWeek = firstDayOfYear.getDay();
          firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek;
          const startOfYear = new Date(year, 0, 0);
          const dayOfYear = Math.floor((targetDate - startOfYear) / (24 * 60 * 60 * 1e3));
          let weekNum = Math.ceil((dayOfYear + firstDayWeek - 1) / 7);
          if (weekNum === 0) {
            const lastYear = year - 1;
            const lastDayOfLastYear = new Date(lastYear, 11, 31);
            return this.getWeekNumber(lastDayOfLastYear);
          }
          return weekNum;
        }
      },
      canGoLastWeek() {
        if (!this.startDate)
          return true;
        const start = new Date(this.startDate);
        const today = /* @__PURE__ */ new Date();
        const lastWeekDate = new Date(today);
        lastWeekDate.setDate(today.getDate() + (this.weekOffset - 1) * 7);
        const lastWeekDayOfWeek = lastWeekDate.getDay();
        const lastWeekMonday = new Date(lastWeekDate);
        const diff = lastWeekDayOfWeek === 0 ? -6 : 1 - lastWeekDayOfWeek;
        lastWeekMonday.setDate(lastWeekDate.getDate() + diff);
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const mondayDate = new Date(lastWeekMonday);
        mondayDate.setHours(0, 0, 0, 0);
        return mondayDate >= startDate;
      },
      switchSchedule() {
        this.showOptions = !this.showOptions;
      },
      selectSchedule(item) {
        this.currentSchedule = item;
        this.showOptions = false;
        const savedData = uni.getStorageSync(`courseData_${item.name}`);
        if (savedData) {
          this.courseList = savedData.courses || [];
          this.loadCurrentWeekCourses();
        }
      },
      openSettings() {
        uni.navigateTo({
          url: "/pages/index/setting/setting"
        });
      },
      lastWeek() {
        if (!this.canGoLastWeek()) {
          uni.showToast({
            title: "已经是第一周啦，没有更早了_(:з」∠)_",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        this.weekOffset--;
        this.updateWeekData();
      },
      nextWeek() {
        this.weekOffset++;
        this.updateWeekData();
      },
      thisWeek() {
        this.weekOffset = 0;
        this.updateWeekData();
      },
      updateWeekData() {
        const today = /* @__PURE__ */ new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + this.weekOffset * 7);
        this.currentWeekNum = this.calculateTargetWeekNumber(targetDate);
        this.getWeekData();
        this.loadCurrentWeekCourses();
      },
      getWeekData() {
        const today = /* @__PURE__ */ new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + this.weekOffset * 7);
        const todayStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const targetDayOfWeek = targetDate.getDay();
        const monday = new Date(targetDate);
        const diff = targetDayOfWeek === 0 ? -6 : 1 - targetDayOfWeek;
        monday.setDate(targetDate.getDate() + diff);
        const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        this.weekList = weekDays.map((name, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${month}-${day}`;
          return {
            name,
            date: dateStr,
            isToday: this.weekOffset === 0 && dateStr === todayStr
          };
        });
      },
      calculateWeekNumber(targetDate) {
        this.currentWeekNum = this.calculateTargetWeekNumber(targetDate);
      },
      getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        let firstDayWeek = firstDayOfYear.getDay();
        firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek;
        const startOfYear = new Date(date.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1e3));
        return Math.ceil((dayOfYear + firstDayWeek - 1) / 7);
      },
      initTimeSlots() {
        this.timeSlots = [
          {
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
        ];
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createCommentVNode(" 固定 "),
      vue.createElementVNode("view", { class: "fixed-top" }, [
        vue.createCommentVNode(" 顶部行 "),
        vue.createElementVNode("view", { class: "toprow" }, [
          vue.createCommentVNode(" 左侧：课表选择 "),
          vue.createElementVNode("view", { class: "left" }, [
            vue.createElementVNode(
              "view",
              {
                onClick: _cache[0] || (_cache[0] = (...args) => $options.switchSchedule && $options.switchSchedule(...args)),
                class: "schedule-item"
              },
              vue.toDisplayString($data.currentSchedule.name),
              1
              /* TEXT */
            ),
            vue.createCommentVNode(" 选择当前的课表 "),
            $data.showOptions ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "options-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.classScheduleName, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: item.id,
                    onClick: ($event) => $options.selectSchedule(item),
                    class: "option-item"
                  }, vue.toDisplayString(item.name), 9, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" 右侧：设置按钮 "),
          vue.createElementVNode("view", { class: "right" }, [
            vue.createElementVNode("view", {
              onClick: _cache[1] || (_cache[1] = (...args) => $options.openSettings && $options.openSettings(...args)),
              class: "settings-btn"
            }, [
              vue.createElementVNode("image", {
                src: _imports_0$3,
                mode: "aspectFit",
                style: { "width": "100%", "height": "100%" }
              })
            ])
          ])
        ]),
        vue.createCommentVNode(" 显示时间，日期 "),
        vue.createElementVNode("view", { class: "time" }, [
          vue.createCommentVNode(" 显示第几周 "),
          vue.createElementVNode("view", { class: "time-week" }, [
            vue.createElementVNode(
              "text",
              { class: "time-week-num" },
              vue.toDisplayString($data.currentWeekNum),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "time-week-text" }, "周")
          ]),
          vue.createCommentVNode(" 显示日期和星期几 "),
          vue.createElementVNode("view", { class: "time-data" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.weekList, (day, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: vue.normalizeClass(["day-item", { "today-highlight": day.isToday }]),
                    key: index
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      { class: "day-name" },
                      vue.toDisplayString(day.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "day-date" },
                      vue.toDisplayString(day.date),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "true",
        class: "scroll-body"
      }, [
        vue.createCommentVNode(" 主体部分：课表网格 "),
        vue.createElementVNode("view", { class: "body" }, [
          vue.createCommentVNode(" 左侧时间列 "),
          vue.createElementVNode("view", { class: "body-time" }, [
            vue.createElementVNode("view", { class: "time-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.timeSlots.slice(0, 4), (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "time-item",
                    key: item.num
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "time-num" },
                      vue.toDisplayString(item.num),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-start" },
                      vue.toDisplayString(item.start),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-end" },
                      vue.toDisplayString(item.end),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("view", { class: "time-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.timeSlots.slice(4, 8), (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "time-item",
                    key: item.num
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "time-num" },
                      vue.toDisplayString(item.num),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-start" },
                      vue.toDisplayString(item.start),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-end" },
                      vue.toDisplayString(item.end),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("view", { class: "time-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.timeSlots.slice(8, 11), (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "time-item",
                    key: item.num
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "time-num" },
                      vue.toDisplayString(item.num),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-start" },
                      vue.toDisplayString(item.start),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time-end" },
                      vue.toDisplayString(item.end),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createCommentVNode(" 右侧课程网格 "),
          vue.createElementVNode("view", { class: "body-course" }, [
            vue.createCommentVNode(" 上午 "),
            vue.createElementVNode("view", { class: "course-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.weekList, (day, dayIndex) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "course-day",
                    key: dayIndex
                  }, [
                    vue.createCommentVNode(" 使用 v-for 但跳过跨行的第二格 "),
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($data.timeSlots.slice(0, 4), (timeSlot, slotIndex) => {
                        return vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          [
                            !$options.isSecondSpanCell(dayIndex + 1, timeSlot.num) ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: timeSlot.num,
                                class: vue.normalizeClass($options.getCellClass(dayIndex + 1, timeSlot.num))
                              },
                              [
                                $options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  { key: 0 },
                                  vue.renderList($options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num), (course) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      key: course.name + course.timeSlot,
                                      class: "course-item",
                                      style: vue.normalizeStyle({ backgroundColor: $options.getCourseColor(course.name) }),
                                      onClick: ($event) => $options.showCourseDetail(course)
                                    }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-name" },
                                        vue.toDisplayString(course.name),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-location" },
                                        vue.toDisplayString(course.location),
                                        1
                                        /* TEXT */
                                      )
                                    ], 12, ["onClick"]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                )) : (vue.openBlock(), vue.createElementBlock("view", {
                                  key: 1,
                                  class: "course-empty"
                                }))
                              ],
                              2
                              /* CLASS */
                            )) : vue.createCommentVNode("v-if", true)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        );
                      }),
                      256
                      /* UNKEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createCommentVNode(" 下午 "),
            vue.createElementVNode("view", { class: "course-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.weekList, (day, dayIndex) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "course-day",
                    key: dayIndex
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($data.timeSlots.slice(4, 8), (timeSlot, slotIndex) => {
                        return vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          [
                            !$options.isSecondSpanCell(dayIndex + 1, timeSlot.num) ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: timeSlot.num,
                                class: vue.normalizeClass($options.getCellClass(dayIndex + 1, timeSlot.num))
                              },
                              [
                                $options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  { key: 0 },
                                  vue.renderList($options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num), (course) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      key: course.name + course.timeSlot,
                                      class: "course-item",
                                      style: vue.normalizeStyle({ backgroundColor: $options.getCourseColor(course.name) }),
                                      onClick: ($event) => $options.showCourseDetail(course)
                                    }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-name" },
                                        vue.toDisplayString(course.name),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-location" },
                                        vue.toDisplayString(course.location),
                                        1
                                        /* TEXT */
                                      )
                                    ], 12, ["onClick"]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                )) : (vue.openBlock(), vue.createElementBlock("view", {
                                  key: 1,
                                  class: "course-empty"
                                }))
                              ],
                              2
                              /* CLASS */
                            )) : vue.createCommentVNode("v-if", true)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        );
                      }),
                      256
                      /* UNKEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createCommentVNode(" 晚上 "),
            vue.createElementVNode("view", { class: "course-group" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.weekList, (day, dayIndex) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "course-day",
                    key: dayIndex
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($data.timeSlots.slice(8, 11), (timeSlot, slotIndex) => {
                        return vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          [
                            !$options.isSecondSpanCell(dayIndex + 1, timeSlot.num) ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: timeSlot.num,
                                class: vue.normalizeClass($options.getCellClass(dayIndex + 1, timeSlot.num))
                              },
                              [
                                $options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num).length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  { key: 0 },
                                  vue.renderList($options.getCoursesByDayAndTime(dayIndex + 1, timeSlot.num), (course) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      key: course.name + course.timeSlot,
                                      class: "course-item",
                                      style: vue.normalizeStyle({ backgroundColor: $options.getCourseColor(course.name) }),
                                      onClick: ($event) => $options.showCourseDetail(course)
                                    }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-name" },
                                        vue.toDisplayString(course.name),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "course-location" },
                                        vue.toDisplayString(course.location),
                                        1
                                        /* TEXT */
                                      )
                                    ], 12, ["onClick"]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                )) : (vue.openBlock(), vue.createElementBlock("view", {
                                  key: 1,
                                  class: "course-empty"
                                }))
                              ],
                              2
                              /* CLASS */
                            )) : vue.createCommentVNode("v-if", true)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        );
                      }),
                      256
                      /* UNKEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        vue.createCommentVNode(" 下一周，上一周 "),
        vue.createElementVNode("view", { class: "nav-btn" }, [
          vue.createElementVNode("view", {
            class: "btn-last",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.lastWeek && $options.lastWeek(...args))
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "上一周")
          ]),
          vue.createElementVNode("view", {
            class: "btn-this",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.thisWeek && $options.thisWeek(...args))
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "本周")
          ]),
          vue.createElementVNode("view", {
            class: "btn-next",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.nextWeek && $options.nextWeek(...args))
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "下一周")
          ])
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/index.vue"]]);
  const _imports_0$2 = "/static/teaching/viewCount.png";
  const _imports_1$2 = "/static/teaching/comment.png";
  const _sfc_main$6 = {
    data() {
      return {
        API_CONFIG,
        courseList: []
      };
    },
    onLoad() {
      this.fetchCourses();
    },
    methods: {
      fetchCourses() {
        getCourses().then((res) => {
          formatAppLog("log", "at pages/index/teaching/teaching.vue:50", "获取到的数据", res);
          if (res.code === 200) {
            this.courseList = res.data;
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/index/teaching/teaching.vue:56", "获取课程失败", err);
        });
      },
      formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
      formatNumber(num) {
        if (!num)
          return "0";
        const n = parseInt(num);
        if (n >= 1e4) {
          return (n / 1e4).toFixed(1) + "万";
        }
        return n.toString();
      },
      watchCourse(url) {
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "course-list" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($data.courseList, (item) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "course-card",
            key: item.id,
            onClick: ($event) => $options.watchCourse(item.url)
          }, [
            vue.createCommentVNode(" 图片区域 "),
            vue.createElementVNode("view", { class: "course-image" }, [
              vue.createElementVNode("image", {
                class: "course-img",
                src: `${$data.API_CONFIG.baseUrl}${item.imgurl}`,
                mode: "aspectFill"
              }, null, 8, ["src"])
            ]),
            vue.createCommentVNode(" 课程信息区域 "),
            vue.createElementVNode("view", { class: "course-content" }, [
              vue.createElementVNode("view", { class: "course-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "course-name" },
                  vue.toDisplayString(item.CourseName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "course-author" },
                  "作者：" + vue.toDisplayString(item.author),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "course-date" },
                  "发布时间：" + vue.toDisplayString($options.formatDate(item.ReleaseDate)),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "course-stats" }, [
              vue.createElementVNode("view", { class: "stats" }, [
                vue.createElementVNode("image", {
                  src: _imports_0$2,
                  mode: "aspectFill"
                }),
                vue.createElementVNode(
                  "text",
                  { class: "stat-item" },
                  vue.toDisplayString($options.formatNumber(item["view count"])),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stats" }, [
                vue.createElementVNode("image", {
                  src: _imports_1$2,
                  mode: "aspectFill"
                }),
                vue.createElementVNode(
                  "text",
                  { class: "stat-item" },
                  vue.toDisplayString($options.formatNumber(item.comment)),
                  1
                  /* TEXT */
                )
              ])
            ])
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const PagesIndexTeachingTeaching = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-41f847e3"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/teaching/teaching.vue"]]);
  const _imports_0$1 = "/static/setting/file.png";
  const _imports_1$1 = "/static/setting/edu.png";
  const _imports_2$1 = "/static/setting/calendar.png";
  const _sfc_main$5 = {
    data() {
      return {
        startDate: "",
        // 存储开学时间
        startDateText: "",
        // 显示用的开学时间文本
        showPicker: false,
        // 是否显示日期选择器
        // 日期选择器数据
        years: [],
        months: [],
        days: [],
        pickerValue: [0, 0, 0],
        selectedYear: 2024,
        selectedMonth: 9,
        selectedDay: 2,
        selectedDate: null,
        selectedWeekday: ""
      };
    },
    onLoad() {
      this.initDateData();
      this.loadStartDate();
    },
    methods: {
      // 初始化日期数据
      initDateData() {
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        for (let i = currentYear - 2; i <= currentYear + 2; i++) {
          this.years.push(i);
        }
        for (let i = 1; i <= 12; i++) {
          this.months.push(i);
        }
        const defaultYearIndex = this.years.indexOf(currentYear);
        if (defaultYearIndex !== -1) {
          this.pickerValue[0] = defaultYearIndex;
          this.selectedYear = currentYear;
        }
        this.pickerValue[1] = 8;
        this.selectedMonth = 9;
        this.updateDays();
        this.updateSelectedDate();
      },
      // 更新天数（根据年月）
      updateDays() {
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
        this.days = [];
        for (let i = 1; i <= daysInMonth; i++) {
          this.days.push(i);
        }
        if (this.selectedDay > daysInMonth) {
          this.selectedDay = daysInMonth;
          this.pickerValue[2] = daysInMonth - 1;
        }
      },
      // 更新选中日期
      updateSelectedDate() {
        this.selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
        const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const weekdayIndex = this.selectedDate.getDay();
        this.selectedWeekday = weekdays[weekdayIndex];
      },
      // 选择器变化事件
      onPickerChange(e) {
        const val = e.detail.value;
        this.pickerValue = val;
        const year = this.years[val[0]];
        const month = this.months[val[1]];
        this.selectedYear = year;
        this.selectedMonth = month;
        this.updateDays();
        let dayIndex = val[2];
        if (dayIndex >= this.days.length) {
          dayIndex = this.days.length - 1;
        }
        this.selectedDay = this.days[dayIndex];
        this.pickerValue[2] = dayIndex;
        this.updateSelectedDate();
      },
      // 显示日期选择器
      showDatePicker() {
        if (this.startDate) {
          const parts = this.startDate.split("-");
          if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            const yearIndex = this.years.indexOf(year);
            if (yearIndex !== -1) {
              this.pickerValue[0] = yearIndex;
              this.selectedYear = year;
            }
            this.pickerValue[1] = month - 1;
            this.selectedMonth = month;
            this.updateDays();
            const dayIndex = this.days.indexOf(day);
            if (dayIndex !== -1) {
              this.pickerValue[2] = dayIndex;
              this.selectedDay = day;
            }
            this.updateSelectedDate();
          }
        }
        this.showPicker = true;
      },
      // 隐藏日期选择器
      hideDatePicker() {
        this.showPicker = false;
      },
      // 确认选择日期
      confirmDate() {
        const year = this.selectedYear;
        const month = String(this.selectedMonth).padStart(2, "0");
        const day = String(this.selectedDay).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        const weekDay = this.selectedDate.getDay();
        if (weekDay !== 1) {
          uni.showToast({
            title: "请选择周一作为开学时间",
            icon: "none"
          });
          return;
        }
        this.startDate = dateStr;
        this.startDateText = dateStr;
        uni.setStorageSync("startDate", dateStr);
        uni.$emit("startDateChanged", { startDate: dateStr });
        uni.showToast({
          title: "设置成功",
          icon: "success"
        });
        this.hideDatePicker();
      },
      // 加载开学时间
      loadStartDate() {
        const savedDate = uni.getStorageSync("startDate");
        if (savedDate) {
          this.startDate = savedDate;
          this.startDateText = savedDate;
          const parts = savedDate.split("-");
          if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            const yearIndex = this.years.indexOf(year);
            if (yearIndex !== -1) {
              this.pickerValue[0] = yearIndex;
              this.selectedYear = year;
            }
            this.pickerValue[1] = month - 1;
            this.selectedMonth = month;
            this.updateDays();
            const dayIndex = this.days.indexOf(day);
            if (dayIndex !== -1) {
              this.pickerValue[2] = dayIndex;
              this.selectedDay = day;
            }
            this.updateSelectedDate();
          }
        }
      },
      // 文件导入
      importFromFile() {
      },
      // 保存课表数据
      saveCourseData(courseData) {
        let scheduleList = uni.getStorageSync("classScheduleName");
        if (!scheduleList || !Array.isArray(scheduleList)) {
          scheduleList = [];
        }
        const existingIndex = scheduleList.findIndex((item) => item.name === courseData.name);
        if (existingIndex !== -1) {
          scheduleList[existingIndex] = { ...scheduleList[existingIndex], ...courseData };
        } else {
          const newId = scheduleList.length > 0 ? Math.max(...scheduleList.map((item) => item.id), 0) + 1 : 1;
          scheduleList.push({
            id: newId,
            name: courseData.name,
            ...courseData
          });
        }
        uni.setStorageSync("classScheduleName", scheduleList);
        uni.setStorageSync(`courseData_${courseData.name}`, courseData);
      },
      // 验证课表数据格式
      validateCourseData(data) {
        if (!data || typeof data !== "object")
          return false;
        if (!data.name || typeof data.name !== "string")
          return false;
        if (!data.courses || !Array.isArray(data.courses))
          return false;
        for (const course of data.courses) {
          if (!course.name || !course.dayOfWeek || !course.weekNum || !course.timeSlot) {
            return false;
          }
        }
        return true;
      },
      // 保存课表数据
      saveCourseData(courseData) {
        const scheduleList = uni.getStorageSync("classScheduleName") || [
          { id: 1, name: "大二下" },
          { id: 2, name: "大三上" }
        ];
        const existingIndex = scheduleList.findIndex((item) => item.name === courseData.name);
        if (existingIndex !== -1) {
          scheduleList[existingIndex] = { ...scheduleList[existingIndex], ...courseData };
        } else {
          const newId = Math.max(...scheduleList.map((item) => item.id), 0) + 1;
          scheduleList.push({
            id: newId,
            name: courseData.name,
            ...courseData
          });
        }
        uni.setStorageSync("classScheduleName", scheduleList);
        uni.setStorageSync(`courseData_${courseData.name}`, courseData);
      },
      // 教务导入
      importFromEdu() {
        uni.showToast({
          title: "教务导入功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-container" }, [
      vue.createCommentVNode(" 所有的图标颜色为 #8a8a8a "),
      vue.createCommentVNode(" 课表导入 "),
      vue.createElementVNode("view", { class: "settings-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "课表导入"),
        vue.createCommentVNode(" 选项 "),
        vue.createElementVNode("view", { class: "card-options" }, [
          vue.createCommentVNode(" 文件导入 "),
          vue.createElementVNode("view", {
            class: "option-item",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.importFromFile && $options.importFromFile(...args))
          }, [
            vue.createElementVNode("view", { class: "option-left" }, [
              vue.createElementVNode("image", {
                src: _imports_0$1,
                mode: "aspectFit",
                class: "option-icon"
              }),
              vue.createElementVNode("view", { class: "option-info" }, [
                vue.createElementVNode("text", { class: "option-title" }, "文件导入"),
                vue.createElementVNode("text", { class: "option-desc" }, "支持 .json 格式")
              ])
            ])
          ]),
          vue.createCommentVNode(" 教务导入 "),
          vue.createElementVNode("view", {
            class: "option-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.importFromEdu && $options.importFromEdu(...args))
          }, [
            vue.createElementVNode("view", { class: "option-left" }, [
              vue.createElementVNode("image", {
                src: _imports_1$1,
                mode: "aspectFit",
                class: "option-icon"
              }),
              vue.createElementVNode("view", { class: "option-info" }, [
                vue.createElementVNode("text", { class: "option-title" }, "教务导入")
              ])
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 开学时间设置 "),
      vue.createElementVNode("view", { class: "settings-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "学期设置"),
        vue.createElementVNode("view", { class: "card-options" }, [
          vue.createElementVNode("view", {
            class: "option-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.showDatePicker && $options.showDatePicker(...args))
          }, [
            vue.createElementVNode("view", { class: "option-left" }, [
              vue.createElementVNode("image", {
                src: _imports_2$1,
                mode: "aspectFit",
                class: "option-icon"
              }),
              vue.createElementVNode("view", { class: "option-info" }, [
                vue.createElementVNode("text", { class: "option-title" }, "开学时间"),
                vue.createElementVNode(
                  "text",
                  { class: "option-desc" },
                  vue.toDisplayString($data.startDateText || "请选择开学日期"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "option-right" }, [
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 日期选择器弹窗 "),
      $data.showPicker ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "date-picker-mask",
        onClick: _cache[7] || (_cache[7] = (...args) => $options.hideDatePicker && $options.hideDatePicker(...args))
      }, [
        vue.createElementVNode("view", {
          class: "date-picker-container",
          onClick: _cache[6] || (_cache[6] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("text", {
              class: "picker-cancel",
              onClick: _cache[3] || (_cache[3] = (...args) => $options.hideDatePicker && $options.hideDatePicker(...args))
            }, "取消"),
            vue.createElementVNode("text", { class: "picker-title" }, "选择开学时间"),
            vue.createElementVNode("text", {
              class: "picker-confirm",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.confirmDate && $options.confirmDate(...args))
            }, "确定")
          ]),
          vue.createCommentVNode(" 日期选择器 "),
          vue.createElementVNode("view", { class: "date-picker-wrapper" }, [
            vue.createElementVNode("picker-view", {
              value: $data.pickerValue,
              onChange: _cache[5] || (_cache[5] = (...args) => $options.onPickerChange && $options.onPickerChange(...args)),
              class: "picker-view",
              "indicator-style": "height: 80rpx;"
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.years, (year, idx) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: idx,
                        class: "picker-item"
                      },
                      vue.toDisplayString(year) + "年 ",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.months, (month, idx) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: idx,
                        class: "picker-item"
                      },
                      vue.toDisplayString(month) + "月 ",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.days, (day, idx) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: idx,
                        class: "picker-item"
                      },
                      vue.toDisplayString(day) + "日 ",
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["value"])
          ]),
          vue.createCommentVNode(" 星期显示 "),
          $data.selectedDate ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "weekday-info"
          }, [
            vue.createElementVNode(
              "text",
              { class: "weekday-text" },
              "开学当天为：" + vue.toDisplayString($data.selectedWeekday),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 提示信息 "),
          vue.createElementVNode("view", { class: "picker-tip" }, [
            vue.createElementVNode("text", null, "请选择开学第一周的周一日期")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexSettingSetting = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-ad249183"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/setting/setting.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        url: ""
      };
    },
    onLoad(options) {
      this.url = decodeURIComponent(options.url || "");
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "webview-container" }, [
      vue.createElementVNode("web-view", { src: $data.url }, null, 8, ["src"])
    ]);
  }
  const PagesWebviewWebview = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-deb32cb9"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/webview/webview.vue"]]);
  function getDirectoryContent(path = "") {
    return request({
      url: `/node/list?path=${encodeURIComponent(path)}`,
      method: "GET"
    });
  }
  function getFileContent(filename) {
    return request({
      url: `/node/content/${encodeURIComponent(filename)}`,
      method: "GET"
    });
  }
  function createFolder(folderName, parentPath = "") {
    return request({
      url: "/node/folder",
      method: "POST",
      data: { folderName, parentPath }
    });
  }
  function createFile(fileName, content = "", parentPath = "") {
    return request({
      url: "/node/file",
      method: "POST",
      data: { fileName, content, parentPath }
    });
  }
  function updateFile(filename, content) {
    return request({
      url: `/node/file/${encodeURIComponent(filename)}`,
      method: "PUT",
      data: { content }
    });
  }
  function renameItem(oldPath, newName) {
    return request({
      url: "/node/rename",
      method: "PUT",
      data: { oldPath, newName }
    });
  }
  function deleteItem(itemPath) {
    return request({
      url: "/node/delete",
      method: "DELETE",
      data: { itemPath }
    });
  }
  const _imports_0 = "/static/node/folder-add.png";
  const _imports_1 = "/static/node/file.png";
  const _imports_2 = "/static/node/empty.png";
  const _sfc_main$3 = {
    data() {
      return {
        allItems: [],
        // 当前目录内容
        allFiles: [],
        // 所有笔记文件（用于全局搜索）
        loading: false,
        // 加载状态
        searchKeyword: "",
        // 搜索关键词
        currentPath: [],
        // 当前路径（文件夹数组）
        currentPathStr: "",
        // 当前路径字符串
        isSearchMode: false
        // 是否搜索模式
      };
    },
    computed: {
      // 搜索结果（从全部文件中搜索）
      searchResults() {
        if (!this.searchKeyword.trim()) {
          return [];
        }
        const keyword = this.searchKeyword.toLowerCase().trim();
        return this.allFiles.filter((item) => {
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
      this.loadAllFiles();
    },
    methods: {
      // 判断是否为 Markdown 文件
      isMarkdownFile(filename) {
        if (!filename)
          return false;
        return filename.endsWith(".md") || filename.endsWith(".markdown");
      },
      // 获取笔记名称（去掉 .md 后缀）
      getNoteName(filename) {
        if (!filename)
          return "";
        return filename.replace(/\.md$/, "").replace(/\.markdown$/, "");
      },
      // 高亮关键词
      highlightKeyword(text) {
        if (!this.isSearchMode || !this.searchKeyword || !text) {
          return text;
        }
        const keyword = this.searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${keyword})`, "gi");
        return text.replace(regex, '<span class="highlight">$1</span>');
      },
      // 递归获取所有子目录中的文件
      async loadAllFiles() {
        try {
          const res = await getDirectoryContent("");
          if (res && res.code === 200) {
            const items = res.data.items || [];
            const files = [];
            const traverse = async (itemList, parentPath = "") => {
              for (const item of itemList) {
                if (item.type === "folder") {
                  const subRes = await getDirectoryContent(parentPath ? `${parentPath}/${item.name}` : item.name);
                  if (subRes && subRes.code === 200) {
                    const subItems = subRes.data.items || [];
                    await traverse(subItems, parentPath ? `${parentPath}/${item.name}` : item.name);
                  }
                } else if (item.type === "file" && this.isMarkdownFile(item.name)) {
                  files.push({
                    name: item.name,
                    fullPath: parentPath ? `${parentPath}/${item.name}` : item.name,
                    type: "file",
                    size: item.size,
                    modifyTime: item.modifyTime,
                    displayPath: parentPath || "根目录"
                  });
                }
              }
            };
            await traverse(items);
            this.allFiles = files;
            formatAppLog("log", "at pages/index/node/node.vue:228", "已加载全部文件数量:", this.allFiles.length);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:231", "加载全部文件失败:", error);
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
          formatAppLog("log", "at pages/index/node/node.vue:245", "API响应:", res);
          if (res && res.code === 200) {
            let items = [];
            if (res.data && Array.isArray(res.data.items)) {
              items = res.data.items;
            } else if (Array.isArray(res.data)) {
              items = res.data;
            }
            this.allItems = items.filter((item) => item && typeof item === "object").map((item) => {
              return {
                name: item.name || "",
                fullPath: item.fullPath || item.name || "",
                type: item.type || (item.isDirectory ? "folder" : "file"),
                size: item.size || 0,
                modifyTime: item.modifyTime || (/* @__PURE__ */ new Date()).toISOString(),
                fileCount: item.fileCount || 0
              };
            });
            formatAppLog("log", "at pages/index/node/node.vue:268", "当前目录数据数量:", this.allItems.length);
          } else {
            formatAppLog("error", "at pages/index/node/node.vue:270", "API错误:", res == null ? void 0 : res.message);
            this.allItems = [];
            if (res == null ? void 0 : res.message) {
              uni.showToast({
                title: res.message,
                icon: "none"
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:280", "请求失败:", error);
          this.allItems = [];
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 进入文件夹
      enterFolder(folder) {
        if (!folder || !folder.name)
          return;
        this.currentPath.push(folder.name);
        this.currentPathStr = this.currentPath.join("/");
        this.searchKeyword = "";
        this.isSearchMode = false;
        this.loadContentList();
      },
      // 导航到指定路径
      navigateToPath(index) {
        if (index === -1) {
          this.currentPath = [];
          this.currentPathStr = "";
        } else {
          this.currentPath = this.currentPath.slice(0, index + 1);
          this.currentPathStr = this.currentPath.join("/");
        }
        this.searchKeyword = "";
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
        uni.showLoading({
          title: "搜索中..."
        });
        await this.refreshAllFiles();
        uni.hideLoading();
        this.isSearchMode = true;
        const count = this.searchResults.length;
        if (count === 0) {
          uni.showToast({
            title: "未找到相关笔记",
            icon: "none"
          });
        } else {
          uni.showToast({
            title: `找到 ${count} 个相关笔记`,
            icon: "success",
            duration: 1500
          });
        }
      },
      // 退出搜索模式
      exitSearchMode() {
        this.isSearchMode = false;
        this.searchKeyword = "";
      },
      // 显示创建文件夹对话框
      showCreateFolderDialog() {
        uni.showModal({
          title: "新建文件夹",
          editable: true,
          placeholderText: "请输入文件夹名称",
          success: (res) => {
            if (res.confirm && res.content) {
              this.createFolderItem(res.content);
            }
          }
        });
      },
      // 创建文件夹
      async createFolderItem(folderName) {
        if (!folderName)
          return;
        try {
          uni.showLoading({
            title: "创建中..."
          });
          const res = await createFolder(folderName, this.currentPathStr);
          if (res.code === 200) {
            uni.showToast({
              title: "创建成功",
              icon: "success"
            });
            this.loadContentList();
            this.refreshAllFiles();
          } else {
            uni.showToast({
              title: res.message || "创建失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:396", "创建失败:", error);
          uni.showToast({
            title: "创建失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 显示创建文件对话框
      showCreateFileDialog() {
        uni.showModal({
          title: "新建笔记",
          editable: true,
          placeholderText: "请输入笔记名称",
          success: (res) => {
            if (res.confirm && res.content) {
              this.createFileItem(res.content);
            }
          }
        });
      },
      // 创建文件
      async createFileItem(fileName) {
        if (!fileName)
          return;
        let finalFileName = fileName;
        if (!fileName.endsWith(".md") && !fileName.endsWith(".markdown")) {
          finalFileName = fileName + ".md";
        }
        const defaultContent = `# ${fileName.replace(/\.md$/, "")}

## 介绍

在这里写下你的笔记内容...

## 详细内容

`;
        try {
          uni.showLoading({
            title: "创建中..."
          });
          const res = await createFile(finalFileName, defaultContent, this.currentPathStr);
          if (res.code === 200) {
            uni.showToast({
              title: "创建成功",
              icon: "success"
            });
            this.loadContentList();
            this.refreshAllFiles();
          } else {
            uni.showToast({
              title: res.message || "创建失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:451", "创建失败:", error);
          uni.showToast({
            title: "创建失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 显示重命名对话框
      showRenameDialog(item) {
        if (!item || !item.name)
          return;
        uni.showModal({
          title: "重命名",
          editable: true,
          placeholderText: "请输入新名称",
          success: (res) => {
            if (res.confirm && res.content) {
              this.renameItem(item, res.content);
            }
          }
        });
      },
      // 重命名
      async renameItem(item, newName) {
        if (!item || !item.fullPath)
          return;
        let finalNewName = newName;
        if (item.type === "file" && !newName.endsWith(".md") && !newName.endsWith(".markdown")) {
          finalNewName = newName + ".md";
        }
        try {
          uni.showLoading({
            title: "重命名中..."
          });
          const res = await renameItem(item.fullPath, finalNewName);
          if (res.code === 200) {
            uni.showToast({
              title: "重命名成功",
              icon: "success"
            });
            this.loadContentList();
            this.refreshAllFiles();
          } else {
            uni.showToast({
              title: res.message || "重命名失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:506", "重命名失败:", error);
          uni.showToast({
            title: "重命名失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 确认删除
      confirmDelete(item) {
        if (!item || !item.name)
          return;
        const type = item.type === "folder" ? "文件夹" : "笔记";
        uni.showModal({
          title: "提示",
          content: `确定要删除${type}"${item.name}"吗？${item.type === "folder" ? "删除后无法恢复！" : ""}`,
          success: async (res) => {
            if (res.confirm) {
              await this.deleteItem(item);
            }
          }
        });
      },
      // 删除文件或文件夹
      async deleteItem(item) {
        if (!item || !item.fullPath)
          return;
        try {
          uni.showLoading({
            title: "删除中..."
          });
          const result = await deleteItem(item.fullPath);
          if (result.code === 200) {
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            this.loadContentList();
            this.refreshAllFiles();
          } else {
            uni.showToast({
              title: result.message || "删除失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:556", "删除失败:", error);
          uni.showToast({
            title: "删除失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 查看笔记详情
      async viewNote(note) {
        if (!note || !note.fullPath)
          return;
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const res = await getFileContent(note.fullPath);
          if (res.code === 200 && res.data) {
            uni.navigateTo({
              url: `/pages/index/node/noteDetail?filename=${encodeURIComponent(res.data.filename)}&content=${encodeURIComponent(res.data.content)}`
            });
          } else {
            uni.showToast({
              title: res.message || "读取失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/node.vue:587", "读取失败:", error);
          uni.showToast({
            title: "读取失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 编辑笔记
      editNote(note) {
        if (!note || !note.fullPath)
          return;
        uni.navigateTo({
          url: `/pages/index/node/noteEdit?filename=${encodeURIComponent(note.fullPath)}`
        });
      },
      // 格式化文件大小
      formatSize(bytes) {
        if (!bytes || bytes === 0)
          return "0 B";
        if (bytes < 1024)
          return bytes + " B";
        if (bytes < 1024 * 1024)
          return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
      },
      // 格式化时间
      formatTime(time) {
        if (!time)
          return "";
        try {
          const date = new Date(time);
          const now = /* @__PURE__ */ new Date();
          const diff = now - date;
          if (diff < 6e4)
            return "刚刚";
          if (diff < 36e5)
            return Math.floor(diff / 6e4) + "分钟前";
          if (date.toDateString() === now.toDateString()) {
            return `今天 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
          }
          if (date.getFullYear() === now.getFullYear()) {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
          }
          return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        } catch (e) {
          return "";
        }
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 头部 "),
      vue.createElementVNode("view", { class: "top" }, [
        vue.createElementVNode("text", { class: "title" }, "笔记"),
        vue.createElementVNode("view", { class: "actions" }, [
          vue.createElementVNode("view", {
            class: "file",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.showCreateFolderDialog && $options.showCreateFolderDialog(...args))
          }, [
            vue.createElementVNode("image", {
              class: "file-btn",
              src: _imports_0,
              mode: "aspectFill"
            }),
            vue.createElementVNode("text", null, "新建文件夹")
          ]),
          vue.createElementVNode("view", {
            class: "file",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.showCreateFileDialog && $options.showCreateFileDialog(...args))
          }, [
            vue.createElementVNode("image", {
              class: "file-btn",
              src: _imports_1,
              mode: "aspectFill"
            }),
            vue.createElementVNode("text", null, "新建笔记")
          ])
        ])
      ]),
      vue.createCommentVNode(" 面包屑导航 - 搜索模式下隐藏 "),
      $data.currentPath.length > 0 && !$data.isSearchMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "breadcrumb"
      }, [
        vue.createElementVNode("view", {
          class: "breadcrumb-item",
          onClick: _cache[2] || (_cache[2] = ($event) => $options.navigateToPath(-1))
        }, [
          vue.createElementVNode("text", null, "📁 根目录")
        ]),
        vue.createElementVNode("view", { class: "breadcrumb-separator" }, ">"),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.currentPath, (folder, idx) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "breadcrumb-item",
              key: idx,
              onClick: ($event) => $options.navigateToPath(idx)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(folder),
                1
                /* TEXT */
              ),
              idx < $data.currentPath.length - 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "breadcrumb-separator"
              }, ">")) : vue.createCommentVNode("v-if", true)
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", { class: "search-input-wrapper" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              type: "text",
              placeholder: "搜索全部笔记...",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.searchKeyword = $event),
              onConfirm: _cache[4] || (_cache[4] = (...args) => $options.searchNotes && $options.searchNotes(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "search-btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.searchNotes && $options.searchNotes(...args))
        }, "搜索")
      ]),
      vue.createCommentVNode(" 搜索模式提示 "),
      $data.isSearchMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "search-info"
      }, [
        vue.createElementVNode("text", { class: "search-info-text" }, [
          vue.createTextVNode(" 找到 "),
          vue.createElementVNode(
            "text",
            { class: "search-count" },
            vue.toDisplayString($options.searchResults.length),
            1
            /* TEXT */
          ),
          vue.createTextVNode(" 个相关笔记 ")
        ]),
        vue.createElementVNode("text", {
          class: "search-cancel",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.exitSearchMode && $options.exitSearchMode(...args))
        }, "返回全部")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 内容列表 "),
      vue.createElementVNode("view", { class: "note-list" }, [
        vue.createCommentVNode(" 加载状态 "),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : $options.displayItems.length === 0 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 空状态 "),
            vue.createElementVNode("view", { class: "empty-state" }, [
              vue.createElementVNode("image", {
                src: _imports_2,
                mode: "aspectFill",
                class: "empty-image"
              }),
              vue.createElementVNode(
                "text",
                { class: "empty-text" },
                vue.toDisplayString($data.isSearchMode ? "没有找到相关笔记~" : "暂无内容，点击新建吧~"),
                1
                /* TEXT */
              )
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 2 },
          [
            vue.createCommentVNode(" 内容列表 "),
            vue.createElementVNode("view", { class: "note-items" }, [
              vue.createCommentVNode(" 文件夹列表（搜索模式下不显示文件夹） "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($options.displayItems, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    {
                      key: "item-" + index
                    },
                    [
                      !$data.isSearchMode && item && item.type === "folder" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "folder-item",
                        onClick: ($event) => $options.enterFolder(item)
                      }, [
                        vue.createElementVNode("view", { class: "folder-info" }, [
                          vue.createElementVNode("view", { class: "folder-icon-wrapper" }, [
                            vue.createElementVNode("text", { class: "folder-icon" }, "📁")
                          ]),
                          vue.createElementVNode("view", { class: "folder-details" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "folder-name" },
                              vue.toDisplayString(item.name || ""),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "folder-count" },
                              vue.toDisplayString(item.fileCount || 0) + "个笔记",
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "folder-actions" }, [
                          vue.createElementVNode("text", {
                            class: "rename-btn",
                            onClick: vue.withModifiers(($event) => $options.showRenameDialog(item), ["stop"])
                          }, "重命名", 8, ["onClick"]),
                          vue.createElementVNode("text", {
                            class: "delete-btn",
                            onClick: vue.withModifiers(($event) => $options.confirmDelete(item), ["stop"])
                          }, "删除", 8, ["onClick"])
                        ])
                      ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                      vue.createCommentVNode(" 笔记列表（只显示 .md 文件） "),
                      item && item.type === "file" && $options.isMarkdownFile(item.name) ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "note-item",
                        onClick: ($event) => $options.viewNote(item)
                      }, [
                        vue.createCommentVNode(" 左侧：文件名 "),
                        vue.createElementVNode("view", { class: "note-left" }, [
                          vue.createElementVNode("view", { class: "note-icon-wrapper" }, [
                            vue.createElementVNode("text", { class: "note-icon" }, "📝")
                          ]),
                          vue.createElementVNode("view", { class: "note-name-wrapper" }, [
                            vue.createElementVNode("text", {
                              class: "note-name",
                              innerHTML: $data.isSearchMode ? $options.highlightKeyword($options.getNoteName(item.name)) : $options.getNoteName(item.name)
                            }, null, 8, ["innerHTML"]),
                            vue.createCommentVNode(" 搜索模式下显示文件所在路径 "),
                            $data.isSearchMode && item.displayPath ? (vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: 0,
                                class: "note-path"
                              },
                              vue.toDisplayString(item.displayPath),
                              1
                              /* TEXT */
                            )) : vue.createCommentVNode("v-if", true)
                          ])
                        ]),
                        vue.createCommentVNode(" 右侧：信息区域 "),
                        vue.createElementVNode("view", { class: "note-right" }, [
                          vue.createCommentVNode(" 上方：修改时间和文件大小 "),
                          vue.createElementVNode("view", { class: "note-meta-top" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "note-time" },
                              vue.toDisplayString($options.formatTime(item.modifyTime)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "note-size" },
                              vue.toDisplayString($options.formatSize(item.size)),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createCommentVNode(" 下方：编辑和删除按钮 "),
                          vue.createElementVNode("view", { class: "note-actions-bottom" }, [
                            vue.createElementVNode("text", {
                              class: "edit-btn",
                              onClick: vue.withModifiers(($event) => $options.editNote(item), ["stop"])
                            }, "编辑", 8, ["onClick"]),
                            vue.createElementVNode("text", {
                              class: "delete-btn",
                              onClick: vue.withModifiers(($event) => $options.confirmDelete(item), ["stop"])
                            }, "删除", 8, ["onClick"])
                          ])
                        ])
                      ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesIndexNodeNode = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-90be68da"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/node/node.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        filename: "",
        title: "",
        content: "",
        isEdit: false
      };
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
          uni.showLoading({ title: "加载中..." });
          const res = await getFileContent(this.filename);
          if (res.code === 200) {
            this.content = res.data.content;
            const lines = this.content.split("\n");
            const firstLine = lines[0];
            if (firstLine.startsWith("# ")) {
              this.title = firstLine.substring(2);
            } else {
              this.title = this.filename.split("/").pop().replace(/\.md$/, "");
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/noteEdit.vue:50", "加载失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      async saveNote() {
        if (!this.title && !this.content) {
          uni.showToast({
            title: "请输入内容",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({ title: "保存中..." });
          const fullContent = `# ${this.title}

${this.content}`;
          if (this.isEdit) {
            const res = await updateFile(this.filename, fullContent);
            if (res.code === 200) {
              uni.showToast({
                title: "保存成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            }
          } else {
            const fileName = this.title.replace(/[\\/:*?"<>|]/g, "") + ".md";
            const res = await createFile(fileName, fullContent, this.parentPath || "");
            if (res.code === 200) {
              uni.showToast({
                title: "创建成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/noteEdit.vue:98", "保存失败:", error);
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "editor-header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, "返回"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "title-input",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.title = $event),
            placeholder: "请输入标题"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.title]
        ]),
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.saveNote && $options.saveNote(...args))
        }, "保存")
      ]),
      vue.withDirectives(vue.createElementVNode(
        "textarea",
        {
          class: "editor-content",
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.content = $event),
          placeholder: "请输入内容..."
        },
        null,
        512
        /* NEED_PATCH */
      ), [
        [vue.vModelText, $data.content]
      ])
    ]);
  }
  const PagesIndexNodeNoteEdit = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-4dacbfbb"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/node/noteEdit.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        filename: "",
        title: "",
        content: "",
        htmlContent: "",
        loading: false
      };
    },
    onLoad(options) {
      formatAppLog("log", "at pages/index/node/noteDetail.vue:29", "noteDetail onLoad:", options);
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
        if (!this.filename)
          return;
        this.loading = true;
        try {
          uni.showLoading({ title: "加载中..." });
          const res = await getFileContent(this.filename);
          formatAppLog("log", "at pages/index/node/noteDetail.vue:46", "加载内容响应:", res);
          if (res && res.code === 200 && res.data) {
            this.content = res.data.content || "";
            this.parseContent();
          } else {
            this.htmlContent = "<p>暂无内容</p>";
            uni.showToast({
              title: (res == null ? void 0 : res.message) || "加载失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/node/noteDetail.vue:59", "加载失败:", error);
          this.htmlContent = "<p>加载失败</p>";
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
          uni.hideLoading();
        }
      },
      parseContent() {
        if (!this.content || this.content.trim() === "") {
          this.htmlContent = "<p>暂无内容</p>";
          this.title = this.filename ? this.filename.split("/").pop().replace(/\.md$/, "") : "笔记";
          return;
        }
        const lines = this.content.split("\n");
        const firstLine = lines[0] || "";
        if (firstLine.startsWith("# ")) {
          this.title = firstLine.substring(2).trim();
        } else {
          this.title = this.filename ? this.filename.split("/").pop().replace(/\.md$/, "") : "笔记";
        }
        let html = this.content;
        html = this.escapeHtml(html);
        html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
          return `<pre><code>${code.trim()}</code></pre>`;
        });
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
        html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
        html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
        html = html.replace(/\n/g, "<br/>");
        this.htmlContent = html;
      },
      // 转义 HTML 特殊字符
      escapeHtml(text) {
        if (!text)
          return "";
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
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
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "detail-header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, "返回"),
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          class: "edit-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.editNote && $options.editNote(...args))
        }, "编辑")
      ]),
      vue.createElementVNode("scroll-view", {
        class: "detail-content",
        "scroll-y": ""
      }, [
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading"
        }, "加载中...")) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "markdown-body",
          innerHTML: $data.htmlContent
        }, null, 8, ["innerHTML"]))
      ])
    ]);
  }
  const PagesIndexNodeNoteDetail = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-a1fa3479"], ["__file", "D:/AllProjects/uni-app/class-schedule/课程表/pages/index/node/noteDetail.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/index/teaching/teaching", PagesIndexTeachingTeaching);
  __definePage("pages/index/setting/setting", PagesIndexSettingSetting);
  __definePage("pages/webview/webview", PagesWebviewWebview);
  __definePage("pages/index/node/node", PagesIndexNodeNode);
  __definePage("pages/index/node/noteEdit", PagesIndexNodeNoteEdit);
  __definePage("pages/index/node/noteDetail", PagesIndexNodeNoteDetail);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/AllProjects/uni-app/class-schedule/课程表/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
