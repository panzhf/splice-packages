<template>
  <view v-if="showPopup" :style="calcStyle" class="wrap-popup" @touchmove.stop="handleMove">
    <!-- 弹窗有input，加上css动画会导致input内容变形，尽量控制动画幅度 -->
    <!-- 阻止touchmove滑动导致底层元素跟着滑动 -->
    <view class="common-popup" :style="customStyle" @touchmove.stop="handleMove">
      <view v-if="title" class="header fw-bold fs-32 text-center">- {{ title }} -</view>
      <view v-else class="pb-20" />
      <view class="content fs-30 text-center">
        <view v-if="content">{{ content }}</view>
        <template v-if="type === 'prompt'">
          <textarea
            v-if="isTextarea"
            :value="changeValue"
            type="text"
            :maxlength="maxLength"
            :placeholder="placeholder"
            class="textarea br-10 text-left"
            @input="handleInput"
          />
          <input
            v-if="!isTextarea"
            :value="changeValue"
            type="text"
            :placeholder="placeholder"
            :maxlength="maxLength"
            :cursor-spacing="180"
            class="flex flex-middle input br-10 text-left"
            @input="handleInput"
          />
          <view v-if="tip" class="tip mt-20 text-left">{{ tip }}</view>
        </template>
        <slot />
      </view>
      <view v-if="!popHideButton" class="footer" :class="[type]">
        <button
          v-if="(type === 'confirm' || type === 'prompt') && cancelText"
          class="primary-btn plain round"
          @tap="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button class="primary-btn round" @tap="handleConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 通用弹窗，使用v-model控制显示/隐藏
 * <common-popup v-model="showPopup" type="tip" content="提示内容" />
 * <common-popup v-model="showPopup" type="confirm" content="提示内容？" @confirm="" />
 *
 * prompt输入模式，defaultValue结合sync修饰符，可以重置绑定变量
 * <common-popup v-model="showPopup" type="prompt" :default-value.sync="storeName" @confirm="" />
 */
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'CommonPopup',
  // #ifndef MP-RETAIL
  mixins: [notThemeMixin],
  // #endif
  props: {
    pstyle: {
      type: String,
      default: ''
    },
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'tip', // tip常规提示 confirm二次确认 prompt带输入
      validator(v) {
        return ['tip', 'confirm', 'prompt'].includes(v)
      }
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: '' // tip/confirm的提示文字
    },
    tip: {
      type: String,
      default: '' // prompt模式的提示文字
    },
    defaultValue: {
      type: String,
      default: '' // prompt模式初始显示
    },
    maxLength: {
      type: Number,
      default: 8 // prompt模式输入的最大长度
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    isTextarea: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    popHideButton: {
      type: Boolean,
      default: false
    },
    customStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showPopup: false,
      changeValue: ''
    }
  },
  computed: {
    calcStyle() {
      return [this.pstyle, this.themeVars].join(';')
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
    },
    defaultValue(v) {
      this.changeValue = v
    }
  },
  methods: {
    handleInput(e) {
      let v = e.target.value
      v = v.trim()
      this.changeValue = v.substring(0, this.maxLength)
    },
    handleClose() {
      this.$emit('input', false)
      this.changeValue && (this.changeValue = '')
      this.$emit('update:defaultValue', '')
    },
    handleConfirm() {
      if (this.type === 'prompt') {
        // prompt类型  需要返回值
        this.$emit('confirm', this.changeValue)
      } else if (this.type === 'confirm') {
        // confirm类型  需要返回值
        this.$emit('confirm')
      } else {
        this.handleClose()
        this.$emit('close')
      }
    },
    handleCancel() {
      this.handleClose()
      this.$emit('cancel')
    },
    handleMove() {}
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
.wrap-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.common-popup {
  width: 600rpx;
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  @include box;
  .header {
    @include lh(100rpx);
  }
  .content {
    padding: 33rpx 30rpx 59rpx;
    line-height: 50rpx;
    .input {
      padding: 12rpx 20rpx;
      border: 1px solid $uni-border-color;
      height: 56rpx;
    }
    .textarea {
      width: calc(100% - 32rpx);
      padding: 12rpx 16rpx;
      border: 1px solid #aaa;
      height: 210rpx;
      background: #f0f0f0;
    }
    .tip {
      color: $uni-border-color;
      font-size: 24rpx;
      line-height: 30rpx;
    }
  }
  .footer {
    margin: 0 60rpx 50rpx;
    &.tip {
      display: flex;
      justify-content: center;
      .primary-btn {
        width: 400rpx;
      }
    }
    &.confirm,
    &.prompt {
      display: flex;
      justify-content: space-between;
      .primary-btn {
        flex: 1;
        & + .primary-btn {
          margin-left: 40rpx;
        }
      }
    }
  }
  .primary-btn {
    height: 80rpx;
    color: #fff;
    text-align: center;
    font-size: 32rpx;
    line-height: 80rpx;
    // background-color: $uni-color-primary;
    background-color: var(--theme-color, $uni-color-primary);
    border: none;
    @include box;

    &.plain {
      border: 1px solid #aaa;
      background-color: #fff;
      color: #000;
    }

    &.round {
      border-radius: 44rpx;
    }
  }
}
@keyframes scale {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
</style>
