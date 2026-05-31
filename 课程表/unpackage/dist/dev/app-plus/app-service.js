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
  const _imports_0$1 = "/static/index/tap/setting.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$4 = {
    data() {
      return {
        classScheduleName: [
          {
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
      };
    },
    onLoad() {
      this.getWeekData();
      this.initTimeSlots();
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
          url: "/pages/index/setting/setting"
        });
      },
      getWeekData() {
        const today = /* @__PURE__ */ new Date();
        const todayDayOfWeek = today.getDay();
        const monday = new Date(today);
        const diff = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
        monday.setDate(today.getDate() + diff);
        const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        this.weekList = weekDays.map((name, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return {
            name,
            // 周几名称
            date: `${month}-${day}`
            // 日期
          };
        });
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
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
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
                src: _imports_0$1,
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
            vue.createElementVNode("text", { class: "time-week-num" }, "14"),
            vue.createElementVNode("text", { class: "time-week-text" }, "周")
          ]),
          vue.createCommentVNode(" 显示日期和星期几 "),
          vue.createElementVNode("view", { class: "time-data" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.weekList, (day, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "day-item",
                  key: index
                }, [
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
                ]);
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
        vue.createCommentVNode(" 主体部分 "),
        vue.createElementVNode("view", { class: "body" }, [
          vue.createCommentVNode(" 显示时间 "),
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
          vue.createCommentVNode(" 显示课程 "),
          vue.createElementVNode("view", { class: "body-course" })
        ]),
        vue.createCommentVNode(" 下一周，上一周 "),
        vue.createElementVNode("view", { class: "nav-btn" }, [
          vue.createElementVNode("view", { class: "btn-last" }, [
            vue.createElementVNode("text", { class: "btn-text" }, "上一周")
          ]),
          vue.createElementVNode("view", { class: "btn-this" }, [
            vue.createElementVNode("text", { class: "btn-text" }, "本周")
          ]),
          vue.createElementVNode("view", { class: "btn-next" }, [
            vue.createElementVNode("text", { class: "btn-text" }, "下一周")
          ])
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/AllProjects/uni-app/课程表/pages/index/index.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {};
    },
    methods: {}
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesIndexTeachingTeaching = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/AllProjects/uni-app/课程表/pages/index/teaching/teaching.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {};
    },
    methods: {}
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesIndexNoteNote = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/AllProjects/uni-app/课程表/pages/index/note/note.vue"]]);
  const _imports_0 = "/static/setting/file.png";
  const _imports_1 = "/static/setting/edu.png";
  const _sfc_main$1 = {
    data() {
      return {};
    },
    methods: {}
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
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
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.importFromFile && _ctx.importFromFile(...args))
          }, [
            vue.createElementVNode("view", { class: "option-left" }, [
              vue.createElementVNode("image", {
                src: _imports_0,
                mode: "aspectFit",
                class: "option-icon"
              }),
              vue.createElementVNode("view", { class: "option-info" }, [
                vue.createElementVNode("text", { class: "option-title" }, "文件导入")
              ])
            ])
          ]),
          vue.createCommentVNode(" 教务导入 "),
          vue.createElementVNode("view", {
            class: "option-item",
            onClick: _cache[1] || (_cache[1] = (...args) => _ctx.importFromEdu && _ctx.importFromEdu(...args))
          }, [
            vue.createElementVNode("view", { class: "option-left" }, [
              vue.createElementVNode("image", {
                src: _imports_1,
                mode: "aspectFit",
                class: "option-icon"
              }),
              vue.createElementVNode("view", { class: "option-info" }, [
                vue.createElementVNode("text", { class: "option-title" }, "教务导入")
              ])
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesIndexSettingSetting = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-ad249183"], ["__file", "D:/AllProjects/uni-app/课程表/pages/index/setting/setting.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/index/teaching/teaching", PagesIndexTeachingTeaching);
  __definePage("pages/index/note/note", PagesIndexNoteNote);
  __definePage("pages/index/setting/setting", PagesIndexSettingSetting);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
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
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/AllProjects/uni-app/课程表/App.vue"]]);
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
