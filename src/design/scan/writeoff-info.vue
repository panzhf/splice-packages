<template>
  <view v-if="showWriteoffInfo">
    <view class="writeoff-info" :style="containerStyle">
      <view class="title" :style="titleStyle">
        {{ writeoffData.tipsText }}
      </view>
      <v-img
        v-if="BgImage"
        size="1000"
        class="writeoff-info__image"
        mode="widthFix"
        :src="BgImage"
        @click.native="handleClick"
      />
    </view>
  </view>
</template>

<script>
import { apiGetCodeWriteOffInfo } from 'packages/api/scan'
export default {
  props: {
    writeoffData: {
      type: Object,
      default() {
        return {}
      }
    },
    codeData: {
      type: Object,
      default() {
        return {}
      }
    },
    preview: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      swiperHeight: '',
      activeIndex: 0,
      BgImage: '',
      windowWidth: 750,
      showWriteoffInfo: false
    }
  },
  computed: {
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.writeoffData.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`border-radius: ${(this.writeoffData.radius || 0) * 2}rpx`)
      return s.join(';')
    },
    titleStyle() {
      const s = []
      s.push(`text-align: ${this.writeoffData.Align}`)
      this.writeoffData.TextColor && s.push(`color: ${this.writeoffData.TextColor}`)
      this.writeoffData.fontWeight && s.push(`font-weight: ${this.writeoffData.fontWeight}`)
      this.writeoffData.fontSize && s.push(`font-size: ${this.writeoffData.fontSize * 2}rpx`)
      return s.join(';')
    }
  },
  watch: {
    writeoffData: {
      handler(val) {
        this.BgImage = val.BgImage
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    if (this.preview) {
      this.showWriteoffInfo = true
    } else {
      this.getCodeWriteoff()
    }
  },
  methods: {
    // 获取是否已被核销
    getCodeWriteoff() {
      // 请求接口
      apiGetCodeWriteOffInfo(this.codeData).then(res => {
        const { return_data } = res
        if (this.$ck(res)) {
          this.showWriteoffInfo = !!(return_data && return_data.id > 0)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'writeoff-info';
.#{$prefix} {
  position: relative;
  margin: 0px auto;
  display: flex;
  align-items: center;
  margin-top: -1rpx;
  margin-bottom: -1rpx;
  .#{$prefix}__image {
    display: block;
    width: 100%;
    margin: 0 auto;
  }
  .title {
    position: absolute;
    flex: 1;
    width: 100%;
    z-index: 1;
    box-sizing: border-box;
    padding: 0 60rpx;
  }
}
</style>
