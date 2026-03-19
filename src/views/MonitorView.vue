<template>
  <div class="monitor-page">
    <div v-if="!isLoggedIn" class="empty-state center-block">
      <h2>Login Required</h2>
      <p>Please login to view your link monitoring data.</p>
      <router-link to="/login" class="btn-primary">Go to Login</router-link>
    </div>

    <template v-else>
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-label">Total Links</span>
          <span class="stat-value">{{ summary.totalLinks }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Clicks</span>
          <span class="stat-value">{{ summary.totalClicks }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Top Province</span>
          <span class="stat-value small">{{ summary.topProvince || '-' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Latest Activity</span>
          <span class="stat-value small">{{ summary.latestActivity || '-' }}</span>
        </div>
      </div>

      <section class="advanced-filter">
        <header class="filter-header">
          <div class="filter-title-wrap">
            <h3>Advanced Filters</h3>
            <span class="filter-meta">{{ activeFilterCount }} active</span>
          </div>
          <button class="filter-toggle" @click="isFilterExpanded = !isFilterExpanded">
            {{ isFilterExpanded ? 'Collapse' : 'Expand' }}
          </button>
        </header>

        <div v-show="isFilterExpanded" class="filter-content">
          <div class="quick-range">
            <button class="range-btn" :class="{ active: filters.preset === '7d' }" @click="setPresetRange('7d')">Last 7 Days</button>
            <button class="range-btn" :class="{ active: filters.preset === '30d' }" @click="setPresetRange('30d')">Last 30 Days</button>
            <button class="range-btn" :class="{ active: filters.preset === 'all' }" @click="setPresetRange('all')">All</button>
          </div>

          <div class="filter-inputs">
            <input type="date" v-model="filters.startDate" class="filter-date" @change="handleDateManualChange" />
            <span class="date-sep">~</span>
            <input type="date" v-model="filters.endDate" class="filter-date" @change="handleDateManualChange" />
            <input
              v-model.trim="filters.titleKeyword"
              type="text"
              class="filter-keyword"
              placeholder="Search Title"
              @keydown.enter="applyFilters"
            />
            <input
              v-model.trim="filters.linkCodeKeyword"
              type="text"
              class="filter-keyword"
              placeholder="Search LinkCode"
              @keydown.enter="applyFilters"
            />
            <input
              v-model.trim="filters.originalUrlKeyword"
              type="text"
              class="filter-keyword"
              placeholder="Search Original URL"
              @keydown.enter="applyFilters"
            />
            <input
              v-model.trim="filters.regionKeyword"
              type="text"
              class="filter-keyword"
              placeholder="Search Province / City"
              @keydown.enter="applyFilters"
            />
            <button class="filter-btn primary" @click="applyFilters">Search</button>
            <button class="filter-btn" @click="resetFilters">Reset</button>
          </div>
        </div>
      </section>

      <div class="charts-row">
        <section class="chart-card">
          <header class="chart-header">
            <h3>Click Trend</h3>
            <span>{{ trendData.length }} points</span>
          </header>
          <div v-if="trendData.length" class="line-chart">
            <svg viewBox="0 0 600 220" preserveAspectRatio="none">
              <polyline class="trend-grid" points="40,20 40,190 580,190" />
              <polyline class="trend-line" :points="trendPolyline" />
              <g v-for="(dot, idx) in trendDots" :key="idx">
                <circle :cx="dot.x" :cy="dot.y" r="3" class="trend-dot" />
              </g>
            </svg>
            <div class="line-axis">
              <span>{{ trendData[0]?.time || '-' }}</span>
              <span>{{ trendData[trendData.length - 1]?.time || '-' }}</span>
            </div>
          </div>
          <div v-else class="chart-empty">No trend data</div>
        </section>

        <section class="chart-card">
          <header class="chart-header">
            <h3>Link Click Distribution</h3>
            <div class="chart-controls">
              <span>Top</span>
              <select v-model.number="linkTitleTopN" class="chart-select">
                <option v-for="n in 8" :key="n + 2" :value="n + 2">{{ n + 2 }}</option>
              </select>
              <span>{{ linkTitleLegend.length }} links</span>
            </div>
          </header>
          <div v-if="linkTitleLegend.length" class="pie-wrapper">
            <div class="pie" :style="pieStyle"></div>
            <div class="pie-legend">
              <div v-for="item in linkTitleLegend" :key="item.linkTitle" class="legend-row">
                <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label" :title="item.linkTitle">{{ truncate(item.linkTitle, 20) }}</span>
                <span class="legend-count">{{ item.clicks }}</span>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">No distribution data</div>
        </section>
      </div>

      <section class="table-panel">
        <header class="panel-header">
          <h3>Link Monitor List</h3>
          <div class="panel-actions">
            <button class="danger-btn" :disabled="!selectedCount || loading" @click="handleBatchDelete">
              Delete Selected ({{ selectedCount }})
            </button>
            <div class="panel-meta">
              <span>Total {{ pagination.total }}</span>
              <span>Page {{ pagination.pageNo }} / {{ totalPages }}</span>
            </div>
          </div>
        </header>

        <div v-if="loading" class="loading-area center-block">
          <div class="spinner"></div>
          <p>Loading monitor data...</p>
        </div>

        <div v-else-if="!list.length" class="empty-state subtle center-block">
          <h3>No links yet</h3>
          <p>Go to <router-link to="/">Home</router-link> to create your first link code.</p>
        </div>

        <template v-else>
          <div class="table-scroll">
            <div class="table-wrap">
              <table class="link-table">
                <colgroup>
                  <col class="col-main-check" />
                  <col class="col-main-idx" />
                  <col class="col-main-title" />
                  <col class="col-main-code" />
                  <col class="col-main-url" />
                  <col class="col-main-clicks" />
                  <col class="col-main-province" />
                  <col class="col-main-latest" />
                  <col class="col-main-action" />
                </colgroup>
                <thead>
                  <tr>
                    <th class="col-check">
                      <input
                        type="checkbox"
                        :checked="allRowsSelectedOnPage"
                        :disabled="!hasSelectableRows"
                        @change="toggleSelectAllOnPage"
                      />
                    </th>
                    <th class="col-idx">#</th>
                    <th>Title</th>
                    <th>Link Code</th>
                    <th>Original URL</th>
                    <th class="col-num">Clicks</th>
                    <th>Top Province</th>
                    <th>Latest Click</th>
                    <th class="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, idx) in list" :key="item.linkId || item.linkCode">
                    <tr class="main-row" :class="{ expanded: expandedSet.has(item.linkCode) }">
                      <td class="col-check">
                        <input
                          type="checkbox"
                          :checked="isRowSelected(item.linkId)"
                          :disabled="!isValidLinkId(item.linkId)"
                          @change="toggleRowSelection(item.linkId)"
                        />
                      </td>
                      <td class="col-idx muted">{{ rowIndex(idx) }}</td>
                      <td class="cell-title">{{ item.linkTitle }}</td>
                      <td class="cell-code"><code class="code-badge">{{ item.linkCode }}</code></td>
                      <td class="cell-url">
                        <a
                          v-if="item.originalUrl !== '-'"
                          :href="item.originalUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="item.originalUrl"
                        >
                          {{ truncate(item.originalUrl, 36) }}
                        </a>
                        <span v-else class="muted">-</span>
                      </td>
                      <td class="col-num"><span class="click-pill">{{ item.clickCount }}</span></td>
                      <td class="muted">{{ topProvinceOf(item) }}</td>
                      <td class="muted">{{ latestClickOf(item) }}</td>
                      <td class="col-action">
                        <button
                          v-if="item.clickCount > 0 || item.detailTotal > 0"
                          class="expand-btn"
                          :aria-expanded="expandedSet.has(item.linkCode)"
                          @click="toggleExpand(item.linkCode)"
                        >
                          <span class="chevron" :class="{ rotated: expandedSet.has(item.linkCode) }">&#9656;</span>
                          Details
                        </button>
                        <span v-else class="muted no-record">No records</span>
                      </td>
                    </tr>

                    <tr v-if="expandedSet.has(item.linkCode)" class="detail-row">
                      <td colspan="9">
                        <div class="detail-inner">
                          <div class="detail-header">
                            Click Records
                            <span class="muted detail-count">{{ detailTotal(item.linkCode) }} entries</span>
                          </div>

                          <div v-if="detailLoading(item.linkCode)" class="detail-loading">Loading detail records...</div>

                          <template v-else-if="detailRows(item.linkCode).length">
                            <table class="record-table">
                              <colgroup>
                                <col class="col-detail-idx" />
                                <col class="col-detail-ip" />
                                <col class="col-detail-location" />
                                <col class="col-detail-env" />
                                <col class="col-detail-ua" />
                                <col class="col-detail-time" />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>IP Address</th>
                                  <th>Location</th>
                                  <th>OS / Browser</th>
                                  <th>User-Agent</th>
                                  <th>Click Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(rec, ri) in detailRows(item.linkCode)" :key="ri">
                                  <td class="muted">{{ detailRowIndex(item.linkCode, ri) }}</td>
                                  <td><code>{{ rec.ip }}</code></td>
                                  <td>{{ formatLocation(rec) }}</td>
                                  <td>
                                    <div class="env-tags">
                                      <span class="env-tag">{{ rec.os }}</span>
                                      <span class="env-tag browser">{{ rec.browser }}</span>
                                    </div>
                                  </td>
                                  <td class="cell-ua" :title="rec.ua">{{ truncate(rec.ua, 48) }}</td>
                                  <td class="muted">{{ formatTime(rec.clickTime) }}</td>
                                </tr>
                              </tbody>
                            </table>

                            <footer class="detail-pagination">
                              <button class="mini-btn" :disabled="detailPage(item.linkCode) <= 1" @click="goDetailPrev(item.linkCode)">Prev</button>
                              <span class="mini-meta">{{ detailPage(item.linkCode) }} / {{ detailTotalPages(item.linkCode) }}</span>
                              <button
                                class="mini-btn"
                                :disabled="detailPage(item.linkCode) >= detailTotalPages(item.linkCode)"
                                @click="goDetailNext(item.linkCode)"
                              >
                                Next
                              </button>
                              <select v-model.number="detailState(item.linkCode).pageSize" class="mini-size" @change="changeDetailSize(item.linkCode)">
                                <option :value="5">5 / page</option>
                                <option :value="10">10 / page</option>
                                <option :value="20">20 / page</option>
                              </select>
                            </footer>

                            <div v-if="provinceBarsByCode(item.linkCode).length" class="region-chart">
                              <div class="region-chart-title">Province Distribution (Current Detail Page)</div>
                              <div v-for="bar in provinceBarsByCode(item.linkCode)" :key="bar.province" class="bar-row">
                                <span class="bar-label">{{ bar.province }}</span>
                                <div class="bar-track">
                                  <div class="bar-fill" :style="{ width: bar.pct + '%' }"></div>
                                </div>
                                <span class="bar-count">{{ bar.count }}</span>
                              </div>
                            </div>
                          </template>

                          <div v-else class="detail-empty">No detail records</div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <footer class="pagination-bar">
            <button class="page-btn" :disabled="pagination.pageNo <= 1" @click="goPrev">Prev</button>
            <button
              v-for="page in visiblePages"
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.pageNo }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>
            <button class="page-btn" :disabled="pagination.pageNo >= totalPages" @click="goNext">Next</button>

            <select v-model.number="pagination.pageSize" class="page-size" @change="handlePageSizeChange">
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="30">30 / page</option>
            </select>
          </footer>
        </template>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import {
  getLinkMonitorListAPI,
  getLinkMonitorDetailRecordsAPI,
  getMonitorTrendAPI,
  getMonitorLinkTitleDistributionAPI,
  deleteLinksByIdsAPI
} from '../api/link'
import { notifyErrorOnce } from '../utils/error-handler'
import { notifySuccess } from '../utils/notify'

const { isLoggedIn } = useAuth()

const loading = ref(false)
const list = ref([])
const expandedSet = reactive(new Set())
const selectedLinkIds = ref([])
const detailStateByCode = reactive({})
const trendData = ref([])
const linkTitleDistribution = ref([])
const isFilterExpanded = ref(true)
const linkTitleTopN = ref(5)

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  preset: '7d',
  startDate: '',
  endDate: '',
  titleKeyword: '',
  linkCodeKeyword: '',
  originalUrlKeyword: '',
  regionKeyword: ''
})

const padZero = (num) => String(num).padStart(2, '0')

const toDateInput = (date) => {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
}

const normalizeText = (value) => {
  const text = String(value ?? '').trim()
  return text || '-'
}

const toPositiveInt = (value, fallback) => {
  const num = Number(value)
  if (Number.isInteger(num) && num > 0) return num
  return fallback
}

const isValidLinkId = (linkId) => {
  return Boolean(linkId && String(linkId).trim() && String(linkId).trim() !== '-')
}

const normalizeRecord = (record) => ({
  ip: normalizeText(record?.ip),
  province: normalizeText(record?.province),
  city: normalizeText(record?.city),
  ua: normalizeText(record?.ua),
  os: normalizeText(record?.os),
  browser: normalizeText(record?.browser),
  clickTime: normalizeText(record?.clickTime)
})

const normalizeListItem = (item) => ({
  linkId: normalizeText(item?.linkId),
  linkCode: normalizeText(item?.linkCode),
  linkTitle: normalizeText(item?.linkTitle),
  originalUrl: normalizeText(item?.originalUrl),
  clickCount: Number(item?.clickCount ?? 0),
  topProvince: normalizeText(item?.topProvince),
  latestClickTime: normalizeText(item?.latestClickTime),
  detailTotal: Number(item?.detailTotal ?? item?.clickCount ?? 0)
})

const setPresetRange = (preset, shouldFetch = true) => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(end)

  if (preset === '7d') {
    start.setDate(end.getDate() - 6)
    filters.startDate = toDateInput(start)
    filters.endDate = toDateInput(end)
  } else if (preset === '30d') {
    start.setDate(end.getDate() - 29)
    filters.startDate = toDateInput(start)
    filters.endDate = toDateInput(end)
  } else {
    filters.startDate = ''
    filters.endDate = ''
  }

  filters.preset = preset

  if (shouldFetch) {
    pagination.pageNo = 1
    fetchList()
  }
}

const handleDateManualChange = () => {
  filters.preset = 'custom'
}

const getCommonFilterParams = () => {
  const params = {}

  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  if (filters.titleKeyword) params.linkTitleKeyword = filters.titleKeyword
  if (filters.linkCodeKeyword) params.linkCodeKeyword = filters.linkCodeKeyword
  if (filters.originalUrlKeyword) params.originalUrlKeyword = filters.originalUrlKeyword
  if (filters.regionKeyword) params.regionKeyword = filters.regionKeyword

  return params
}

const getQueryParams = () => {
  return {
    pageNo: pagination.pageNo,
    pageSize: pagination.pageSize,
    ...getCommonFilterParams()
  }
}

const parseListPayload = (data) => {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      pageNo: toPositiveInt(pagination.pageNo, 1),
      pageSize: toPositiveInt(pagination.pageSize, 10),
      list: data
    }
  }

  if (data && typeof data === 'object') {
    const rows = data.list || data.records || data.items || []
    const safePageNo = toPositiveInt(data.pageNo, toPositiveInt(pagination.pageNo, 1))
    const safePageSize = toPositiveInt(data.pageSize, toPositiveInt(pagination.pageSize, 10))
    return {
      total: Number(data.total ?? rows.length),
      pageNo: safePageNo,
      pageSize: safePageSize,
      list: Array.isArray(rows) ? rows : []
    }
  }

  return {
    total: 0,
    pageNo: toPositiveInt(pagination.pageNo, 1),
    pageSize: toPositiveInt(pagination.pageSize, 10),
    list: []
  }
}

const clearDetailState = () => {
  Object.keys(detailStateByCode).forEach((key) => {
    delete detailStateByCode[key]
  })
}

const clearSelectedRows = () => {
  selectedLinkIds.value = []
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getLinkMonitorListAPI(getQueryParams())
    const parsed = parseListPayload(data)

    pagination.total = parsed.total
    pagination.pageNo = parsed.pageNo
    pagination.pageSize = parsed.pageSize
    list.value = parsed.list.map(normalizeListItem)

    expandedSet.clear()
    clearSelectedRows()
    clearDetailState()
    hydrateChartData()
  } catch (err) {
    notifyErrorOnce(err, 'Failed to load monitor list')
  } finally {
    loading.value = false
  }
}

const hydrateChartData = async () => {
  const common = getCommonFilterParams()
  const [trendResult, distributionResult] = await Promise.allSettled([
    getMonitorTrendAPI({ granularity: 'day', ...common }),
    getMonitorLinkTitleDistributionAPI({ topN: chartTopN.value, ...common })
  ])

  if (trendResult.status === 'fulfilled' && Array.isArray(trendResult.value) && trendResult.value.length) {
    trendData.value = trendResult.value.map((item) => ({
      time: normalizeText(item?.time),
      clicks: Number(item?.clicks ?? 0)
    }))
  } else {
    trendData.value = []
  }

  if (distributionResult.status === 'fulfilled' && Array.isArray(distributionResult.value) && distributionResult.value.length) {
    linkTitleDistribution.value = distributionResult.value
      .map((item) => ({
        linkTitle: normalizeText(item?.linkTitle),
        clicks: Number(item?.clicks ?? 0)
      }))
      .sort((a, b) => b.clicks - a.clicks)
  } else {
    linkTitleDistribution.value = []
  }
}

const getDetailState = (code) => {
  if (!detailStateByCode[code]) {
    detailStateByCode[code] = {
      loading: false,
      loaded: false,
      total: 0,
      pageNo: 1,
      pageSize: 5,
      records: []
    }
  }
  return detailStateByCode[code]
}

const parseDetailPayload = (data, state) => {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      pageNo: toPositiveInt(state.pageNo, 1),
      pageSize: toPositiveInt(state.pageSize, 5),
      list: data
    }
  }

  if (data && typeof data === 'object') {
    const rows = data.list || data.records || data.items || []
    const safePageNo = toPositiveInt(data.pageNo, toPositiveInt(state.pageNo, 1))
    const safePageSize = toPositiveInt(data.pageSize, toPositiveInt(state.pageSize, 5))
    return {
      total: Number(data.total ?? rows.length),
      pageNo: safePageNo,
      pageSize: safePageSize,
      list: Array.isArray(rows) ? rows : []
    }
  }

  return {
    total: 0,
    pageNo: toPositiveInt(state.pageNo, 1),
    pageSize: toPositiveInt(state.pageSize, 5),
    list: []
  }
}

const fetchDetailRecords = async (linkCode, options = {}) => {
  const state = getDetailState(linkCode)
  if (options.resetPage) {
    state.pageNo = 1
  }

  state.loading = true

  try {
    const data = await getLinkMonitorDetailRecordsAPI({
      linkCode,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
      ...getCommonFilterParams()
    })

    const parsed = parseDetailPayload(data, state)
    state.total = parsed.total
    state.pageNo = parsed.pageNo
    state.pageSize = parsed.pageSize
    state.records = parsed.list.map(normalizeRecord)
    state.loaded = true
  } catch (err) {
    notifyErrorOnce(err, 'Failed to load detail records')
  } finally {
    state.loading = false
  }
}

const toggleExpand = async (code) => {
  if (expandedSet.has(code)) {
    expandedSet.delete(code)
    return
  }

  expandedSet.add(code)
  const state = getDetailState(code)
  if (!state.loaded) {
    await fetchDetailRecords(code, { resetPage: true })
  }
}

const detailState = (code) => getDetailState(code)
const detailRows = (code) => getDetailState(code).records
const detailLoading = (code) => getDetailState(code).loading
const detailPage = (code) => getDetailState(code).pageNo
const detailTotal = (code) => getDetailState(code).total

const detailTotalPages = (code) => {
  const state = getDetailState(code)
  return Math.max(1, Math.ceil((state.total || 0) / state.pageSize))
}

const detailRowIndex = (code, idx) => {
  const state = getDetailState(code)
  return (state.pageNo - 1) * state.pageSize + idx + 1
}

const goDetailPrev = (code) => {
  const state = getDetailState(code)
  if (state.pageNo <= 1) return
  state.pageNo -= 1
  fetchDetailRecords(code)
}

const goDetailNext = (code) => {
  const state = getDetailState(code)
  if (state.pageNo >= detailTotalPages(code)) return
  state.pageNo += 1
  fetchDetailRecords(code)
}

const changeDetailSize = (code) => {
  const state = getDetailState(code)
  state.pageNo = 1
  fetchDetailRecords(code)
}

onMounted(() => {
  if (isLoggedIn.value) {
    setPresetRange('7d', false)
    fetchList()
  }
})

watch(linkTitleTopN, () => {
  if (isLoggedIn.value) {
    hydrateChartData()
  }
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize))
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = pagination.pageNo
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  for (let p = start; p <= end; p += 1) {
    pages.push(p)
  }
  return pages
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.startDate) count += 1
  if (filters.endDate) count += 1
  if (filters.titleKeyword) count += 1
  if (filters.linkCodeKeyword) count += 1
  if (filters.originalUrlKeyword) count += 1
  if (filters.regionKeyword) count += 1
  return count
})

const chartTopN = computed(() => {
  return Math.min(10, Math.max(3, Number(linkTitleTopN.value) || 5))
})

const hasSelectableRows = computed(() => {
  return list.value.some((item) => isValidLinkId(item.linkId))
})

const allRowsSelectedOnPage = computed(() => {
  const currentPageIds = list.value
    .map((item) => item.linkId)
    .filter((id) => isValidLinkId(id))

  if (!currentPageIds.length) return false
  return currentPageIds.every((id) => selectedLinkIds.value.includes(id))
})

const selectedCount = computed(() => selectedLinkIds.value.length)

const rowIndex = (idx) => {
  return (pagination.pageNo - 1) * pagination.pageSize + idx + 1
}

const summary = computed(() => {
  const totalLinks = pagination.total
  const totalClicks = list.value.reduce((sum, item) => sum + (item.clickCount || 0), 0)
  const topProvinceMap = {}
  list.value.forEach((item) => {
    if (item.topProvince && item.topProvince !== '-') {
      topProvinceMap[item.topProvince] = (topProvinceMap[item.topProvince] || 0) + Math.max(item.clickCount || 0, 1)
    }
  })
  const topProvince = Object.entries(topProvinceMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const allTimes = list.value
    .map((item) => item.latestClickTime)
    .filter((value) => value && value !== '-')
    .sort()
    .reverse()

  const latestActivity = allTimes[0] ? formatTime(allTimes[0]) : null
  return { totalLinks, totalClicks, topProvince, latestActivity }
})

const trendDots = computed(() => {
  if (!trendData.value.length) return []
  const width = 600
  const height = 220
  const padding = 40
  const maxValue = Math.max(...trendData.value.map((item) => item.clicks), 1)
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 1.5
  const denominator = Math.max(trendData.value.length - 1, 1)

  return trendData.value.map((item, index) => {
    const x = padding + (usableWidth * index) / denominator
    const y = height - padding - (item.clicks / maxValue) * usableHeight
    return { x, y }
  })
})

const trendPolyline = computed(() => {
  return trendDots.value.map((dot) => `${dot.x},${dot.y}`).join(' ')
})

const linkTitleLegend = computed(() => {
  const colors = ['#0f172a', '#2563eb', '#16a34a', '#f59e0b', '#d946ef', '#ef4444']
  const rows = linkTitleDistribution.value
    .filter((item) => item.linkTitle !== '-' && item.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, chartTopN.value)

  return rows.map((item, index) => ({
    linkTitle: item.linkTitle,
    clicks: item.clicks,
    color: colors[index % colors.length]
  }))
})

const pieStyle = computed(() => {
  if (!linkTitleLegend.value.length) {
    return { background: '#e2e8f0' }
  }

  const total = linkTitleLegend.value.reduce((sum, item) => sum + item.clicks, 0) || 1
  let offset = 0
  const segments = linkTitleLegend.value.map((item) => {
    const ratio = item.clicks / total
    const start = Math.round(offset * 360)
    offset += ratio
    const end = Math.round(offset * 360)
    return `${item.color} ${start}deg ${end}deg`
  })

  return {
    background: `conic-gradient(${segments.join(',')})`
  }
})

const goPage = (page) => {
  if (page === pagination.pageNo) return
  pagination.pageNo = page
  fetchList()
}

const goPrev = () => {
  if (pagination.pageNo <= 1) return
  pagination.pageNo -= 1
  fetchList()
}

const goNext = () => {
  if (pagination.pageNo >= totalPages.value) return
  pagination.pageNo += 1
  fetchList()
}

const handlePageSizeChange = () => {
  pagination.pageNo = 1
  fetchList()
}

const isRowSelected = (linkId) => {
  if (!isValidLinkId(linkId)) return false
  return selectedLinkIds.value.includes(linkId)
}

const toggleRowSelection = (linkId) => {
  if (!isValidLinkId(linkId)) return
  if (selectedLinkIds.value.includes(linkId)) {
    selectedLinkIds.value = selectedLinkIds.value.filter((id) => id !== linkId)
  } else {
    selectedLinkIds.value = [...selectedLinkIds.value, linkId]
  }
}

const toggleSelectAllOnPage = () => {
  const currentPageIds = list.value
    .map((item) => item.linkId)
    .filter((id) => isValidLinkId(id))

  if (!currentPageIds.length) return

  if (allRowsSelectedOnPage.value) {
    selectedLinkIds.value = selectedLinkIds.value.filter((id) => !currentPageIds.includes(id))
    return
  }

  const merged = [...selectedLinkIds.value, ...currentPageIds]
  selectedLinkIds.value = Array.from(new Set(merged))
}

const handleBatchDelete = async () => {
  const linkIds = [...selectedLinkIds.value]
  if (!linkIds.length) return

  const ok = window.confirm(`确认删除选中的 ${linkIds.length} 条链接吗？`)
  if (!ok) return

  try {
    await deleteLinksByIdsAPI(linkIds)
    notifySuccess(`删除成功，共删除 ${linkIds.length} 条链接`)
    clearSelectedRows()
    fetchList()
  } catch (err) {
    notifyErrorOnce(err, '批量删除失败，请稍后重试')
  }
}

const applyFilters = () => {
  pagination.pageNo = 1
  fetchList()
}

const resetFilters = () => {
  filters.titleKeyword = ''
  filters.linkCodeKeyword = ''
  filters.originalUrlKeyword = ''
  filters.regionKeyword = ''
  setPresetRange('7d')
}

const truncate = (str, max) => {
  if (!str) return '-'
  return str.length > max ? `${str.slice(0, max)}...` : str
}

const formatLocation = (rec) => {
  const parts = [rec.province, rec.city].filter((value) => value && value !== '-')
  return parts.join(' / ') || '-'
}

const formatTime = (raw) => {
  if (!raw || raw === '-') return '-'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const topProvinceOf = (item) => {
  if (item.topProvince && item.topProvince !== '-') return item.topProvince

  const map = {}
  detailRows(item.linkCode).forEach((record) => {
    if (record.province && record.province !== '-') {
      map[record.province] = (map[record.province] || 0) + 1
    }
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
}

const latestClickOf = (item) => {
  if (item.latestClickTime && item.latestClickTime !== '-') {
    return formatTime(item.latestClickTime)
  }

  const times = detailRows(item.linkCode)
    .map((record) => record.clickTime)
    .filter((value) => value && value !== '-')
    .sort()
    .reverse()
  return times[0] ? formatTime(times[0]) : '-'
}

const provinceBarsByCode = (code) => {
  const map = {}
  detailRows(code).forEach((record) => {
    if (record.province && record.province !== '-') {
      map[record.province] = (map[record.province] || 0) + 1
    }
  })

  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] || 1
  return entries.map(([province, count]) => ({
    province,
    count,
    pct: Math.round((count / max) * 100)
  }))
}

</script>

<style scoped>
.monitor-page {
  --monitor-inline-space: clamp(24px, 3vw, 40px);
  width: min(calc(100vw - var(--monitor-inline-space) * 2), 1540px);
  max-width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  height: calc(100vh - 84px);
  padding: 102px 0 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.center-block {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  height: 100%;
}

.empty-state.subtle {
  min-height: 280px;
}

.empty-state h2,
.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 28px;
  font-size: 1rem;
}

.btn-primary {
  display: inline-block;
  background: #0f172a;
  color: #fff;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px 20px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.stat-value.small {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
}

.advanced-filter {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #edf2f7;
}

.filter-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-title-wrap h3 {
  font-size: 0.92rem;
  color: #0f172a;
}

.filter-meta {
  font-size: 0.78rem;
  color: #94a3b8;
}

.filter-toggle {
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 10px;
  cursor: pointer;
}

.filter-content {
  padding: 10px 12px;
  display: grid;
  gap: 10px;
}

.quick-range {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.range-btn {
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0 12px;
  cursor: pointer;
}

.range-btn.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.filter-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  overflow-x: visible;
}

.filter-inputs > * {
  flex: 0 1 auto;
}

.filter-date,
.filter-keyword {
  height: 34px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.82rem;
  padding: 0 10px;
  outline: none;
}

.filter-date {
  width: 136px;
}

.filter-keyword {
  width: 180px;
}

.date-sep {
  color: #94a3b8;
  font-size: 0.82rem;
}

.filter-btn {
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0 12px;
  cursor: pointer;
}

.filter-btn.primary {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.charts-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 12px;
}

.chart-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  padding: 14px 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chart-header h3 {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.chart-header span {
  color: #94a3b8;
  font-size: 0.75rem;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.75rem;
}

.chart-select {
  height: 26px;
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font-size: 0.75rem;
  padding: 0 6px;
}

.line-chart svg {
  width: 100%;
  height: 146px;
}

.trend-grid {
  fill: none;
  stroke: #cbd5e1;
  stroke-width: 1;
}

.trend-line {
  fill: none;
  stroke: #2563eb;
  stroke-width: 2.5;
}

.trend-dot {
  fill: #2563eb;
}

.line-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.pie-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.pie-legend {
  width: 100%;
}

.legend-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  flex-shrink: 0;
}

.legend-label {
  color: #334155;
  font-size: 0.8rem;
  flex: 1;
}

.legend-count {
  font-size: 0.78rem;
  color: #94a3b8;
}

.chart-empty {
  min-height: 126px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.table-panel {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 14px;
}

.panel-header h3 {
  font-size: 0.95rem;
  color: #0f172a;
  font-weight: 700;
}

.panel-meta {
  display: flex;
  gap: 14px;
  color: #94a3b8;
  font-size: 0.78rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.danger-btn {
  height: 30px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0 10px;
  cursor: pointer;
}

.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-area {
  flex: 1;
  gap: 10px;
  color: #94a3b8;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0f172a;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-wrap {
  min-width: 0;
  width: 100%;
}

.link-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.92rem;
}

.link-table thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.link-table th {
  padding: 12px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-align: left;
  white-space: nowrap;
}

.link-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  vertical-align: middle;
}

.main-row.expanded td {
  border-bottom: none;
}

.main-row:hover td {
  background: #fafafa;
}

.col-main-check {
  width: 2.5%;
}

.col-main-idx {
  width: 4.5%;
}

.col-main-title {
  width: 16%;
}

.col-main-code {
  width: 16%;
}

.col-main-url {
  width: 24%;
}

.col-main-clicks {
  width: 7%;
}

.col-main-province {
  width: 10%;
}

.col-main-latest {
  width: 13.5%;
}

.col-main-action {
  width: 6.5%;
}

.col-idx {
  width: 52px;
}

.col-check {
  width: 40px;
  text-align: center;
}

.col-num {
  width: 92px;
  text-align: center;
}

.col-action {
  width: 148px;
  text-align: right;
  padding-right: 24px !important;
}

.muted {
  color: #94a3b8;
}

.cell-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-code {
  white-space: nowrap;
}

.cell-url a {
  display: block;
  color: #475569;
  text-decoration: none;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-url a:hover {
  color: #0f172a;
  text-decoration: underline;
}

.code-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.82rem;
  color: #0f172a;
  white-space: nowrap;
}

.cell-url {
  min-width: 0;
}

.click-pill {
  display: inline-block;
  background: #0f172a;
  color: #fff;
  border-radius: 50px;
  padding: 3px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  min-width: 38px;
  text-align: center;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e2e8f0;
  background: none;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  margin-left: auto;
}

.expand-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.chevron {
  display: inline-block;
  font-size: 0.7rem;
  line-height: 1;
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(90deg);
}

.no-record {
  display: inline-block;
  font-size: 12px;
}

.detail-row td {
  padding: 0 !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc;
}

.detail-inner {
  padding: 14px 24px 18px 44px;
}

.detail-header {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #475569;
  margin-bottom: 12px;
}

.detail-count {
  font-weight: 500;
  margin-left: 8px;
}

.detail-loading,
.detail-empty {
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 8px 0 12px;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.88rem;
  margin-bottom: 10px;
}

.col-detail-idx {
  width: 6%;
}

.col-detail-ip {
  width: 16%;
}

.col-detail-location {
  width: 18%;
}

.col-detail-env {
  width: 18%;
}

.col-detail-ua {
  width: 26%;
}

.col-detail-time {
  width: 16%;
}

.record-table th {
  padding: 8px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.record-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.record-table tr:last-child td {
  border-bottom: none;
}

.record-table code {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.85rem;
}

.env-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.env-tag {
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.75rem;
  font-weight: 600;
}

.env-tag.browser {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.cell-ua {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mini-btn {
  min-width: 34px;
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.mini-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mini-meta {
  color: #64748b;
  font-size: 0.78rem;
  min-width: 56px;
  text-align: center;
}

.mini-size {
  margin-left: auto;
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.78rem;
  color: #334155;
  background: #fff;
}

.region-chart {
  max-width: 380px;
}

.region-chart-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #64748b;
  margin-bottom: 10px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
}

.bar-label {
  width: 90px;
  font-size: 0.82rem;
  color: #334155;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #0f172a;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.bar-count {
  width: 24px;
  text-align: right;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.pagination-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  padding: 10px 14px;
}

.page-btn {
  min-width: 34px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-btn.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.page-size {
  margin-left: auto;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.82rem;
  color: #334155;
  background: #fff;
}

@media (max-width: 860px) {
  .monitor-page {
    height: calc(100vh - 74px);
    padding-top: 88px;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .cell-title,
  .cell-url,
  .cell-ua {
    min-width: 0;
  }

  .filter-keyword {
    width: 100%;
  }

  .filter-inputs {
    flex-wrap: wrap;
    overflow-x: visible;
  }
}

@media (max-width: 600px) {
  .monitor-page {
    height: calc(100vh - 74px);
    padding-top: 84px;
    padding-bottom: 12px;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .panel-meta {
    display: none;
  }

  .filter-inputs {
    width: 100%;
  }

  .filter-date,
  .filter-keyword,
  .filter-btn {
    width: 100%;
  }

  .date-sep {
    display: none;
  }

  .link-table th:nth-child(4),
  .link-table td:nth-child(4),
  .link-table th:nth-child(6),
  .link-table td:nth-child(6) {
    display: none;
  }

  .detail-inner {
    padding-left: 16px;
  }

  .cell-ua {
    max-width: 130px;
    min-width: 0;
  }
}
</style>

