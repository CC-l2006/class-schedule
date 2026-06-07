# 课程表
### 软件介绍

#### 首页

点击右上角设置选择开学时间

目前没有教务系统导入和文件导入的功能，占时将课程数据存储到后端根目录下server\utils\courseParser.js文件中

在下方可以查看上周下周的课程

#### 教学

在教学中可以观看教学视频，webview页面，数据来源后端的数据库文件server\schedule.sql



#### 笔记

笔记文件存储在后端服务器server\node目录下，支持新建笔记，查看笔记，新建文件夹，搜索笔记，删除功能

### 后端

server\config文件夹下的db.js用于链接数据库，需要改成你的mysql密码

server\course文件夹下存储的是课程中的图片

server\node用于存储笔记

server\utils用于存储方法

server\utils\courseParser.js存储课程数据

server.js为接口

### 前端

static存储图标等文件

utils工具类，根目录下config.js用于获取后端接口，utils\request.js封装方法，其余为接口







