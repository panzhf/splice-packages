<template>
  <view>
    <view class="page-group-buy" :style="{ 'background-color': pageConfig.bgColor }">
      <TitleBar
        type="detail"
        :title="info.title"
        textcolor="#fff"
        :bg-pic="pageConfig.bg"
        is-transparent
        show-nav-title
      />
      <image :src="pageConfig.bg" mode="widthFix" class="bg" />
      <view class="rule-icon flex flex-middle" :style="{ top: rulesTop }" @click="isShowDesc = true">
        <view class="iconfont iconbangzhu fs-30 mr-10" />
        活动说明
      </view>
      <view style="height: 964rpx" />
      <view class="pd-box bgs flex" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'group-buy/pd-bg.png'})` }">
        <image mode="aspectFit" :src="product.img" class="img" />
        <view class="ml-20 flex-1">
          <view class="title fs-32 fw-bold ellipsis-2">{{ product.name }}</view>
          <view v-if="product.skuName" class="fs-24 c-6 mt-10">{{ product.skuName }}</view>
        </view>
      </view>
      <image mode="aspectFit" :src="PACKAGE_STATIC_URL + 'group-buy/prize.png'" class="title-img" />
      <view class="prize-box tx-c">
        <view
          class="header bgs"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'group-buy/prize-top.png'})` }"
        />
        <view
          class="content bgs"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'group-buy/prize-line.png'})` }"
        >
          <view class="th flex flex-middle flex-center fs-24 fw-medium">
            <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">{{ tableLable }}</view>
            <view v-if="info.drawtype === 0" class="item flex-1">开瓶率(%)</view>
            <view class="item flex-1">奖品</view>
          </view>
          <view
            v-for="(item, index) in storeAwardList"
            :key="index"
            class="td flex flex-middle flex-center fs-24 fw-medium"
          >
            <view class="item flex-1" :class="{ 'flex-half': info.drawtype === 1 }">
              {{ getShwoFirstValue(item) }}
            </view>
            <view v-if="info.drawtype === 0" class="item flex-1">{{ item.leastscancoderate || '无要求' }}</view>
            <view class="item flex-1">{{ getShowValue(item.prizes) }}</view>
          </view>
        </view>
        <view
          class="footer bgs"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'group-buy/prize-bottom.png'})` }"
        >
          <view class="tips fs-24 fw-medium">发奖时间：{{ storeAwardMsg }}</view>
        </view>
      </view>
      <view style="height: 150rpx" />
      <view class="btn-group flex flex-middle fw-bold">
        <view class="btn plain flex flex-middle flex-center" @tap="handleNav('record')">提报记录</view>
        <view class="btn active flex-1 ml-20 mr-20 flex flex-middle flex-center" @tap="handleNav('order')">
          提报团购订单
        </view>
        <view class="btn plain flex flex-middle flex-center" @tap="handleNav('prize')">我的奖品</view>
      </view>
    </view>
    <desc-dialog ref="descDialog" v-model="isShowDesc" :info="info" :act-info="actInfo" :top="top" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import DescDialog from './components/desc-dialog.vue'
import { apiActivityDetail, apiIsCanApply } from 'packages/api/group-buy'
export default {
  components: {
    TitleBar,
    DescDialog
  },
  mixins: [packageStaticMixin],
  data() {
    return {
      loading: true,
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
      info: {
        title: '团购有礼',
        status: 0, // 0：进行中，1：未开始，2：已结束，3：已禁用,4：已删除
        drawtype: 0
      },
      storeAwardList: [
        {
          leastscancodeamount: 10,
          maxscancodeamount: 100,
          computeway: 2,
          leastscancoderate: 10,
          isenablepoint: 1,
          point: 100
        }
      ],
      finishedCheckerType: 0,
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
    },
    tableLable() {
      return this.info.drawtype === 0 ? '用酒数量(瓶)' : '用酒规则'
    },
    storeAwardMsg() {
      return this.storeAwardList.some(item => item.leastscancoderate)
        ? '订单结单时，开瓶率达标则发奖，未达标则不发奖'
        : '订单结单时发奖'
    }
  },
  onLoad(options) {
    if (!options.id) return this.$msg('链接格式不正确')
    this.actInfo.activityid = +options.id
    this.getInfo()
  },
  methods: {
    async getInfo() {
      const res = await apiActivityDetail({ activityID: this.actInfo.activityid })
      if (this.$ck(res, true)) {
        let {
          title,
          status,
          drawtype,
          endtime,
          starttime,
          ruletext,
          productname,
          productformatname,
          productimg,
          backcolor,
          themeimage,
          finishedcheckertype,
          prizerules
        } = res.return_data
        this.pageConfig = {
          bg: themeimage,
          bgColor: backcolor
        }
        this.finishedCheckerType = finishedcheckertype
        this.storeAwardList = prizerules
        this.info = {
          title,
          status,
          drawtype,
          endtime,
          starttime,
          rule: ruletext
        }
        this.product = {
          name: productname,
          skuName: productformatname,
          img: productimg
        }
        this.loading = false
      }
    },
    getShwoFirstValue(item) {
      if (this.info.drawtype === 0) {
        return `${item.leastscancodeamount}~${item.maxscancodeamount}`
      } else {
        return `${item.computeway === 2 ? '每' : '累计'}开${item.leastscancodeamount}瓶`
      }
    },
    getShowValue(prizes) {
      return (prizes || [])
        .reduce((acc, val) => {
          if (val.prizetype === 1) {
            acc.push(`积分（${val.point}）`)
          }
          if (val.prizetype === 10) {
            acc.push(`红包（${val.productname}）`)
          }
          if (val.prizetype === 14) {
            acc.push(`返货券（${val.productname}）* ${val.prizenum}`)
          }
          return acc
        }, [])
        .join('；')
    },
    async handleNav(type) {
      if (type === 'record') {
        this.$navPage(`./order-list?activityid=${this.actInfo.activityid}`)
      } else if (type === 'prize') {
        this.isShowDesc = true
        this.$nextTick(() => {
          this.$refs.descDialog.currentTab = 1
        })
      } else {
        const res = await apiIsCanApply({ activityID: this.actInfo.activityid })
        if (this.$ck(res)) {
          const { iscanapplyfor, waitsubmitorderinfo } = res.return_data
          if (!iscanapplyfor) return this.$msg(res.return_msg)
          let params = `activityid=${this.actInfo.activityid}`
          if (waitsubmitorderinfo) {
            params += `&orderno=${waitsubmitorderinfo.orderno}`
          }
          this.$navPage(`./apply?${params}`)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
