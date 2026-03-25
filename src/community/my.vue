<template>
  <view>
    <title-bar title="我的上传" type="detail" show-nav-title show-placeholder bgcolor="#f4f4f4" />
    <view class="content">
      <view class="list">
        <Content
          v-for="(item, index) in list"
          :key="index"
          :tag-clck="false"
          :info="item"
          class="item mb-20"
          type="my"
          @shareData="setShare"
          @del="handDel(index)"
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
import { getExtConfig } from '@/config/index'
import { apiGetMyContent } from 'packages/api/community'
import TitleBar from 'packages/components/title-bar/title-bar'
import Content from './components/content.vue'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import shareInfo from './mixins/share'
export default {
  components: {
    TitleBar,
    NoneData,
    LoadMore,
    Content
  },
  mixins: [shareInfo],
  data() {
    return {
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      maxid: 0,
      Memberlogin: ''
    }
  },
  onLoad() {
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
    handDel(index) {
      this.list.splice(index, 1)
    },
    getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      apiGetMyContent({
        m: this.Memberlogin,
        maxid: this.maxid
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
</style>
