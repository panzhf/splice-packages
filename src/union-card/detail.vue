<template>
  <view>
    <view style="min-height: 100vh">
      <template v-if="info.title">
        <view class="card-detail">
          <view class="card-detail-header">
            <view
              v-if="info.codedetail.code || info.codedetail.password"
              class="card-circle"
              style="bottom: 0; left: 0; transform: translate(-50%, 50%)"
            />
            <view class="line" />
            <view class="poster-box">
              <v-img mode="widthFix" class="poster" :src="info.picurl" />
            </view>
            <view class="card-detail-content">
              <view class="title c-3 fs-30 fw-bold">{{ info.title }}</view>
              <view class="expire c-9 fs-24">有效期：{{ info.validperiodtips }}</view>
            </view>
          </view>
          <view v-if="info.codedetail.code || info.codedetail.password" class="card-detail-footer">
            <view class="card-circle" style="top: 0; right: 0; transform: translate(50%, -50%)" />
            <view v-if="info.codedetail.code" class="item data">
              <text class="name c-9 fs-28">券码：</text>
              <text class="code fs-26">{{ info.codedetail.code }}</text>
              <text class="copy base-txt fs-22" @tap="handleCopy(info.codedetail.code)">复制</text>
            </view>
            <view v-if="info.codedetail.password" class="item password">
              <text class="name c-9 fs-28">密码：</text>
              <text class="code fs-26">{{ info.codedetail.password }}</text>
              <text class="copy base-txt fs-22" @tap="handleCopy(info.codedetail.password)">复制</text>
            </view>
          </view>
        </view>
        <view v-if="info.status === 0" class="card-btn base-btn" @tap="handleUseCard(info)">激活使用</view>
        <view v-else-if="info.status === 1" class="card-btn dated-btn">已过期</view>
        <view v-if="info.codedetail.notes" class="card-explain">
          <view class="theme c-6 fs-30 fw-bold">【使用说明】</view>
          <u-parse
            class="rich c-9 fs-26"
            :html="info.codedetail.notes"
            :tag-style="parseStyle"
            :show-with-animation="true"
          />
        </view>
      </template>
      <save-qr ref="saveQr" />
      <canvas canvas-id="myCanvas" class="canvas-code" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetCardDetail, apiGetLMCardDetail } from '../api/my'
import generateQrMixin from '@/mixins/generate-qr'
import copy from '@/utils/copy'
import navigateToMP from '@/utils/navigate-mp'
import { richText2Mixin } from 'packages/mixins/rich-text'

export default {
  mixins: [generateQrMixin, richText2Mixin],
  data() {
    return {
      info: {},
      id: 0,
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      requestType: 1 //1 id 查 2 单号查
    }
  },
  async onLoad(option) {
    this.id = option.id
    this.requestType = option.requestType || 1
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      let res
      if (this.requestType === 1) {
        res = await apiGetCardDetail({ id: this.id })
      } else {
        res = await apiGetLMCardDetail({ ordernumber: this.id })
      }

      if (this.$ck(res, true)) {
        if (!res.return_data.codedetail) {
          res.return_data.codedetail = res.return_data.carddetail
        }
        this.info = res.return_data
        this.busy = false
        this.loading = false
      }
    },
    handleCopy(txt) {
      copy(txt)
    },
    handleUseCard(item) {
      if (item.status !== 0) {
        return this.$msg('卡券已过期')
      }
      let { appid } = item
      let { url } = item.codedetail
      if (item.targettype === 2) {
        if (!url) {
          return this.$msg('链接设置错误')
        }
        // H5
        this.generateQr({ text: url })
      } else {
        navigateToMP({
          appId: appid,
          path: url,
          onlyMp: true
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  overflow: hidden;
  height: 100%;
  background: #f4f4f4;
}
.card-detail {
  margin: 20rpx 20rpx 0;

  background: #fff;
  border-radius: 8rpx;
  // box-shadow: 0 0 10rpx #ccc;
  overflow: hidden;
  .card-detail-header {
    position: relative;
    padding: 30rpx 30rpx 36rpx;
    display: flex;
    border-bottom: 1rpx dashed #eeeeee;
    .line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 7rpx;
      background: #aadaff;
      z-index: 1;
    }
    .poster-box {
      width: 130rpx;
      height: 130rpx;
      border-radius: 10rpx;
      overflow: hidden;
      display: flex;
      align-items: center;
      margin: 0 30rpx 0 0;
      .poster {
        width: 100%;
        vertical-align: top;
      }
    }
    .card-detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .title {
        padding: 0 0 24rpx;
      }
    }
  }
  .card-detail-footer {
    position: relative;
    padding: 34rpx 92rpx 7rpx;
    .item {
      padding: 0 0 40rpx;
      .name {
        width: 60rpx;
      }
      .code {
        padding: 0 36rpx 0 0;
      }
    }
  }
  .card-circle {
    position: absolute;
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: #f4f4f4;
    z-index: 2;
  }
}
.card-btn {
  width: 710rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  margin: 85rpx auto 110rpx;
}
.dated-btn {
  background: linear-gradient(0deg, #d5d5d5 0%, #ffffff 100%);
  color: #bbc4cd;
}
.card-explain {
  padding: 0 32rpx 10rpx;
  .theme {
    padding: 0 0 40rpx 0;
  }
}
.canvas-code {
  position: fixed;
  left: -999px;

  width: 150px;
  height: 150px;
}
.base-txt {
  color: #ffa200 !important;
}
</style>
