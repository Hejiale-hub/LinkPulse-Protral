<template>
  <div class="monitor-page">
    <div v-if="!isLoggedIn" class="empty-state center-block">
      <h2>Login Required</h2>
      <p>Please login to view your link monitoring data.</p>
      <router-link to="/login" class="btn-primary">Go to Login</router-link>
    </div>

    <template v-else>
      <div class="monitor-workspace">
        <div class="monitor-main">
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
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0f172a" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="#0f172a" stop-opacity="0.01" />
                </linearGradient>
              </defs>
              <line class="trend-grid-h" x1="40" y1="80" x2="580" y2="80" />
              <line class="trend-grid-h" x1="40" y1="135" x2="580" y2="135" />
              <polyline class="trend-grid" points="40,20 40,190 580,190" />
              <polygon class="trend-area" :points="trendAreaPoints" />
              <polyline class="trend-line-blur" :points="trendPolyline" />
              <polyline class="trend-line" :points="trendPolyline" />
              <g v-for="(dot, idx) in trendDots" :key="idx">
                <circle :cx="dot.x" :cy="dot.y" r="8" class="trend-dot-halo" />
                <circle :cx="dot.x" :cy="dot.y" r="4.5" class="trend-dot-outer" />
                <circle :cx="dot.x" :cy="dot.y" r="2" class="trend-dot-inner" />
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
                      <td class="cell-code">
                        <a
                          :href="item.linkCode.startsWith('http') ? item.linkCode : `http://${item.linkCode}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="code-badge link-badge"
                          :title="item.linkCode"
                        >
                          {{ item.linkCode }}
                        </a>
                      </td>
                      <td class="cell-url">
                        <a
                          v-if="item.originalUrl !== '-'"
                          :href="item.originalUrl.startsWith('http') ? item.originalUrl : `http://${item.originalUrl}`"
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

        </template>
      </section>

      <footer v-if="list.length && !loading" class="pagination-bar">
        <div class="pagination-pages">
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
        </div>
        <select v-model.number="pagination.pageSize" class="page-size" @change="handlePageSizeChange">
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="30">30 / page</option>
        </select>
      </footer>

        </div>

        <button class="ai-fab" :class="{ active: isAiOpen }" @click="toggleAiPanel">
          {{ isAiOpen ? 'Hide AI' : 'AI Chat' }}
        </button>

        <transition name="ai-slide">
        <aside v-if="isAiOpen" class="ai-panel ai-popup">
          <header class="ai-panel-header">
            <div>
              <h3>AI Assistant</h3>
              <p>Session Workspace</p>
            </div>
            <div class="ai-header-actions">
              <button class="ai-close-btn" :disabled="chatSending" @click="closeAiPanel">Close</button>
            </div>
          </header>

          <div class="ai-workspace">
            <section class="ai-session-pane">
              <div class="ai-session-head">
                <span>Sessions</span>
                <button class="mini-refresh" :disabled="sessionLoading" @click="loadAiSessions">Refresh</button>
              </div>

              <div v-if="sessionLoading" class="ai-session-empty">Loading sessions...</div>

              <div v-else-if="!aiSessions.length" class="ai-session-empty">No sessions yet</div>

              <div v-else class="ai-session-list">
                <div
                  v-for="session in aiSessions"
                  :key="session.chatId"
                  class="ai-session-item"
                  :class="{ active: session.chatId === activeChatId }"
                >
                  <button class="session-main" @click="selectAiSession(session.chatId)">
                    <template v-if="editingChatId === session.chatId">
                      <input
                        v-model.trim="editingTitle"
                        class="session-title-input"
                        placeholder="请输入会话标题"
                        :disabled="titleSavingChatId === session.chatId"
                        @click.stop
                        @keydown.enter.stop.prevent="saveSessionTitle(session.chatId)"
                        @keydown.esc.stop.prevent="cancelRenameSession"
                        @blur="saveSessionTitle(session.chatId)"
                      />
                    </template>
                    <template v-else>
                      <span class="session-id" :title="getSessionTitle(session)">{{ getSessionTitle(session) }}</span>
                    </template>
                    <span class="session-type">{{ session.type }}</span>
                  </button>
                  <button class="session-rename" :disabled="titleSavingChatId === session.chatId" @click.stop="startRenameSession(session.chatId)">Edit</button>
                  <button class="session-delete" @click="removeAiSession(session.chatId)">Del</button>
                </div>
              </div>
            </section>

            <section class="ai-chat-pane">
              <template v-if="!activeChatId">
                <div class="chat-create-state">
                  <div class="chat-create-copy">
                    <h4>New Session</h4>
                    <p>选择一种会话类型开始新对话，或从左侧打开已有会话。</p>
                  </div>
                  <div class="chat-create-actions">
                    <button class="create-type-btn" @click="createAiSession('chat')">新建 chat</button>
                    <button class="create-type-btn" @click="createAiSession('service')">新建 service</button>
                    <button class="create-type-btn" @click="createAiSession('pdf')">新建 pdf</button>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="ai-type-actions">
                  <button class="type-btn" @click="createAiSession('chat')">new chat</button>
                  <button class="type-btn" @click="createAiSession('service')">new service</button>
                  <button class="type-btn" @click="createAiSession('pdf')">new pdf</button>
                  <span class="session-meta">{{ getSessionTitle(activeChatId) }} · {{ activeSessionType }}</span>
                </div>

                <div v-if="isPdfSession" class="pdf-upload-row">
                  <button
                    class="pdf-upload-btn"
                    :disabled="pdfUploading || chatSending || !activeChatId"
                    @click="triggerPdfUpload"
                  >
                    {{ pdfUploading ? 'Uploading...' : 'Upload PDF' }}
                  </button>
                  <span class="pdf-upload-tip">
                    {{
                      isActivePdfUploaded
                        ? '已上传 1 个 PDF，可直接提问。'
                        : 'pdf 会话需先上传且仅上传 1 个 PDF。'
                    }}
                  </span>
                </div>

                <div v-if="isChatSession" class="chat-image-row">
                  <button
                    class="chat-image-btn"
                    :disabled="chatSending || !activeChatId"
                    @click="triggerChatImageUpload"
                  >
                    Upload Images
                  </button>
                  <span class="chat-image-tip">
                    {{ selectedChatImages.length ? `已选择 ${selectedChatImages.length} 张图片` : '可选：上传图片辅助 chat 对话' }}
                  </span>
                  <button
                    v-if="selectedChatImages.length"
                    class="chat-image-clear-btn"
                    :disabled="chatSending"
                    @click="clearSelectedChatImages"
                  >
                    Clear
                  </button>
                </div>

                <div v-if="isChatSession && selectedChatImages.length" class="chat-image-list">
                  <span v-for="(file, idx) in selectedChatImages" :key="`${file.name}-${file.size}-${idx}`" class="chat-image-item">
                    <span class="chat-image-name" :title="file.name">{{ truncate(file.name, 22) }}</span>
                    <button class="chat-image-remove" :disabled="chatSending" @click="removeSelectedChatImage(idx)">x</button>
                  </span>
                </div>

                <div ref="chatScrollRef" class="ai-chat-list">
                  <div v-if="aiDetailLoading" class="chat-empty-hint">Loading history...</div>
                  <template v-else>
                    <div v-for="item in activeMessages" :key="item.id" class="chat-row" :class="item.role">
                      <div class="chat-role">{{ item.role === 'user' ? 'You' : 'AI' }}</div>
                      <div class="chat-bubble">{{ item.content }}</div>
                    </div>
                  </template>
                </div>

                <div v-if="chatSending" class="chat-row assistant pending">
                  <div class="chat-role">AI</div>
                  <div class="chat-bubble">Thinking...</div>
                </div>

                <footer class="ai-input-wrap">
                  <input
                    ref="pdfFileInputRef"
                    type="file"
                    accept=".pdf,application/pdf"
                    class="pdf-file-input"
                    @change="handlePdfFileChange"
                  />
                  <input
                    ref="chatImageInputRef"
                    type="file"
                    multiple
                    accept="image/*"
                    class="chat-image-file-input"
                    @change="handleChatImageFileChange"
                  />
                  <textarea
                    ref="aiInputRef"
                    v-model.trim="aiPrompt"
                    class="ai-input"
                    placeholder="请输入问题，Enter 发送"
                    :disabled="chatSending || !activeChatId"
                    @keydown.enter.exact.prevent="submitAiPrompt"
                  ></textarea>
                  <button
                    class="ai-send-btn"
                    :disabled="!aiPrompt || chatSending || !activeChatId || (isPdfSession && !isActivePdfUploaded)"
                    @click="submitAiPrompt"
                  >
                    {{ chatSending ? 'Sending...' : 'Send' }}
                  </button>
                </footer>
              </template>
            </section>
          </div>
        </aside>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import {
  getLinkMonitorListAPI,
  getLinkMonitorDetailRecordsAPI,
  getMonitorTrendAPI,
  getMonitorLinkTitleDistributionAPI,
  deleteLinksByIdsAPI
} from '../api/link'
import {
  AI_CHAT_TYPES,
  createAiSessionAPI,
  getAiSessionsAPI,
  getAiSessionDetailAPI,
  deleteAiSessionAPI,
  sendAiPromptAPI,
  updateAiSessionTitleAPI,
  uploadAiPdfAPI
} from '../api/ai'
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
const isAiOpen = ref(false)
const chatScrollRef = ref(null)
const pdfFileInputRef = ref(null)
const chatImageInputRef = ref(null)
const aiInputRef = ref(null)
const sessionLoading = ref(false)
const aiDetailLoading = ref(false)
const chatSending = ref(false)
const pdfUploading = ref(false)
const aiPrompt = ref('')
const aiSessions = ref([])
const activeChatId = ref('')
const selectedCreateType = ref(AI_CHAT_TYPES.chat)
const activeMessages = ref([])
const pdfUploadedByChatId = reactive({})
const selectedChatImages = ref([])
const chatSeed = ref(1)
const editingChatId = ref('')
const editingTitle = ref('')
const titleSavingChatId = ref('')

const CHAT_IMAGE_MAX_COUNT = 3
const CHAT_IMAGE_MAX_SIZE_BYTES = 1024 * 1024

const pagination = reactive({
  pageNo: 1,
  pageSize: 30,
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

const normalizeAiRole = (role) => {
  const value = String(role || '').trim().toLowerCase()
  if (value === 'user' || value === 'human') return 'user'
  return 'assistant'
}

const normalizeAiContent = (content) => {
  const text = String(content || '').trim()
  return text || '-'
}

const normalizeSessionRow = (row) => {
  const chatId = String(row?.chatId || '').trim()
  const type = String(row?.type || AI_CHAT_TYPES.chat).trim().toLowerCase()
  return {
    chatId,
    type: Object.values(AI_CHAT_TYPES).includes(type) ? type : AI_CHAT_TYPES.chat,
    sessionTitle: String(row?.sessionTitle || '').trim()
  }
}

const findAiSession = (chatId) => {
  return aiSessions.value.find((item) => item.chatId === chatId) || null
}

const getSessionTitle = (sessionOrChatId) => {
  if (!sessionOrChatId) return ''

  if (typeof sessionOrChatId === 'string') {
    const session = findAiSession(sessionOrChatId)
    return String(session?.sessionTitle || '').trim() || sessionOrChatId
  }

  return String(sessionOrChatId.sessionTitle || '').trim() || sessionOrChatId.chatId
}

const startRenameSession = (chatId) => {
  editingChatId.value = chatId
  editingTitle.value = getSessionTitle(chatId)
}

const cancelRenameSession = () => {
  editingChatId.value = ''
  editingTitle.value = ''
}

const saveSessionTitle = async (chatId) => {
  if (titleSavingChatId.value === chatId) return

  const nextTitle = String(editingTitle.value || '').trim()
  if (!chatId) return
  const session = findAiSession(chatId)
  if (!session) {
    cancelRenameSession()
    return
  }

  const finalTitle = nextTitle

  if (!finalTitle) {
    notifyErrorOnce(new Error('empty title'), '会话标题不能为空')
    return
  }

  if (finalTitle === session.sessionTitle) {
    cancelRenameSession()
    return
  }

  titleSavingChatId.value = chatId

  try {
    await updateAiSessionTitleAPI({
      chatId,
      sessionTitle: finalTitle
    })

    aiSessions.value = aiSessions.value.map((item) => {
      if (item.chatId !== chatId) return item
      return {
        ...item,
        sessionTitle: finalTitle
      }
    })
  } catch (err) {
    notifyErrorOnce(err, '会话标题保存失败')
  } finally {
    titleSavingChatId.value = ''
    cancelRenameSession()
  }
}

const scrollChatToBottom = async () => {
  await nextTick()
  if (!chatScrollRef.value) return
  chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
}

const focusAiInput = async () => {
  await nextTick()
  aiInputRef.value?.focus()
}

const appendMessage = (role, content) => {
  activeMessages.value = [
    ...activeMessages.value,
    {
      id: `${activeChatId.value}-${chatSeed.value}`,
      role: normalizeAiRole(role),
      content: normalizeAiContent(content)
    }
  ]
  chatSeed.value += 1
}

const activeSession = computed(() => findAiSession(activeChatId.value))

const activeSessionType = computed(() => {
  return activeSession.value?.type || selectedCreateType.value
})

const isChatSession = computed(() => {
  return activeSessionType.value === AI_CHAT_TYPES.chat
})

const isPdfSession = computed(() => {
  return activeSessionType.value === AI_CHAT_TYPES.pdf
})

const isActivePdfUploaded = computed(() => {
  const chatId = activeChatId.value
  if (!chatId) return false
  return Boolean(pdfUploadedByChatId[chatId])
})

const loadAiSessions = async () => {
  sessionLoading.value = true
  try {
    const rows = await getAiSessionsAPI()
    const sessions = rows.map(normalizeSessionRow).filter((item) => item.chatId)

    aiSessions.value = sessions

    if (activeChatId.value && !sessions.some((item) => item.chatId === activeChatId.value)) {
      activeChatId.value = ''
      activeMessages.value = []
    }

    const sessionIdSet = new Set(sessions.map((item) => item.chatId))
    Object.keys(pdfUploadedByChatId).forEach((chatId) => {
      if (!sessionIdSet.has(chatId)) delete pdfUploadedByChatId[chatId]
    })
  } catch (err) {
    notifyErrorOnce(err, '加载会话列表失败')
  } finally {
    sessionLoading.value = false
  }
}

const selectAiSession = async (chatId) => {
  if (!chatId) return
  clearSelectedChatImages()
  activeChatId.value = chatId
  selectedCreateType.value = findAiSession(chatId)?.type || AI_CHAT_TYPES.chat
  if (selectedCreateType.value === AI_CHAT_TYPES.pdf && pdfUploadedByChatId[chatId] === undefined) {
    pdfUploadedByChatId[chatId] = false
  }

  aiDetailLoading.value = true
  try {
    const rows = await getAiSessionDetailAPI(chatId)
    activeMessages.value = rows.map((item) => ({
      id: `${chatId}-${chatSeed.value++}`,
      role: normalizeAiRole(item?.role),
      content: normalizeAiContent(item?.content)
    }))
  } catch (err) {
    notifyErrorOnce(err, '加载会话详情失败')
    activeMessages.value = []
  } finally {
    aiDetailLoading.value = false
    scrollChatToBottom()
  }
}

const createAiSession = async (type) => {
  const normalizedType = Object.values(AI_CHAT_TYPES).includes(type) ? type : AI_CHAT_TYPES.chat
  clearSelectedChatImages()
  selectedCreateType.value = normalizedType

  try {
    const session = await createAiSessionAPI(normalizedType)
    if (!session?.chatId) {
      notifyErrorOnce(new Error('empty chatId'), '创建会话失败：后端未返回 chatId')
      return
    }

    if (!aiSessions.value.some((item) => item.chatId === session.chatId)) {
      aiSessions.value = [session, ...aiSessions.value]
    }

    await selectAiSession(session.chatId)
  } catch (err) {
    notifyErrorOnce(err, `创建 ${normalizedType} 会话失败`)
  }
}

const removeAiSession = async (chatId) => {
  if (!chatId || chatSending.value) return

  try {
    await deleteAiSessionAPI(chatId)
    aiSessions.value = aiSessions.value.filter((item) => item.chatId !== chatId)
    if (editingChatId.value === chatId) {
      cancelRenameSession()
    }

    if (activeChatId.value === chatId) {
      activeChatId.value = ''
      activeMessages.value = []
      clearSelectedChatImages()
    }
    delete pdfUploadedByChatId[chatId]
  } catch (err) {
    notifyErrorOnce(err, '删除会话失败')
  }
}

const openAiPanel = async () => {
  isAiOpen.value = true
  await loadAiSessions()
  await scrollChatToBottom()
}

const closeAiPanel = () => {
  if (chatSending.value) return
  clearSelectedChatImages()
  isAiOpen.value = false
}

const toggleAiPanel = () => {
  if (isAiOpen.value) {
    closeAiPanel()
    return
  }
  openAiPanel()
}

const triggerPdfUpload = () => {
  if (!activeChatId.value || !isPdfSession.value || pdfUploading.value || chatSending.value) return
  pdfFileInputRef.value?.click()
}

const triggerChatImageUpload = () => {
  if (!activeChatId.value || !isChatSession.value || chatSending.value) return
  chatImageInputRef.value?.click()
}

const clearSelectedChatImages = () => {
  selectedChatImages.value = []
  if (chatImageInputRef.value) {
    chatImageInputRef.value.value = ''
  }
}

const removeSelectedChatImage = (index) => {
  if (index < 0 || index >= selectedChatImages.value.length) return
  selectedChatImages.value = selectedChatImages.value.filter((_, idx) => idx !== index)
  if (!selectedChatImages.value.length && chatImageInputRef.value) {
    chatImageInputRef.value.value = ''
  }
}

const handleChatImageFileChange = (event) => {
  const fileInput = event?.target
  const fileList = fileInput?.files
  if (!fileList || !fileList.length) return
  if (!activeChatId.value || !isChatSession.value) return

  const current = selectedChatImages.value
  const currentKeySet = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`))

  const nextFiles = []
  let hasInvalidType = false
  let hasTooLargeFile = false
  for (const file of Array.from(fileList)) {
    const isImage = String(file.type || '').startsWith('image/')
    if (!isImage) {
      hasInvalidType = true
      continue
    }
    if (file.size > CHAT_IMAGE_MAX_SIZE_BYTES) {
      hasTooLargeFile = true
      continue
    }
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`
    if (!currentKeySet.has(fileKey)) {
      currentKeySet.add(fileKey)
      nextFiles.push(file)
    }
  }

  const mergedFiles = [...current, ...nextFiles]
  if (mergedFiles.length > CHAT_IMAGE_MAX_COUNT) {
    notifyErrorOnce(new Error('too many images'), `chat 对话最多上传 ${CHAT_IMAGE_MAX_COUNT} 张图片`)
    fileInput.value = ''
    return
  }

  if (!nextFiles.length) {
    if (hasTooLargeFile) {
      notifyErrorOnce(new Error('image too large'), `单张图片不能超过 ${Math.floor(CHAT_IMAGE_MAX_SIZE_BYTES / 1024 / 1024)}MB`)
    } else {
      notifyErrorOnce(new Error('invalid image file'), '请选择图片文件上传')
    }
    fileInput.value = ''
    return
  }

  if (hasTooLargeFile) {
    notifyErrorOnce(new Error('image too large'), `部分图片超过 ${Math.floor(CHAT_IMAGE_MAX_SIZE_BYTES / 1024 / 1024)}MB，已自动忽略`)
  } else if (hasInvalidType) {
    notifyErrorOnce(new Error('invalid image file'), '部分文件不是图片，已自动忽略')
  }

  selectedChatImages.value = mergedFiles
  fileInput.value = ''
}

const handlePdfFileChange = async (event) => {
  const fileInput = event?.target
  const fileList = fileInput?.files
  const file = fileList && fileList.length ? fileList[0] : null

  if (!file) return
  if (!activeChatId.value || !isPdfSession.value) return

  const fileName = String(file.name || '').toLowerCase()
  const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf')
  if (!isPdf) {
    notifyErrorOnce(new Error('invalid file type'), '仅支持上传 PDF 文件')
    fileInput.value = ''
    return
  }

  pdfUploading.value = true
  try {
    await uploadAiPdfAPI({
      chatId: activeChatId.value,
      file
    })
    pdfUploadedByChatId[activeChatId.value] = true
    notifySuccess('PDF 上传成功，可以开始对话了')
  } catch (err) {
    notifyErrorOnce(err, 'PDF 上传失败，请稍后重试')
  } finally {
    pdfUploading.value = false
    fileInput.value = ''
  }
}

const submitAiPrompt = async () => {
  const prompt = String(aiPrompt.value || '').trim()
  if (!prompt || chatSending.value || !activeChatId.value) return
  if (isPdfSession.value && !isActivePdfUploaded.value) {
    notifyErrorOnce(new Error('missing pdf'), 'pdf 会话请先上传 1 个 PDF 文件')
    return
  }

  const imageFiles = isChatSession.value ? [...selectedChatImages.value] : []
  const imageCount = imageFiles.length
  const userPrompt = imageCount ? `${prompt}\n[已附带图片 ${imageCount} 张]` : prompt

  if (!isAiOpen.value) {
    await openAiPanel()
  }

  appendMessage('user', userPrompt)
  aiPrompt.value = ''
  clearSelectedChatImages()
  chatSending.value = true
  scrollChatToBottom()

  try {
    const payload = await sendAiPromptAPI({
      type: activeSessionType.value,
      prompt,
      chatId: activeChatId.value,
      files: imageFiles
    })

    const assistantRows = payload
      .filter((item) => normalizeAiRole(item?.role) !== 'user')
      .map((item) => ({
        id: `${activeChatId.value}-${chatSeed.value++}`,
        role: normalizeAiRole(item?.role),
        content: normalizeAiContent(item?.content)
      }))

    if (assistantRows.length) {
      activeMessages.value = [...activeMessages.value, ...assistantRows]
    } else {
      appendMessage('assistant', '本次没有返回可展示的回复内容。')
    }
  } catch (err) {
    notifyErrorOnce(err, 'AI 对话请求失败，请稍后再试')
    appendMessage('assistant', '请求失败了，请检查网络或稍后再试。')
  } finally {
    chatSending.value = false
    scrollChatToBottom()
    focusAiInput()
  }
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
  const total = totalPages.value
  const current = pagination.pageNo
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = start + windowSize - 1

  if (end > total) {
    end = total
    start = Math.max(1, end - windowSize + 1)
  }

  const pages = []
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

const trendAreaPoints = computed(() => {
  const dots = trendDots.value
  if (!dots.length) return ''
  const first = dots[0]
  const last = dots[dots.length - 1]
  const linePoints = dots.map((d) => `${d.x},${d.y}`).join(' ')
  return `${linePoints} ${last.x},190 ${first.x},190`
})

const linkTitleLegend = computed(() => {
  const colors = ['#4a7c6f', '#7c6b4a', '#4a5e7c', '#7c4a6b', '#6b7c4a', '#7c4a4a', '#4a6b7c', '#7c724a']
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

.monitor-workspace {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.monitor-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.ai-panel {
  min-height: 0;
  border-radius: 22px;
  border: 1px solid #d8dce1;
  background:
    radial-gradient(circle at 92% 8%, rgba(15, 23, 42, 0.16), transparent 40%),
    linear-gradient(165deg, #fafafa 0%, #edf1f5 52%, #f7f9fc 100%);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 42px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-workspace {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 10px;
}

.ai-session-pane {
  min-height: 0;
  border: 1px solid #d7dee8;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
}

.ai-session-head {
  padding: 8px 10px;
  border-bottom: 1px solid #e5eaf1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mini-refresh {
  border: 1px solid #cfd7e3;
  background: #fff;
  color: #334155;
  border-radius: 8px;
  height: 26px;
  padding: 0 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.mini-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-session-empty {
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.8rem;
  padding: 10px;
  text-align: center;
}

.ai-session-list {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}

.ai-session-item {
  border: 1px solid #d4dce8;
  border-radius: 10px;
  background: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.ai-session-item.active {
  border-color: #111827;
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.15);
}

.session-main {
  min-width: 0;
  text-align: left;
  border: none;
  background: transparent;
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-id {
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-title-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 8px;
  outline: none;
}

.session-type {
  width: fit-content;
  border-radius: 999px;
  padding: 1px 8px;
  background: #eef2f7;
  color: #475569;
  font-size: 0.68rem;
  font-weight: 700;
}

.session-rename,
.session-delete {
  border: none;
  border-left: 1px solid #e2e8f0;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0 8px;
  cursor: pointer;
}

.session-rename {
  color: #64748b;
}

.session-rename:hover {
  color: #0f172a;
}

.session-delete {
  color: #94a3b8;
}

.session-delete:hover {
  color: #b91c1c;
}

.ai-chat-pane {
  min-height: 0;
  border: 1px solid #d7dee8;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.ai-type-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.type-btn {
  height: 30px;
  border-radius: 999px;
  border: 1px solid #cfd7e3;
  background: #fff;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0 12px;
  cursor: pointer;
  text-transform: lowercase;
}

.type-btn.active {
  background: #111827;
  border-color: #111827;
  color: #f8fafc;
}

.session-meta {
  margin-left: auto;
  font-size: 0.72rem;
  color: #64748b;
  max-width: 52%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-empty-hint {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  font-size: 0.82rem;
}

.chat-create-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  text-align: center;
}

.chat-create-copy h4 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 1.1rem;
}

.chat-create-copy p {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.6;
}

.chat-create-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.create-type-btn {
  min-width: 136px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #111827;
  background: #111827;
  color: #f8fafc;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.create-type-btn:hover {
  background: #1f2937;
}

.ai-popup {
  position: fixed;
  right: 24px;
  top: 104px;
  width: min(800px, 35vw);
  height: calc(100vh - 206px);
  z-index: 1100;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.15), 0 8px 16px -6px rgba(15, 23, 42, 0.1);
}

.ai-fab {
  position: fixed;
  right: 28px;
  bottom: 40px;
  top: auto;
  z-index: 900;
  min-width: 110px;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(15, 23, 42, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 35px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(15, 23, 42, 0.2);
}

.ai-fab:active {
  transform: translateY(0) scale(0.96);
}

.ai-fab.active {
  opacity: 0;
  pointer-events: none;
}

.ai-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-close-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.ai-close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-slide-enter-active,
.ai-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-slide-enter-from,
.ai-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-panel-header h3 {
  margin: 0;
  font-size: 0.94rem;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.ai-panel-header p {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ai-chat-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 2px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-row.user {
  align-items: flex-end;
}

.chat-role {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.chat-bubble {
  width: fit-content;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 0.84rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #0f172a;
}

.chat-row.user .chat-bubble {
  border-color: #111827;
  background: #111827;
  color: #f8fafc;
}

.chat-row.pending .chat-bubble {
  color: #64748b;
  border-style: dashed;
}

.ai-input-wrap {
  display: grid;
  gap: 8px;
}

.pdf-upload-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pdf-upload-btn {
  height: 30px;
  border-radius: 999px;
  border: 1px solid #334155;
  background: #fff;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0 12px;
  cursor: pointer;
}

.pdf-upload-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pdf-upload-tip {
  color: #64748b;
  font-size: 0.74rem;
}

.pdf-file-input {
  display: none;
}

.chat-image-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chat-image-btn,
.chat-image-clear-btn {
  height: 30px;
  border-radius: 999px;
  border: 1px solid #334155;
  background: #fff;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0 12px;
  cursor: pointer;
}

.chat-image-clear-btn {
  border-color: #cbd5e1;
  color: #64748b;
}

.chat-image-btn:disabled,
.chat-image-clear-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.chat-image-tip {
  color: #64748b;
  font-size: 0.74rem;
}

.chat-image-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chat-image-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
}

.chat-image-name {
  max-width: 160px;
  font-size: 0.74rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-image-remove {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.72rem;
  line-height: 1;
  cursor: pointer;
}

.chat-image-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-image-file-input {
  display: none;
}

.ai-input {
  width: 100%;
  min-height: 92px;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid #cdd5df;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  box-sizing: border-box;
  outline: none;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #0f172a;
}

.ai-input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.08);
}

.ai-send-btn {
  height: 36px;
  border-radius: 999px;
  border: 1px solid #111827;
  background: #111827;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.ai-send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-btn:active {
  transform: scale(0.96);
}

.filter-btn.primary {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.filter-btn.primary:hover {
  background: #1e293b;
  border-color: #1e293b;
}

.charts-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 12px;
}

.chart-card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 22px;
  background: linear-gradient(155deg, #ffffff 0%, #f1f5f9 100%);
  padding: 16px 18px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 4px 20px rgba(15, 23, 42, 0.06),
    0 16px 48px rgba(15, 23, 42, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 32px rgba(15, 23, 42, 0.08),
    0 24px 64px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent);
  pointer-events: none;
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

.trend-grid-h {
  stroke: #e2e8f0;
  stroke-width: 0.8;
  stroke-dasharray: 5 4;
}

.trend-area {
  fill: url(#areaGradient);
}

.trend-line-blur {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.35;
}

.trend-line {
  fill: none;
  stroke: #0f172a;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-dot-halo {
  fill: #0f172a;
  opacity: 0.08;
}

.trend-dot-outer {
  fill: #0f172a;
  stroke: white;
  stroke-width: 2;
}

.trend-dot-inner {
  fill: white;
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
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  flex-shrink: 0;
  position: relative;
  box-shadow:
    0 4px 20px rgba(15, 23, 42, 0.14),
    0 1px 4px rgba(15, 23, 42, 0.08);
}

.pie::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.95);
  pointer-events: none;
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
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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
  display: inline-block;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.link-badge {
  text-decoration: none;
  transition: all 0.2s;
}

.link-badge:hover {
  background: #e2e8f0;
  color: #2563eb;
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
  justify-content: center;
  position: relative;
  gap: 12px;
  padding: 10px 60px;
  flex-shrink: 0;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
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
  transition: background 0.15s, border-color 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.page-btn.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.page-size {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
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

  .ai-fab {
    right: 16px;
    bottom: 24px;
    top: auto;
  }

  .ai-popup {
    right: 0;
    top: 84px;
    width: 100vw;
    height: calc(100vh - 84px);
    border-radius: 24px 24px 0 0;
    border: none;
    border-top: 1px solid #e2e8f0;
  }

  .ai-workspace {
    grid-template-columns: 1fr;
  }

  .ai-session-pane {
    max-height: 180px;
  }

  .session-meta {
    max-width: 100%;
    margin-left: 0;
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

  .ai-popup {
    height: calc(100vh - 84px);
  }

  .ai-session-head,
  .session-id,
  .chat-bubble,
  .ai-input {
    font-size: 0.78rem;
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

