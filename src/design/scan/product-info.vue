<template>
  <view
    ref="productInfoRef"
    class="product-info"
    :style="containerStyle"
    @click="handleClick"
  >
    <!-- #ifdef H5 -->
    <drow-btn
      v-if="config.jumpEnabled && fwInfo.yundianproductpath && fwInfo.yundianwxid"
      :info="drowBtnInfo"
      class="drow-btn-wrapper"
    />
    <!-- #endif -->
    <view class="product-container">
      <!-- 商品图片 -->
      <view v-if="config.productImage && config.productImage.show && fwInfo.fwproimgurl" class="product-image-wrapper mb-10">
        <image
          :src="fwInfo.fwproimgurl"
          mode="widthFix"
          class="product-image"
        />
      </view>

      <!-- 商品信息 -->
      <view class="product-info-content">
        <!-- 商品名称 -->
        <view
          v-if="config.productName && config.productName.show && fwInfo.fwproname"
          class="ellipsis-2 mb-10"
          :style="productNameStyle"
        >
          {{ fwInfo.fwproname }}
        </view>

        <view class="flex flex-middle product-wrap">
          <!-- 商品价格 -->
          <view
            v-if="config.productPrice && config.productPrice.show" 
            class="flex-1 flex flex-middle"
          >
            <text :style="priceTitleStyle">零售价：</text>
            <text :style="priceValueStyle">￥{{ fwInfo.price | cashFixedTwo }}</text>
          </view>

          <!-- 详情按钮 -->
          <view
            v-if="config.jumpEnabled"
            class="ml-20"
            :style="jumpTextStyle"
          >
            详情 >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { cashFixedTwo } from 'packages/filters'
import { staticURL } from '@/config'
/* #ifdef H5 */
import DrowBtn from 'packages/design/scan/drow-btn.vue'
/* #endif */
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */

export default {
  name: 'ProductInfo',
  mixins: [],
  components: {
    /* #ifdef H5 */
    DrowBtn
    /* #endif */
  },
  filters: {
    cashFixedTwo
  },
  props: {
    // 商品信息对象
    fwInfo: {
      type: Object,
      default() {
        return {
          fwproimgurl: staticURL(true) + 'scan/product-example.png', // 商品图片
          fwproname: '家安天然酵素洗衣液', // 商品名称
          price: '566.88', // 商品价格
          yundianproductpath: '', // 商品路径
          yundianwxid: '', // 小程序id
        }
      }
    },
    // 配置对象
    config: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      componentHeight: 0, // 组件高度（单位：px）
      componentWidth: 0 // 组件宽度（单位：px）
    }
  },
  computed: {
    // 容器样式
    containerStyle() {
      let s = []
      if (this.config.bgColor !== undefined) {
        s.push(`background-color: ${this.config.bgColor}`)
      }
      if (this.config.gap !== undefined) {
        s.push(`margin: 0 ${this.config.gap * 2}rpx`)
      }
      if (this.config.paddingVertical !== undefined) {
        s.push(`padding-top: ${this.config.paddingVertical * 2}rpx`)
        s.push(`padding-bottom: ${this.config.paddingVertical * 2}rpx`)
      }
      if (this.config.paddingHorizontal !== undefined) {
        s.push(`padding-left: ${this.config.paddingHorizontal * 2}rpx`)
        s.push(`padding-right: ${this.config.paddingHorizontal * 2}rpx`)
      }
      if (this.config.bgUrl) {
        s.push(`background-image: url(${this.config.bgUrl || staticURL(true) + 'scan/product-content-bg.png'})`)
        s.push('background-size: 100% 100%')
        s.push('background-repeat: no-repeat')
      }
      return s.join(';')
    },
    // 商品名称样式
    productNameStyle() {
      const s = []
      const nameConfig = this.config.productName || {}
      if (nameConfig.fontSize) {
        s.push(`font-size: ${nameConfig.fontSize * 2}rpx`)
      }
      if (nameConfig.color) {
        s.push(`color: ${nameConfig.color}`)
      }
      if (nameConfig.fontWeight) {
        s.push(`font-weight: ${nameConfig.fontWeight}`)
      }
      return s.join(';')
    },
    // 价格标题样式（"零售价:"）
    priceTitleStyle() {
      const s = []
      const priceConfig = this.config.productPrice || {}
      if (priceConfig.titleFontSize) {
        s.push(`font-size: ${priceConfig.titleFontSize * 2}rpx`)
      }
      if (priceConfig.titleColor) {
        s.push(`color: ${priceConfig.titleColor}`)
      }
      if (priceConfig.titleFontWeight) {
        s.push(`font-weight: ${priceConfig.titleFontWeight}`)
      }
      return s.join(';')
    },
    // 价格值样式（价格数字）
    priceValueStyle() {
      const s = []
      const priceConfig = this.config.productPrice || {}
      if (priceConfig.fontSize) {
        s.push(`font-size: ${priceConfig.fontSize * 2}rpx`)
      }
      if (priceConfig.color) {
        s.push(`color: ${priceConfig.color}`)
      }
      if (priceConfig.fontWeight) {
        s.push(`font-weight: ${priceConfig.fontWeight}`)
      }
      return s.join(';')
    },
    // 跳转文字样式（详情按钮）
    jumpTextStyle() {
      const s = []
      const jumpConfig = this.config.jumpText || {}
      const priceConfig = this.config.productPrice || {}
      const fontSize = jumpConfig.fontSize || priceConfig.fontSize
      const color = jumpConfig.color || priceConfig.titleColor
      const fontWeight = jumpConfig.fontWeight || priceConfig.titleFontWeight
      if (fontSize) {
        s.push(`font-size: ${fontSize * 2}rpx`)
      }
      if (color) {
        s.push(`color: ${color}`)
      }
      if (fontWeight) {
        s.push(`font-weight: ${fontWeight}`)
      }
      return s.join(';')
    },
    // H5 平台 drow-btn 组件所需的信息
    drowBtnInfo() {
      return {
        username: this.fwInfo.yundianwxid,
        path: this.fwInfo.yundianproductpath || '',
        tipsText: '',
        width: this.componentWidth > 0 ? `${this.componentWidth}px` : `calc(100% - ${this.config.gap || 0}px)`,
        height: `${this.componentHeight || 100 }px`
      }
    }
  },
  created() {},
  mounted() {
    /* #ifdef H5 */
    this.$nextTick(() => {
      this.calculateSize()
    })
    /* #endif */
  },
  updated() {
    /* #ifdef H5 */
    this.$nextTick(() => {
      this.calculateSize()
    })
    /* #endif */
  },
  methods: {
    // 计算组件尺寸（宽度和高度）
    calculateSize() {
      /* #ifdef H5 */
      if (this.$refs.productInfoRef && this.fwInfo.yundianwxid) {
        const element = this.$refs.productInfoRef.$el || this.$refs.productInfoRef
        if (element) {
          const width = element.offsetWidth || element.clientWidth
          const height = element.offsetHeight || element.clientHeight
          this.componentWidth = width
          this.componentHeight = height
        }
      }
      /* #endif */
    },
    // 处理点击事件
    handleClick() {
      if (!this.config.jumpEnabled || !this.fwInfo.yundianproductpath) {
        return
      }
      /* #ifdef MP-WEIXIN */
      navigateToMP({
        format: false,
        path: this.fwInfo.yundianproductpath,
        scene: this.config.jumpType
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: product-info;
.#{$prefix} {
  position: relative;
  min-height: 20rpx;
  border-radius: 8rpx;
  overflow: hidden;

  .drow-btn-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .product-container {
    display: flex;
    align-items: flex-start;
  }

  .product-image-wrapper {
    flex-shrink: 0;
    width: 120rpx;
    height: 120rpx;
    margin-right: 20rpx;
    overflow: hidden;
    background-color: #f5f5f5; 

    .product-image {
      width: 100%;
      height: 100%;
    }
  }

  .product-info-content {
    flex: 1;
    min-width: 0;

    .product-wrap { 
      display: flex;
      align-items: center; 
    }
  }
}
</style>