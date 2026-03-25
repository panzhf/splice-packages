<template>
  <view class="overdue">
    <image :src="iconImg" mode="scaleToFill" class="img" />
    <view class="text">
      <template v-if="errCode === 0">
        <view class="tips">抱歉，您访问的服务已过期不可用</view>
        <view class="c-9 fs-24 mt-20">请联系{{ mpSetting.companyname }}获取更多信息~</view>
      </template>
      <template v-if="errCode === 30011">
        <view class="tips">抱歉，您无权限进入该页面</view>
        <view class="c-9 fs-24 mt-20">请联系客服</view>
      </template>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      errCode: 0 // 0: 系统过期, 30011: 黑名单拦截
    }
  },
  computed: {
    ...mapState(['mpSetting']),
    iconImg() {
      const igmMap = {
        0: 'overdue/mb.png',
        30011: 'overdue/blacklist.png'
      }
      return staticURL(true) + igmMap[this.errCode]
    }
  },
  onLoad(options) {
    options.code && (this.errCode = +options.code)
    // 只有会员小程序在用
    uni.hideHomeButton()
    const titleMap = {
      0: '服务过期',
      30011: '无权限'
    }
    uni.setNavigationBarTitle({
      title: titleMap[this.errCode]
    })
  },
  methods: {}
}
</script>
<style scoped lang='scss'>
.overdue {
  overflow: hidden;
  .img {
    width: 389rpx;
    height: 292rpx;
    margin: 300rpx auto 0;
  }
  .text {
    font-size: 30rpx;
    color: #333333;
    text-align: center;
  }
  .tips {
    font-weight: 700;
  }
}
</style>
