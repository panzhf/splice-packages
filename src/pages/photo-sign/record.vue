<template>
  <view class="sign-record">
    <none-data v-if="showNoneData" msg="暂无打卡记录" />
    <view v-else class="pt-20 pr-20 pb-20 pl-20">
      <SignItem
        v-for="(item, index) in list"
        :key="index"
        :info="{ ...item, audittype: auditType }"
        :aid="actId"
        :mode="2"
      />
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import SignItem from './components/sign-item'
import loadMoreMixin from 'packages/mixins/load-more'
import { apiGetRecord, apiHasDiary } from 'packages/api/photo-sign'

export default {
  name: 'SignRecord',
  components: { NoneData, LoadMore, SignItem },
  mixins: [loadMoreMixin],
  data() {
    return {
      actId: '',
      auditType: 0, // 审核类型
      isOpenDiary: false, // 开启打卡日记
      loading: true
    }
  },
  async onLoad(options) {
    uni.hideShareMenu()
    if (!options.id) return
    this.actId = options.id
    options.type && (this.auditType = +options.type)
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  onShareAppMessage(options) {
    const DEFAULT_TITLE = '拍照打卡，记录美好生活~'
    if (options.from === 'button') {
      const { detailid, content, image } = options.target.dataset
      return {
        title: content || DEFAULT_TITLE,
        imageUrl: image,
        path: `/packages/src/pages/photo-sign/${this.isOpenDiary ? 'diary' : 'index'}?aid=${
          this.actId
        }&detailid=${detailid}`
      }
    }
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        let res = await apiGetRecord({
          aid: this.actId,
          pageindex: nextPage,
          pagesize: this.paging.pageSize
        })
        const d = this.$toLowerKey(res, true)
        if (this.$ck(d)) {
          this.dealRes({ res: d, nextPage, mode: 2 })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    judgeOpenDiary() {
      apiHasDiary({ aid: this.actId }).then(res => {
        this.isOpenDiary = res.return_data
      })
    }
  }
}
</script>
