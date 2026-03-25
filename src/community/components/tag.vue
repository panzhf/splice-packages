<template>
  <view class="tag" :style="tagStyle">#{{ text }}</view>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: ''
    },
    fontSize: {
      type: String,
      default: '26'
    },
    checked: Boolean,
    inactiveColor: {
      type: String,
      default: '#2a2a2a'
    },
    inactiveBg: {
      type: String,
      default: '#f6f6f6'
    },
    activeColor: {
      type: String,
      default: '#5380ff'
    },
    activeBg: {
      type: String,
      default: '#f2f5ff'
    }
  },
  computed: {
    tagStyle() {
      const s = []
      s.push(`font-size:${this.fontSize}rpx`)
      if (this.checked) {
        s.push(`color:${this.activeColor}`)
        s.push(`background:${this.activeBg}`)
      } else {
        s.push(`color:${this.inactiveColor}`)
        s.push(`background:${this.inactiveBg}`)
      }
      return s.join(';')
    }
  }
}
</script>


<style lang="scss" scoped>
.tag {
  margin-top: 16rpx;
  margin-right: 10rpx;
  padding: 12rpx 16rpx;

  border-radius: 18rpx;

  font-weight: 500;
  line-height: 1;
}
</style>
