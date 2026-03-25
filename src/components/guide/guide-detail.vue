<template>
  <view class="page-record pb-40">
    <view class="information bg-f">
      <view v-if="isAudit" class="form-title">申请信息</view>
      <info-cell>
        <view slot="left">姓名</view>
        <view slot="right">{{ info.realname || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">手机号</view>
        <view slot="right">{{ info.mobile }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">微信号</view>
        <view slot="right">{{ info.wxno || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">地区</view>
        <view slot="right">
          {{ diqu || '-' }}
        </view>
      </info-cell>
      <info-cell>
        <view slot="left">详细地址</view>
        <view slot="right">
          {{ info.address || '-' }}
        </view>
      </info-cell>
      <info-cell :is-middle="true">
        <view slot="left">上传图片</view>
        <view slot="right" class="flex flex-end">
          <block v-if="info.salerimg.length">
            <v-img
              v-for="(item, index) in info.salerimg"
              :key="index"
              class="personal-avatar ml-20"
              :src="item"
              :size="100"
              @tap="handlePreview(info.salerimg, index)"
            />
          </block>
          <text v-else>-</text>
        </view>
      </info-cell>
      <info-cell>
        <view slot="left">备注</view>
        <view slot="right">{{ info.remark || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">{{ isAudit ? '申请' : '创建' }}时间</view>
        <view slot="right">{{ info.addtime || '-' }}</view>
      </info-cell>
      <info-cell v-if="!isAudit">
        <view slot="left">账号状态</view>
        <view slot="right">{{ info.salerstate | guideStatusFilter }}</view>
      </info-cell>
    </view>

    <!-- 审核信息 -->
    <template v-if="isAudit && info.checkstate">
      <view class="information bg-f mt-20">
        <view class="form-title">审核信息</view>
        <info-cell :is-link="false">
          <view slot="left">审核结果</view>
          <view slot="right">{{ info.checkstate === 1 ? '审核通过' : '审核不通过' }}</view>
        </info-cell>
        <info-cell :is-link="false">
          <view slot="left">审核日期</view>
          <view slot="right">{{ info.checktime }}</view>
        </info-cell>
        <info-cell v-if="info.checkstate === 2" :is-link="false" :is-two-line="false" :is-wordbreak="true">
          <view slot="left">审核不通过原因</view>
          <view slot="right">
            {{ info.checkremark || '-' }}
          </view>
        </info-cell>
      </view>
    </template>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { guideStatusFilter } from 'packages/filters'
import InfoCell from 'packages/components/info-cell/info-cell'
import { previewImage } from 'packages/utils'
export default {
  components: { InfoCell },
  filters: { guideStatusFilter },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: Number,
      default: -1 // 0详情 1审核
    }
  },
  computed: {
    diqu() {
      let { provincename, cityname, areaname, streetname } = this.info
      return `${provincename || ''}${cityname || ''}${areaname || ''} ${streetname || ''}`.trim()
    },
    isAudit() {
      return this.mode === 1
    }
  },
  methods: {
    handlePreview(urls, index) {
      previewImage({ current: urls[index], urls })
    },
    async handleOpenMap() {
      if (!this.info.lanandlat) return this.$msg('门店暂未录入经纬度信息！')
      const latlog = this.info.lanandlat.split(',')
      const latitude = Number(latlog[0])
      const longitude = Number(latlog[1])
      wx.openLocation({
        latitude,
        longitude,
        scale: 18
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.personal-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  overflow: hidden;
  text-align: right;
}
.information {
  margin: 20rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
}
.form-title {
  position: relative;
  margin: 15rpx 20rpx;
  padding: 30rpx 0 0;
  color: #000;
  font-size: 30rpx;
  font-weight: 700;
  /* #ifdef MP-RETAIL  */
  &::after {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60rpx;
    height: 8rpx;
    content: '';
    opacity: 0.5;
    border-radius: 4rpx;
    background: #ff7640;
  }
  // #endif
}
</style>
