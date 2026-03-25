<template>
  <view v-if="!loading" class="banquet" :style="{ 'background-color': pageConfig.bgColor }">
    <TitleBar
      :title="info.title"
      textcolor="#fff"
      :bg-pic="pageConfig.bg"
      type="detail"
      show-nav-title
      is-transparent
    />

    <view class="rule-icon" mode="widthFix" :style="{ top: rulesTop }" @click="isShowDesc = true">
      <view class="iconfont iconbangzhu" />
      活动说明
    </view>
    <view class="content">
      <!-- 背景图 -->
      <image :src="pageConfig.bg" mode="widthFix" class="bg" />
      <view class="container">
        <view :style="{ height: bgTop }" />
        <view
          class="prodect-box flex"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/text-bg.png'})` }"
        >
          <image mode="aspectFit" :src="product.img" class="img" />
          <view class="right flex-1">
            <view class="title">{{ product.name }}</view>
            <view v-if="product.skuName" class="sku">{{ product.skuName }}</view>
          </view>
        </view>
        <view class="but-box">
          <image mode="aspectFit" :src="staticImg.bmImg" class="bm" @click="handleApply" />
          <view class="mb-box flex">
            <view class="block flex flex-middle" @click="handleRecord()">
              <text class="iconfont iconbaomingjilu" />
              <view class="lable fsz-28">报名记录</view>
            </view>
            <view class="block flex flex-middle" @click="handleMyPrize">
              <text class="iconfont iconjihuojiangliicon" />
              <view class="lable fsz-28">我的奖品</view>
            </view>
          </view>
        </view>
        <view class="prize-content">
          <image mode="aspectFit" :src="staticImg.titleImg" class="title-img" />
          <view class="prize-box mt-40">
            <view
              class="header flex"
              :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-t.png?v1'})` }"
            >
              <view class="title">门店奖励</view>
            </view>
            <view
              class="content"
              :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-bg.png?v1'})` }"
            >
              <view class="th flex">
                <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">{{ tableLable }}</view>
                <view v-if="info.drawtype === 0" class="item flex-1">开瓶率(%)</view>
                <view class="item flex-1">奖品</view>
              </view>
              <view v-for="(item, index) in storeAwardList" :key="index" class="td flex">
                <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">
                  {{ getShwoFirstValue(item) }}
                </view>
                <view v-if="info.drawtype === 0" class="item flex-1">{{ item.leastscancoderate || '无要求' }}</view>
                <view class="item flex-1">{{ getShowValue(item) }}</view>
              </view>
            </view>
            <view class="footer" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-b.png?v1'})` }">
              <div class="tips">发奖时间：{{ storeAwardMsg }}</div>
            </view>
          </view>
          <view v-if="isenableextraprize" class="prize-box mt-40">
            <view
              class="header flex"
              :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-t.png?v1'})` }"
            >
              <view class="title">额外奖励</view>
            </view>
            <view
              class="content"
              :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-bg.png?v1'})` }"
            >
              <view class="th flex">
                <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">{{ tableLable }}</view>
                <view v-if="info.drawtype === 0" class="item flex-1">开瓶率(%)</view>
                <view class="item flex-1">奖品</view>
              </view>
              <view v-for="(item, index) in extraAwardList" :key="index" class="td flex">
                <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">
                  {{ getShwoFirstValue(item) }}
                </view>
                <view v-if="info.drawtype === 0" class="item flex-1">{{ item.leastscancoderate || '无要求' }}</view>
                <view class="item flex-1">{{ getShowValue(item, 'name') }}</view>
              </view>
            </view>
            <view class="footer" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'banquet/prize-b.png?v1'})` }">
              <div class="tips">发奖时间：{{ extraAwardMsg }}</div>
            </view>
          </view>
          <view style="height: 100rpx" />
        </view>
      </view>
    </view>
    <desc-dialog ref="descDialog" v-model="isShowDesc" :desc="info" :act-info="actInfo" :top="top" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiBanquetGetactivity, apiBanquetIscanApplyfor } from 'packages/api/banquet'
import { packageStaticMixin } from 'packages/mixins/static-url'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import DescDialog from './components/desc-dialog.vue'
import { hbTypeName } from 'packages/utils'
import { getUrlQuery } from '@/utils/index'
import SwitchBrand from '@/mixins/switch-brand'
export default {
  components: {
    TitleBar,
    DescDialog
  },
  mixins: [packageStaticMixin, SwitchBrand],
  data() {
    return {
      finishedCheckerType: 0,
      loading: true,
      isShowDesc: false,
      info: {
        title: '宴席有礼',
        starttime: '',
        endtime: '',
        rule: '',
        drawtype: 0 //发奖方式：0-按开瓶率；1-按开瓶数
      },
      actInfo: {
        activityid: ''
        // memberlogin: '10003911'
      },
      pageConfig: {
        bg: '',
        bgColor: ''
      },
      product: {
        name: '',
        skuName: '',
        img: ''
      },
      storeAwardList: [],
      extraAwardList: [],
      isenableextraprize: false // 是否开启额外奖励
    }
  },
  computed: {
    tableLable() {
      return this.info.drawtype === 0 ? '用酒数量(瓶)' : '用酒规则'
    },
    storeAwardMsg() {
      return this.storeAwardList.some(item => item.leastscancoderate)
        ? '订单结单时，开瓶率达标则发奖，未达标则不发奖'
        : this.finishedCheckerType === 1
        ? '结单审核通过后发奖'
        : '订单结单时发奖'
    },
    extraAwardMsg() {
      return this.extraAwardList.some(item => item.leastscancoderate)
        ? '订单结单时，开瓶率达标则发奖，未达标则不发奖'
        : this.finishedCheckerType === 1
        ? '结单审核通过后发奖'
        : '订单结单时发奖'
    },
    staticImg() {
      return {
        bmImg: this.PACKAGE_STATIC_URL + 'banquet/but.png',
        titleImg: this.PACKAGE_STATIC_URL + 'banquet/prize-title.png'
      }
    },
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
    },
    bgTop() {
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 1000rpx)`
      /* #endif */
      return style
    }
  },
  async onLoad(options) {
    if (!options.id && !options.scene) return this.$msg('链接格式不正确')
    const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
    await this.verifyMemberLogin(query.m, 3)
    this.actInfo.activityid = query.id
    await this.getInfo()
  },
  methods: {
    handleMyPrize() {
      this.isShowDesc = true
      this.$nextTick(() => {
        this.$refs.descDialog.currentTab = 1
      })
    },
    handleRecord() {
      uni.navigateTo({
        url: `/packages/src/pages/banquet/record?id=${this.actInfo.activityid}`
      })
    },
    getShwoFirstValue(item) {
      if (this.info.drawtype === 0) {
        return `${item.leastscancodeamount}~${item.maxscancodeamount}`
      } else {
        return `${item.computeway === 2 ? '每' : '累计'}开${item.leastscancodeamount}瓶`
      }
    },
    getShowValue(prizes, name) {
      if (name === 'name') return prizes.name
      let rewards = []
      if (prizes.isenablepoint) {
        rewards.push(`积分（${prizes.point}）`)
      }
      if (prizes.isenablehb) {
        rewards.push(`红包（${prizes.remark}（${hbTypeName(prizes.hbtype)}ID：${prizes.hbid}））`)
      }
      if (prizes.isenableshopvou) {
        rewards.push(`返货券（${prizes.shouvouname}）* ${prizes.shouvouamount}`)
      }
      return rewards.join('，')
    },
    handleApply() {
      apiBanquetIscanApplyfor({ activityid: this.actInfo.activityid }).then(res => {
        if (this.$ck(res)) {
          if (!res.return_data.iscanapplyfor) return this.$msg('您不符合报名要求')
          uni.navigateTo({ url: `/packages/src/pages/banquet/apply?activityid=${this.actInfo.activityid}` })
        }
      })
    },
    getInfo() {
      return new Promise(resolve => {
        apiBanquetGetactivity(this.actInfo).then(res => {
          if (this.$ck(res)) {
            let {
              title,
              drawtype,
              prizes,
              isenableextraprize,
              endtime,
              starttime,
              rule,
              productname,
              productformatname,
              productimg,
              contentjson: { backgroupcolor, backgroupimageurl },
              finishedcheckertype
            } = res.return_data
            this.pageConfig = {
              bg: backgroupimageurl,
              bgColor: backgroupcolor
            }
            this.finishedCheckerType = finishedcheckertype
            this.storeAwardList = prizes.filter(item => item.producttype !== 9)
            this.extraAwardList = prizes.filter(item => item.producttype === 9)
            this.isenableextraprize = isenableextraprize
            this.info = {
              endtime,
              starttime,
              title,
              rule,
              drawtype
            }
            this.product = {
              name: productname,
              skuName: productformatname,
              img: productimg
            }
            this.loading = false
            resolve(true)
          } else {
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
