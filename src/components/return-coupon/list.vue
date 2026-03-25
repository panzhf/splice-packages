<template>
  <view class="coupon-box" :style="themeVars">
    <template v-if="showType === 0 && sourceStatistics">
      <list-card v-for="(cur, cdx) in sourceStatistics" :key="cur.sourcetype">
        <view slot="header">
          <view class="flex flex-middle header">
            <view class="fs-2 flex-1">
              {{ cur.sourcedescription }}
            </view>
            <view class="coupon-num fs-32 mr-10">{{ cur.sourcecount }}张</view>
          </view>
        </view>
        <view v-if="cur.list && cur.list.length" slot="list">
          <view v-for="(item, index) in cur.list" :key="item.voucherid" class="coupon-list-item">
            <item :item="item" @tap="handleDrop(cdx, index)" />
          </view>
        </view>
      </list-card>
    </template>
    <template v-if="showType === 1 && list">
      <list-card v-for="item in list" :key="item.voucherid" hide-opera @tap="navUrl(item)">
        <item slot="list" :item="item" is-large :tag="statusTag" />
      </list-card>
    </template>
  </view>
</template>
<script>
import ListCard from './list-card.vue'
import Item from './item.vue'
import { prodDefault } from '@/utils/default-picture'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'ReturnCouponList',
  components: {
    ListCard,
    Item
  },
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    sourceStatistics: {
      type: Array,
      default: () => []
    },
    list: {
      type: Array,
      default: () => []
    },
    tabId: {
      type: Number,
      default: 1
    },
    showType: {
      type: Number,
      default: 0 // 0表示来源，1表示产品
    }
  },
  data() {
    return {
      prodErrImg: prodDefault
    }
  },
  computed: {
    statusTag() {
      const map = {
        1: '待返货',
        2: '已返货',
        3: '已过期'
      }
      return map[this.tabId]
    }
  },
  methods: {
    handleDrop(cdx, index) {
      const sourceData = this.sourceStatistics?.[cdx]
      let item = sourceData?.list?.[index]
      item.sourcetype = sourceData?.sourcetype
      this.navUrl(item)
    },
    navUrl(item) {
      item && this.$emit('drop', item)
    }
  }
}
</script>
<style lang="scss" scoped>
.coupon-box {
  position: relative;
  .header {
    font-weight: bold;
    line-height: 40rpx;
  }
  .coupon-num {
    color: var(--theme-color, $uni-color-primary);
  }
  .coupon-list-item {
    @include border-bottom(#e5e5e5);
    margin: 0 30rpx;
    &:last-child {
      border: none;
    }
  }
}
</style>
