<template>
  <view>
    <view v-if="blankData.Type === 'line'" :style="{ padding: `0 ${blankData.LineGap * 2}rpx` }">
      <view
        style="margin: 0.5px auto"
        :style="{ borderTop: `1px ${blankData.LineType} ${blankData.LineColor}` }"
      ></view>
    </view>
    <view v-else :style="{ height: `${blankData.Height * 2}rpx`, backgroundColor: blankData.BgColor }" />
  </view>
</template>

<script>
export default {
  props: {
    blankData: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>
