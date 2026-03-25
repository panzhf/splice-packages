<template>
  <view class="photo-sign flex flex-between" :style="bgStyle">
    <view class="flex-1 flex" :style="{ color: info.baseColor }">
      <view class="count-box text-center fs-24">
        <view>
          <text class="count fw-bold fs-40" :style="{ color: info.countColor }">{{ photoSignCount.total }}</text>
          天
        </view>
        <view>累计打卡</view>
      </view>
      <view class="count-box text-center fs-24">
        <view>
          <text class="count fw-bold fs-40" :style="{ color: info.countColor }">{{ photoSignCount.month }}</text>
          天
        </view>
        <view>本月打卡</view>
      </view>
    </view>
    <view class="btn text-center fs-28 br-8" :style="btnStyle" @tap.stop="handleOpenLink(info.linkInfo)">立即打卡</view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
/* #ifdef MP-WEIXIN */
import { mapState } from 'vuex'
import { getUrlQuery } from 'packages/utils/function'
/* #endif */
export default {
  name: 'PhotoSign',
  mixins: [openLinkMixin],
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      /* #ifdef H5-DECORATE */
      photoSignCount: {
        total: 24,
        month: 3
      }
      /* #endif */
    }
  },
  computed: {
    bgStyle() {
      let s = []
      if (this.info.bgUrl) {
        s.push(`background-image: url(${this.info.bgUrl})`)
      }
      if (this.info.bgColor) {
        s.push(`background-color: ${this.info.bgColor}`)
      }
      if (this.info.gap) {
        s.push(`margin: 0 ${this.info.gap * 2}rpx`)
      }
      if (this.info.radius) {
        s.push(`border-radius: ${this.info.radius * 2}rpx`)
      }
      return s.join(';')
    },
    btnStyle() {
      let s = []
      s.push(`color: ${this.info.btnColor}`)
      s.push(`background-color: ${this.info.btnBg}`)
      return s.join(';')
    },
    /* #ifdef MP-WEIXIN */
    ...mapState('photoSign', {
      photoSignCount: state => state.photoSignCount
    })
    /* #endif */
  },
  mounted() {
    /* #ifdef MP-WEIXIN */
    const link = this.info.linkInfo?.Link || ''
    const { id } = getUrlQuery(decodeURIComponent(link.split('?scene=')[1]))
    if (!id) {
      this.$store.commit('photoSign/setPhotoSign', { total: 0, month: 0 })
      return
    }
    this.$store.dispatch('photoSign/updatePhotoSign', { mpid: id })
    /* #endif */
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: photo-sign;
.#{$prefix} {
  height: 144rpx;
  background-size: cover;
  background-repeat: no-repeat;
  padding: 0 48rpx;
  .count-box {
    margin-top: 36rpx;
    & + .count-box {
      margin-left: 60rpx;
    }
    .count {
      margin-right: 4rpx;
    }
  }
  .btn {
    @include whl(160rpx, 64rpx);
    margin: 52rpx 0 0 48rpx;
  }
}
</style>
