<template>
  <view class="container shipping-address" :style="themeVars">
    <block v-if="addressList.length > 0">
      <view v-for="(item, index) in addressList" :key="index" class="shipping mb-20" @click="onTapChooseAddress(item)">
        <view class="info fs-26 fw-bold">
          <text class="name">{{ item.consignee }}</text>
          <text>{{ item.mobile }}</text>
        </view>
        <view class="address mb-30 fs-24">
          <text v-if="item.provincename !== null">{{ item.provincename }}</text>
          <text v-if="item.cityname !== null">{{ item.cityname }}</text>
          <text v-if="item.countyname !== null">{{ item.countyname }}</text>
          <text v-if="item.address !== null">{{ item.address }}</text>
        </view>
        <view class="options flex flex-between fs-26">
          <view
            class="is-default flex flex-middle fs-24"
            :class="{ 'is-checked': item.isdefault == 1 }"
            @tap.stop="handleDefault(item)"
          >
            <!-- #ifndef MP-CLOUDSHOP -->
            <view class="iconfont fs-32" :class="[item.isdefault == 1 ? 'icon-checked' : 'icon-uncheck']" />
            <!-- #endif -->
            <!-- #ifdef MP-CLOUDSHOP -->
            <view class="iconfont fs-32" :class="[item.isdefault == 1 ? 'iconxuanze' : 'icon-uncheck']" />
            <!-- #endif -->
            <view>默认地址</view>
          </view>
          <view class="flex flex-middle">
            <view class="edit mr-30" @tap.stop="handleAdd('edit', item)">
              <text class="iconfont icon-edit menu-icon" />
              编辑
            </view>
            <view class="del" @tap.stop="handleDel(item.id)">
              <text class="iconfont icon-trash menu-icon" />
              删除
            </view>
          </view>
        </view>
        <view v-if="item.id === chooseAdressdId" class="tick-badge">
          <icon type="success_no_circle" size="20rpx" color="#fff" />
        </view>
      </view>
    </block>
    <none-data v-if="!addressList.length && !loading" msg="暂无收货地址" class="none-data" />

    <view class="btns-bar flex flex-middle fs-30 text-center">
      <view class="flex-1 button" @tap="handleChoose">从微信获取新地址</view>
      <view class="flex-1 button add-address ml-20" @tap="handleAdd">新增收货地址</view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiAddresslist, apiaAdressedit, apiAddressdelete } from '../api/address.js'
// #ifndef MP-RETAIL
// 零售用宿主小程序的组件
import NoneData from '../components/none-data/index.vue'
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    // #ifndef MP-RETAIL
    NoneData
    // #endif
  },
  // #ifndef MP-RETAIL
  mixins: [notThemeMixin],
  // #endif
  data() {
    return {
      addressList: [],
      loading: false,
      entryType: 0, //如果==1 就是从下单页面跳转进来
      chooseAdressdId: 0,
      updateFlag: false,
      isChoosing: false // 正在选择微信地址
    }
  },
  onLoad(options) {
    if (options.entryType) {
      this.entryType = options.entryType
    }
    if (options.chooseAdressdId) this.chooseAdressdId = parseInt(options.chooseAdressdId)
  },
  onShow() {
    this.addressList = []
    this.getData()
    uni.$once('updateFlag', res => {
      if (res) {
        this.updateFlag = true
      }
    })
    // #ifdef MP-WEIXIN
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  methods: {
    getData() {
      if (this.isChoosing) return
      this.loading = true
      apiAddresslist().then(res => {
        // #ifdef MP-CLOUDSHOP
        res = this.$toLowerKey(res, true)
        // #endif
        const { return_code: code, return_data: list = [] } = res
        this.addressList = list || []

        if (code === 0 && list !== null && list.length > 0) {
          this.updateChoosedAddress()
        }
        this.loading = false
      })
    },
    handleChoose() {
      // 获取微信收货地址
      uni.getSetting({
        success: result => {
          let scopeAddress = result.authSetting['scope.address']
          if (scopeAddress === true || scopeAddress === undefined) {
            this.isChoosing = true
            uni.chooseAddress({
              success: res => {
                this.$loading.show('保存中')
                const {
                  userName: consignee,
                  detailInfo: address,
                  telNumber: mobile,
                  nationalCode: nationalcode,
                  provinceName: provincename,
                  cityName: cityname,
                  countyName: countyname
                } = res
                const list = {
                  id: 0,
                  consignee,
                  address,
                  mobile,
                  nationalcode,
                  provincename,
                  cityname,
                  countyname,
                  isdefault: 0,
                  type: 1
                }
                apiaAdressedit(list)
                  .then(res => {
                    this.$loading.hide()
                    // #ifdef MP-CLOUDSHOP
                    res = this.$toLowerKey(res, true)
                    // #endif
                    if (this.$ck(res)) {
                      this.isChoosing = false
                      this.getData()
                    } else {
                      setTimeout(() => {
                        // 延时是为了让提示显示，防止接口loading覆盖
                        this.isChoosing = false
                        this.getData()
                      }, 1500)
                    }
                  })
                  .catch(err => {
                    // 超时、网络异常等
                    this.$msg(err.return_msg)
                    setTimeout(() => {
                      // 延时是为了让提示显示，防止接口loading覆盖
                      this.isChoosing = false
                      this.getData()
                    }, 1500)
                  })
              },
              fail: () => {
                // 选择地址为微信原生页面，可以返回/取消，需重置标记
                this.isChoosing = false
              }
            })
          }
        }
      })
    },
    handleAdd(type, item) {
      if (type === 'edit') {
        uni.navigateTo({
          url: '/packages/src/address/edit?obj=' + encodeURIComponent(JSON.stringify(item))
        })
      } else {
        uni.navigateTo({
          url: '/packages/src/address/edit'
        })
      }
    },
    async handleDefault(item) {
      apiaAdressedit({
        ...item,
        isdefault: 1
      }).then(res => {
        if (this.$ck(res)) {
          this.getData()
        }
      })
    },
    handleDel(id) {
      uni.showModal({
        title: '删除提示',
        content: '是否确认删除该地址',
        success: res => {
          res.confirm && this.addressdelete(id)
        }
      })
    },
    addressdelete(id) {
      apiAddressdelete({ id }).then(res => {
        // #ifdef MP-CLOUDSHOP
        res = this.$toLowerKey(res, true)
        // #endif
        if (this.$ck(res)) {
          this.$msg('删除成功')
          setTimeout(() => {
            this.getData()
          }, 1500)
        }
      })
    },
    updateChoosedAddress() {
      if (this.updateFlag && this.chooseAdressdId) {
        this.updateFlag = false
        let index = this.addressList.findIndex(item => item.id === this.chooseAdressdId)
        if (index > -1) uni.$emit('selectRess', this.addressList[index])
      }
    },
    // 从下单页面跳转进来选取地址
    onTapChooseAddress(item) {
      if (this.entryType !== '1') return
      uni.$emit('selectRess', item)
      uni.navigateBack()
    }
  }
}
</script>
<style lang="scss" scoped>
.shipping-address {
  overflow: hidden;
  position: relative;
  padding: 20rpx 20rpx 130rpx;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 130rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 130rpx);
  .shipping {
    box-sizing: border-box;
    padding: 28rpx 20rpx 24rpx;
    position: relative;
    background-color: #fff;
    border-radius: 10rpx;
  }
  .info {
    margin-bottom: 16rpx;
    color: #333;
    line-height: 40rpx;
    .name {
      padding-right: 16rpx;
    }
  }
  .address {
    color: #666;
    line-height: 36rpx;
  }
  .options {
    color: #000;
    line-height: 40rpx;
    .is-default {
      .iconfont {
        padding-right: 16rpx;
        color: #999;
      }
      &.is-checked {
        color: var(--theme-color, $uni-color-primary);
        .iconfont {
          color: var(--theme-color, $uni-color-primary);
        }
      }
    }
    .menu-icon {
      vertical-align: 1px;
      padding-right: 4px;
      font-size: 22rpx;
      color: #999;
    }
  }
  .tick-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border: 25rpx solid transparent;
    border-top-color: var(--theme-color, $uni-color-primary);
    border-right-color: var(--theme-color, $uni-color-primary);
    border-radius: 0 10rpx;
    icon {
      position: absolute;
      left: 0;
      top: -18rpx;
    }
  }
  .btns-bar {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    padding: 15rpx 20rpx;
    padding-bottom: 15rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 15rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 15rpx);
    box-sizing: border-box;
  }
  .button {
    height: 80rpx;
    line-height: 80rpx;
    color: #000;
    border: 1px solid #999;
    border-radius: 40rpx;
    background: #fff;
  }
  .add-address {
    background: var(--theme-color, $uni-color-primary);
    color: #fff;
    border: none;
  }
  .none-data {
    margin-top: 166rpx;
  }
}
</style>
