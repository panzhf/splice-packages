<template>
  <view :style="themeCalcVars">
    <view v-if="!loading" class="display-present flex flex-column">
      <TitleBar
        :title="title"
        :bgcolor="currentThemeColor"
        textcolor="#fff"
        :type="fromType === 'scan' ? 'custom' : 'detail'"
        show-nav-title
        is-transparent
      />
      <view class="bg" :style="bgStyle" />
      <view class="content" :style="{ paddingTop: top }">
        <v-steps v-model="steps" :color="currentThemeColor" class="db mt-30" />
        <view class="block">
          <template v-if="steps === 0">
            <v-info class="db mt-20 round" :info="activityInfo" />
            <v-rule class="db mt-20 round" :info="activityInfo" :bar-color="currentThemeColor" />
          </template>
          <template v-if="steps > 0">
            <v-periods :list="timeArr" :perioddisplay="perioddisplay" class="db mt-40 periods" @handleSelect="handleSelectTime" />
            <v-content
              :activity-id="id"
              :steps="steps"
              :info="activityInfo"
              :state="periodsState"
              :activity-status="activityStatus"
              :subscribe-settings="subscribeSettings"
              :template-id="noticeTempList"
              @submit="onSubmit"
            />
          </template>
        </view>
      </view>

      <template v-if="steps === 0">
        <view class="btn-submit">
          <view class="rule-checked flex flex-middle flex-center pt-20 pb-20 pl-20" @tap="agreeRule = !agreeRule">
            <u-checkbox
              class="check-box"
              size="32"
              :value="agreeRule"
              shape="circle"
              :active-color="currentThemeColor"
            />
            <view class="rule">我已知晓任务规则</view>
          </view>
          <button class="flex-1" :disabled="!agreeRule" @tap="handleSave">接受任务</button>
        </view>
        <view class="massive" />
      </template>
    </view>
    <common-popup v-model="showPopup" :show-title="false" confirm-text="关闭" class="pop" @close="popClose">
      <view class="popup-box">
        <view class="iconfont iconpack-gou mt-30 db" />
        <view class="title fw-bold db">上传成功</view>
        <view class="tips db mt-20">信息正在审核中，请关注审核结果</view>
      </view>
    </common-popup>
    <common-popup v-model="showErrPopup" confirm-text="关闭" class="pop" @close="showErrPopup = false">
      <view class="popup-box">
        <view class="msg">
          {{ errMsg }}
        </view>
        <view class="tips db mt-20" style="color: #4690ff" @click="handleEdit">若门店地址有误？前往修改门店 ></view>
      </view>
    </common-popup>
    <common-popup v-model="showPendingPopup" type="tip" title="温馨提示" content="已有待审核记录，无法提交！" confirm-text="确定" @close="handlePendingConfirm" />
    <u-popup v-model="showScanPopup" mode="center" width="600rpx" height="400rpx" border-radius="20" closeable="true">
      <view class="flex flex-middle flex-center flex-column scan-popup">
        <view class="content">
          {{ scanErrMsg }}
        </view>
        <button class="scan-button" @tap="handleScan(2)">扫一扫</button>
      </view>
    </u-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { getUrlQuery } from '@/utils/index'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import VSteps from './components/v-steps.vue'
import VInfo from './components/v-info.vue'
import VRule from './components/rule.vue'
import VPeriods from './components/periods.vue'
import VContent from './components/v-content.vue'
import { apiGetTimeList, apiGetActivitDetail, apiTakeTask, apiSubmitStoreLayout } from 'packages/api/display-present'
import SwitchBrand from '@/mixins/switch-brand'
import refreshPageMixin from '@/mixins/refresh-page'
import { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
import { activityCheckMixin } from 'packages/mixins/activity-check'
import { scanCbMixin, scanQrcodeMixin } from 'packages/mixins/scan'

export default {
  components: {
    TitleBar,
    VSteps,
    VInfo,
    VRule,
    VPeriods,
    VContent
  },
  mixins: [SwitchBrand, refreshPageMixin, noticeMixin, noticeMixin2, activityCheckMixin, scanCbMixin, scanQrcodeMixin],
  data() {
    return {
      title: '',
      errMsg: '',
      agreeRule: false, // 是否同意协议
      steps: -1,
      id: 0,
      timeArr: [],
      activityInfo: {},
      periodsState: 0, // 0：进行中，1：未开始，2：已结束
      activityStatus: 0, // 活动状态 0：进行中，1：未开始，2：已结束，3：已禁用,4：已删除
      perioddisplay: 0, // 周期显示方式  0 显示， 1 隐藏
      showPopup: false,
      showErrPopup: false,
      showPendingPopup: false, // 待审核记录提示弹窗
      isenabledstorerangelimit: false, // 是否开启地理位置限制
      loading: true,
      noticeTempList: [],
      showScanPopup: false,
      scanErrMsg: '',
      fromType: '' // 扫码跳转会携带参数fromtype=scan
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    bgHeight() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight + 180}px`
      /* #endif */
      return style
    },
    top() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    currentThemeColor() {
      return this.activityInfo?.activityinfo?.contentjson?.backgroupcolor || '#ff7640'
    },
    themeCalcVars() {
      const s = [this.themeVars]
      s.push(`--page-theme-color: ${this.currentThemeColor}`)
      return s.join(';')
    },
    bgStyle() {
      const s = []
      s.push(`height: ${this.bgHeight}`)
      s.push(`background: ${this.currentThemeColor}`)
      return s.join(';')
    }
  },
  async onLoad(options) {
    // 消息订阅：id=x&m=x
    // 小程序码：scene=encodeURIComponent('id=x&m=x')
    // 页面跳转：id=x
    if (!options.id && !options.scene) return this.$msg('链接格式不正确')
    const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
    if (options.m) {
      // 通过消息订阅进入
      const r = this.checkBrand({ m: options.m })
      if (!r) return
    }
    await this.verifyMemberLogin(query.m)
    this.id = query.id
    options.fromtype && (this.fromType = options.fromtype)

    this.refreshPage()

    const res1 = await this.initNotice(547)
    const res2 = await this.initNotice(548)
    this.subscribeSettings = {
      isopenaudit: res1.isopen,
      isopenstart: res2.isopen
    }
    const type = res1.isopen && res2.isopen ? 4 : res1.isopen ? 8 : res2.isopen ? 9 : 0
    this.subscribeSettings.type = type
    this.fetchNotice(type)
  },
  methods: {
    async refreshPage() {
      await this.getTimeList()
      const defaultPeriod = this.timeArr.find(i => i.isdefault)
      if (defaultPeriod) {
        this.getDetail(defaultPeriod)
      }
    },
    async getTimeList() {
      let res = await apiGetTimeList({
        activityid: this.id
      })
      if (this.$ck(res)) {
        let { return_data: list } = res
        if (!list.length) return this.$msg('暂无数据')
        const formatDate = date => date.split(' ')[0].split('-').slice(1).join('-')
        let timeArr = list.map(item => {
          return { ...item, showstarttime: formatDate(item.starttime), showendtime: formatDate(item.endtime) }
        })
        this.timeArr = timeArr
      }
      return res?.return_code === 0
    },
    getDetail(row) {
      apiGetActivitDetail({
        activityId: this.id,
        index: row.index,
        starttime: row.starttime,
        endtime: row.endtime
      }).then(res => {
        if (this.$ck(res)) {
          this.activityInfo = res.return_data
          this.loading = false

          /**
           * joinRecordFinished 是否上传了图片。true时代表上传了
           * currentperiodstatus 0：进行中，1：未开始，2：已结束
           */
          let {
            storerelationfinished,
            joinrecordfinished,
            currentperiodstatus,
            activitystatus,
            joinrecord: { processstatus },
            activityinfo: { id, title, isenabledstorerangelimit, perioddisplay }
          } = res.return_data

          if (!id) {
            this.brandConfirm()
            return
          }

          this.title = title
          this.isenabledstorerangelimit = isenabledstorerangelimit
          this.periodsState = currentperiodstatus
          this.activityStatus = activitystatus
          this.perioddisplay = perioddisplay
          // 根据当前周期状态来决定下一步流程
          // 已结束
          if (currentperiodstatus === 2) this.steps = 3
          else if (currentperiodstatus === 1 || currentperiodstatus === 0) {
            // 如果没同意协议，到步骤一
            if (!storerelationfinished) this.steps = 0
            else if (joinrecordfinished) {
              // 待审核
              if (processstatus === 0) this.steps = 2
              //  审核通过
              else if (processstatus === 1) this.steps = 3
              // 审核未通过
              else if (processstatus === -1) this.steps = 1
              // 如果未上传，到步骤一
            } else this.steps = 1
          }
        }
      })
    },
    async onSubmit({ data: path, lanandlat, address, subscriberesult }) {
      let selectRow = this.timeArr.find(item => item.isdefault)
      let query = {
        activityId: this.id,
        index: selectRow.index,
        starttime: selectRow.starttime,
        endtime: selectRow.endtime,
        lanandlat,
        address,
        fromtype: this.fromType
      }
      let res = await apiSubmitStoreLayout(
        Object.assign(query, {
          imageurl: path
        })
      )
      if (this.$ck(res, false)) {
        this.reportNotice({
          subscriberesult,
          type: this.subscribeSettings.type,
          orderid: res.return_data
        })

        this.showPopup = true
      } else if (res.return_code === 30206) {
        // 已有待审核记录
        this.showPendingPopup = true
      } else if (res.return_code === 30072) {
        this.errMsg = res.return_msg
        this.showErrPopup = true
      } else if (res.return_code === 30081) {
        // 策略拦截
        this.scanErrMsg = res.return_msg
        this.showScanPopup = true
      } else {
        this.$msg(res.return_msg)
      }
    },
    // 接受任务
    handleSave() {
      apiTakeTask({
        activityId: this.id,
        fromtype: this.fromType
      }).then(res => {
        if (res.return_code === 0) {
          this.steps = 1
        } else if (res.return_code === 30081) {
          // 策略拦截
          this.scanErrMsg = res.return_msg
          this.showScanPopup = true
        } else {
          this.$msg(res.return_msg)
        }
      })
    },
    handleSelectTime(index) {
      let oldIndex = this.timeArr.findIndex(item => item.isdefault)
      if (oldIndex === index) return
      this.timeArr.forEach((item, q) => {
        if (index === q) {
          this.getDetail(item)
        }
        item.isdefault = index === q
      })
    },
    handleEdit() {
      this.showErrPopup = false
      uni.navigateTo({ url: '/shop/address/edit?type=1' })
    },
    popClose() {
      this.showPopup = false
      let selectRow = this.timeArr.find(item => item.isdefault)
      this.getDetail(selectRow)
    },
    handlePendingConfirm() {
      this.showPendingPopup = false
      this.refreshPage()
    }
  }
}
</script>

<style lang="scss" scoped>
.db {
  display: block;
}
.round {
  border-radius: 10rpx;
  overflow: hidden;
}
.display-present {
  .bg {
    background: linear-gradient(90deg, #ff7640 0%, #ff9540 100%);
    height: 200rpx;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }
  .block {
    padding: 20rpx;
  }
  .massive {
    height: 200rpx;
    height: calc(constant(safe-area-inset-bottom) + 200rpx);
    height: calc(env(safe-area-inset-bottom) + 200rpx);
  }
  .btn-submit {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    padding: 15rpx 20rpx;
    padding-bottom: 15rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 15rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 15rpx);
    box-sizing: border-box;
    .rule-checked {
      .check-box {
        width: 50rpx;
      }
      .iconfont {
        padding-right: 6rpx;
      }
    }

    /* 修改默认背景色 */
    button[disabled][type='default'],
    wx-button[disabled]:not([type]) {
      color: #fff;
      background-color: #dcdcdc;
      border-color: #ccc;
    }
    button {
      height: 80rpx;
      margin-left: 20rpx;
      color: #fff;
      border-radius: 40rpx;
      background: var(--page-theme-color, --theme-color, $uni-color-primary);
      line-height: 80rpx;
      font-size: 32rpx;
    }
  }
  .periods {
    padding: 0 40rpx;
  }
}
.popup-box {
  .iconpack-gou {
    color: #58be6b;
    font-size: 80rpx;
  }
  .title {
    font-size: 36rpx;
    margin-top: 50rpx;
  }
  .tips {
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #999999;
  }
}
.scan-popup {
  height: 100%;
  font-weight: bold;
  .content {
    font-size: 30rpx;
    color: #333;
    text-align: center;
    padding: 60rpx 40rpx;
  }
}
.scan-button {
  width: 70%;
  height: 80rpx;
  color: #fff;
  text-align: center;
  font-size: 32rpx;
  line-height: 80rpx;
  background-color: var(--page-theme-color, --theme-color);
  box-sizing: border-box;
  border-radius: 40rpx;
}
</style>
