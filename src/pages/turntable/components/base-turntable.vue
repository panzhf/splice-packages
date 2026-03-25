<template>
  <view class="base-turntable" :class="skinClass">
    <view class="wrapper">
      <view class="bg" :style="{ backgroundImage: `url(${tableBg})` }" />
      <view class="prize-list" :animation="animationData">
        <view
          v-for="(item, index) in list"
          :key="index"
          :style="{ transform: `rotate(${(index * 360) / listLength}deg)` }"
          class="prize-item flex flex-column flex-middle"
        >
          <text class="name fs-26 fw-bold">{{ item.name }}</text>
          <image :src="item.awardpicture" class="icon mt-20" />
          <view class="line" :style="{ transform: `rotate(${180 / listLength}deg)` }" />
        </view>
      </view>
      <!-- 个别模板没有转盘闪灯 -->
      <view v-if="[0, 1, 2, 3, 4, 9].includes(skin)" class="light">
        <view
          v-for="(item, index) in 24"
          :key="item"
          :style="{ transform: `rotate(${(index * 360) / 24}deg)` }"
          class="item"
        />
      </view>
    </view>
    <image :src="tableGo" class="play-btn" :class="{ disabled: !btnInfo.status }" @tap="handlePlay" />

    <custom-tip
      v-model="isShowPopup"
      :btn-info="btnInfo"
      :countdown="countdown"
      :btm-jump-html="btmJumpHtml"
      @navigate="onNavigate"
      @location="onLocation"
      @cleartimer="onReset"
    />
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import { propMixin, navigateMixin } from '../mixins'
import { apiGetPrize } from 'packages/api/activity'
import CustomTip from './custom-tip.vue'
import dayjs from 'dayjs'
export default {
  name: 'BaseTurntable',
  components: {
    CustomTip
  },
  mixins: [packageStaticMixin, propMixin, navigateMixin],
  props: {
    freeNum: {
      type: Number,
      default: 0 // 免费抽奖次数
    },
    isThirdOpen: {
      type: Boolean,
      default: false
    },
    btmJumpHtml: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isPlaying: false,
      isShowPopup: false,
      btnInfo: {
        status: true,
        type: 0, // 1.用户限制 2.活动未开始 3.稍后重试 4.积分不足 5.位置授权 6.位置提示 7.其他提示
        msg: ''
      },
      countdown: {
        days: '',
        hours: '',
        minutes: '',
        seconds: ''
      },
      timer: null,
      firstTime: 0, // usescenetype=1，线下场景。首次抽奖时需要扫门店码
      animationData: {},
      round: 0, // 转数
      startTime: 0
    }
  },
  computed: {
    listLength() {
      return this.list.length
    },
    tableBg() {
      return `${this.PACKAGE_STATIC_URL}turntable/${this.skin}/round-bg.png`
    },
    tableGo() {
      return `${this.PACKAGE_STATIC_URL}turntable/${this.skin}/go.png`
    }
  },
  beforeDestroy() {
    this.resetTimer('round')
  },
  methods: {
    init() {
      // 页面刷新时通过ref调用重置
      this.btnInfo = {
        status: true,
        type: 0,
        msg: ''
      }
      this.resetTimer()
      this.countdown = {
        days: '',
        hours: '',
        minutes: '',
        seconds: ''
      }
    },
    handlePlay() {
      if (this.info.usescenetype === 1 && !this.info.coordinate) {
        // 未授权地理位置
        this.limitLocation()
        return
      }
      this.resetTimer()

      if (!this.timeOut(this.info.startdatetime)) {
        // 活动未开始
        this.btnInfo.status = false
        this.btnInfo.type = 2
        this.btnInfo.msg = ''
        this.calcTime(this.info.startdatetime)
        return
      }

      if (this.info.timestartdatetime && this.info.status === 2) {
        // 指定时间参与
        this.btnInfo.status = this.timeIn(this.info.timestartdatetime, this.info.timeenddatetime)
        if (!this.btnInfo.status) {
          this.btnInfo.type = 2
          this.btnInfo.msg = ''
          this.limitTime(this.info.timestartdatetime, this.info.timeenddatetime)
          return
        }
      }

      if (this.info.ismembers === 0) {
        // 用户限制：会员标签/会员等级
        this.limitUser()
        return
      }

      if (this.info.usescenetype === 1) {
        // 线下门店场景，需要先扫码
        this.scanQrcode()
        return
      }
      this.fetchPrize()
    },
    async fetchPrize(shopData) {
      if (this.isPlaying) return
      this.isPlaying = true

      let params = {
        aid: this.info.aid
      }
      if (this.info.usescenetype === 1) {
        // 线下门店场景，增加门店码和经纬度
        params = { ...params, ...shopData }
      }
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        params.Userid = this.$route.query.Userid
        params.Key = this.$route.query.Key
      }
      /* #endif */
      this.startTime = new Date().getTime()
      if (!this.animation) {
        const animation = uni.createAnimation({
          duration: 400,
          timingFunction: 'ease'
        })
        this.animation = animation
      }
      this.animation.rotate(0).step({ duration: 20, timingFunction: 'step-start' })
      try {
        this.round = 0
        this.roundTimer = setInterval(() => {
          this.round++
          this.animation.rotate(360 * this.round).step({ duration: 400, timingFunction: 'linear' })
          this.animationData = this.animation.export()
          // console.log('this.round', this.round)
        }, 400)
        const res = await apiGetPrize(params, { loading: false })
        const { return_code: code, return_freenum: freeNum, return_index: prizeId, return_turntablelink: link } = res
        if (code === 0) {
          // 0:正常
          this.successCb({ freeNum, prizeId, link })
          return
        }
      } catch (err) {
        const {
          return_code: code,
          return_freenum: freeNum,
          return_index: prizeId,
          return_turntablelink: link,
          return_msg: msg
        } = err
        if (code === 30007) {
          // 30007:奖品发放失败
          this.successCb({ freeNum, prizeId, link })
          return
        }

        this.failCb({ code, msg })
      }
    },
    async successCb({ freeNum, prizeId, link }) {
      // 若有扫码获得免费抽奖机会，同步更新数据
      this.$emit('update:free-num', freeNum)
      this.firstTime++
      const prizeIndex = this.list.findIndex(item => item.id === prizeId)
      let prizeInfo = this.list.find(item => item.id === prizeId)
      prizeInfo = { ...prizeInfo, ...link }
      if (this.info.usescenetype === 1) {
        // 线下领取增加个获奖时间
        prizeInfo.time = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      const e = new Date().getTime()
      const diff = e - this.startTime
      // 保证至少6次转盘转动时间，否则按响应时间向上取整
      const round = diff < 400 * 6 ? Math.max(this.round, 6) : Math.ceil(diff / 400)
      // console.log('round', round)
      await this.sleep((round - this.round) * 400)
      this.resetTimer('round')
      // 转盘最终转动角度，加两圈使得有减速效果
      let angle = (-prizeIndex * 360) / this.listLength + 360 * (round + 2)
      this.animation.rotate(angle).step({ duration: 2000, timingFunction: 'ease-out' })
      this.animationData = this.animation.export()
      setTimeout(() => {
        this.isPlaying = false
        this.$emit('success', prizeInfo)
      }, 2000)
    },
    failCb({ code, msg }) {
      this.resetTimer('round')
      this.animation.rotate(0).step({ duration: 10, timingFunction: 'step-start' })
      this.animationData = this.animation.export()
      this.isPlaying = false
      if (code === 30047) {
        this.btnInfo.type = 3
        this.btnInfo.msg = '请稍后重试，活动马上开始'
        this.$nextTick(() => {
          this.isShowPopup = true
        })
        return
      }
      if (code === 30049) {
        // 积分不足
        this.btnInfo.type = 4
        this.btnInfo.msg = '亲，您的积分不足哦~'
        this.$nextTick(() => {
          this.isShowPopup = true
        })
        return
      }
      if (code === 30061) {
        // 活动限制
        this.limitUser()
        return
      }
      if (code === 30052) {
        // 门店位置相关
        this.btnInfo.type = 6
        this.btnInfo.msg = msg
        this.$nextTick(() => {
          this.isShowPopup = true
        })
        this.$emit('refresh-location')
        return
      }
      this.btnInfo.status = false
      this.btnInfo.type = 7
      this.btnInfo.msg = msg || '请检查您的网络'
      this.$nextTick(() => {
        this.isShowPopup = true
      })
    },
    sleep(time) {
      return new Promise(resolve => {
        setTimeout(resolve, time)
      })
    },
    scanQrcode() {
      if (this.firstTime > 0) {
        // 记录之前的扫码数据，无需重复扫码
        const shopData = JSON.parse(uni.getStorageSync('shopScanData'))
        this.fetchPrize(shopData)
        return
      }
      /* #ifdef MP-WEIXIN */
      uni.scanCode({
        scanType: ['qrCode', 'barCode'],
        success: res => {
          let { result } = res
          result = result.trim()
          let shopData = {
            storecode: result,
            coordinate: this.info.coordinate
          }
          uni.setStorageSync('shopScanData', JSON.stringify(shopData))
          this.fetchPrize(shopData)
        }
      })
      /* #endif */
      /* #ifdef H5 */
      this.$wechat.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
        scanType: ['qrCode', 'barCode'],
        success: res => {
          let { resultStr: result } = res
          result = result.trim()
          let shopData = {
            storecode: result,
            coordinate: this.info.coordinate
          }
          uni.setStorageSync('shopScanData', JSON.stringify(shopData))
          this.fetchPrize(shopData)
        }
      })
      /* #endif */
    },
    limitUser() {
      this.btnInfo.status = false
      this.btnInfo.type = 1
      this.btnInfo.msg = this.info.limitexplain
      this.$nextTick(() => {
        this.isShowPopup = true
      })
    },
    limitLocation() {
      this.btnInfo.status = true
      this.btnInfo.type = 5
      /* #ifdef MP-WEIXIN */
      this.btnInfo.msg = '亲，该活动需要获取地理位置才能参与\n（请确保手机微信定位权限已开启）'
      /* #endif */
      /* #ifdef H5 */
      this.btnInfo.msg =
        '亲，该活动需要获取地理位置才能参与，请刷新页面后在弹出授权请求框中选择“是”，然后再点击抽奖~（请确保手机微信定位权限已开启）'
      /* #endif */
      this.$nextTick(() => {
        this.isShowPopup = true
      })
    },
    calcTime(startTime, endTime) {
      this.resetTimer()
      this.timer = setInterval(() => {
        let time = this.difSeconds(startTime, endTime)
        if (time === 'over') {
          this.isShowPopup = false
          this.btnInfo.status = true
          clearInterval(this.timer)
          return
        }
        this.countdown = time
      }, 1000)
      this.countdown = this.difSeconds(startTime, endTime)
      this.$nextTick(() => {
        this.isShowPopup = true
      })
    },
    limitTime(start, end) {
      if (start && !this.timeOut(dayjs().format('YYYY-MM-DD') + ' ' + start)) {
        this.calcTime(dayjs().format('YYYY-MM-DD') + ' ' + start)
        return
      }
      if (end && this.timeOut(dayjs().format('YYYY-MM-DD') + ' ' + end)) {
        this.calcTime(
          dayjs().format('YYYY-MM-DD') + ' ' + end,
          dayjs().add(1, 'day').format('YYYY-MM-DD') + ' ' + start
        )
        return
      }
    },
    timeOut(time) {
      // 指定时间在当前时间之前
      if (dayjs(time).diff(dayjs()) < 0) {
        return true
      }
      return false
    },
    timeIn(s, e) {
      // 两个时间点之间
      let t = dayjs().format('YYYY-MM-DD')
      if (dayjs(t + ' ' + s).diff(dayjs()) < 0 && dayjs(t + ' ' + e).diff(dayjs()) > 0) {
        return true
      }
      return false
    },
    difSeconds(start, end) {
      let dif = end ? dayjs(end).diff(dayjs(), 'seconds') : dayjs(start).diff(dayjs(), 'seconds')
      if (dif <= 0) return 'over'
      let days = Math.floor(dif / (24 * 60 * 60))
      let hours = this.padNum(Math.floor(dif / (60 * 60)) - days * 24)
      let minutes = this.padNum(Math.floor(dif / 60) - days * 24 * 60 - hours * 60)
      let seconds = this.padNum(dif % 60)
      return {
        days,
        hours,
        minutes,
        seconds
      }
    },
    onReset() {
      this.resetTimer()
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        this.dropThirdMathPage()
      }
      /* #endif */
    },
    resetTimer(type) {
      if (type === 'round') {
        if (this.roundTimer) {
          clearInterval(this.roundTimer)
          this.roundTimer = null
        }
      } else {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
      }
    },
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    },
    onNavigate() {
      /* #ifdef MP-WEIXIN */
      if (this.btnInfo.type === 1) {
        this.handleNavigate('/pages/me/index')
      } else if (this.btnInfo.type === 4) {
        this.handleNavigate('/pages/index/index')
      }
      /* #endif */
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        this.dropThirdMathPage()
      } else if (this.btnInfo.type === 1) {
        this.handleNavigate(this.info.personallink)
      } else if (this.btnInfo.type === 4) {
        this.handleNavigate(this.info.pointlink)
      }
      /* #endif */
    },
    onLocation() {
      /* #ifdef MP-WEIXIN */
      uni.openSetting()
      /* #endif */
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        this.dropThirdMathPage()
      } else {
        location.reload()
      }
      /* #endif */
    },
    /* #ifdef H5 */
    dropThirdMathPage() {
      this.$wechat.miniProgram.navigateTo({
        url: '/pages/home/home'
      })
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/base-table.scss';
</style>
