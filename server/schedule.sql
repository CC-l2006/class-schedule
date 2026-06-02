/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80044
 Source Host           : localhost:3306
 Source Schema         : schedule

 Target Server Type    : MySQL
 Target Server Version : 80044
 File Encoding         : 65001

 Date: 02/06/2026 12:51:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `CourseName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ReleaseDate` datetime NULL DEFAULT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `view count` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `comment` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `imgurl` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course
-- ----------------------------
INSERT INTO `course` VALUES (1, '黑马程序员Node.js全套入门教程，nodejs新教程含es6模块化+npm+express+webpack+promise等_Nodejs实战案例详解', '2021-12-22 00:00:00', '黑马程序员', 'https://www.bilibili.com/video/BV1a34y167AZ/?spm_id_from=333.337.search-card.all.click&vd_source=657da637ad4d38e01bfc382ac6a0d680', '2939000', '62000', '/course/1.avif');
INSERT INTO `course` VALUES (2, '全网首发黑马程序员鸿蒙 HarmonyOS NEXT星河版零基础入门到实战，零基础也能快速入门鸿蒙开发教程', '2024-02-04 00:00:00', '黑马程序员', 'https://www.bilibili.com/video/BV14t421W7pA/?spm_id_from=333.337.search-card.all.click&vd_source=657da637ad4d38e01bfc382ac6a0d680', '1057000', '13000', '/course/2.avif');
INSERT INTO `course` VALUES (3, '【AE教程】100集（全）从零开始学Adobe After Effect软件基础（2026新手入门实用版）AE特效2026零基础入门教程！！！', '2026-05-29 00:00:00', 'PR-AE-C4D教程\r\n', 'https://www.bilibili.com/video/BV1aGVh6kEd9/?spm_id_from=333.337.search-card.all.click&vd_source=657da637ad4d38e01bfc382ac6a0d680', '1902', '24', '/course/3.avif');
INSERT INTO `course` VALUES (4, '黑马程序员前端项目uniapp小兔鲜儿微信小程序项目视频教程，基于Vue3+Ts+Pinia+uni-app的最新组合技术栈开发的电商业务全流程', '2023-08-08 00:00:00', '黑马程序员', 'https://www.bilibili.com/video/BV1Bp4y1379L/?spm_id_from=333.337.top_right_bar_window_custom_collection.content.click&vd_source=657da637ad4d38e01bfc382ac6a0d680', '937000', '12000', '/course/4.avif');
INSERT INTO `course` VALUES (5, '黑马程序员软件测试视频教程，软件测试基础入门到项目实战（涵盖软件测试基础+黑马头条项目实战）', '2022-01-12 00:00:00', '黑马程序员', 'https://www.bilibili.com/video/BV1TP4y1J7BD/?spm_id_from=333.337.search-card.all.click&vd_source=657da637ad4d38e01bfc382ac6a0d680', '2348000', '29000', '/course/5.avif');

SET FOREIGN_KEY_CHECKS = 1;
