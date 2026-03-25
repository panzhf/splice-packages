<template>
  <view class="prize-list" :class="skinClass">
    <view class="header flex flex-middle" :class="isSpecialExplain ? 'flex-center' : 'flex-between'">
      <template v-if="skin === 5 || isSpecialExplain">
        <image :src="`${PACKAGE_STATIC_URL}turntable/${skin}/prize-title.png`" class="title-icon" />
        <image
          :src="`${PACKAGE_STATIC_URL}turntable/${skin}/explain.png`"
          class="explain-icon"
          @tap="isShowDesc = true"
        />
      </template>
      <template v-else>
        <view class="title fs-32">奖项内容</view>
        <view class="desc fs-24 flex flex-middle" @tap="isShowDesc = true">
          活动说明
          <view class="desc-icon br-round fs-28 ml-20 text-center">?</view>
        </view>
      </template>
    </view>
    <view class="list">
      <view v-for="(item, index) in calcList" :key="index" class="prize-item flex flex-middle" :style="prizeItemBg">
        <image :src="item.awardpicture" class="icon mr-20" />
        <view class="info flex-1 overflow-h">
          <view class="title fs-28">{{ item.name }}</view>
          <view class="name ellipsis fs-26">{{ item.productname }}</view>
        </view>
      </view>
    </view>
    <desc-dialog v-model="isShowDesc" :info="info" />
  </view>
</template>

<script>
import DescDialog from './desc-dialog.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { propMixin } from '../mixins'
export default {
  name: 'PrizeList',
  components: {
    DescDialog
  },
  mixins: [packageStaticMixin, propMixin],
  data() {
    return {
      isShowDesc: false
    }
  },
  computed: {
    calcList() {
      return this.list.filter(item => !!item.id)
    },
    prizeItemBg() {
      if ([5, 7, 8].includes(this.skin)) {
        return `background-image: url(${this.PACKAGE_STATIC_URL}turntable/${this.skin}/prize-item.png)`
      }
      return ''
    },
    isSpecialExplain() {
      // 活动说明在右上角
      return [6, 7, 8].includes(this.skin)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/prize-list.scss';
</style>
