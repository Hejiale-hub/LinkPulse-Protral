<template>
  <div class="monitor-page">

    <!-- 未登录空态 -->
    <div v-if="!isLoggedIn" class="empty-state">
      <div class="empty-icon">🔒</div>
      <h2>Login Required</h2>
      <p>Please login to view your link monitoring data.</p>
      <router-link to="/login" class="btn-primary">Go to Login</router-link>
    </div>

    <!-- 已登录内容区 -->
    <template v-else>
      <!-- 顶部统计卡片 -->
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
          <span class="stat-value small">{{ summary.topRegion || '—' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Latest Activity</span>
          <span class="stat-value small">{{ summary.latestActivity || '—' }}</span>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-area">
        <div class="spinner"></div>
        <p>Loading monitor data…</p>
      </div>

      <!-- 空记录 -->
      <div v-else-if="!loading && !list.length" class="empty-state subtle">
        <div class="empty-icon">📭</div>
        <h3>No links yet</h3>
        <p>Go to <router-link to="/">Home</router-link> to create your first link code.</p>
      </div>

      <!-- 数据表格 -->
      <div v-else class="table-wrap">
        <table class="link-table">
          <thead>
            <tr>
              <th class="col-idx">#</th>
              <th>Title</th>
              <th>Link Code</th>
              <th>Original URL</th>
              <th class="col-num">Clicks</th>
              <th>Top Province</th>
              <th>Latest Click</th>
              <th class="col-action"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, idx) in list" :key="item.linkCode">
              <!-- 主行 -->
              <tr class="main-row" :class="{ expanded: expandedSet.has(item.linkCode) }">
                <td class="col-idx muted">{{ idx + 1 }}</td>
                <td class="cell-title">{{ item.linkTitle || '—' }}</td>
                <td><code class="code-badge">{{ item.linkCode }}</code></td>
                <td class="cell-url">
                  <a :href="item.originalUrl" target="_blank" rel="noopener noreferrer" :title="item.originalUrl">
                    {{ truncate(item.originalUrl, 36) }}
                  </a>
                </td>
                <td class="col-num">
                  <span class="click-pill">{{ item.clickCount ?? 0 }}</span>
                </td>
                <td class="muted">{{ topProvinceOf(item) || '—' }}</td>
                <td class="muted">{{ latestClickOf(item) || '—' }}</td>
                <td class="col-action">
                  <button
                    v-if="item.clickRecords?.length"
                    class="expand-btn"
                    :aria-expanded="expandedSet.has(item.linkCode)"
                    @click="toggleExpand(item.linkCode)"
                  >
                    <span class="chevron" :class="{ rotated: expandedSet.has(item.linkCode) }">▸</span>
                    Details
                  </button>
                  <span v-else class="muted" style="font-size:12px">No records</span>
                </td>
              </tr>

              <!-- 展开行：点击明细 -->
              <tr v-if="expandedSet.has(item.linkCode)" class="detail-row">
                <td colspan="8">
                  <div class="detail-inner">
                    <div class="detail-header">
                      Click Records
                      <span class="muted" style="font-weight:500;margin-left:8px">{{ item.clickRecords.length }} entries</span>
                    </div>
                    <table class="record-table">
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
                        <tr v-for="(rec, ri) in item.clickRecords" :key="ri">
                          <td class="muted">{{ ri + 1 }}</td>
                          <td><code>{{ rec.ip || '—' }}</code></td>
                          <td>{{ formatLocation(rec) }}</td>
                          <td>
                            <div class="env-tags">
                              <span class="env-tag">{{ rec.os || '—' }}</span>
                              <span class="env-tag browser">{{ rec.browser || '—' }}</span>
                            </div>
                          </td>
                          <td class="cell-ua" :title="rec.ua">{{ truncate(rec.ua, 38) || '—' }}</td>
                          <td class="muted">{{ formatTime(rec.clickTime) }}</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- 省份分布小图 -->
                    <div v-if="provinceBars(item).length" class="region-chart">
                      <div class="region-chart-title">Province Distribution</div>
                      <div
                        v-for="bar in provinceBars(item)"
                        :key="bar.province"
                        class="bar-row"
                      >
                        <span class="bar-label">{{ bar.province }}</span>
                        <div class="bar-track">
                          <div
                            class="bar-fill"
                            :style="{ width: bar.pct + '%' }"
                          ></div>
                        </div>
                        <span class="bar-count">{{ bar.count }}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getLinkMonitorListAPI } from '../api/link'
import { notifyErrorOnce } from '../utils/error-handler'

const { isLoggedIn } = useAuth()

const loading = ref(false)
const list = ref([])
const expandedSet = reactive(new Set())

// ─── 数据加载 ──────────────────────────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true
  try {
    const data = await getLinkMonitorListAPI()
    list.value = Array.isArray(data) ? data : (data ? [data] : [])
  } catch (err) {
    notifyErrorOnce(err, '获取监控数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchList()
  }
})

// ─── 汇总卡片数据 ──────────────────────────────────────────────────────────────
const summary = computed(() => {
  const totalLinks = list.value.length
  const totalClicks = list.value.reduce((s, i) => s + (i.clickCount ?? 0), 0)

  // 统计全局省份频次
  const provinceMap = {}
  list.value.forEach((item) => {
    ;(item.clickRecords ?? []).forEach(({ province }) => {
      if (province && province !== '-') provinceMap[province] = (provinceMap[province] ?? 0) + 1
    })
  })
  const topRegion = Object.entries(provinceMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // 最新点击时间
  const allTimes = list.value
    .flatMap((i) => (i.clickRecords ?? []).map((r) => r.clickTime))
    .filter(Boolean)
    .sort()
    .reverse()
  const latestActivity = allTimes[0] ? formatTime(allTimes[0]) : null

  return { totalLinks, totalClicks, topRegion, latestActivity }
})

// ─── 展开切换 ──────────────────────────────────────────────────────────────────
const toggleExpand = (code) => {
  if (expandedSet.has(code)) {
    expandedSet.delete(code)
  } else {
    expandedSet.add(code)
  }
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────
const truncate = (str, max) =>
  str && str.length > max ? str.slice(0, max) + '…' : str

const topProvinceOf = (item) => {
  const records = item.clickRecords ?? []
  const map = {}
  records.forEach(({ province }) => {
    if (province && province !== '-') map[province] = (map[province] ?? 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const formatLocation = (rec) => {
  const parts = [rec.province, rec.city].filter(v => v && v !== '-')
  return parts.join(' · ') || '—'
}

const latestClickOf = (item) => {
  const times = (item.clickRecords ?? []).map((r) => r.clickTime).filter(Boolean).sort().reverse()
  return times[0] ? formatTime(times[0]) : null
}

const formatTime = (raw) => {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return String(raw)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const provinceBars = (item) => {
  const records = item.clickRecords ?? []
  const map = {}
  records.forEach(({ province }) => {
    if (province && province !== '-') map[province] = (map[province] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([province, count]) => ({ province, count, pct: Math.round((count / max) * 100) }))
}
</script>

<style scoped>
/* ─── 页面容器 ─────────────────────────────────────────────────────────────── */
.monitor-page {
  max-width: 1060px;
  margin: 0 auto;
  padding: 108px 5% 80px;
}

/* ─── 空态 ─────────────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 100px 0;
}
.empty-state.subtle {
  padding: 60px 0;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 18px;
}
.empty-state h2, .empty-state h3 {
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
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.75; }

/* ─── 统计卡片 ─────────────────────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
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

/* ─── 加载 ─────────────────────────────────────────────────────────────────── */
.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 0;
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
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── 表格容器 ─────────────────────────────────────────────────────────────── */
.table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
}

/* ─── 主表格 ─────────────────────────────────────────────────────────────────*/
.link-table {
  width: 100%;
  border-collapse: collapse;
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
  padding: 14px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  vertical-align: middle;
}
.main-row:last-child td {
  border-bottom: none;
}
.main-row.expanded td {
  border-bottom: none;
}
.main-row:hover td {
  background: #fafafa;
}

.col-idx { width: 44px; }
.col-num { width: 80px; text-align: center; }
.col-action { width: 110px; }

.muted { color: #94a3b8; }
.cell-title { font-weight: 600; max-width: 160px; }
.cell-url a {
  color: #475569;
  text-decoration: none;
  font-size: 0.85rem;
}
.cell-url a:hover { color: #0f172a; text-decoration: underline; }

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

/* ─── 展开按钮 ─────────────────────────────────────────────────────────────── */
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
  transition: background 0.15s, border-color 0.15s;
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

/* ─── 展开详情区 ─────────────────────────────────────────────────────────────*/
.detail-row td {
  padding: 0 !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc;
}
.detail-inner {
  padding: 18px 24px 22px 52px;
}
.detail-header {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #475569;
  margin-bottom: 12px;
}

/* ─── 点击明细子表 ─────────────────────────────────────────────────────────── */
.record-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin-bottom: 20px;
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
  white-space: nowrap;
}
.env-tag.browser {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.cell-ua {
  max-width: 200px;
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

/* ─── 地区分布条形图 ─────────────────────────────────────────────────────────*/
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

/* ─── 响应式 ─────────────────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .monitor-page {
    padding-top: 90px;
  }
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .stat-value { font-size: 1.5rem; }
  .link-table th:nth-child(4),
  .link-table td:nth-child(4),
  .link-table th:nth-child(6),
  .link-table td:nth-child(6) {
    display: none;
  }
  .detail-inner {
    padding-left: 16px;
  }
}
</style>
