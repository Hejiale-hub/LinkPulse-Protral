# 在线教育平台后端接口文档

本文档用于对齐前后端联调。当前前端默认通过 Vite 代理请求 `/api` 前缀，实际后端可部署在网关后。

## 1. 通用约定

### 1.1 Base URL
- 开发环境前端请求前缀: `/api`
- 网关示例: `http://localhost:10010`

### 1.2 认证方式
- Header: `Authorization: Bearer <token>`
- token 获取方式: 登录接口返回 `data.token`

### 1.3 统一响应结构

```json
{
  "code": 1,
  "msg": "ok",
  "data": {}
}
```

- `code = 1` 表示业务成功
- `code != 1` 表示业务失败（前端会统一提示 `msg`）

### 1.4 通用错误码建议
- `40001`: 参数校验失败
- `40004`: 资源不存在
- `40100`: 未登录/Token 无效
- `40300`: 无权限
- `50000`: 服务器内部错误

## 2. 用户与认证模块

### 2.1 登录
- Method: `POST`
- Path: `/user/login`
- Auth: 否

Request:
```json
{
  "username": "admin",
  "password": "123456"
}
```

Response:
```json
{
  "code": 1,
  "msg": "登录成功",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "username": "admin",
      "phone": "18800000000",
      "avatar": "https://..."
    }
  }
}
```

### 2.2 注册
- Method: `POST`
- Path: `/user/register`
- Auth: 否

Request:
```json
{
  "phone": "18800000000",
  "password": "123456",
  "code": "123456"
}
```

Response:
```json
{
  "code": 1,
  "msg": "注册成功",
  "data": {
    "userId": 1001
  }
}
```

### 2.3 发送验证码
- Method: `POST`
- Path: `/user/sendCode`
- Auth: 否

Request:
```json
{
  "phone": "18800000000"
}
```

Response:
```json
{
  "code": 1,
  "msg": "发送成功",
  "data": null
}
```

### 2.4 获取当前用户信息
- Method: `GET`
- Path: `/user/info`
- Auth: 是

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": {
    "id": 1,
    "username": "admin",
    "phone": "18800000000",
    "avatar": "https://..."
  }
}
```

### 2.5 退出登录
- Method: `POST`
- Path: `/user/logout`
- Auth: 是

Response:
```json
{
  "code": 1,
  "msg": "退出成功",
  "data": null
}
```

## 3. 课程模块

### 3.1 获取课程列表（支持筛选/排序）
- Method: `GET`
- Path: `/courses`
- Auth: 否

Query:
- `keyword`: string，可选，关键词（标题/讲师/标签）
- `category`: string，可选，分类（如 `Frontend`）
- `level`: string，可选，难度（`Beginner|Intermediate|Advanced`）
- `sortBy`: string，可选，`popular|rating|priceAsc|priceDesc`
- `page`: number，可选
- `pageSize`: number，可选

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": [
    {
      "id": 101,
      "title": "Vue 3 From Zero to Production",
      "subtitle": "Build real-world apps with Vue Router and composables",
      "instructor": "Lina Hartono",
      "category": "Frontend",
      "level": "Beginner",
      "duration": "18h 20m",
      "lessons": 64,
      "students": 14320,
      "rating": 4.9,
      "price": 59,
      "cover": "https://...",
      "tags": ["Vue", "Router"]
    }
  ]
}
```

### 3.2 获取课程筛选项
- Method: `GET`
- Path: `/courses/filters`
- Auth: 否

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": {
    "categories": ["Frontend", "Programming", "Design", "Business", "Language"],
    "levels": ["Beginner", "Intermediate", "Advanced"]
  }
}
```

### 3.3 获取课程详情
- Method: `GET`
- Path: `/courses/{id}`
- Auth: 否

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": {
    "id": 101,
    "title": "Vue 3 From Zero to Production",
    "subtitle": "Build real-world apps with Vue Router and composables",
    "instructor": "Lina Hartono",
    "category": "Frontend",
    "level": "Beginner",
    "duration": "18h 20m",
    "lessons": 64,
    "students": 14320,
    "rating": 4.9,
    "price": 59,
    "cover": "https://...",
    "goals": ["..."],
    "syllabus": ["..."]
  }
}
```

### 3.4 获取首页推荐课程
- Method: `GET`
- Path: `/courses/featured`
- Auth: 否

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": [
    {
      "id": 101,
      "title": "Vue 3 From Zero to Production"
    }
  ]
}
```

### 3.5 获取平台统计
- Method: `GET`
- Path: `/platform/stats`
- Auth: 否

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": {
    "totalCourses": 120,
    "totalStudents": 98560,
    "averageRating": 4.8
  }
}
```

## 4. 学习中心模块

### 4.1 获取我的课程
- Method: `GET`
- Path: `/learning/courses`
- Auth: 是

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": [
    {
      "id": 101,
      "title": "Vue 3 From Zero to Production",
      "subtitle": "Build real-world apps with Vue Router and composables",
      "cover": "https://...",
      "progress": 30
    }
  ]
}
```

### 4.2 加入学习
- Method: `POST`
- Path: `/learning/enroll`
- Auth: 是

Request:
```json
{
  "courseId": 101
}
```

Response:
```json
{
  "code": 1,
  "msg": "加入成功",
  "data": null
}
```

### 4.3 更新学习进度
- Method: `PUT`
- Path: `/learning/progress`
- Auth: 是

Request:
```json
{
  "courseId": 101,
  "progress": 40
}
```

Response:
```json
{
  "code": 1,
  "msg": "更新成功",
  "data": null
}
```

### 4.4 获取学习总览（个人中心统计）
- Method: `GET`
- Path: `/learning/overview`
- Auth: 是

Response:
```json
{
  "code": 1,
  "msg": "ok",
  "data": {
    "enrolledCount": 3,
    "averageProgress": 42,
    "learnedHours": 28
  }
}
```

## 5. 数据字段说明

### 5.1 Course（课程对象）
- `id`: number
- `title`: string
- `subtitle`: string
- `instructor`: string
- `category`: string
- `level`: string
- `duration`: string
- `lessons`: number
- `students`: number
- `rating`: number
- `price`: number
- `cover`: string
- `tags`: string[]
- `goals`: string[]（详情页用）
- `syllabus`: string[]（详情页用）

### 5.2 LearningCourse（我的学习课程对象）
- `id`: number（课程 ID）
- `title`: string
- `subtitle`: string
- `cover`: string
- `progress`: number（0-100）

## 6. 联调建议
- 所有写操作接口建议幂等：重复加入课程返回成功但不重复插入。
- `progress` 建议后端做范围保护：小于 0 置 0，大于 100 置 100。
- 建议后端为课程列表返回分页结构（后续可扩展）：
  - `data.list`
  - `data.total`
  - `data.page`
  - `data.pageSize`
- 若后端暂未完成全部接口，可先实现以下最小闭环：
  1. `/user/login`
  2. `/user/info`
  3. `/courses`
  4. `/courses/{id}`
  5. `/learning/courses`
