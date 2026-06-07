const fs = require('fs')
const path = require('path')

// 递归获取目录下所有文件
function walkDir(dir, basePath) {
    const results = [];
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.relative(basePath, fullPath);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // 递归读取子目录
            results.push({
                name: relativePath,
                isDirectory: true,
                children: walkDir(fullPath, basePath)
            });
        } else {
            results.push({
                name: relativePath,
                size: stat.size,
                isDirectory: false,
                modifyTime: stat.mtime.toISOString()
            });
        }
    }
    return results;
}

// 获取目录结构（用于文件夹视图）
function getDirectoryStructure(dir, basePath) {
    const results = [];
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.relative(basePath, fullPath);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results.push({
                name: relativePath,
                isDirectory: true,
                modifyTime: stat.mtime.toISOString()
            });
        } else {
            results.push({
                name: relativePath,
                size: stat.size,
                isDirectory: false,
                modifyTime: stat.mtime.toISOString()
            });
        }
    }
    return results;
}

// 创建文件夹
function createFolder(folderPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, path: folderPath });
            }
        });
    });
}

// 创建文件
function createFile(filePath, content = '') {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, 'utf-8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, path: filePath });
            }
        });
    });
}

// 重命名文件或文件夹
function renameItem(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, oldPath, newPath });
            }
        });
    });
}

// 删除文件或文件夹
function deleteItem(itemPath) {
    return new Promise((resolve, reject) => {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            // 递归删除文件夹
            fs.rm(itemPath, { recursive: true, force: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true, path: itemPath });
                }
            });
        } else {
            // 删除文件
            fs.unlink(itemPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true, path: itemPath });
                }
            });
        }
    });
}

// 更新文件内容
function updateFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, 'utf-8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, path: filePath });
            }
        });
    });
}

// 检查路径是否存在
function checkPathExists(filePath) {
    return fs.existsSync(filePath);
}

// 获取文件信息
function getFileInfo(filePath) {
    const stat = fs.statSync(filePath);
    return {
        name: path.basename(filePath),
        size: stat.size,
        modifyTime: stat.mtime.toISOString(),
        isDirectory: stat.isDirectory()
    };
}

module.exports = {
    walkDir,
    getDirectoryStructure,
    createFolder,
    createFile,
    renameItem,
    deleteItem,
    updateFile,
    checkPathExists,
    getFileInfo
};