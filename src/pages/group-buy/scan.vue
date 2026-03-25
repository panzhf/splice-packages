<template>
  <view :style="themeVars">
    <view v-if="isShowCamera && !busy" class="scan-special">
      <img :src="scanlink" alt="" class="link" />
    </view>
    <camera
      v-if="isShowCamera"
      device-position="back"
      flash="off"
      style="width: 100%; height: 560rpx"
      mode="scanCode"
      @initdone="initdone"
      @scancode="throttle"
      @error="catchCamera"
    />
    <CameraZoom v-if="isShowCamera" :max-zoom="maxZoom" is-open @zoom="setZoom" @change-mode="onChangeScan" />
    <view v-if="!scanState && iswritelogisticscode" class="manual-box">
      <view class="manual-input bg-f">
        <view class="search-box bg-f">
          <search-input
            ref="searchInput"
            v-model="keyword"
            :placeholder="searchPlacehoder"
            class="search-input"
            :max-length="50"
            :custom-style="customStyle"
            :show-search-btn="false"
            :show-btn="false"
            use-blur
            @search="handleSchare()"
          />
          <view class="search-button fs-30" @click="handleSchare(1)">{{ checked ? '回退' : '确定' }}</view>
        </view>
      </view>
    </view>
    <view v-if="iswritelogisticscode" :class="['switch-button', scanState ? '' : 'cal']" @click="handleSwitch">
      <text v-if="scanState" class="iconfont icon-shoudongshuru iconshoudongshuru fs-40" />
      <text v-else class="iconfont icon-shexiangtou iconshexiangtou fs-40" />
    </view>
    <view class="tool-content bg-f">
      <view class="panel">
        <view class="left fs-30">
          扫码结果：
          <text class="success-state">{{ resultMsg }}</text>
        </view>
        <view v-if="orderno && actiontype === 0" class="right fs-30">
          <u-checkbox-group @change="checkboxChange">
            <u-checkbox v-model="checked" name="true">错误回退</u-checkbox>
          </u-checkbox-group>
        </view>
      </view>
      <view class="list-box">
        <scroll-view class="left" scroll-y scroll-with-animation :scroll-into-view="toView">
          <view v-if="list.length" id="'view-1'" class="item item-top">
            <view class="serial ellipsis-1">物流码</view>
            <view class="number">数量</view>
          </view>
          <view v-for="(item, index) in list" :id="'view' + index" :key="index" class="item">
            <view class="serial ellipsis-1">{{ item.logisticscode }}</view>
            <view class="number">x{{ item.codecount }}</view>
          </view>
          <view v-if="!list.length" class="no-data center-middle fs-28">
            暂无记录 {{ actiontype === 0 ? '，请扫码登记' : '' }}
          </view>
        </scroll-view>
        <view class="right">
          <view class="view">
            <view class="num">{{ totalscanamount }}</view>
            <view class="title">{{ actiontype === 0 ? '已扫' : '已退' }}物流码数量</view>
          </view>
          <view class="view">
            <view class="num">{{ totallogisticscode }}</view>
            <view class="title fs-28">{{ actiontype === 0 ? '已登记' : '已退' }}商品总件数</view>
          </view>
        </view>
      </view>
      <view v-if="totalscanamount === 0" class="next-button fs-36" @click="handleBackList">返回列表</view>
      <view v-else class="next-button fs-36" @click="handleFinish">完成登记</view>
    </view>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="title"
      :confirm-text="confirmText"
      :cancel-text="cancelText"
      :content="popContent"
      :max-size="popType === 'confirm'"
      @confirm="handleOpenSetting"
      @close="handleOpenSetting"
      @cancel="cancelConfirm"
    >
      <view v-if="errMsg">
        <view class="err-tips fs-28">{{ errMsg }}</view>
        <view class="ma fs-24">本次扫描物流码：{{ errSerialnumber }}</view>
      </view>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiDeliveryOrder,
  apiReturnOrder,
  apiReturnStatistics,
  apiDeliveryStatistics,
  apiActivitySetting,
  apiDeliveryOrderBack
} from 'packages/api/group-buy.js'
import SearchInput from '@/components/search/search-input.vue'
import { getSetting, openSetting } from 'packages/utils/function.js'
import { audioSuccess, audioFail, scanBg, scanlink } from '@/utils/default-picture'
import cameraZoomMixin, { autoScanMixin, scanTypeMixin } from 'packages/mixins/camera-zoom'
import CameraZoom from 'packages/components/camera/zoom'
import { extractCode } from 'packages/utils'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    SearchInput,
    CameraZoom
  },
  mixins: [
    cameraZoomMixin,
    autoScanMixin,
    scanTypeMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      customStyle: 'background: #f5f5f5;border-radius: 10rpx;margin: 0 20rpx;',
      actiontype: 0,
      actionText: '',
      orderno: '',
      isShowCamera: true,
      resultMsg: '',
      errMsg: '',
      errSerialnumber: '',
      timestamp: new Date().getTime(),
      title: '',
      confirmText: '确认',
      cancelText: '',
      tips: '',
      keyword: '',
      toView: 'view0',
      list: [],
      checked: false, // 错误回退，只有待提交订单
      showPicker: true,
      popType: 'tip',
      scanState: true, //扫码状态
      popContent: '', // 弹窗内容
      showPopup: false, // 显示弹窗  true：显示  false：不显示
      searchPlacehoder: '请输入物流码',
      totallogisticscode: 0, //商品总件数
      totalscanamount: 0, //物流码数量
      type: 0, //0经销商1门店
      busy: false, // 防重复标记
      maxHeight: 300,
      query: {},
      scanBg,
      scanlink,
      userinfo: {},
      iswritelogisticscode: 1
    }
  },

  watch: {
    showPopup(v) {
      if (v) {
        this.busy = true
      } else {
        this.errMsg = ''
        this.cancelText = '取消'
      }
    }
  },

  /**
   * orderno  订单号
   * actiontype 0登记1退货
   * activityid 活动id
   * storeId 门店id 业务帮帮需要
   */
  onLoad(options) {
    this.query = options

    this.actiontype = Number(options.actiontype)
    this.actionText = this.actiontype === 0 ? '登记' : '退货'
    uni.setNavigationBarTitle({
      title: this.actiontype === 0 ? '团购商品登记' : '退货扫码'
    })

    this.orderno = options.orderno
    this.userinfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    if (this.orderno) {
      this.getOrderstat()
    }

    this.initScanType()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发导致相机不正常初始化
    this.$refs.privacyPopup.refresh()
    // #endif
    if (!this.isShowCamera) {
      getSetting('camera')
        .then(() => {
          this.isShowCamera = true
          this.busy = false
        })
        .catch(() => {
          this.isShowCamera = true
          this.busy = true
        })
    }
  },
  methods: {
    checkboxChange() {
      this.list = []
      this.resultMsg = ''
      this.getOrderstat()
    },
    initdone(e) {
      this.initScanTimer()
      this.initCtx(e.detail.maxZoom)
      this.setZoom()
    },
    initScanType() {
      apiActivitySetting().then(res => {
        if (this.$ck(res)) {
          const { isbarcode, isqrcode, iswritelogisticscode } = res.return_data
          this.iswritelogisticscode = iswritelogisticscode
          this.setScanType({ isbarcode, isqrcode })
        }
      })
    },
    handleFinish() {
      this.popType = 'confirm'
      this.title = '提示'
      if (this.actiontype === 0) {
        this.popContent = '确认完成本次团购商品登记扫码？'
      } else {
        this.popContent = `确认完成本次退货扫码？`
      }
      this.cancelText = '取消'
      this.confirmText = '确认'
      this.showPopup = true
    },
    handleBackList() {
      // uni.navigateBack({
      //   delta: 2
      // })
      this.handleBack()
    },
    handleBack() {
      uni.navigateBack()
    },
    async getOrderstat() {
      this.list = []
      this.totallogisticscode = 0
      this.totalscanamount = 0
      let res

      let query = {
        memberlogin: this.userinfo.memberLogin,
        orderno: this.orderno,
        activityid: +this.query.activityid
      }

      // #ifdef MP-SALE
      query.storeId = +this.query.storeId
      // #endif
      // 根据actiontype决定调用哪个统计API
      // actiontype=0时: 调用发货统计API
      // actiontype!=0时: 调用退单统计API
      const shouldReturnStatistics = this.actiontype === 1
      res = shouldReturnStatistics ? await apiReturnStatistics(query) : await apiDeliveryStatistics(query)
      if (this.$ck(res, false)) {
        this.totallogisticscode = res.return_data.totallogisticscode
        this.totalscanamount = res.return_data.totalscanamount
      }
    },
    async handleSchare(delay) {
      if (delay) {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 100)
        })
      }
      if (!this.keyword.trim()) {
        delay && this.$msg('请输入物流码')
        return
      }
      let reg = /^[\da-z]+$/i
      if (!reg.test(this.keyword)) {
        return this.$msg('只能输入数字或字母')
      }
      this.handleScancode(this.keyword)
      this.$refs.searchInput && this.$refs.searchInput.clearAndFocus()
    },
    handleOpenSetting() {
      if (this.confirmText === '确认') {
        this.isShowCamera = false
        this.handleBack()
      } else if (this.confirmText === '去授权') {
        this.isShowCamera = false
        openSetting()
      } else {
        this.showPopup = false
        this.busy = false
      }
    },
    cancelConfirm() {
      if (this.cancelText === '完成登记') {
        this.handleBack()
      } else {
        this.busy = false
      }
    },
    catchCamera() {
      this.popType = 'tip'
      getSetting('camera').catch(() => {
        this.popContent = '授权使用摄像头后才能扫描货品请您授权开启摄像头'
        this.confirmText = '去授权'
        this.title = '温馨提示'
        this.showPopup = true
      })
    },
    handleFull() {
      this.popType = 'confirm'
      this.title = '提示'
      this.popContent = `登记扫码数量已达到团购订单报名数量。`
      this.confirmText = '继续扫码登记'
      this.cancelText = '完成登记'
      this.showPopup = true
    },

    throttle(e) {
      this.clearScanTimer()
      // 使用抽取的扫描类型校验方法
      if (!this.validateScanType(e)) return
      if (new Date().getTime() - this.timestamp >= 1500 && this.scanState) {
        let { result } = e.detail
        result = result.trim()
        this.handleScancode(extractCode(result))
      }
    },
    async handleScancode(value) {
      if (this.busy) return
      this.busy = true
      this.timestamp = new Date().getTime()
      uni.vibrateShort()
      let { memberLogin, memberLoginName, storeId, mainpartName } = this.userinfo
      let query = {
        orderno: this.orderno,
        memberlogin: memberLogin,
        logisticscode: value,
        activityId: +this.query.activityid
      }
      // #ifdef MP-SALE
      query.storeId = +this.query.storeId
      // #endif
      let res
      try {
        // 根据actiontype决定调用哪个API
        // actiontype=0时: 调用发货API
        // actiontype!=0时: 调用退单API
        const shouldReturnOrder = this.actiontype === 1
        res = shouldReturnOrder
          ? await apiReturnOrder(query)
          : this.checked
          ? await apiDeliveryOrderBack(query)
          : await apiDeliveryOrder(query)

        if (this.$ck(res, false)) {
          setTimeout(() => {
            this.handleRadio(true)
          }, 500)
          this.resultMsg = `${this.checked ? '回退' : this.actionText}成功`
          const { totallogisticscode, totalscanamount } = res.return_data
          this.totallogisticscode =
            Number(this.totallogisticscode) + (this.checked ? -Number(totallogisticscode) : Number(totallogisticscode))
          this.totalscanamount =
            Number(this.totalscanamount) + (this.checked ? -Number(totalscanamount) : Number(totalscanamount))
          if (!this.isSetPrevOrderNo && res.return_data.orderno) {
            this.orderno = res.return_data.orderno
            // 设置申请页的订单号
            const pages = getCurrentPages()
            const prevPage = pages[pages.length - 2]
            if (prevPage.route === 'packages/src/pages/group-buy/apply') {
              prevPage.$vm.setOrderNo(res.return_data.orderno)
              this.isSetPrevOrderNo = true
            }
          }
          this.list.unshift({
            logisticscode: value,
            codecount: res.return_data.totallogisticscode
          })
          if (this.list.length > 300) {
            this.list.splice(0, 1)
          }
          this.toView = 'view-1'

          setTimeout(() => {
            // ios连扫会黑屏，需延时
            this.autoScan && this.onChangeScan()
          }, 2000)

          setTimeout(() => {
            this.busy = false
          }, 1000)
        } else {
          if (this.autoScan) {
            // 高清模式下扫码有提示，重置
            this.isShowCamera = true
            this.autoScan = false
          }
          this.popType = 'tip'
          this.popContent = ''
          this.confirmText = '确定'
          this.title = `${this.checked ? '回退' : this.actionText}失败`
          this.resultMsg = `${this.checked ? '回退' : this.actionText}失败`
          this.errMsg = res.return_msg
          this.errSerialnumber = query.logisticscode
          this.showPopup = true

          setTimeout(() => {
            this.busy = false
          }, 1000)

          setTimeout(() => {
            this.handleRadio(false)
          }, 500)

          this.$log.error({
            type: 'scancode',
            desc: '团购扫码',
            data: JSON.stringify(res),
            extend: JSON.stringify({
              memberLogin,
              memberLoginName,
              storeId,
              mainpartName,
              logisticscode: value
            })
          })
        }
      } catch (e) {
        // #ifdef MP-SALE
        if (e.return_code) {
          this.popType = 'tip'
          this.popContent = ''
          this.confirmText = '确定'
          this.title = `${this.checked ? '回退' : this.actionText}失败`
          this.resultMsg = `${this.checked ? '回退' : this.actionText}失败`
          this.errMsg = e.return_msg
          this.errSerialnumber = value
          this.showPopup = true
        }
        // #endif

        if (this.autoScan) {
          // 高清模式下扫码有提示，重置
          this.isShowCamera = true
          this.autoScan = false
        }
        setTimeout(() => {
          this.busy = false
        }, 1000)

        this.$log.error({
          type: 'scancode: catch-error',
          desc: '团购扫码',
          data: JSON.stringify(e),
          extend: JSON.stringify({
            memberLogin,
            memberLoginName,
            storeId,
            mainpartName,
            logisticscode: value
          })
        })
      }
    },
    handleSwitch() {
      this.scanState = !this.scanState
    },
    handleRadio(state) {
      let Audio = uni.createInnerAudioContext()
      Audio.autoplay = true
      Audio.src = state ? audioSuccess : audioFail
      Audio.onPlay()
    }
  }
}
</script>

<style lang="scss" scoped>
.ma {
  margin-top: 20rpx;
  font-weight: 500;
  word-wrap: break-word;
}
.err-tips {
  font-weight: 500;
  word-wrap: break-word;
}
.tool-content {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  padding: 50rpx 40rpx 30rpx;
  border-radius: 30rpx 30rpx 0px 0px;
  z-index: 2;
  .panel {
    display: flex;
    justify-content: space-between;
    .success-state {
      color: var(--theme-color, $uni-color-primary);
    }
  }
  .list-box {
    display: flex;
    margin-top: 40rpx;
    .left {
      height: calc(100vh - 780rpx);
      width: 400rpx;
      .item {
        padding-right: 40rpx;
        display: flex;
        justify-content: space-between;
        font-size: 28rpx;
        font-weight: 500;
        margin-bottom: 10rpx;
        color: #666666;
        .serial {
          width: 260rpx;
        }
      }
      .item-top {
        color: #333333;
        margin-bottom: 16rpx;
      }
      .no-data {
        height: 100%;
        color: #aaaaaa;
        font-family: PingFang SC;
        font-weight: 500;
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      flex: 1;
      .view {
        flex: 1;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        .num {
          font-size: 60rpx;
          font-weight: 500;
          color: var(--theme-color, $uni-color-primary);
        }
        .title {
          font-weight: 500;
          font-size: 28rpx;
        }
      }
    }
  }
  .next-button {
    width: 100%;
    height: 90rpx;
    background: var(--theme-color, $uni-color-primary);
    border-radius: 45rpx;
    margin: 40rpx auto 0;
    font-weight: bold;
    color: #ffffff;
    line-height: 90rpx;
    text-align: center;
  }
}
.switch-button {
  position: fixed;
  width: 70rpx;
  height: 70rpx;
  opacity: 0.8;
  border-radius: 50%;
  top: 120rpx;
  left: -15rpx;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  .icon-shoudongshuru {
    color: #fff;
  }
}
.cal {
  background-color: rgba(255, 255, 255, 1);
}
.manual-box {
  position: fixed;
  height: 560rpx;
  width: 100%;
  top: 0;
  background-color: rgba(0, 0, 0, 1);
  z-index: 2;
  .manual-input {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700rpx;
    height: 160rpx;
    display: flex;
    border-radius: 10rpx;
    overflow: hidden;
    .search-box {
      display: flex;
      width: 100%;
      align-items: center;
      padding-right: 30rpx;
      .search-input {
        flex: 1;
        margin-bottom: 0;
      }
      .search-button {
        width: 110rpx;
        height: 80rpx;
        background: var(--theme-color, $uni-color-primary);
        border-radius: 15rpx;
        line-height: 80rpx;
        text-align: center;
        color: #ffffff;
      }
    }
  }
}
::v-deep .u-checkbox__icon-wrap {
  margin-left: 10rpx;
}
::v-deep .center-middle {
  height: 300rpx !important;
}
.scan-special {
  position: fixed;
  height: 560rpx;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  background-size: 100%;
  .link {
    width: 590rpx;
    height: 35rpx;
    margin: 0 auto;
    display: block;
    margin-top: 100rpx;
    animation-name: scanAnimation;
    animation-duration: 2.4s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-direction: alternate;
  }
}
@keyframes scanAnimation {
  0% {
    margin-top: 100rpx;
  }
  90% {
    margin-top: 400rpx;
  }
  100% {
    margin-top: 400rpx;
  }
}
</style>
