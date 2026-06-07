const http = require('http');
const fs = require('fs');
const path = require('path');
const busboy = require('busboy');
const db = require('./config/db');
const fileUtils = require('./utils/file');


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
        try {
            const [rows] = await db.query('SELECT * FROM course ORDER BY id');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: '获取课程列表成功',
                data: rows
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 500,
                message: '获取课程列表失败',
                error: err.message
            }));
        }
        return;
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
        return;
    }

    // ============== 课表数据接口 ==============

    // 获取课表数据（静态数据）
    if (req.url === '/api/get-course-data' && req.method === 'GET') {
        try {
            const courseData = require('./utils/courseParser').getCourseData();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: '获取课表数据成功',
                data: courseData
            }));
        } catch (err) {
            console.error('获取课表数据失败:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 500,
                message: '获取课表数据失败',
                error: err.message
            }));
        }
        return;
    }

    // 获取周次对应的课程（根据周数过滤）
    if (req.url.startsWith('/api/courses-by-week') && req.method === 'GET') {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const weekNum = parseInt(urlObj.searchParams.get('week') || '1');

            const courseData = require('./utils/courseParser').getCourseData();
            const filteredCourses = courseData.courses.filter(course => {
                return course.weekNum.includes(weekNum);
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: `获取第${weekNum}周课程成功`,
                data: {
                    week: weekNum,
                    courses: filteredCourses
                }
            }));
        } catch (err) {
            console.error('获取周次课程失败:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 500,
                message: '获取课程失败',
                error: err.message
            }));
        }
        return;
    }


    // ============== 笔记相关接口 ==============

    // 获取 node 文件夹下的所有文件（包括子目录）
    if (req.url === '/node' && req.method === 'GET') {
        try {
            const nodeDir = path.join(__dirname, 'node');

            // 确保 node 目录存在
            if (!fs.existsSync(nodeDir)) {
                fs.mkdirSync(nodeDir, { recursive: true });
            }

            const fileList = fileUtils.walkDir(nodeDir, nodeDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: '获取文件列表成功',
                data: fileList
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 500,
                message: '读取文件夹失败',
                error: err.message
            }));
        }
        return;
    }

    // 获取指定路径下的文件列表
    if (req.url.startsWith('/node/list') && req.method === 'GET') {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const dirPath = urlObj.searchParams.get('path') || '';

            const nodeDir = path.join(__dirname, 'node');
            const targetDir = dirPath ? path.join(nodeDir, dirPath) : nodeDir;

            // 安全检查
            if (!targetDir.startsWith(nodeDir)) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 403,
                    message: '禁止访问'
                }));
                return;
            }

            // 确保目录存在
            if (!fs.existsSync(targetDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 404,
                    message: '目录不存在'
                }));
                return;
            }

            const items = fs.readdirSync(targetDir);
            const result = [];

            for (const item of items) {
                const fullPath = path.join(targetDir, item);
                const stat = fs.statSync(fullPath);
                const relativePath = dirPath ? path.join(dirPath, item) : item;

                if (stat.isDirectory()) {
                    // 获取文件夹内的文件数量
                    const files = fs.readdirSync(fullPath);
                    const fileCount = files.filter(file => {
                        const filePath = path.join(fullPath, file);
                        return fs.statSync(filePath).isFile();
                    }).length;

                    result.push({
                        name: item,
                        fullPath: relativePath,
                        type: 'folder',
                        fileCount: fileCount,
                        modifyTime: stat.mtime.toISOString()
                    });
                } else {
                    const ext = item.split('.').pop().toLowerCase();
                    if (['md', 'markdown', 'txt', 'note'].includes(ext)) {
                        result.push({
                            name: item,
                            fullPath: relativePath,
                            type: 'file',
                            size: stat.size,
                            modifyTime: stat.mtime.toISOString()
                        });
                    }
                }
            }

            // 排序：文件夹在前，文件在后
            result.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: '获取目录内容成功',
                data: {
                    currentPath: dirPath,
                    items: result
                }
            }));
        } catch (err) {
            console.error('获取目录内容错误:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 500,
                message: '读取目录失败',
                error: err.message
            }));
        }
        return;
    }

    // 获取 node 文件夹下指定文件的内容
    if (req.url.startsWith('/node/content/') && req.method === 'GET') {
        const filename = decodeURIComponent(req.url.replace('/node/content/', ''));
        const filePath = path.join(__dirname, 'node', filename);

        // 安全检查：防止路径穿越攻击
        if (!filePath.startsWith(path.join(__dirname, 'node'))) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 403,
                message: '禁止访问'
            }));
            return;
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 404,
                message: '文件不存在'
            }));
            return;
        }

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '读取文件失败',
                    error: err.message
                }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: '获取文件内容成功',
                data: {
                    filename: filename,
                    content: data
                }
            }));
        });
        return;
    }

    // 创建文件夹
    if (req.url === '/node/folder' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { folderName, parentPath = '' } = JSON.parse(body);

                if (!folderName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '文件夹名称不能为空'
                    }));
                    return;
                }

                const nodeDir = path.join(__dirname, 'node');
                const targetDir = parentPath ? path.join(nodeDir, parentPath) : nodeDir;
                const folderPath = path.join(targetDir, folderName);

                // 安全检查
                if (!folderPath.startsWith(nodeDir)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 403,
                        message: '禁止访问'
                    }));
                    return;
                }

                // 检查文件夹是否已存在
                if (fs.existsSync(folderPath)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '文件夹已存在'
                    }));
                    return;
                }

                await fileUtils.createFolder(folderPath);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 200,
                    message: '文件夹创建成功',
                    data: {
                        folderName: folderName,
                        fullPath: parentPath ? path.join(parentPath, folderName) : folderName
                    }
                }));
            } catch (err) {
                console.error('创建文件夹错误:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '创建文件夹失败',
                    error: err.message
                }));
            }
        });
        return;
    }

    // 创建文件
    if (req.url === '/node/file' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { fileName, content = '', parentPath = '' } = JSON.parse(body);

                if (!fileName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '文件名不能为空'
                    }));
                    return;
                }

                const nodeDir = path.join(__dirname, 'node');
                const targetDir = parentPath ? path.join(nodeDir, parentPath) : nodeDir;
                const filePath = path.join(targetDir, fileName);

                // 确保目录存在
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // 安全检查
                if (!filePath.startsWith(nodeDir)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 403,
                        message: '禁止访问'
                    }));
                    return;
                }

                // 检查文件是否已存在
                if (fs.existsSync(filePath)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '文件已存在'
                    }));
                    return;
                }

                await fileUtils.createFile(filePath, content);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 200,
                    message: '文件创建成功',
                    data: {
                        fileName: fileName,
                        fullPath: parentPath ? path.join(parentPath, fileName) : fileName,
                        content: content
                    }
                }));
            } catch (err) {
                console.error('创建文件错误:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '创建文件失败',
                    error: err.message
                }));
            }
        });
        return;
    }

    // 更新文件内容
    if (req.url.startsWith('/node/file/') && req.method === 'PUT') {
        const filename = decodeURIComponent(req.url.replace('/node/file/', ''));
        const filePath = path.join(__dirname, 'node', filename);

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { content } = JSON.parse(body);

                // 安全检查
                if (!filePath.startsWith(path.join(__dirname, 'node'))) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 403,
                        message: '禁止访问'
                    }));
                    return;
                }

                // 检查文件是否存在
                if (!fs.existsSync(filePath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 404,
                        message: '文件不存在'
                    }));
                    return;
                }

                await fileUtils.updateFile(filePath, content);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 200,
                    message: '文件更新成功',
                    data: {
                        filename: filename,
                        content: content
                    }
                }));
            } catch (err) {
                console.error('更新文件错误:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '更新文件失败',
                    error: err.message
                }));
            }
        });
        return;
    }

    // 重命名文件或文件夹
    if (req.url === '/node/rename' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { oldPath: oldRelativePath, newName } = JSON.parse(body);

                if (!oldRelativePath || !newName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '参数不完整'
                    }));
                    return;
                }

                const nodeDir = path.join(__dirname, 'node');
                const oldPath = path.join(nodeDir, oldRelativePath);
                const newPath = path.join(path.dirname(oldPath), newName);

                // 安全检查
                if (!oldPath.startsWith(nodeDir) || !newPath.startsWith(nodeDir)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 403,
                        message: '禁止访问'
                    }));
                    return;
                }

                // 检查原文件是否存在
                if (!fs.existsSync(oldPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 404,
                        message: '文件或文件夹不存在'
                    }));
                    return;
                }

                // 检查新名称是否已存在
                if (fs.existsSync(newPath)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '同名文件或文件夹已存在'
                    }));
                    return;
                }

                await fileUtils.renameItem(oldPath, newPath);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 200,
                    message: '重命名成功',
                    data: {
                        oldPath: oldRelativePath,
                        newPath: path.relative(nodeDir, newPath)
                    }
                }));
            } catch (err) {
                console.error('重命名错误:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '重命名失败',
                    error: err.message
                }));
            }
        });
        return;
    }

    // 删除文件或文件夹
    if (req.url === '/node/delete' && req.method === 'DELETE') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { itemPath: relativePath } = JSON.parse(body);

                if (!relativePath) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 400,
                        message: '路径不能为空'
                    }));
                    return;
                }

                const nodeDir = path.join(__dirname, 'node');
                const targetPath = path.join(nodeDir, relativePath);

                // 安全检查
                if (!targetPath.startsWith(nodeDir)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 403,
                        message: '禁止访问'
                    }));
                    return;
                }

                // 检查是否存在
                if (!fs.existsSync(targetPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        code: 404,
                        message: '文件或文件夹不存在'
                    }));
                    return;
                }

                await fileUtils.deleteItem(targetPath);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 200,
                    message: '删除成功'
                }));
            } catch (err) {
                console.error('删除错误:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    code: 500,
                    message: '删除失败',
                    error: err.message
                }));
            }
        });
        return;
    }

    // ============== 测试接口 ==============

    if (req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Hello World',
            status: 'success'
        }));
        return;
    }

    // 处理 404 - 访问其他路径时返回
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        code: 404,
        error: '接口不存在'
    }));
})

server.listen(3000, () => {
    console.log('服务器已启动,访问http://localhost:3000');
    console.log('笔记接口:');
    console.log('  GET    /node              - 获取所有文件列表');
    console.log('  GET    /node/list?path=   - 获取指定目录内容');
    console.log('  GET    /node/content/     - 获取文件内容');
    console.log('  POST   /node/folder       - 创建文件夹');
    console.log('  POST   /node/file         - 创建文件');
    console.log('  PUT    /node/file/        - 更新文件内容');
    console.log('  PUT    /node/rename       - 重命名');
    console.log('  DELETE /node/delete       - 删除');
});