<template>
  <common-popup v-model="showPopup" type="tip" title="温馨提示" :content="popContent" @close="opensetting" />
</template>

<script>
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import { getLocation, getSetting, openSetting } from 'packages/utils/function.js'

export default {
  components: { CommonPopup },
  props: {
    popContent: {
      type: String,
      default: '获取位置信息才能进行使用，请您开启地理位置授权'
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  methods: {
    opensetting() {
      openSetting().then(() => {
        this.setLocation()
      })
    },
    setLocation() {
      getLocation({ loading: true })
        .then(res => {
          if (res.latitude && res.longitude) {
            this.$emit('location', res)
          }
        })
        .catch(async err => {
          if (err.errMsg !== 'getLocation:fail system permission denied') {
            getSetting('userLocation')
              .then(() => {
                uni.showModal({
                  content: '获取地理位置失败,请检查是否有开启定位功能',
                  confirmText: '确认',
                  cancelText: '取消'
                })
              })

              .catch(() => {
                this.showPopup = true
              })
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
