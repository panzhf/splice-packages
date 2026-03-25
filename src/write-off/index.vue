<template>
  <view>
    <view v-show="loaded" class="write-off" :class="{ 'bg-white': status !== 0 }">
      <!-- 核销失败 -->
      <view v-if="status !== 0" class="result">
        <image :src="fail" mode="scaleToFill" class="result-fail" />
        <view class="title">核销失败</view>
        <view class="tip">{{ errMsg || '' }}</view>
        <view v-if="showWriteoffInfo" class="had-writeoff c-9 fs-28">
          <view class="flex">
            <view class="label shrink-0">核销人：</view>
            {{ info.writeoffname }}
          </view>
          <view class="flex mt-10">
            <view class="label shrink-0">核销门店：</view>
            {{ info.writeoffstore }}
          </view>
          <view class="flex mt-10">
            <view class="label shrink-0">核销时间：</view>
            {{ info.writeoffdate }}
          </view>
        </view>
      </view>
      <!-- 核销成功 -->
      <template v-if="status === 0">
        <view class="result">
          <image :src="success" mode="scaleToFill" class="result-success" />
          <view class="title">核销成功</view>
          <!-- 核销进度 -->
          <view v-if="info.totalwriteoffcount > 0" class="monthly-progress mt-20">
            <view class="progress-text">
              <text>您</text>
              <text>{{ info.periodstr }}</text>
              <text>已成功核销</text>
              <text class="highlight">{{ info.totalwriteoffcount }}次</text>
              <template v-if="info.remainingwriteofftimes">
                <text>，再核销</text>
                <text class="highlight">{{ info.remainingwriteofftimes }}次</text>
                <text>就可获得</text>
              </template>
            </view>
            <view v-if="info.nextawards.length > 0 && info.remainingwriteofftimes" class="awards-list">
              <text v-for="(award, index) in info.nextawards" :key="index" class="award-item">
                【
                <template v-if="award.prizetype === 1">{{ award.points }}{{ award.prizename }}</template>
                <template v-else-if="award.prizetype === 10">
                  {{
                    award.minamount === award.maxamount
                      ? award.maxamount
                      : award.minamount + '-' + award.maxamount + '元'
                  }}元{{ award.prizename }}
                </template>
                <template v-else-if="award.prizetype === 14 && award.couponcount > 0">
                  {{ award.prizename }}x{{ award.couponcount }}
                </template>
                <template v-else>{{ award.prizename }}</template>
                】
              </text>
            </view>
          </view>
        </view>
        <!-- 核销奖励 -->
        <view v-if="normalRewards.length > 0 || extraRewards.length > 0" class="bg-white pb-30">
          <view class="prize-awards">
            <view
              :style="{ backgroundImage: `url(${awardPic.title} )` }"
              class="prize-awards__title text-center fw-bold"
            >
              恭喜您获得
            </view>
            <view v-if="normalRewards.length > 0">
              <view v-for="(item, index) in normalRewards" :key="index">
                <prize-item :item="item" :is-last="index === normalRewards.length - 1" />
              </view>
            </view>
            <view v-if="extraRewards.length > 0">
              <view class="reward-section-title">核销奖励</view>
              <view v-for="(item, index) in extraRewards" :key="index">
                <prize-item :item="item" :is-last="index === extraRewards.length - 1" />
              </view>
            </view>
          </view>
        </view>
        <view class="list-title">核销详情</view>
        <view class="list-writer">
          <view class="brand-info flex flex-middle mb-20 pb-20">
            <image class="logo mr-20" :src="brandInfo.headpath" mode="scaleToFill" />
            <view class="ellipsis-1 flex-1 fs-28">{{ brandInfo.companyname }}</view>
          </view>
          <view>核销人：{{ info.writeoffname }}</view>
          <view>核销时间：{{ info.writeoffdate }}</view>
        </view>
      </template>
      <view style="height: 150rpx" />
      <view class="btn-group flex">
        <!-- #ifdef MP-WEIXIN -->
        <button class="primary-btn flex-1 plain round" hover-class="button-action" @tap="handleNav(1)">
          查看核销记录
        </button>
        <button class="primary-btn flex-1 round ml-20 shrink-0" hover-class="button-action" @tap="handleNav(2)">
          连续核销
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <view class="primary-btn flex-1 plain round" style="position: relative">
          查看核销记录
          <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
          <view v-html="wxTag1" />
        </view>
        <view class="primary-btn flex-1 round ml-20 shrink-0" style="position: relative">
          连续核销
          <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
          <view v-html="wxTag2" />
        </view>
        <!-- #endif -->
      </view>
    </view>
    <!-- 门店选择 -->
    <store-list v-model="showStoreSelect" @SelectStore="selectStore" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
// H5暂时放在智能营销项目，后续可能移到个人中心
import { staticURL } from '@/config'
import PrizeItem from './components/prize-item.vue'
import StoreList from 'packages/components/scan/store-list.vue'
import { scanCodeMixin } from './mixins'
import {
  apiScanSourceCodeWriteOff,
  // #ifdef H5
  apiGetBrandInfo
  //#endif
} from 'packages/api/write-off'

// #ifdef H5
// import { apiGetWxConfig } from '@/api/home'
// 暂时放在智能营销项目，后续可能移到个人中心
import { apiGetWxConfig } from 'packages/api/scan'
// #endif
import { apiSavaStore } from 'packages/api/scan'
export default {
  name: 'WriteOff',
  components: {
    PrizeItem,
    StoreList
  },
  mixins: [scanCodeMixin],
  data() {
    return {
      loaded: false,
      awardPic: {
        title: staticURL(true) + 'write-off/title.png'
      },
      showStoreSelect: false,
      options: null, // 页面参数
      storeId: '', // 门店ID
      brandInfo: {} // 品牌信息
    }
  },
  computed: {
    normalRewards() {
      return this.info?.awardrecord?.filter(item => item.isextendaward === 0)
    },
    extraRewards() {
      return this.info?.awardrecord?.filter(item => item.isextendaward === 1)
    },
    showWriteoffInfo() {
      return this.errMsg.includes('此码已核销过了')
    }
  },
  async onLoad(options) {
    this.options = options
    if (options.code) {
      const code = decodeURIComponent(options.code)
      // #ifdef MP-WEIXIN
      this.code = code
      // #endif
      // #ifdef H5
      sessionStorage.setItem('write_off_code', code)
      // code为二维码链接时，重定向到当前页面
      if (code.indexOf('http') > -1 || code.indexOf('https') > -1) {
        location.href = location.href.replace(/&code=[^&]*/, '')
        return
      }
      // #endif
    }
    // #ifdef H5
    const write_off_code = sessionStorage.getItem('write_off_code')
    if (write_off_code) {
      this.code = write_off_code
    }
    // #endif
    // #ifdef H5
    await this.initWxConfig()
    // #endif

    // 单门店，保存门店ID
    if (options.storeid) {
      this.storeId = options.storeid
    }

    // 多门店选择，先显示门店列表
    if (options.multistore === '1') {
      this.showStoreSelect = true
      return
    }
    this.init()
  },
  methods: {
    async init() {
      await this.scanCode()
      await this.getStoreSSOToken()
      // #ifdef H5
      this.$wechat.ready(() => {
        this.initWxTag()
      })
      // #endif
      this.handleSoundResult(this.status === 0 ? 1 : 0)
    },
    async scanCode() {
      const res = await this.getInfo()
      // #ifdef MP-WEIXIN
      this.brandInfo = this.$store.state.mpSetting
      // #endif
      // #ifdef H5
      if (res.code === 0) await this.getBrandInfo()
      // #endif
      return true
    },
    // 选择完门店
    async selectStore(item) {
      // 保存选择的门店ID
      this.storeId = item.id
      await apiSavaStore({
        storeid: item.id,
        code: this.code,
        // #ifdef H5
        openid: this.options.openid,
        memberlogin: this.options.m
        // #endif
      })
      this.showStoreSelect = false
      this.init()
    },
    async getInfo() {
      const params = {
        code: this.code,
        type: 0,
        // #ifdef H5
        openid: this.options.openid,
        memberlogin: this.options.m
        // #endif
      }
      // 如果有门店ID，传递给接口
      if (this.storeId) {
        params.storeid = this.storeId
      }
      let res = null
      try {
        res = await apiScanSourceCodeWriteOff(params)
      } catch (error) {
        // #ifdef H5
        res = error
        // #endif
      }
      let info = res.return_data || {}
      info.nextawards = info.nextawards || []
      info.awardrecord = (info.awardrecord || []).map(item => ({
        type: [1].includes(item.prizetype)
          ? 'jf'
          : [2, 3, 4, 10].includes(item.prizetype)
          ? 'hb'
          : [14].includes(item.prizetype)
          ? 'gw'
          : '',
        amount: [1].includes(item.prizetype) ? item.points : item.amount,
        prizetype: item.prizetype,
        prizename: item.prizename,
        prizeimage: item.prizeimage,
        isextendaward: item.isextendaward
      }))

      this.status = +res.return_code
      this.errMsg = [0, '0'].includes(res.return_code) ? '' : res.return_msg
      this.info = info
      this.loaded = true
      return { code: this.status, data: info }
    },
    handleSoundResult(state = 0) {
      let Audio = uni.createInnerAudioContext() // 开发工具会报错不影响
      Audio.src = state ? staticURL(true) + 'write-off/success.wav' : staticURL(true) + 'write-off/fail.wav'
      Audio.obeyMuteSwitch = false
      // #ifdef MP-WEIXIN
      Audio.autoplay = true
      Audio.onPlay()
      // #endif
      // #ifdef H5
      if (uni.getSystemInfoSync().platform === 'ios') {
        Audio.autoplay = true

        this.$wechat.ready(() => {
          this.$wechat.getNetworkType({
            success: () => {
              Audio.play()
            }
          })
        })
      } else {
        Audio.play()
      }
      // #endif
    },
    // #ifdef H5
    async getBrandInfo() {
      const res = await apiGetBrandInfo({
        memberlogin: this.$route.query.m
      })
      if (this.$ck(res, false)) {
        this.brandInfo = this.$toLowerKey(res.return_data || {}, true)
      }
    },
    async initWxConfig() {
      let params = {
        memberlogin: this.$route.query.m,
        currentUrl: encodeURIComponent(location.href)
      }
      let res = await apiGetWxConfig(params)
      let wxConfig = res.return_data?.config
      wxConfig &&
        this.$wechat.config({
          debug: false,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: ['scanQRCode', 'hideOptionMenu'],
          openTagList: ['wx-open-launch-weapp']
        })
      this.$wechat.ready(() => {
        this.$wechat.hideOptionMenu() // 隐藏菜单
      })
    }
    // #endif
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
