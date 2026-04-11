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
 * 请求参数：
 * {
 *   pageNo: number,            // 页码，从 1 开始
 *   pageSize: number,          // 每页条数
 *   startDate?: string,        // 可选，yyyy-MM-dd
 *   endDate?: string,          // 可选，yyyy-MM-dd
 *   linkTitleKeyword?: string, // 可选，标题模糊查询
 *   linkCodeKeyword?: string,  // 可选，linkCode 模糊查询
 *   originalUrlKeyword?: string,// 可选，原始链接模糊查询
 *   regionKeyword?: string     // 可选，地区模糊查询（匹配 province/city）
 * }
 *
 * 返回 data 格式：
 * {
 *   total: number,
 *   pageNo: number,
 *   pageSize: number,
 *   list: Array<{
 *     linkCode: string,         // link 短码
 *     linkTitle: string,        // 链接标题
 *     originalUrl: string,      // 原始链接
 *     clickCount: number,       // 总点击次数
 *     topProvince?: string,     // 可选，列表展示用
 *     latestClickTime?: string, // 可选，列表展示用
 *     detailTotal?: number      // 可选，该 link 的明细总条数
 *   }>
 * }
 */
export const getLinkMonitorListAPI = (params) => {
  return request({
    url: API_PATHS.link.monitorList,
    method: 'get',
    params
  })
}

/**
 * 获取某个 linkCode 的点击明细（按需加载 + 分页）
 *
 * 请求：GET /link/monitorDetailRecords
 * 请求参数：
 * {
 *   linkCode: string,
 *   pageNo: number,
 *   pageSize: number,
 *   startDate?: string,
 *   endDate?: string,
 *   linkTitleKeyword?: string,
 *   linkCodeKeyword?: string,
 *   originalUrlKeyword?: string,
 *   regionKeyword?: string
 * }
 *
 * 返回 data：
 * {
 *   total: number,
 *   pageNo: number,
 *   pageSize: number,
 *   list: Array<{
 *     ip: string,
 *     province: string,
 *     city: string,
 *     ua: string,
 *     os: string,
 *     browser: string,
 *     clickTime: string
 *   }>
 * }
 */
export const getLinkMonitorDetailRecordsAPI = (params) => {
  return request({
    url: API_PATHS.link.monitorDetailRecords,
    method: 'get',
    params
  })
}

/**
 * 监控趋势图（折线图）
 *
 * 请求：GET /link/monitorTrend
 * 请求参数：
 * {
 *   startDate: string,          // yyyy-MM-dd
 *   endDate: string,            // yyyy-MM-dd
 *   granularity: 'day' | 'hour',// 时间粒度
 *   linkTitleKeyword?: string,
 *   linkCodeKeyword?: string,
 *   originalUrlKeyword?: string,
 *   regionKeyword?: string
 * }
 *
 * 返回 data：
 * Array<{
 *   time: string,               // 例如 2026-03-19 或 2026-03-19 14:00
 *   clicks: number
 * }>
 */
export const getMonitorTrendAPI = (params) => {
  return request({
    url: API_PATHS.link.monitorTrend,
    method: 'get',
    params
  })
}

/**
 * 省份分布图（饼图）
 *
 * 请求：GET /link/monitorProvinceDistribution
 * 请求参数：
 * {
 *   startDate?: string,         // 可选 yyyy-MM-dd
 *   endDate?: string,           // 可选 yyyy-MM-dd
 *   linkTitleKeyword?: string,
 *   linkCodeKeyword?: string,
 *   originalUrlKeyword?: string,
 *   regionKeyword?: string
 * }
 *
 * 返回 data：
 * Array<{
 *   province: string,
 *   clicks: number
 * }>
 */
export const getMonitorProvinceDistributionAPI = (params) => {
  return request({
    url: API_PATHS.link.monitorProvinceDistribution,
    method: 'get',
    params
  })
}

/**
 * 链接标题点击分布（饼图）
 *
 * 请求：GET /link/monitorLinkTitleDistribution
 * 请求参数：
 * {
 *   startDate?: string,
 *   endDate?: string,
 *   linkTitleKeyword?: string,
 *   linkCodeKeyword?: string,
 *   originalUrlKeyword?: string,
 *   regionKeyword?: string,
 *   topN?: number // 3-10
 * }
 *
 * 返回 data：
 * Array<{
 *   linkTitle: string,
 *   clicks: number
 * }>
 */
export const getMonitorLinkTitleDistributionAPI = (params) => {
  return request({
    url: API_PATHS.link.monitorLinkTitleDistribution,
    method: 'get',
    params
  })
}

/**
 * 批量删除 linkCode（按 linkId）
 *
 * 请求：DELETE /link/deleteByLinkIds
 * 请求体：
 * {
 *   linkIds: string[]
 * }
 */
export const deleteLinksByIdsAPI = (linkIds) => {
  return request({
    url: API_PATHS.link.deleteByLinkIds,
    method: 'delete',
    data: { linkIds }
  })
}
