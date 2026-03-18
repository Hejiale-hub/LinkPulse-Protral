// src/api/user.js
import request from '../utils/request'
import { API_PATHS } from '../constants/api-paths'

// 登录接口
export const loginAPI = (data) => {
  return request({
    url: API_PATHS.user.login,
    method: 'post',
    data: data
  })
}

// 注册接口
export const registerAPI = (data) => {
  return request({
    url: API_PATHS.user.register,
    method: 'post',
    data: data
  })
}

// 创建 link code 接口
export const createLinkCodeAPI = (data) => {
  return request({
    url: API_PATHS.link.createCode,
    method: 'post',
    data: data
  })
}