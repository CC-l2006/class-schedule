const http = require('http')
const fs = require('fs')
const path = require('path')
const db = require('./config/db')
const express = require('express');
const cors = require('cors');
const file = require('./utils/file')

const server = http.createServer(async (req, res) => {

    // 跨域处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ============== 课程相关接口 ==============

    // 链接数据库接口
    if (req.url === '/course' && req.method === 'GET') {
        // 异步获取
        const [rows] = await db.query('SELECT * FROM course ORDER BY id');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            code: 200,
            message: '获取课程列表成功',
            data: rows
        }));
    }

    // 图片文件
    if (req.url.startsWith('/course/') && req.method === 'GET') {
        const filename = req.url.replace('/course/', '');
        const filePath = path.join(__dirname, 'course', filename);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('图片不存在');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'image/avif' });
            res.end(data);
        });
    }


    // ============== 笔记相关接口 ==============

    
    // ============== 测试接口 ==============

    else if (req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Hello World',
            status: 'success'
        }));
    }
    else {
        // 处理 404 - 访问其他路径时返回
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: '接口不存在'
        }));
    }
})

server.listen(3000, () => {
    console.log('服务器已启动,访问http://localhost:3000');
})