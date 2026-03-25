<template>
  <view class="win-list" :class="skinClass">
    <view class="title fs-26">发行方：{{ tip }}</view>
    <view class="wrapper">
      <image v-if="skin === 7" :src="PACKAGE_STATIC_URL + 'turntable/7/win-top.png'" class="win-top" />
      <template v-if="listLength > 0">
        <swiper
          :autoplay="canLoop"
          :circular="canLoop"
          :interval="3000"
          :vertical="true"
          :display-multiple-items="swiperItems"
          :style="{ height: swiperHeight + 'rpx' }"
          class="swipper-container"
        >
          <swiper-item v-for="(item, index) in list" :key="index">
            <view class="flex flex-middle prize-item">
              <image class="shrink-0 avatar br-round mr-20" :src="formatHead(item.headimg)" />
              <view class="flex-1 fs-28 content ellipsis-2">
                <text class="name">{{ item.customernickname }}</text>
                <text>{{ item.text }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="cover" />
      </template>
      <view v-else class="empty-box flex flex-column flex-center">
        <image :src="PACKAGE_STATIC_URL + 'turntable/face.png'" class="place-icon" />
        <view class="fs-26 mt-20">当前还没有人中奖哦</view>
      </view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import { propMixin } from '../mixins'
export default {
  name: 'WinnerList',
  mixins: [packageStaticMixin, propMixin],
  props: {
    tip: {
      type: String,
      default: ''
    }
  },
  computed: {
    listLength() {
      return this.list.length
    },
    canLoop() {
      return this.listLength > 3
    },
    swiperItems() {
      return Math.min(this.listLength, 3)
    },
    swiperHeight() {
      return Math.min(this.listLength, 3) * 122
    }
  },
  methods: {
    formatHead(p) {
      return p || `${this.PACKAGE_STATIC_URL}avatar.jpg`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/winner-list.scss';
</style>
