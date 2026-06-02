import request from "@/utils/request.js";
export function getHello() {
    return request({ url: '/test' });
}