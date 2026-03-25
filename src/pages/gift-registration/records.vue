<template>
  <view class="gift-records-page">
    <view class="record-list">
      <view v-for="(item, index) in list" :key="index" class="record-item flex flex-middle justify-between" @tap="handleRecordClick(item)">
        <view class="record-content flex-1">
          <view class="record-title fs-30 c-3">
            <text class="record-bullet">·</text>
            <text>填写了{{ item.ActivityName }}</text>
          </view>
          <view class="record-time c-8">时间: {{ item.AddTime || '--' }}</view>
        </view>
        <view class="record-arrow" />
      </view>
    </view>

    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="showNoneData" msg="暂无记录" />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetUserRecords } from 'packages/api/gift-registration'
import { getOpenId, getMemberLogin } from './mixins'
import LoadMore from 'packages/components/load-more/index.vue'
import NoneData from 'packages/components/none-data/index.vue'
import loadMoreMixin from 'packages/mixins/load-more'

export default {
  components: {
    LoadMore,
    NoneData
  },
  mixins: [loadMoreMixin],
  data() {
    return {
      activityId: 0,
      openId: '',
      memberlogin: '',
      loading: true
    }
  },
  onLoad(options) {
    this.activityId = Number(options.activityid || options.id || 0)
    this.openId = getOpenId(options)
    this.memberlogin = getMemberLogin(options)
    this.getData()
  },
  onPullDownRefresh() {
    this.resetData()
    this.getData()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        const params = {
          pageNum: nextPage,
          pageSize: this.paging.pageSize,
          activityID: this.activityId
        }
        // #ifdef H5
        params.openID = this.openId || ''
        params.memberLogin = this.memberlogin || ''
        // #endif
        const res = await apiGetUserRecords(params)
        if (this.$ck(res)) {
          const { return_data } = res
          this.dealRes({
            res: {
              return_data: {
                Results: return_data.Results || [],
                totalcount: return_data.TotalCount
              }
            },
            nextPage,
            listProp: 'Results'
          })
        }
      } catch (error) {
        this.$msg('获取记录失败')
      } finally {
        this.busy = false
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    handleRecordClick(item) {
      const recordId = item.ID
      if (!recordId) return
      uni.navigateTo({
        url: `./record-detail?recordid=${recordId}&activityid=${this.activityId || ''}&openid=${encodeURIComponent(this.openId || '')}&m=${encodeURIComponent(this.memberlogin || '')}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
