<template>
  <view v-if="!loading" class="my-apply">
    <view class="info" :style="{ background: `url(${bg})` }">
      <view class="title">
        我的邀请人数
        <span class="quantity">{{ form.nowinviter }}</span>
        人
        <span v-if="form.invitationcount > 0">
          ，再邀请
          <span class="quantity">{{ form.invitationcount - form.nowinviter }}</span>
        </span>
        <span v-if="form.invitationcount > 0">人，即可获得：</span>
        <span v-if="form.invitationcount <= 0 && (form.ispoints || form.isvoucher || form.iswxhb || form.isproduct)">
          当前已获得奖励：
        </span>
      </view>
      <view v-if="form.ispoints" class="row">
        <span class="quantity">{{ form.points }}</span>
        积分
      </view>
      <view v-if="form.isvoucher" class="row">
        <span class="quantity">{{ form.denominations }}</span>
        元购物券
      </view>
      <view v-if="form.iswxhb" class="row">
        <span v-if="form.minmoney === 0" class="num">一个</span>
        <span v-else-if="form.minmoney === form.maxmoney" class="num">{{ form.minmoney }}元</span>
        <span v-else class="num">
          <span class="quantity">{{ form.minmoney }}</span>
          -
          <span class="quantity">{{ form.maxmoney }}元</span>
        </span>
        微信红包
      </view>
      <view v-if="form.isproduct" class="row">
        <span>{{ form.productname }}</span>
      </view>
      <view class="button-explain" @click="handleClick()">奖励说明</view>
    </view>
    <view class="apply-title">我邀请的好友</view>
    <view class="photo-box">
      <view v-for="(item, index) in list" :key="index" class="photo-item">
        <img class="img" :src="item.headpath" alt="" />
        <view class="name">{{ item.nickname }}</view>
      </view>
    </view>
    <none-data v-if="!list.length" msg="暂无数据" class="none-data" />
    <popup ref="explainPopup" class="explain-box">
      点击立即邀请，长按二维码生成海报，分享给好友，你的好友扫描海报上的二维码领取会员卡，你即可获得奖励。邀请的越多，奖励越丰富。
      <view v-for="(item, index) in invitation" :key="index">
        <view class="row mt50">
          邀请：
          <span class="num">{{ item.invitationcount }}</span>
          人，即可得到以下奖励：
        </view>
        <view v-if="item.ispoints" class="explain-item">
          <span class="num">{{ item.points }}</span>
          积分
        </view>
        <view v-if="item.isvoucher" class="explain-item">
          <span class="num">{{ item.denominations }}</span>
          元购物券
        </view>
        <view v-if="item.iswxhb" class="explain-item">
          <span v-if="item.minmoney === 0" class="num">一个</span>
          <span v-else-if="item.minmoney === item.maxmoney" class="num">{{ item.minmoney }}元</span>
          <span v-else class="num">{{ item.minmoney }} - {{ item.maxmoney }}元</span>
          微信红包
        </view>
        <view v-if="item.isproduct" class="explain-item">
          <span>{{ item.productname }}</span>
        </view>
      </view>
    </popup>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetMyApplyAwardData } from '../api/member.js'
import { staticURL } from '@/config'
import NoneData from '@/components/none-data/index.vue'
import Popup from '../components/explain-popup.vue'
import { apiGetApplyAwardData } from '../api/member.js'
export default {
  components: {
    NoneData,
    Popup
  },
  data() {
    return {
      bg: staticURL(true) + 'apply/my-apply.png',
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      list: [],
      form: {},
      invitation: []
    }
  },
  async onLoad() {
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    async handleClick() {
      let res = await apiGetApplyAwardData()
      if (this.$ck(res, true)) {
        this.invitation = res.return_data
        this.$refs.explainPopup.showToast({
          title: '奖励说明',
          explain: ''
        })
      }
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetMyApplyAwardData()
      if (this.$ck(res, true)) {
        this.form = res.return_data
        this.list = res.return_data.list
        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.my-apply {
  .info {
    padding-bottom: 40rpx;
    color: #c6aaff;
    padding-left: 40rpx;
    overflow: hidden;
    .title {
      margin-top: 50rpx;
    }
    .row {
      margin-top: 16rpx;
      position: relative;
      padding-left: 30rpx;
      &::after {
        content: '';
        position: absolute;
        width: 10rpx;
        height: 10rpx;
        background-color: #fff;
        border-radius: 50%;
        left: 0;
        top: 20rpx;
      }
    }
  }
  .quantity {
    color: #fef050;
    font-size: 33rpx;
    margin: 0 6rpx;
  }
  .apply-title {
    font-size: 31rpx;
    color: #333333;
    text-align: center;
    margin: 40rpx 0;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      width: 52rpx;
      height: 1rpx;
      background-color: #cccccc;
      left: 200rpx;
      top: 20rpx;
    }
    &::before {
      content: '';
      position: absolute;
      width: 52rpx;
      height: 1rpx;
      background-color: #cccccc;
      right: 200rpx;
      top: 20rpx;
    }
  }
  .photo-box {
    display: flex;
    flex-wrap: wrap;
    .photo-item {
      margin-top: 20rpx;
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .img {
        width: 125rpx;
        height: 125rpx;
        border-radius: 50%;
      }
      .name {
        margin-top: 20rpx;
        text-align: center;
      }
    }
  }
  .button-explain {
    position: fixed;
    width: 160rpx;
    height: 52rpx;
    background: #660498;
    border-radius: 26rpx 0px 0px 26rpx;
    font-size: 29rpx;
    text-align: center;
    line-height: 52rpx;
    right: 0;
    top: 100rpx;
    background: #fff;
    color: #4f038d;
    font-weight: bold;
  }
}
.explain-box {
  .row {
    font-size: 33rpx;
  }
  .num {
    color: #ff9933;
    margin: 0 6rpx;
  }
  .mt50 {
    margin-top: 50rpx;
  }

  .explain-item {
    margin-top: 8rpx;
    padding-left: 40rpx;
    position: relative;
    &::after {
      content: '';
      background-color: #000;
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      position: absolute;
      left: 16rpx;
      top: 16rpx;
    }
  }
  .mt30 {
    margin-top: 30rpx;
  }
}
</style>
