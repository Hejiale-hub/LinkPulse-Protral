export const API_PATHS = {
  user: {
    login: '/user/login',
    register: '/user/register'
  },
  ai: {
    createChat: '/ai/createChat',
    chat: '/ai/chat',
    service: '/ai/service',
    pdf: '/ai/pdf',
    history: '/ai/history',
    historyDetail: '/ai/history/detail',
    historyDelete: '/ai/history/delete',
    historyTitle: '/ai/history/title'
  },
  link: {
    createCode: '/link/createCode',
    monitorList: '/link/monitorList',
    monitorDetailRecords: '/link/monitorDetailRecords',
    monitorTrend: '/link/monitorTrend',
    monitorProvinceDistribution: '/link/monitorProvinceDistribution',
    monitorLinkTitleDistribution: '/link/monitorLinkTitleDistribution',
    deleteByLinkIds: '/link/deleteByLinkIds'
  }
}