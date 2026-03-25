<template>
  <view>
    <title-bar title="种草社区" type="detail" show-nav-title show-placeholder bgcolor="#ff5c53" textcolor="#fff" />
    <view class="content">
      <view class="bg" />
      <view class="list">
        <view class="topic-title flex flex-middle flex-between bg-white mb-20 br-10">
          <view class="left flex-1 fs-30 fw-bold">#{{ topicname }}</view>
          <span class="iconfont icon-close fs-24" @tap="handleToBack" />
        </view>
        <content-item
          v-for="(item, index) in list"
          :key="index"
          :tag-clck="false"
          :checked-tag-id="topicid"
          tag-checked-color="#2a2a2a"
          tag-color="#888"
          class="item mb-20"
          :info="item"
          @shareData="setShare"
          @update="e => update(e, index)"
        />
        <load-more v-if="!loading && list.length" :has-more="hasMore" />
        <none-data v-if="!list.length && !loading" />
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiContentCommunityDetailList } from 'packages/api/community'
import { getExtConfig } from '@/config/index'
import TitleBar from 'packages/components/title-bar/title-bar'
import ContentItem from './components/content.vue'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import shareInfo from './mixins/share'
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
      topicname: '',
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
    this.topicid = Number(options.id)
    this.topicname = decodeURIComponent(options.title)
    this.Memberlogin = this.$toLowerKey(getExtConfig()).memberlogin
    this.getData()
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
    handleToBack() {
      uni.navigateBack()
    },
    getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      apiContentCommunityDetailList({
        communityid: this.id,
        maxid: this.maxid,
        expectid: this.expectid,
        m: this.Memberlogin,
        topicid: this.topicid
      })
        .then(res => {
          this.list = [...this.list, ...res.return_data]
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
.topic-title {
  padding: 25rpx 30rpx;
  .left {
    color: #2a2a2a;
  }
}
</style>
