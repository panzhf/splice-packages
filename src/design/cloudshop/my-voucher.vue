<template>
  <view v-if="isShow">
    <view class="list-wrap" :style="{ 'background-color': voucherDate.BackgroundColor }" @tap="handleOpenLink">
      <view class="image-wrap">
        <image class="image" :src="myVoucher" />
      </view>
      <view class="info">
        <view class="top">
          <view :class="['name', 'ut-s2']" :style="{ color: voucherDate.TextColor }">
            {{ info.ActivityName || '这是活动的名称' }}
          </view>
        </view>
        <view class="bottom">
          <view class="price-wrap" :style="{ color: voucherDate.TimeTextColor }">
            <view>活动时间：</view>
            <view>{{ info.StartTime }} 至 {{ info.EndTime }}</view>
          </view>
        </view>
        <view
          class="get-btn"
          :style="{ color: voucherDate.BtnTextColor, 'background-color': voucherDate.BtnBackgroundColor }"
        >
          领取
        </view>
      </view>
    </view>
    <AuthButton />
  </view>
</template>

<script>
// #ifdef MP
import { apiGetStoreRedCouponAct, apiUserGetRedCouponByAct } from '@/api/CollectCouponsAct'
// #endif
import { myVoucher } from '@/assets/base64/list'
import Observal from '@/utils/observal.js'
export default {
  props: {
    voucherDate: {
      type: Object,
      default() {
        return {}
      }
    },
    m: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: true,
      loading: false,
      info: {},
      myVoucher: myVoucher
    }
  },
  watch: {
    voucherDate: {
      deep: true,
      immediate: true,
      handler(n) {
        this.getlist()
      }
    }
  },
  created() {
    Observal.register('switch-store', async val => {
      // 授权成功回调
      this.getlist()
    })
  },
  methods: {
    handleOpenLink() {
      /* #ifdef MP */
      getApp().showLoading()
      if (this.loading) return
      this.loading = true
      apiUserGetRedCouponByAct({
        ActId: Number(this.info.Id)
      }).then(res => {
        getApp().hideLoading()
        this.loading = false
        if (res.Return_code === 0) {
          uni.navigateTo({
            url: `/cloudStore/VoucherReceiveResult/index?id=${this.info.Id}`
          })
        } else {
          getApp().tips(res.Return_msg)
        }
      })
      /* #endif */
    },
    getlist() {
      /* #ifdef MP */
      apiGetStoreRedCouponAct().then(res => {
        if (res.Return_code === 0) {
          if (!res.Return_data) {
            this.isShow = false
          } else {
            this.isShow = true
          }
          this.info = res.Return_data || {}
        } else {
          getApp().tips(res.Return_msg)
        }
      })
      /* #endif */
      // #ifdef H5-DECORATE
      this.info = {
        StartTime: '2022-08-01 00:00:00',
        EndTime: '2023-01-31 23:59:59'
      }
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.list-wrap {
  display: flex;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #fff;
  .image-wrap {
    width: 140rpx;
    height: 140rpx;
    .image {
      width: 100%;
      height: 100%;
      vertical-align: top;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    position: relative;
    flex: 1;
    margin-left: 20rpx;
    .top {
      flex: 1;
      .name {
        font-size: 30rpx;
        font-weight: 700;
      }
    }

    .bottom {
      .price-wrap {
        font-size: 22rpx;
      }
    }

    .get-btn {
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%);
      width: 130rpx;
      border-radius: 25rpx;
      line-height: 50rpx;
      text-align: center;
      font-size: 28rpx;
    }
  }
}
</style>
