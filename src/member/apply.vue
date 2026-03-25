<template>
  <view v-if="!loading">
    <title-bar :title="title" :opacity="0.5" />
    <u-parse class="rich-text" :html="customcontent" :tag-style="parseStyle" @imgtap="({ ignore }) => ignore()" />
    <view :class="['btn', 'button-me', isCustomMade ? 'diy' : '']" @click="handleClick('me')">个人中心</view>
    <view :class="['btn', 'button-apply', isCustomMade ? 'diy' : '']" @click="handleClick('apply')">我的邀请</view>
    <view :class="['btn', 'button-explain', isCustomMade ? 'diy' : '']" @click="handleClick('explain')">奖励说明</view>
    <view :class="['footer-button', isCustomMade ? 'custom-made' : '']" @click="handleApply">立即邀请</view>
    <popup ref="explainPopup" class="explain-box">
      点击立即邀请，长按二维码生成海报，分享给好友，你的好友扫描海报上的二维码领取会员卡，你即可获得奖励。邀请的越多，奖励越丰富。
      <view v-for="(item, index) in invitation" :key="index">
        <view class="row mt50">
          邀请：
          <span class="num">{{ item.invitationcount }}</span>
          人，即可得到以下奖励：
        </view>
        <view v-if="item.ispoints" class="explain-item">
          <span class="num">{{ item.points }}</span>
          积分
        </view>
        <view v-if="item.isvoucher" class="explain-item">
          <span class="num">{{ item.denominations }}</span>
          元购物券
        </view>
        <view v-if="item.iswxhb" class="explain-item">
          <span v-if="item.minmoney === 0" class="num">一个</span>
          <span v-else-if="item.minmoney === item.maxmoney" class="num">{{ item.minmoney }}元</span>
          <span v-else class="num">{{ item.minmoney }} - {{ item.maxmoney }}元</span>
          微信红包
        </view>
        <view v-if="item.isproduct" class="explain-item">
          <span>{{ item.productname }}</span>
        </view>
      </view>
    </popup>
    <canvas id="myQrcode" canvas-id="myQrcode" class="share-canvas" catchtouchmove="true" />
    <canvas-popup ref="canvasPopup" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import TitleBar from '../components/title-bar/title-bar.vue'
import Popup from '../components/explain-popup.vue'
import canvasPopup from './canvas/index.vue'
import { createPoster } from './canvas/index.js'
import richTextMixin from 'packages/mixins/rich-text'
import { apiGetApplyData, apiGetApplyAwardData } from '../api/member.js'
import { getExtConfig } from '@/config'
export default {
  components: {
    TitleBar,
    Popup,
    canvasPopup
  },
  mixins: [createPoster, richTextMixin],
  data() {
    return {
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      opacity: 0,
      title: '邀请有礼',
      customcontent: '',
      invitation: []
    }
  },
  computed: {
    isCustomMade() {
      return getExtConfig().memberLogin === '10003911' || getExtConfig().memberLogin === '10002249'
    }
  },
  async onLoad() {
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetApplyData()
      if (this.$ck(res, true)) {
        // 使用异步处理，避免阻塞主线程，提升移动端响应速度
        this.customcontent = await this.processImageTagsAsync(res.return_data.customcontent)
        this.title = res.return_data.pagetitle
        this.busy = false
        this.loading = false
      }
    },
    // 异步处理图片标签，避免阻塞主线程
    processImageTagsAsync(html) {
      return new Promise(resolve => {
        // 使用 setTimeout 将处理放到下一个事件循环，避免阻塞UI
        setTimeout(() => {
          if (!html) {
            resolve('')
            return
          }
          // 使用更高效的方法：只匹配标签边界，避免在长base64字符串中回溯
          // 匹配 <img 到 > 或 /> 之间的内容，使用非贪婪匹配
          const result = html.replace(/<img\s+([^>]*?)\/?>/gi, match => {
            // 如果已有 style，替换它
            if (/style\s*=/i.test(match)) {
              return match.replace(
                /style\s*=\s*["'][^"']*["']/i,
                'style="max-width:100%;height:auto;vertical-align:middle;"'
              )
            } else {
              // 在结束标签前添加 style
              return match.replace(/\s*\/?>$/, ' style="max-width:100%;height:auto;vertical-align:middle;" />')
            }
          })
          resolve(result)
        }, 0)
      })
    },
    async handleClick(type) {
      if (type === 'me') {
        uni.navigateTo({
          url: `/pages/me/index`
        })
      } else if (type === 'explain') {
        let res = await apiGetApplyAwardData()
        if (this.$ck(res, true)) {
          this.invitation = res.return_data
          this.$refs.explainPopup.showToast({
            title: '奖励说明',
            explain: ''
          })
        }
      } else if (type === 'apply') {
        uni.navigateTo({
          url: `/packages/src/member/my-apply?hui`
        })
      }
    },
    handleApply() {
      // this.$refs.canvasPopup.showImage('')
      this.hanldGetData()
    }
  }
}
</script>

<style lang="scss" scoped>
// .parser ._img {
//   display: block !important;
// }
.rich-text {
  word-break: break-all;
}
.footer-button {
  position: fixed;
  height: 104rpx;
  width: 705rpx;
  bottom: 52rpx;
  bottom: constant(52rpx + safe-area-inset-bottom);
  bottom: env(52rpx + safe-area-inset-bottom);
  // background: #fc6944;
  background: linear-gradient(0deg, #fa524b, #fd7640);
  left: 21rpx;
  text-align: center;
  line-height: 104rpx;
  color: #fffefe;
  font-size: 42rpx;
  border-radius: 50rpx;
}
.custom-made {
  background: linear-gradient(0deg, #c71912, #c71912);
}
.btn {
  position: fixed;
  width: 160rpx;
  height: 52rpx;
  background: #660498;
  border-radius: 26rpx 0px 0px 26rpx;
  color: #ffffff;
  font-size: 29rpx;
  text-align: center;
  line-height: 52rpx;
  right: 0;
}
.diy {
  left: 0;
  border-radius: 0px 26rpx 26rpx 0px;
  background: #fff;
  color: #c71912;
  font-weight: bold;
}
.button-explain {
  bottom: 219rpx;
  bottom: constant(219rpx + safe-area-inset-bottom);
  bottom: env(219rpx + safe-area-inset-bottom);
}
.button-me {
  bottom: 401rpx;
  bottom: constant(401rpx + safe-area-inset-bottom);
  bottom: env(401rpx + safe-area-inset-bottom);
}
.button-apply {
  bottom: 310rpx;
  bottom: constant(310rpx + safe-area-inset-bottom);
  bottom: env(310rpx + safe-area-inset-bottom);
}
.explain-box {
  .row {
    font-size: 33rpx;
  }
  .num {
    color: #ff9933;
    margin: 0 6rpx;
  }
  .mt50 {
    margin-top: 50rpx;
  }

  .explain-item {
    margin-top: 8rpx;
    padding-left: 40rpx;
    position: relative;
    &::after {
      content: '';
      background-color: #000;
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      position: absolute;
      left: 16rpx;
      top: 16rpx;
    }
  }
  .mt30 {
    margin-top: 30rpx;
  }
}
.share-canvas {
  border: 1px solid #c3c3c3;
  width: 540px;
  height: 960px;
  position: fixed;
  z-index: -1;
  top: -10000000px;
  // top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
