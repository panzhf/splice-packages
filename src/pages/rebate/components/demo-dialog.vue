<template>
  <u-mask :show="showDialog" :zoom="false" :custom-style="{ background: 'rgba(0, 0, 0, 0.5)' }" z-index="100">
    <view class="dialog-info" :class="{ showDialog }">
      <view class="iconfont icon-close2 close-icon fw-bold" @tap.stop="showDialog = false" />
      <view class="title">上传订单图片示例</view>
      <v-tabs
        v-model="active"
        :tabs="tablist"
        color="#000"
        active-color="#277DF5"
        line-color="#277DF5"
        line-height="6rpx"
        padding-item="10rpx 40rpx"
        :line-scale="0.3"
        height="76rpx"
        fixed
        field="name"
        @change="handleChangeTab"
      />
      <view class="img-box">
        <image :src="imgPath" class="demp-img" mode="widthFix" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import VTabs from 'packages/components/v-tabs'
import dialogMixin from 'packages/mixins/dialog'
export default {
  components: {
    VTabs
  },
  mixins: [dialogMixin, packageStaticMixin],
  data() {
    return {
      imgName: 'tm',
      active: 0,
      fileList: [],
      // 0全部 、1.天猫、2.淘宝、3.京东、4.拼多多、5.抖音、6.快手、7.苏宁、8.有赞、9.唯品会、10.腾讯荟聚、11.其它
      tablist: [
        {
          name: '天猫',
          value: 'tm'
        },
        {
          name: '淘宝',
          value: 'tb'
        },
        {
          name: '京东',
          value: 'jd'
        },
        {
          name: '拼多多',
          value: 'pdd'
        },
        {
          name: '抖音',
          value: 'dy'
        },
        {
          name: '快手',
          value: 'ks'
        },
        {
          name: '苏宁',
          value: 'sn'
        },
        {
          name: '微信',
          value: 'wx'
        },
        {
          name: '唯品会',
          value: 'wph'
        }
      ]
    }
  },
  computed: {
    imgPath() {
      return `${this.PACKAGE_STATIC_URL}rebate/demo/${this.imgName}.jpg?v2`
    }
  },
  methods: {
    handleChangeTab(val) {
      this.imgName = this.tablist[val].value
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-info {
  background: #fff;
  position: relative;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  border-radius: 30rpx 30rpx 0 0;
  height: 0;
  -webkit-transition: all 0.2s ease-in;
  transition: all 0.2s ease-in;
  padding: 0 30rpx;
  &.showDialog {
    height: 1100rpx;
  }
  .close-icon {
    position: absolute;
    top: -85rpx;
    right: 30rpx;
    color: #fff;
    font-size: 50rpx;
  }
  .title {
    margin-top: 40rpx;
    text-align: center;
    font-size: 28rpx;
    font-family: PingFang SC;
    .mb {
      font-weight: bold;
    }
  }
  .tips {
    margin-top: 16rpx;
    text-align: center;
    font-size: 24rpx;
    font-family: PingFang SC;
    color: #aaaaaa;
  }
  .img-box {
    border: 1px solid #e5e5e5;
    margin-top: 40rpx;
  }
}
</style>
