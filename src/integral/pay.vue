<template>
  <view class="payok" :style="themeVars">
    <title-bar
      :title="`${textStride}结果`"
      back-color="black"
      title-color
      is-settle="2"
      class="title-bar"
      :back-home="backHome"
    />
    <!-- 头部内容 -->
    <view v-if="list.ordernumber">
      <view class="payok-header">
        <view class="payok-top">
          <view :class="[iconTitle, iconTitle == 'iconduihuanzhong1' ? 'icon-duihuan-loading' : '']" class="iconfont" />
          <view class="top-exchange">{{ title }}</view>
          <view class="top-red">{{ list.orderstatustext }}</view>
        </view>

        <view class="payok-exchange">
          <view class="exchange-box">
            <view class="exchange-left">订单号</view>
            <view>{{ list.ordernumber }}</view>
          </view>
          <view class="exchange-box">
            <view class="exchange-left">实付</view>
            <view v-if="list.point || list.originalamount" class="exchange-cope">
              <view v-if="list.point">{{ list.point }}积分</view>
              <view v-if="list.point && list.originalamount" style="margin: 0 5rpx">+</view>
              <price v-if="list.originalamount" :price="list.originalamount" double show-sign mode="cash" />
            </view>
            <view v-else class="exchange-cope">0</view>
          </view>
          <view class="exchange-box">
            <view class="exchange-left">支付方式</view>
            <view>{{ list.payway }}</view>
          </view>
        </view>
      </view>

      <!-- 装修组件 -->
      <!-- #ifdef MP-MEMBER -->
      <view v-for="(item, index) in components" :key="index" class="component-item">
        <image-ad v-if="item.code === 'ImageAd'" :img-data="item.data" />
        <title-text v-if="item.code === 'TitleText'" :text-data="item.data" />
        <blank-segmente v-if="item.code === 'BlankSegmente'" :blank-data="item.data" />
        <custom-content v-if="item.code === 'CustomContent'" :value="item.data" />
      </view>
      <!-- #endif -->
      <view class="foot-gap" />
      <!-- 底部 -->
      <view v-if="show" class="integral-footer">
        <view class="footer-confirm safe-area-inset-bottom">
          <view class="footer-left" style="margin-right: 20rpx" @click="handleBack">回到主页</view>
          <view class="footer-right" @click="handleToview">{{ btnToview }}</view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import titleBar from '../components/title-bar/title-bar'
import price from '../components/price/price'
// #ifdef MP-MEMBER
import ImageAd from 'packages/design/basic/image-ad.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import CustomContent from 'packages/design/basic/custom-content.vue'
// #endif
import { apiOrderOrderstatus } from '../api/order.js'
// #ifdef MP-MEMBER
import { apiGetRedemptionResultPage } from '../api/integral.js'
// #endif
import { filterSuccess, filterSuccessBtn } from '../utils/orders.js'
import integralMixin from './mixins/integral.js'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    titleBar,
    price,
    // #ifdef MP-MEMBER
    ImageAd,
    TitleText,
    blankSegmente,
    CustomContent
    // #endif
  },
  mixins: [
    integralMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      components: [], // 装修组件
      redemptionBgColor: '',
      iconTitle: 'iconduihuanzhong1', // 头部icon
      title: '',
      show: false, //显示底部
      orderid: '', //订单id
      url: '', //跳转路劲
      list: {},
      type: 1,
      time: null,
      btnToview: '查看订单详情',
      subcategory: 0, //积分类型 2积分换购订单6扫码实物中奖订单13营销订单14 会员小程序 19生日礼包
      ordersourcetype: 1 //订单来源类型，1：积分商城订单 2:扫码中奖订单 3：营销订单 5:生日礼包
    }
  },
  computed: {
    backHome() {
      return [2, 5].includes(this.type)
    }
  },
  async onLoad(options) {
    // #ifdef MP-MEMBER
    // 获取装修数据
    this.getDecorations()
    // #endif
    if (options.id) {
      this.type = Number(options.type)
      this.ordersourcetype = Number(this.type)
      this.subcategory = options.subcategory
      await this.getDate(options.id)
      //兑换页面如果出错了抛的异常
      if (options.msg !== '') this.$msg(options.msg)
    }
  },
  onUnload() {
    clearTimeout(this.time)
    this.time = null
  },
  methods: {
    // #ifdef MP-MEMBER
    // 获取装修数据
    async getDecorations() {
      const res = await apiGetRedemptionResultPage()
      // 处理装修数据
      if (this.$ck(res)) {
        if (res.return_data) {
          this.components = []
          let dataList = []
          for (let item of res.return_data || []) {
            if (item.code === 'RedemptionResultPageSetting' || (item.name === '页面设置' && !item.code)) {
              const data = JSON.parse(item.data)
              // 设置页面标题和背景
              // 标题通常由title-bar组件控制，这里如果需要可以设置navigationBarTitle
              if (data.Title) {
                uni.setNavigationBarTitle({
                  title: data.Title
                })
              }
              // 设置页面背景色 - 注意这里只影响window背景，实际背景可能由view控制
              if (data.PageBgColor) {
                uni.setBackgroundColor({
                  backgroundColor: data.PageBgColor
                })
              }
            } else if (item.code === 'RedemptionResult') {
              // const data = JSON.parse(item.data)
              // if (data.bgColor) {
              //   this.redemptionBgColor = data.bgColor
              //   // 更新themeVars以改变上半部分背景色
              //   // 这里假设themeVars是字符串形式，追加--theme-color变量
              //   // 注意：如果themeVars已有值，需要处理分号
              //   let vars = this.themeVars || ''
              //   if (!vars.endsWith(';') && vars.length > 0) vars += ';'
              //   // this.themeVars = vars + `--theme-color: ${data.bgColor};`
              // }
            } else {
              try {
                item.data = JSON.parse(item.data)
                dataList.push(item)
              } catch (e) {
                console.error('解析组件数据失败', item, e)
              }
            }
          }
          this.components = [...dataList]
        }
      }
    },
    // #endif

    // 获取数据
    getDate(id) {
      apiOrderOrderstatus(id).then(res => {
        if (this.$ck(res)) {
          // orderstatus --订单状态（1 待支付、2 待发货、3 待收货\待核销、4 已完成、5 已取消、6 退款订单、7 处理中）
          const data = res.return_data
          this.orderid = data.orderid
          this.list = data

          if ([2, 3, 4].includes(data.orderstatus)) {
            this.title = this.textStride + '成功'
            this.url = filterSuccess(data.lipintype, this.orderid, this.type, this.subcategory) // 跳转路劲
            this.iconTitle = 'iconduihuanchenggong'
            this.show = true
            if (data.deliverymode === 1) {
              this.btnToview = '查看兑换码'
            } else {
              this.btnToview = filterSuccessBtn(data.lipintype) //按钮
            }
          } else if (data.orderstatus === 6) {
            this.title = this.textStride + '失败'
            this.url = `/packages/src/order/detail?id=${data.orderid}&type=${this.type}&subcategory=${this.subcategory}`
            this.iconTitle = 'icon-duihuan-fail'
            this.show = true
          } else {
            this.title = this.textStride + '中'
            this.iconTitle = 'iconduihuanzhong1'
            this.show = false
          }

          // 订单处理中\待支付三秒轮询一下接口
          if ([1, 7].includes(data.orderstatus)) {
            this.time = setTimeout(() => {
              this.getDate(id)
            }, 3000)
          }
        }
      })
    },

    // 返回主页
    handleBack() {
      uni.redirectTo({
        url: '/pages/index/index'
      })
    },
    // 查看详情
    handleToview() {
      // #ifdef MP-GUIDE
      if (this.url === '/personal/change/index') {
        this.url = '/pages/index/index'
      }
      // #endif
      uni.redirectTo({
        url: this.url
      })
    }
  }
}
</script>


<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.component-item {
  position: relative;
}
.payok {
  padding: 20rpx 0rpx;
  margin-top: 90rpx;
  margin-top: calc(90rpx + constant(safe-area-inset-bottom));
  margin-top: calc(90rpx + env(safe-area-inset-bottom));
  .title-bar ::v-deep .backcolor {
    color: $integral-text-color;
  }
  .title-bar ::v-deep .black {
    &::after {
      border-left: $integral-text-color 2px solid;
      border-bottom: $integral-text-color 2px solid;
    }
  }
  &::after {
    content: '';
    width: 100%;
    height: 600rpx;
    background: var(--theme-color, $bg-color);
    position: absolute;
    left: 0;
    top: 60rpx;
    z-index: 10;
  }
  .payok-header {
    padding: 0 30rpx;
    .payok-top {
      position: relative;
      z-index: 50;
      text-align: center;
      margin-top: 90rpx;
      .iconfont {
        font-size: 85rpx;
        color: $integral-text-color;
      }
      .icon-duihuan-loading {
        animation: rotate 4s linear infinite;
      }
      .top-exchange {
        font-size: 36rpx;
        font-weight: 700;
        margin-top: 40rpx;
        color: $integral-text-color;
      }
      .top-red {
        margin-top: 30rpx;
        font-size: 28rpx;
        color: $integral-text-color;
      }
    }
    .payok-exchange {
      position: relative;
      z-index: 50;
      background: #ffffff;
      padding: 30rpx 20rpx;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
      margin-top: 40rpx;
      .exchange-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 26rpx;
        color: #000;
        font-weight: 500;
        border-bottom: 1rpx solid #eeeeee;
        padding-bottom: 25rpx;
        margin-top: 30rpx;
        .exchange-left {
          color: #666666;
        }
        .exchange-cope {
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        &:nth-child(1) {
          margin-top: 0;
        }
        &:nth-last-child(1) {
          border-bottom: 2rpx solid transparent;
          padding-bottom: 0;
        }
      }
    }
  }
  .foot-gap {
    height: 154rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
  }
  .integral-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;

    .footer-confirm {
      width: 100%;
      background: #ffffff;
      padding: 25rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      padding-bottom: calc(constant(safe-area-inset-bottom));
      padding-bottom: calc(env(safe-area-inset-bottom));
      min-height: 135rpx;
      box-sizing: border-box;
      .footer-left {
        text-align: center;
        border: 1px solid var(--theme-color, $integral-order-color);
        background: #ffffff;
        border-radius: 41px;
        padding: 20rpx 90rpx;
        color: var(--theme-color, $integral-btn-color);
      }
      .footer-right {
        text-align: center;
        border: 1px solid var(--theme-color, $bg-color);
        background: var(--theme-color, $bg-color);
        border-radius: 41px;
        padding: 20rpx 90rpx;
        color: $integral-text-color;
      }
    }
  }
}
</style>
