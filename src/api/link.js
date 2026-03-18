import request from '../utils/request'
import { API_PATHS } from '../constants/api-paths'

// 创建 link code 接口
export const createLinkCodeAPI = (data) => {
  return request({
    url: API_PATHS.link.createCode,
    method: 'post',
    data: data
  })
}

/**
 * 获取当前用户的监控列表
 *
 * 请求：GET /link/monitorList
 * 请求头：token（自动注入）
 * 请求参数：无（后端通过 token 识别用户）
 *
 * 返回 data 格式：
 * Array<{
 *   linkCode: string,           // link 短码
 *   linkTitle: string,          // 链接标题
 *   originalUrl: string,        // 原始链接
 *   clickCount: number,         // 总点击次数
 *   clickRecords: Array<{
 *     ip: string,               // 访问者 IP
 *     province: string,         // 省份（无值时为 "-"）
 *     city: string,             // 城市（无值时为 "-"）
 *     ua: string,               // User-Agent 原始字符串（无值时为 "-"）
 *     os: string,               // 操作系统（无值时为 "-"）
 *     browser: string,          // 浏览器类型（无值时为 "-"）
 *     clickTime: string         // 点击时间（ISO 字符串 或 yyyy-MM-dd HH:mm:ss）
 *   }>
 * }>
 */
export const getLinkMonitorListAPI = () => {
  return request({
    url: API_PATHS.link.monitorList,
    method: 'get'
  })
}
