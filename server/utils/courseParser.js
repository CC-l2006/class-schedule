// utils/courseParser.js
// 根据提供的课表文档内容，直接返回结构化的 JSON 数据

function getCourseData() {
    // 从文档中提取的完整课表数据
    const courses = [
        // 星期一 第1-2节
        {
            name: "鸿蒙应用开发",
            dayOfWeek: 1,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 1,
            teacher: "黄涛",
            location: "南区综合楼518鲲鹏系统实训室"
        },
        // 星期一 第3-4节
        {
            name: "鸿蒙应用开发",
            dayOfWeek: 1,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 3,
            teacher: "黄涛",
            location: "南区综合楼518鲲鹏系统实训室"
        },
        // 星期一 第5-6节（鸿蒙）
        {
            name: "鸿蒙应用开发",
            dayOfWeek: 1,
            weekNum: [3,4,5,6,7,8,9,10,11,12,14,15,16,17,18],
            timeSlot: 5,
            teacher: "黄涛",
            location: "南区综合楼518鲲鹏系统实训室"
        },
        // 星期一 第5-6节（形势与政策）
        {
            name: "形势与政策（四）",
            dayOfWeek: 1,
            weekNum: [13],
            timeSlot: 5,
            teacher: "王谦,敖凌航",
            location: "南区2号教学楼2-2-101智慧教室"
        },
        // 星期一 第7-8节
        {
            name: "形势与政策（四）",
            dayOfWeek: 1,
            weekNum: [13],
            timeSlot: 7,
            teacher: "王谦,敖凌航",
            location: "南区2号教学楼2-2-101智慧教室"
        },
        
        // 星期二 第1-2节
        {
            name: "动效设计",
            dayOfWeek: 2,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
            timeSlot: 1,
            teacher: "雷菁",
            location: "南区综合楼306智能软件实训室三"
        },
        // 星期二 第3-4节
        {
            name: "动效设计",
            dayOfWeek: 2,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
            timeSlot: 3,
            teacher: "雷菁",
            location: "南区综合楼306智能软件实训室三"
        },
        // 星期二 第5-6节
        {
            name: "App跨平台开发技术",
            dayOfWeek: 2,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 5,
            teacher: "张兆哲",
            location: "南区综合楼516鲲鹏计算实训室(1+X)"
        },
        // 星期二 第7-8节
        {
            name: "App跨平台开发技术",
            dayOfWeek: 2,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 7,
            teacher: "张兆哲",
            location: "南区综合楼516鲲鹏计算实训室(1+X)"
        },
        
        // 星期三 第1-2节
        {
            name: "后端程序开发",
            dayOfWeek: 3,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 1,
            teacher: "黎阳",
            location: "南区综合楼402平面设计实训室"
        },
        // 星期三 第3-4节
        {
            name: "后端程序开发",
            dayOfWeek: 3,
            weekNum: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            timeSlot: 3,
            teacher: "黎阳",
            location: "南区综合楼402平面设计实训室"
        },
        // 星期三 第5-6节（形势与政策）
        {
            name: "形势与政策（四）",
            dayOfWeek: 3,
            weekNum: [13],
            timeSlot: 5,
            teacher: "王谦,敖凌航",
            location: "南区2号教学楼2-2-102智慧教室"
        },
        // 星期三 第7-8节（形势与政策）
        {
            name: "形势与政策（四）",
            dayOfWeek: 3,
            weekNum: [13],
            timeSlot: 7,
            teacher: "王谦,敖凌航",
            location: "南区2号教学楼2-2-102智慧教室"
        },
        // 星期三 第7-8节（习近平新时代中国特色社会主义思想概论）
        {
            name: "习近平新时代中国特色社会主义思想概论",
            dayOfWeek: 3,
            weekNum: [3,4,5,6,7,8,9,10],
            timeSlot: 7,
            teacher: "张利云",
            location: "南区2号教学楼2-2-105智慧教室"
        },
        // 星期三 第7-8节（大学生创新创业）
        {
            name: "大学生创新创业（三）",
            dayOfWeek: 3,
            weekNum: [14,15,16,17],
            timeSlot: 7,
            teacher: "潘中锋",
            location: "南区2号教学楼2-2-105智慧教室"
        },
        
        // 星期四 第3-4节
        {
            name: "习近平新时代中国特色社会主义思想概论",
            dayOfWeek: 4,
            weekNum: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
            timeSlot: 3,
            teacher: "张利云",
            location: "南区2号教学楼2-2-105智慧教室"
        },
        // 星期四 第5-6节（动效设计）
        {
            name: "动效设计",
            dayOfWeek: 4,
            weekNum: [12],
            timeSlot: 5,
            teacher: "雷菁",
            location: "南区综合楼306智能软件实训室三"
        },
        // 星期四 第5-6节（鸿蒙应用开发）
        {
            name: "鸿蒙应用开发",
            dayOfWeek: 4,
            weekNum: [17],
            timeSlot: 5,
            teacher: "黄涛",
            location: "南区综合楼518鲲鹏系统实训室"
        },
        // 星期四 第7-8节（动效设计）
        {
            name: "动效设计",
            dayOfWeek: 4,
            weekNum: [12],
            timeSlot: 7,
            teacher: "雷菁",
            location: "南区综合楼306智能软件实训室三"
        },
        
        // 星期五 第1-2节
        {
            name: "软件测试高级",
            dayOfWeek: 5,
            weekNum: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
            timeSlot: 1,
            teacher: "张喻平",
            location: "南区综合楼310智能软件实训室四"
        },
        // 星期五 第3-4节
        {
            name: "软件测试高级",
            dayOfWeek: 5,
            weekNum: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
            timeSlot: 3,
            teacher: "张喻平",
            location: "南区综合楼310智能软件实训室四"
        },
        // 星期五 第5-6节（国家安全教育）
        {
            name: "国家安全教育（四）",
            dayOfWeek: 5,
            weekNum: [13],
            timeSlot: 5,
            teacher: "王晶",
            location: "南区2号教学楼2-2-105智慧教室"
        },
        // 星期五 第5-6节（软件测试高级）
        {
            name: "软件测试高级",
            dayOfWeek: 5,
            weekNum: [2,3,4,5,6,7,8,9,10,11,12,14,15,16,17],
            timeSlot: 5,
            teacher: "张喻平",
            location: "南区综合楼310智能软件实训室四"
        },
        // 星期五 第7-8节（国家安全教育）
        {
            name: "国家安全教育（四）",
            dayOfWeek: 5,
            weekNum: [13],
            timeSlot: 7,
            teacher: "王晶",
            location: "南区2号教学楼2-2-105智慧教室"
        },
        // 星期五 第7-8节（软件测试高级）
        {
            name: "软件测试高级",
            dayOfWeek: 5,
            weekNum: [7],
            timeSlot: 7,
            teacher: "张喻平",
            location: "南区综合楼310智能软件实训室四"
        }
    ];
    
    return {
        name: "大二下",
        student: "刘振宇",
        semester: "2025-2026-2",
        courses: courses
    };
}

module.exports = {
    getCourseData
};