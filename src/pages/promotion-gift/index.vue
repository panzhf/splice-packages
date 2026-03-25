<template>
  <view>
    <view class="page-promotion-gift" :style="{ 'background-color': pageConfig.bgColor }">
      <TitleBar
        type="detail"
        :title="info.title"
        textcolor="#fff"
        :bg-pic="pageConfig.bg"
        is-transparent
        show-nav-title
      />
      <image v-if="pageConfig.bg" :src="pageConfig.bg" mode="widthFix" class="bg" />
      <view class="rule-icon flex flex-middle" :style="{ top: rulesTop }" @click="isShowDesc = true">
        <view class="iconfont iconbangzhu fs-30 mr-10" />
        活动说明
      </view>
      <view class="placeholder-area" />

      <!-- 参与商品区域 -->
      <view v-if="productList.length > 0" class="product-list item-box">
        <view class="item-title fw-bold">参与商品</view>
        <view v-for="(product, index) in productList" :key="index" class="pd-box flex">
          <image mode="aspectFit" :src="product.img" class="img" />
          <view class="ml-20 fs-28 flex-1">
            <view class="pro-name ellipsis-2">{{ product.name }}</view>
            <view v-if="product.skuName" class="c-6 mt-10">{{ product.skuName }}</view>
          </view>
        </view>
      </view>

      <!-- 奖励说明 -->
      <view v-if="rewardList && rewardList.length" class="br-10 item-box">
        <view class="item-title fw-bold">奖励说明</view>
        <view class="reward-content fs-28 c-6">
          <view>当消费者扫描登记码对应的内码后，将给最后一个登记人发放奖励：</view>
          <view v-for="(reward, index) in rewardList" :key="index" class="flex flex-middle mt-20">
            <image
              :src="PACKAGE_STATIC_URL + 'promotion-gift/hongbao.png'"
              class="reward-icon mr-10"
              mode="aspectFit"
            />
            <view class="reward-amount">
              <template v-if="reward.hbminprice !== reward.hbmaxprice">
                <text class="num fw-bold">
                  ￥{{ reward.hbminprice | cashFixedTwo }}~￥{{ reward.hbmaxprice | cashFixedTwo }}
                </text>
              </template>
              <template v-else>
                <text class="num fw-bold">￥{{ reward.hbminprice | cashFixedTwo }}</text>
              </template>
              <text class="fs-32 ml-10">{{ reward.prizetype | rewardTypwFilter }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 150rpx" />

      <!-- 底部按钮组 -->
      <view class="btn-group flex flex-middle">
        <image
          :src="PACKAGE_STATIC_URL + 'promotion-gift/record-btn.png'"
          class="btn-img btn-img-small"
          mode="widthFix"
          @tap="handleNav('record')"
        />
        <image
          :src="PACKAGE_STATIC_URL + 'promotion-gift/scan-btn.png'"
          class="btn-img btn-img-big mt-10"
          mode="widthFix"
          @tap="scanRegister"
        />
        <image
          :src="PACKAGE_STATIC_URL + 'promotion-gift/award-btn.png'"
          class="btn-img btn-img-small"
          mode="widthFix"
          @tap="handleNav('prize')"
        />
      </view>
    </view>

    <!-- 活动说明弹窗 -->
    <desc-dialog ref="descDialog" v-model="isShowDesc" :info="info" :act-info="actInfo" :top="top" />

    <!-- 登记弹窗 -->
    <register-dialog ref="registerDialog" @continue="scanRegister" />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import DescDialog from './components/desc-dialog.vue'
import RegisterDialog from 'packages/components/code-register/index.vue'
import richTextMixin from 'packages/mixins/rich-text'
import ScanCode from '@/mixins/scan-code'
import { apiActivityDetail } from 'packages/api/promotion-gift'
import { cashFixedTwo } from 'packages/filters'
import { rewardTypwFilter } from './filters'

export default {
  components: {
    TitleBar,
    DescDialog,
    RegisterDialog
  },
  filters: {
    cashFixedTwo,
    rewardTypwFilter
  },
  mixins: [packageStaticMixin, richTextMixin, ScanCode],
  data() {
    return {
      loading: true,
      actInfo: {
        activityid: ''
      },
      pageConfig: {
        bg: '',
        bgColor: '#F6AC7D'
      },
      productList: [],
      rewardList: [], // 奖励规则列表
      info: {
        title: '推荐有礼',
        status: 0, // 0：进行中，1：未开始，2：已结束，3：已禁用,4：已删除
        starttime: '',
        endtime: '',
        ruletext: ''
      },
      isShowDesc: false
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      let style = `${44 + this.statusBarHeight}px`
      return style
    },
    rulesTop() {
      let style = `calc(${this.top} + 20rpx)`
      return style
    }
  },
  onLoad(options) {
    if (!options.id) return this.$msg('链接格式不正确')
    this.actInfo.activityid = +options.id
    this.getInfo()
  },
  methods: {
    async getInfo() {
      const res = await apiActivityDetail({
        activityid: this.actInfo.activityid
      })
      if (this.$ck(res, true)) {
        this.info = res.return_data
        this.pageConfig = {
          bg: this.info.themeimage || this.PACKAGE_STATIC_URL + 'promotion-gift/bg.jpg',
          bgColor: this.info.backcolor || '#F6AC7D'
        }

        // 处理商品列表
        this.productList = (this.info.actgoodslist || []).map(item => ({
          name: item.goodsname || '',
          skuName: item.goodsformatname || '',
          img: item.goodsimg || ''
        }))

        // 处理奖励规则列表
        this.rewardList = this.info.actprizes || []

        this.loading = false
      }
    },

    handleNav(type) {
      if (type === 'record') {
        // 跳转到登记明细页面
        this.$navPage(`./record?activityid=${this.actInfo.activityid}`)
      } else if (type === 'prize') {
        // 跳转到奖品列表页面，定位到营销奖品tab
        this.$navPage('/scans/prize/list?index=1&subIndex=6')
      }
    },

    // 扫码登记 - 直接调用 mixin 中的 handleScanCode 方法
    scanRegister() {
      this.handleScanCode('index')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
