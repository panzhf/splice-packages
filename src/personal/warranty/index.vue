<template>
  <view class="warranty-page">
    <view class="warranty-actions mt-20 mr-30">
      <view class="service-record-btn flex flex-middle flex-center" @tap="goServiceRecord">
        <text class="service-record-btn__text">服务记录</text>
        <text class="iconfont iconjiantou2 service-record-btn__arrow" />
      </view>
    </view>
    <view class="warranty-list">
      <view v-for="(item, index) in list" :key="index" class="warranty-item">
        <view class="product-card">
          <!-- 产品名称 - 最上方 -->
          <view class="product-name">
            <text class="product-name-text c-3 fs-30 fw-bold">{{ getFieldValue(item, 'goodsname') }}</text>
          </view>
          <!-- 产品图片和详细信息 -->
          <view class="product-content">
            <image
              v-if="item.goodspic"
              :src="item.goodspic"
              class="product-image"
              mode="aspectFill"
              @tap="previewImage(item.goodspic)"
            />
            <image v-else :src="defaultImage" class="product-image" mode="aspectFill" />
            <view class="product-info c-6">
              <view v-for="(field, fieldIndex) in fieldList" :key="fieldIndex" class="info-row">
                <text v-if="field.label" class="label">{{ field.label }}：</text>
                <text :class="['value', field.className]">{{ getFieldValue(item, field.key) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" :loading="busy" />
    <none-data v-if="!list.length && !loading" msg="暂无质保产品" class="none-data" />
  </view>
</template>

<script>
import { apiGetWarrantyList } from 'packages/api/warranty'
import NoneData from '@/components/none-data/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import { previewImage } from '@/utils/index'
import { staticURL } from '@/config'
import { productNameFilter, productNoFilter } from 'packages/mixins/warranty-product'

export default {
  components: {
    NoneData,
    LoadMore
  },
  filters: {
    productNameFilter,
    productNoFilter
  },
  data() {
    return {
      list: [],
      paging: {
        PageIndex: 1,
        PageSize: 10
      },
      hasMore: true,
      loading: true,
      busy: false,
      defaultImage: staticURL() + 'no-data.png',
      fieldList: [
        { label: '产品编号', key: 'goodsno', className: '' },
        { label: '质保编码', key: 'codestr', className: 'warranty-code' },
        { label: '保修期剩余', key: 'remainingdays', className: 'warranty-period' }
      ]
    }
  },
  async onLoad() {
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  async onPullDownRefresh() {
    this.resetData()
    await this.getData()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 500)
  },
  methods: {
    resetData() {
      this.hasMore = true
      this.busy = false
      this.list = []
      this.loading = false
      this.paging.PageIndex = 1
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      
      let res = await apiGetWarrantyList({ ...this.paging })
      if (this.$ck(res, true)) {
        const d = this.$toLowerKey(res, true)
        const results = d.return_data.results || []
        this.list = [...this.list, ...results]
        // 判断是否还有更多数据
        this.hasMore = results.length >= this.paging.PageSize && d.return_data.totalcount > this.list.length
        this.loading = false
        this.busy = false
      } else {
        this.busy = false
        this.loading = false
      }
    },
    // 获取字段值（使用过滤器处理产品名称和产品编号）
    getFieldValue(item, key) {
      if (key === 'goodsname') {
        return this.$options.filters.productNameFilter(item)
      } else if (key === 'goodsno') {
        return this.$options.filters.productNoFilter(item)
      } else if (key === 'remainingdays') {
        return item.remainingdays + '天'
      }
      return item[key]
    },
    goServiceRecord() {
      uni.navigateTo({
        url: '/packages/src/personal/warranty/service-record'
      })
    },
    // 预览图片
    previewImage(imageUrl) {
      if (!imageUrl) return
      const imageUrls = this.list.filter(item => item.goodspic).map(item => item.goodspic)
      previewImage({
        current: imageUrl,
        urls: imageUrls.length > 0 ? imageUrls : [imageUrl]
      })
    }
  },
  onReachBottom() {
    if (this.hasMore && !this.busy) {
      this.paging.PageIndex++
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
$service-record-blue: #007bff;

.warranty-page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
  padding-bottom: 30rpx;
}

.warranty-actions {
  .service-record-btn {
    margin-left: auto;
    width: 200rpx;
    height: 60rpx; 
    background-color: #fff;
    border: 2rpx solid $service-record-blue;
    border-radius:  30rpx;
    color: $service-record-blue;
    font-size: 28rpx;
    box-sizing: border-box;

    &__text {
      margin-right: 8rpx;
    }

    &__arrow {
      font-size: 24rpx;
    }
  }
}

.warranty-list {
  padding: 20rpx;

  .warranty-item {
    margin-bottom: 20rpx;

    .product-card {
      background-color: #fff;
      border-radius: 8rpx;
      padding: 30rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

      .product-name {
        margin-bottom: 20rpx; 

        .product-name-text {  
          line-height: 1.5;
          word-break: break-all;
        }
      }

      .product-content {
        display: flex;

        .product-image {
          width: 120rpx;
          height: 120rpx; 
          margin-right: 20rpx; 
          background-color: #f5f5f5;
        }

        .product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20rpx;
            font-size: 28rpx;
            line-height: 30rpx;

            &:last-child {
              margin-bottom: 0;
            }

            .label { 
              flex-shrink: 0;
            }

            .value { 
              word-break: break-all;

              &.warranty-code {
                font-family: monospace;
              } 
            }
          }
        }
      }
    }
  }
}

.none-data {
  margin-top: 200rpx;
}
</style>