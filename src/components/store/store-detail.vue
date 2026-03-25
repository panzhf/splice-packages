<template>
  <view class="page-record pb-40">
    <view class="information bg-f pl-30">
      <view class="pt-20 pb-20 fs-32 fw-bold">基本信息</view>
      <info-cell>
        <view slot="left">门店编号</view>
        <view slot="right">{{ storeInfo.storeno || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">门店名称</view>
        <view slot="right">{{ storeInfo.storename }}</view>
      </info-cell>
      <info-cell v-if="pageType === 'pass'">
        <view slot="left">分店名</view>
        <view slot="right">{{ storeInfo.branchname || '-' }}</view>
      </info-cell>
      <info-cell :is-link="true" icon-type="daohang" @tap="handleOpenMap()">
        <view slot="left">门店地址</view>
        <view slot="right">
          {{ address || '-' }}
        </view>
      </info-cell>
      <info-cell>
        <view slot="left">门店类型</view>
        <view slot="right">{{ storeInfo.storetypename || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">店铺面积</view>
        <view slot="right">{{ storeInfo.shopsize || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">{{ pageType === 'audit' ? '提交' : '创建' }}日期</view>
        <view slot="right">{{ storeInfo.addtime }}</view>
      </info-cell>
      <info-cell v-if="pageType === 'pass'">
        <view slot="left">账号状态</view>
        <!-- 账号状态:0-禁用,1-启用,3-未激活 4、未激活已禁用-->
        <view slot="right">
          <view class="c-0">{{ storeInfo.status | storeStatusFilter }}</view>
          <view v-if="storeInfo.status === 3" class="fs-24 c-6">(需激活成功后才可正常使用)</view>
          <text v-if="storeInfo.status === 1" class="fs-24">(可登录)</text>
        </view>
      </info-cell>
      <info-cell :is-middle="true">
        <view slot="left">门头照</view>
        <view slot="right" class="flex flex-end">
          <v-img
            v-if="storeInfo.shopfor"
            class="personal-avatar"
            :src="storeInfo.shopfor"
            :size="100"
            @tap="handlePreview(storeInfo.shopfor)"
          />
          <text v-else>-</text>
        </view>
      </info-cell>
      <info-cell :is-middle="true">
        <view slot="left">营业执照</view>
        <view slot="right" class="flex flex-end">
          <v-img
            v-if="storeInfo.businesslicense"
            class="personal-avatar"
            :src="storeInfo.businesslicense"
            :size="100"
            @tap="handlePreview(storeInfo.businesslicense)"
          />
          <text v-else>-</text>
        </view>
      </info-cell>
      <info-cell v-if="showDealers">
        <view slot="left">所属经销商</view>
        <view slot="right">{{ dealerNames || '-' }}</view>
      </info-cell>
      <template v-if="showSaleman">
        <info-cell
          v-if="pageType === 'pass' || (pageType === 'audit' && storeInfo.status === 0)"
          :is-link="pageType === 'pass'"
          @tap="$emit('selectSaleman', { id: storeInfo.salesmanid, name: storeInfo.salesmanname })"
        >
          <view slot="left">经销商业务员</view>
          <view slot="right">
            <text class="mr-20">{{ storeInfo.salesmanid ? storeInfo.salesmanname : '未分配' }}</text>
            <text v-if="pageType === 'pass'" class="edit-color">{{ storeInfo.salesmanid ? '更换' : '选择' }}</text>
          </view>
        </info-cell>
      </template>
      <info-cell v-if="pageType === 'pass'">
        <view slot="left">门店来源</view>
        <view slot="right">{{ storeInfo.registerremark || '-' }}</view>
      </info-cell>
      <info-cell v-if="mp === 1 && pageType === 'pass'">
        <view slot="left">备注</view>
        <view slot="right">{{ storeInfo.remark || '-' }}</view>
      </info-cell>
    </view>
    <!-- 负责人信息 -->
    <view class="information bg-f pl-30 mt-20">
      <view class="pt-20 pb-20 fs-32 fw-bold">负责人信息</view>
      <info-cell>
        <view slot="left">负责人</view>
        <view slot="right">{{ storeInfo.leader || '-' }}</view>
      </info-cell>
      <info-cell>
        <view slot="left">手机号</view>
        <view slot="right">{{ storeInfo.mobile || '-' }}</view>
      </info-cell>
    </view>

    <!-- 审核信息 -->
    <template v-if="pageType === 'audit' && storeInfo.isreview">
      <view class="information bg-f pl-30 mt-20">
        <view class="pt-20 pb-20 fs-32 fw-bold">审核信息</view>
        <info-cell>
          <view slot="left">审核人</view>
          <view slot="right">{{ storeInfo.reviewname || '-' }}</view>
        </info-cell>
        <info-cell>
          <view slot="left">审核结果</view>
          <view slot="right">{{ storeInfo.isreview === 1 ? '审核通过' : '审核不通过' }}</view>
        </info-cell>
        <info-cell>
          <view slot="left">审核日期</view>
          <view slot="right">{{ storeInfo.reviewtime }}</view>
        </info-cell>
        <info-cell v-if="storeInfo.isreview === 2" :is-two-line="false" :is-wordbreak="true">
          <view slot="left">审核不通过原因</view>
          <view slot="right">
            {{ storeInfo.reviewremark || '-' }}
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
// 业务帮帮
import { storeStatusFilter } from 'packages/filters'
import InfoCell from 'packages/components/info-cell/info-cell'
import { previewImage } from 'packages/utils'
export default {
  components: { InfoCell },
  filters: { storeStatusFilter },
  props: {
    showDealers: Boolean,
    showSaleman: Boolean,
    storeInfo: {
      type: Object,
      default: () => {}
    },
    mp: {
      type: Number,
      default: 1 // 1业务帮帮  2新经销
    },
    pageType: {
      type: String,
      default: 'pass'
    }
  },
  computed: {
    dealerNames() {
      return this.storeInfo?.dealers?.map(dealer => dealer.dealername).join('、') || '-'
    },
    address() {
      let { provincename, cityname, areaname, streetname, address } = this.storeInfo
      return `${provincename || ''}${cityname || ''}${areaname || ''} ${streetname || ''}${address || ''}`
    },
    reviewerInfo() {
      const reviewname = this.storeInfo.reviewname || '-'
      if (reviewname === '-') return reviewname

      const typeMap = {
        0: '总部',
        1: '经销商',
        2: '经销商业务员',
        3: '厂家业务员'
      }
      const reviewoperatortype = this.storeInfo.reviewoperatortype
      const identity = typeMap[reviewoperatortype] || ''

      return identity ? `${reviewname}（${identity}）` : reviewname
    }
  },
  methods: {
    handlePreview(img) {
      previewImage({ current: img })
    },
    async handleOpenMap() {
      if (!this.storeInfo.lanandlat) return this.$msg('门店暂未录入经纬度信息！')
      const latlog = this.storeInfo.lanandlat.split(',')
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
</style>
