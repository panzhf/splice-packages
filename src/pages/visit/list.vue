<template>
  <view class="page" style="min-height: 100vh">
    <view class="header-box bg-f">
      <tab
        :tab="tabArr"
        active-color="#3246C3"
        draw-height="2"
        active-bag-color="#3246C3"
        :active-index.sync="activeIndex"
        draw-width="80"
        class="tab"
        @change="handleTabChange"
      />
      <!-- 客户列表Tab -->
      <view v-if="activeIndex === 0" class="search">
        <selector-picker
          v-model="filter.customerType"
          :value="filter.customerType"
          :options="filteredCustomerTypeOptions"
          range-key="label"
          range-value="val"
          class="search-picker"
          @change="handleCustomerTypeChange"
        />
        <search-input
          v-model="filter.keyword"
          placeholder="搜索客户名称/编号/手机号"
          class="search-input flex-1"
          @search="handleSearch"
        />
      </view>
      <!-- 拜访记录Tab -->
      <view v-else class="search">
        <search-input
          v-model="filter.keyword"
          placeholder="搜索客户名称/编号/手机号/任务名称"
          class="search-input"
          @search="handleSearch"
        />
      </view>
    </view>
    <view :style="{ height: headerHeight }"></view>
    <!-- 排序Tab（仅客户列表Tab显示，不固定在顶部） -->
    <view v-if="activeIndex === 0" class="sort-tab-box flex">
      <view
        v-for="(item, index) in filteredSortTabs"
        :key="index"
        class="sort-tab-item flex-1 flex flex-middle flex-center"
        :class="{ active: item.sort === 0 || item.sort === 1 }"
        @tap="handleSortSelect(index, item)"
      >
        <view>{{ item.name }}</view>
        <view class="caret-wrapper flex flex-column flex-center ml-10 mr-20">
          <view class="sort-caret ascending" :class="{ active: item.sort === 0 }"></view>
          <view class="sort-caret descending" :class="{ active: item.sort === 1 }"></view>
        </view>
      </view>
    </view>
    <!-- 客户列表 -->
    <template v-if="activeIndex === 0">
      <list-card
        v-for="(item, index) in list"
        :key="index"
        hide-opera
        @tap="handleCustomerClick(item)"
      >
        <view slot="slot-list" class="customer-content p-r">
          <view class="customer-name ellipsis fs-30 fw-bold c-2 mb-10 pr-200">
            {{ item.customername || '  '}}
          </view>
          <view class="distance-status p-a">
            <view
              class="visit-status fs-26 mb-10 fw-bold"
              :class="[getVisitStatusClass(item)]"
            >
              {{ getVisitStatusText(item) }}
            </view>
            <view v-if="filter.customerType === 1" class="distance fs-26 c-6">{{ formatDistance(item.distance) }}</view>
          </view>
          <view class="customer-no fs-26 c-6 mb-10">{{ item.customerno }}</view>
          <view class="customer-address fs-26 c-6 ellipsis">{{ item.address || '' }}</view>
          <text class="icon-detail iconfont iconjiantou ml-10 fs-20"></text>
        </view> 
      </list-card>
    </template>
    <!-- 拜访记录列表 -->
    <template v-else>
      <list-card
        v-for="(item, index) in list"
        :key="index"
        hide-opera
        @tap="handleRecordClick(item)"
      >
        <view slot="slot-list" class="record-content p-r">
          <view class="customer-name ellipsis fs-30 fw-bold c-2 mb-10 pr-200 ">{{ (item.customer && item.customer.customername) || item.customername }}</view>
          <view class="record-status p-a">
            <view
              class="visit-status fs-26 mb-10 fw-bold"
              :class="item.status === 1 ? 'visited' : 'visiting'"
            >
              {{ item.statusdesc }}
            </view>
          </view>
          <view class="record-info-box">
            <view class="customer-no fs-26 c-6 mb-10">{{ (item.customer && item.customer.customerno) || item.customerno }}</view>
              <view class="record-info fs-26 c-6">
                <view>抵达：{{ item.arrivetime }}</view>
                <view v-if="item.status === 1 && item.leavetime">离开：{{ item.leavetime }}</view>
                <view v-if="item.status === 1 && item.duration">用时：{{ formatDuration(item.duration) }}</view>
              </view> 
              <text class="icon-record-detail iconfont iconjiantou ml-10 fs-20"></text>
          </view>
        </view>
      </list-card>
    </template>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <view v-if="showNoneData" class="none-data">
      <NoneData :msg="noneDataMsg" />
    </view>
    <!-- 新增按钮（仅客户列表Tab且客户类型为门店时显示） -->
    <add-customer-button 
      v-if="showAddBtn"
      :show="showAddBtn"
      @click="handleAddCustomer"
    />
    <!-- 任务选择弹窗 -->
    <task-picker v-model="showTaskPicker" :customer-info="selectedCustomer" :customer-type="filter.customerType" :task-list="taskList" @select="handleTaskSelect" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import Tab from '@/components/tab.vue'
import SearchInput from '@/components/search/search-input.vue'
import SelectorPicker from '@/components/search/selector-picker.vue'
import ListCard from '@/components/list-card/list-card.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import NoneData from '@/components/nodata.vue'
import TaskPicker from './components/task-picker.vue'
import AddCustomerButton from './components/add-customer-button.vue'
import { locationMixin } from './mixins'
import { customerTypeOptions } from './config'
import { apiGetCustomerList, apiGetVisitRecordList, apiGetCustomerTasks } from 'packages/api/visit'
import loadMoreMixin from '@/mixins/load-more-maxid'

export default {
  components: {
    Tab,
    SearchInput,
    SelectorPicker,
    ListCard,
    LoadMore,
    NoneData,
    TaskPicker,
    AddCustomerButton
  },
  mixins: [locationMixin, loadMoreMixin],
  data() {
    return {
      activeIndex: 0, // 0-客户列表，1-拜访记录
      tabArr: ['客户列表', '拜访记录'],
      loading: true,
      currentLocation: null, // 当前保存的位置信息
      sortTabs: [
        {
          name: '距离',
          value: 0, // 0-按距离，1-按拜访时间
          sort: 0 // 0-升序，1-降序（默认升序）
        },
        {
          name: '拜访时间',
          value: 1,
          sort: null // null-未激活，0-升序，1-降序
        }
      ],
      filter: {
        keyword: '',
        customerType: 1, // 0-全部，1-门店，2-经销商（默认选中门店）
        sortType: 0, // 0-按距离，1-按拜访时间（默认按距离）
        sortOrder: 0 // 0-升序，1-降序（默认升序）
      },
      customerTypeOptions: customerTypeOptions,
      showTaskPicker: false,
      selectedCustomer: null,
      taskList: [] // 客户可执行任务列表
    }
  },
  computed: {
    userinfo() {
      return uni.getStorageSync('currentUserInfo') ? JSON.parse(uni.getStorageSync('currentUserInfo')) : {}
    },
    salemanType() {
      // 1厂家业务员 2经销商业务员
      return this.userinfo.dealerid > 0 ? 2 : this.userinfo.dealerid === 0 ? 1 : 0
    },
    showAddBtn() {
      // 显示条件：客户列表Tab && 客户类型为门店
      return this.activeIndex === 0 && this.filter.customerType === 1
    },
    headerHeight() { 
      return '220rpx'
    },
    showNoneData() {
      return !this.loading && this.list.length === 0
    },
    noneDataMsg() {
      if (this.activeIndex === 0) {
        return '暂无数据'
      } else {
        return '暂无拜访记录'
      }
    },
    // 过滤后的排序选项：当客户类型为经销商时，隐藏按距离排序
    filteredSortTabs() {
      // 客户类型为经销商(2)时，只显示拜访时间排序
      if (this.filter.customerType === 2) {
        return this.sortTabs.filter(tab => tab.value === 1)
      }
      return this.sortTabs
    },
    // 过滤后的客户类型选项：经销商业务员仅支持门店
    filteredCustomerTypeOptions() {
      // 经销商业务员(salemanType === 2)时，只显示门店选项
      if (this.salemanType === 2) {
        return this.customerTypeOptions.filter(option => option.val === 1)
      }
      return this.customerTypeOptions
    }
  },
  onShow() {
    // 触发隐私协议弹窗
    if (this.$refs.privacyPopup) {
      this.$refs.privacyPopup.refresh()
    }
    this.handleSearch()
  },
  methods: {
    // Tab切换
    async handleTabChange() { 
      await this.resetData()
      this.handleSearch()
    },
    // 搜索
    async handleSearch(location = null) {
      // 只有客户列表才需要位置信息
      if (this.activeIndex === 0) {
        // 如果未传入位置信息，则重新获取地理位置
        if (!location) {
          location = await this.getCurrentLocation()
        }
        // 保存位置信息（即使为null也保存，避免重复获取）
        this.currentLocation = location
      }
      await this.resetData()
      this.getData(location)
    },
    // 获取数据
    async getData(location = null) {
      try {
        if (this.busy) return
        this.busy = true
        const nextPage = this.paging.page + 1

        const api = this.activeIndex === 0 ? apiGetCustomerList : apiGetVisitRecordList
        
        let params = {}
        
        if (this.activeIndex === 0) {
          // 客户列表接口参数
          // 如果没有传入位置信息，使用已保存的位置
          if (!location || !location.latitude || !location.longitude) {
            location = this.currentLocation
          }
          // 构建请求参数
          params = {
            salesmanId: this.userinfo.salesmanid,
            customerType: this.filter.customerType || 0,
            keyword: this.filter.keyword || '',
            sortType: this.filter.sortType ?? 0,
            sortOrder: this.filter.sortOrder ?? 0,
            pageNum: nextPage,
            pageSize: this.paging.pageSize
          }
          // 如果有位置信息，添加到参数中
          if (location && location.latitude && location.longitude) {
            params.latitude = location.latitude
            params.longitude = location.longitude
          }
        } else {
          // 拜访记录列表接口参数（不需要位置信息）
          params = {
            pageNum: nextPage,
            pageSize: this.paging.pageSize,
            ...this.filter
          }
        }
        
        const res = await api(params) 

        if (this.$ck(res)) {
          // 统一 totalcount 字段
          if (res.return_data && !res.return_data.totalcount) {
            res.return_data.totalcount = res.return_data.total || 0
          }
          this.dealRes({ res, nextPage, listProp: 'list' })
          this.busy = false
          this.loading = false
        } else {
          this.busy = false
          this.loading = false
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.busy = false
        this.loading = false
      }
    },
    // 排序选择
    async handleSortSelect(index, item) {
      let location = null
      // 如果是按距离排序，需要先检查是否能获取到位置
      if (item.value === 0) {
        location = await this.getCurrentLocation()
        if (!location || !location.latitude || !location.longitude) {
          // 无法获取位置信息，提示用户
          uni.showToast({
            title: '无法获取位置信息，不支持按距离排序',
            icon: 'none',
            duration: 2000
          })
          return // 不执行后续操作
        }
      }
      
      // 重置其他排序项（使用 value 来匹配，而不是索引）
      this.sortTabs.forEach((tab) => {
        if (tab.value !== item.value && tab.value !== undefined) {
          tab.sort = null
        }
      })
      
      // 切换当前排序项的状态：0(升序) <-> 1(降序)，不允许取消排序
      // sort: 0-升序，1-降序
      if (item.sort === 0) {
        item.sort = 1 // 切换到降序
      } else {
        item.sort = 0 // 切换到升序
      }
      
      // 更新筛选条件
      // sortType: 0-按距离，1-按拜访时间
      // sortOrder: 0-升序，1-降序
      this.filter.sortType = item.value
      this.filter.sortOrder = item.sort // 0(升序) -> 0, 1(降序) -> 1
      
      // 如果已经获取了位置信息，传递给 handleSearch 避免重复获取
      this.handleSearch(location)
    },
    // 客户类型选择
    handleCustomerTypeChange() {
      // 如果切换到经销商，且当前是距离排序，需要重置为拜访时间排序
      if (this.filter.customerType === 2 && this.filter.sortType === 0) {
        // 重置距离排序状态
        const distanceTab = this.sortTabs.find(tab => tab.value === 0)
        if (distanceTab) {
          distanceTab.sort = null // 未激活
        }
        // 设置为拜访时间排序（默认升序）
        const timeTab = this.sortTabs.find(tab => tab.value === 1)
        if (timeTab) {
          timeTab.sort = 0 // 升序
        }
        this.filter.sortType = 1 // 按拜访时间
        this.filter.sortOrder = 0 // 升序
      }
      this.handleSearch()
    },
    // 客户点击
    async handleCustomerClick(item) {
      this.selectedCustomer = item
      // 获取客户可执行任务列表
      const customerId = item.customerid || item.id
      try {
        const res = await apiGetCustomerTasks({ 
          customerId, 
          customerType: this.filter.customerType 
        })
        if (this.$ck(res)) {
          this.taskList = (res.return_data && res.return_data.list) || res.return_data || []
      // 如果只有一个任务，直接进入任务执行页
          if (this.taskList.length === 1) {
            const task = this.taskList[0]
            const taskid = task.taskid || task.id
            this.$navPage(`./task-execute?customerid=${customerId}&taskid=${taskid}`)
          } else if (this.taskList.length > 1) {
      // 如果有多个任务，显示任务选择弹窗
      this.showTaskPicker = true
          } else {
            // 如果没有任务，提示用户
            uni.showToast({
              title: '暂无可执行的任务',
              icon: 'none',
              duration: 2000
            })
          }
        }
      } catch (error) {
        console.error('获取任务列表失败:', error)
        uni.showToast({
          title: '获取任务列表失败',
          icon: 'none',
          duration: 2000
        })
      }
    },
    // 任务选择
    handleTaskSelect(task) {
      this.showTaskPicker = false
      // 跳转到任务执行页
      const customerid = this.selectedCustomer.customerid || this.selectedCustomer.id
      const taskid = task.taskid || task.id
      this.$navPage(`./task-execute?customerid=${customerid}&taskid=${taskid}`)
    },
    // 记录点击
    handleRecordClick(item) {
      const recordid = item.recordid || item.id
      this.$navPage(`./record-detail?recordid=${recordid}`)
    },
    // 新增客户
    handleAddCustomer() {
      // 跳转到新增门店
      this.$navPage('/pages/store-manage/add-store?type=1&id=0')
    },
    // 获取拜访状态文本
    getVisitStatusText(item) {
      const lastVisitDays = item.lastVisitDays || item.lastvisitdays
      if (item.statusdesc === '拜访中') {
        return '拜访中'
      }
      if (lastVisitDays === -1 || lastVisitDays == null) {
        return '未拜访'
      }
      if (lastVisitDays === 0) {
        return '今日已拜访'
      }
      return `${lastVisitDays}天未拜访`
    },
    // 获取拜访状态样式类
    getVisitStatusClass(item) {
      const lastVisitDays = item.lastVisitDays || item.lastvisitdays
      if (lastVisitDays === -1 || lastVisitDays == null) {
        return 'not-visited'
      }
      if (lastVisitDays === 0 || item.statusdesc === '拜访中') {
        return 'visited-today'
      }
      return 'visited-before'
    },
    // 格式化时长（分钟转文本）
    formatDuration(duration) {
      if (typeof duration === 'string') return duration
      if (!duration) return '--'
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/list.scss';
</style>

