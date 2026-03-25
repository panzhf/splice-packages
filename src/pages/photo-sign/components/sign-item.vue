<template>
  <view>
    <view class="sign-item mb-20 bg-white fs-28">
      <view class="header-box flex flex-middle">
        <image :src="innerData.headpath" class="avatar" />
        <view class="flex-1 ml-14 mr-10 overflow-h">
          <view class="fs-32 fw-bold ellipsis">{{ innerData.nickname }}</view>
          <view class="tip-color fs-26 fw-medium">{{ innerData.addtime }}</view>
        </view>
        <view v-if="innerData.auditstatus === 1">
          累计打卡
          <text class="count fw-bold">{{ innerData.totalnumber }}</text>
          天
        </view>
      </view>
      <view class="content-box">
        <view class="pl-30 pr-30 mb-20">
          <text-collapse
            v-if="innerData.content"
            :line="6"
            :dt="innerData.content"
            font-style="font-size: 32rpx;font-weight: 500;color: #2a2a2a;"
          />
        </view>
        <image :src="innerData.signimage" mode="widthFix" class="cover" @tap="handlePreview(innerData.signimage)" />
      </view>
      <view
        v-if="innerData.auditstatus > 0"
        class="footer-box flex flex-middle"
        :class="{ 'flex-end': innerData.auditstatus === 1 && !innerData.award }"
      >
        <template v-if="innerData.auditstatus === 1 && innerData.award">
          <view class="flex-1 fs-28 fw-bold overflow-h ellipsis">打卡奖励：{{ innerData.award }}</view>
        </template>
        <template v-if="innerData.auditstatus === 2">
          <view class="flex-1 fs-28 fw-medium link" @tap="handleShowReason">查看原因</view>
        </template>
        <view v-if="innerData.auditstatus === 1" class="flex flex-middle flex-end">
          <view class="like flex flex-middle shrink-0">
            <view class="icon-box flex flex-middle flex-center shrink-0" @tap="handleLike">
              <view
                class="iconfont fs-36 tip-color"
                :class="[innerData.islikeit ? 'icondianzan' : 'icondianzan-2', { bounce: isLiked }]"
              />
              <view class="like-tip" :class="{ float: isLiked }">+1</view>
            </view>
            <view v-if="innerData.likeitnum" class="tip-color fs-26 shrink-0">
              {{ innerData.likeitnum | formatLike }}人点赞
            </view>
          </view>
          <button
            open-type="share"
            :data-detailid="innerData.detailid"
            :data-image="innerData.signimage"
            :data-content="innerData.sharecontent"
            hover-class="button-action"
            class="iconfont iconpack-fenxiang fs-36 tip-color icon-box flex flex-middle flex-center shrink-0"
          />
        </view>
      </view>
      <template v-if="mode === 2 && innerData.audittype === 1">
        <image
          v-if="innerData.auditstatus === 0"
          :src="PACKAGE_STATIC_URL + 'photo-sign/status-wait.png'"
          class="status-icon"
        />
        <image
          v-if="innerData.auditstatus === 1"
          :src="PACKAGE_STATIC_URL + 'photo-sign/status-pass.png'"
          class="status-icon"
        />
        <image
          v-if="innerData.auditstatus === 2"
          :src="PACKAGE_STATIC_URL + 'photo-sign/status-reject.png'"
          class="status-icon"
        />
      </template>
    </view>
    <CommonPopup v-model="showPopup" :title="popTitle" :content="popContent" confirm-text="关闭" />
  </view>
</template>

<script>
import TextCollapse from 'packages/components/text-collapse/index'
import CommonPopup from 'packages/components/common-popup/common-popup'

import { packageStaticMixin } from 'packages/mixins/static-url'
import popupMixin from 'packages/mixins/popup'
import imgMixin, { previewMixin } from 'packages/mixins/img'
import { apiLikeit } from 'packages/api/photo-sign'
export default {
  name: 'SignItem',
  components: {
    TextCollapse,
    CommonPopup
  },
  filters: {
    formatLike(v) {
      // return v > 9999 ? (v / 10000).toFixed(1) + '万' : v
      if (v < 10000) {
        return v.toString()
      }
      const wan = Math.floor(v / 10000)
      const decimal = Math.floor((v % 10000) / 1000)
      return `${wan}${decimal > 0 ? `.${decimal}` : ''}万`
    }
  },
  mixins: [packageStaticMixin, popupMixin, imgMixin, previewMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    aid: {
      type: String,
      default: ''
    },
    mode: {
      type: Number,
      default: 1
    } // 1.打卡日记 2.我的打卡
  },
  data() {
    return {
      innerData: {},
      isLiked: false,
      loading: false
    }
  },
  watch: {
    info: {
      deep: true,
      immediate: true,
      handler(v) {
        if (v) {
          this.innerData = v
          this.innerData.signimage = this.formatImg(v.signimage)
          const content = this.innerData.content || ''
          // 分享文案剔除换行符
          this.innerData.sharecontent = Array.from(content)
            .filter(item => !['↵', '\n', '\r\n', '\n\n'].includes(item))
            .slice(0, 40)
            .join('')
        }
      }
    }
  },
  methods: {
    handleLike() {
      if (this.innerData.islikeit) {
        return this.$msg('已点赞，不可取消哦', { mask: false })
      }
      if (this.loading) return
      this.loading = true
      apiLikeit({ aid: this.aid, detailid: this.innerData.detailid })
        .then(res => {
          this.loading = false
          const d = this.$toLowerKey(res, true)
          if (this.$ck(d)) {
            this.innerData.likeitnum++
            this.innerData.islikeit = true
            this.isLiked = true
          }
        })
        .catch(err => {
          this.loading = false
          this.$msg(err.return_msg)
        })
    },
    handleShowReason() {
      this.showTips({ title: '未通过原因', content: this.innerData.auditreason })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: sign-item;
$active-color: #ff5c53;
.tip-color {
  color: #888;
}
.#{$prefix} {
  position: relative;
  border-radius: 10rpx;
  .header-box {
    padding: 30rpx 28rpx;
    .avatar {
      @include wh(72rpx);
      @include round;
    }
    .count {
      margin: 0 8rpx;
      color: $active-color;
    }
  }
  /* #ifdef MP-CLOUDSHOP */
  .content-box {
    .cover {
      width: 100%;
    }
  }
  /* #endif */
  .footer-box {
    height: 106rpx;
    padding: 0 40rpx 0 30rpx;
    .like {
      margin-right: 30rpx;
    }
    .icon-box {
      position: relative;
      background-color: #fff;
      @include wh(70rpx);
    }
    .like-tip {
      position: absolute;
      top: 0;
      left: 26rpx;
      z-index: 5;
      color: $active-color;
      font-size: 20rpx;
      transform: scale(0);
      &.float {
        animation: float 1.5s 1 linear;
      }
    }
    .iconfont {
      &.icondianzan {
        color: $active-color;
      }
      &.bounce {
        animation: bounce 0.3s 1 linear;
      }
    }
    .link {
      color: #5380ff;
    }
  }
  .status-icon {
    position: absolute;
    top: 0;
    right: 0;
    @include wh(100rpx, 106rpx);
  }
}

@keyframes float {
  0% {
    transform: scale(0) translateY(-4rpx);
  }
  50% {
    transform: scale(2) translateY(-30rpx);
  }
  100% {
    transform: scale(0.8) translateY(-80rpx);
  }
}
@keyframes bounce {
  0% {
    opacity: 0.8;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
view {
  box-sizing: border-box;
}
image {
  display: block;
}
button {
  margin: 0;
  padding: 0;
  border-radius: 0;
  line-height: 1;
  &::after {
    border: none;
  }
}
/* #endif */
</style>
