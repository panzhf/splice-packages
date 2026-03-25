<template>
  <view>
    <title-bar title="种草社区" type="detail" show-nav-title show-placeholder bgcolor="#ff5c53" textcolor="#fff" />
    <view class="content">
      <view class="bg" />
      <view class="list">
        <content-item
          v-for="(item, index) in list"
          :key="index"
          :info="item"
          class="item mb-20"
          @shareData="setShare"
          @update="e => update(e, index)"
        />
        <load-more v-if="!loading && list.length" :has-more="hasMore" />
        <none-data v-if="!list.length && !loading" />
      </view>
      <md-copyright />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiContentCommunityDetailList, apiContentCommunityDetail } from 'packages/api/community'
import { getExtConfig } from '@/config/index'
import TitleBar from 'packages/components/title-bar/title-bar'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import shareInfo from './mixins/share'
import ContentItem from './components/content.vue'
import { getUrlQuery } from 'packages/utils/function'
export default {
  components: {
    TitleBar,
    ContentItem,
    NoneData,
    LoadMore
  },
  mixins: [shareInfo],
  data() {
    return {
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      maxid: 0,
      id: 0,
      Memberlogin: '',
      topicid: '',
      expectid: ''
    }
  },
  onLoad(options) {
    if (options.scene) {
      let params = getUrlQuery(decodeURIComponent(options.scene))
      this.id = params.id
      this.expectid = params.id
    } else {
      this.id = options.id
    }
    this.Memberlogin = this.$toLowerKey(getExtConfig()).memberlogin
    this.getDetail()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    update(val, index) {
      this.$set(this.list, index, val)
    },
    getDetail() {
      apiContentCommunityDetail({
        communityid: this.id,
        m: this.Memberlogin
      })
        .then(res => {
          this.list.push({ ...res.return_data, istaped: false })
          this.getData()
        })
        .catch(err => {
          this.$msg(err.return_msg)
          this.getData()
        })
    },
    getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      this.loading = true
      apiContentCommunityDetailList({
        communityid: this.id,
        maxid: this.maxid,
        expectid: this.expectid,
        m: this.Memberlogin,
        topicid: this.topicid
      })
        .then(res => {
          const result = (res.return_data || []).map(item => ({ ...item, istaped: false }))
          this.list = [...this.list, ...result]
          this.maxid = res.return_maxid
          // 判断加载完成
          this.hasMore = res.return_maxid !== 0
          this.busy = false
          this.loading = false
        })
        .catch(err => {
          this.$msg(err.return_msg)
          this.busy = false
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/list.scss';
@include list();
@include bg();
</style>
