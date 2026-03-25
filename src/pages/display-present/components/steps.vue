<template>
  <view>
    <view
      class="u-steps"
      :style="{
        flexDirection: direction
      }"
    >
      <view v-for="(item, index) in list" :key="index" class="u-steps__item" :class="['u-steps__item--' + direction]">
        <view
          v-if="mode == 'number'"
          class="u-steps__item__num"
          :style="{
            borderColor: current < index ? 'transparent' : 'rgba(255, 255, 255, 0.5)'
          }"
        >
          <view
            class="u-steps__item__num__inner"
            :style="{
              backgroundColor: current < index ? 'rgba(255, 255, 255, 0.5)' : '#fff',
              color: current < index ? 'rgba(255, 255, 255, 0.5)' : '#fff'
            }"
          >
            <text :style="current < index ? unActiveNumberStyle : activeNumberStyle">
              {{ index + 1 }}
            </text>
          </view>
        </view>
        <view
          v-if="mode == 'dot'"
          class="u-steps__item__dot"
          :style="{
            backgroundColor: index <= current ? activeColor : unActiveColor
          }"
        />
        <text
          class="u-line-1"
          :style="{
            color: index <= current ? activeColor : unActiveColor
          }"
          :class="['u-steps__item__text--' + direction]"
        >
          {{ item.name }}
        </text>
        <view v-if="index < list.length - 1" class="u-steps__item__line" :class="['u-steps__item__line--' + mode]">
          <u-line :direction="direction" length="100%" :hair-line="false" :color="lineColor" class="line" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * steps 步骤条
 * @description 该组件一般用于完成一个任务要分几个步骤，标识目前处于第几步的场景。
 * @tutorial https://www.uviewui.com/components/steps.html
 * @property {String} mode 设置模式（默认dot）
 * @property {Array} list 数轴条数据，数组。具体见上方示例
 * @property {String} type type主题（默认primary）
 * @property {String} direction row-横向，column-竖向（默认row）
 * @property {Number String} current 设置当前处于第几步
 * @property {String} active-color 已完成步骤的激活颜色，如设置，type值会失效
 * @property {String} un-active-color 未激活的颜色，用于表示未完成步骤的颜色（默认#606266）
 * @example <u-steps :list="numList" active-color="#fa3534"></u-steps>
 * 魔改了一些样式和结构
 */
export default {
  props: {
    // 步骤条的类型，dot|number
    mode: {
      type: String,
      default: 'dot'
    },
    // 步骤条的数据
    list: {
      type: Array,
      default() {
        return []
      }
    },
    // 主题类型, primary|success|info|warning|error
    type: {
      type: String,
      default: 'primary'
    },
    // 当前哪一步是激活的
    current: {
      type: [Number, String],
      default: 0
    },
    // 激活步骤的颜色
    activeColor: {
      type: String,
      default: '#2979ff'
    },
    // 未激活的颜色
    unActiveColor: {
      type: String,
      default: '#909399'
    },
    // 自定义图标
    icon: {
      type: String,
      default: 'checkmark'
    },
    // step的排列方向，row-横向，column-竖向
    direction: {
      type: String,
      default: 'row'
    },
    // 激活number的样式
    activeNumberStyle: {
      type: String,
      default: ''
    },
    // 未激活number的样式
    unActiveNumberStyle: {
      type: String,
      default: ''
    },
    // 分隔线的样式
    lineColor: {
      type: String,
      default: '#FFAD8D'
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
// 定义混入指令，用于在非nvue环境下的flex定义，因为nvue没有display属性，会报错
@mixin vue-flex($direction: row) {
  /* #ifndef APP-NVUE */
  display: flex;
  flex-direction: $direction;
  /* #endif */
}
$u-steps-item-number-width: 60rpx;
$u-steps-item-dot-width: 20rpx;

.u-steps {
  @include vue-flex;

  .u-steps__item {
    flex: 1;
    text-align: center;
    position: relative;
    min-width: 100rpx;
    font-size: 26rpx;
    color: #8799a3;
    @include vue-flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    &--row {
      @include vue-flex;
      flex-direction: column;

      .u-steps__item__line {
        position: absolute;
        z-index: 0;
        left: 75%;
        width: 50%;
        &--dot {
          top: calc(#{$u-steps-item-dot-width} / 2);
        }

        &--number {
          top: calc(#{$u-steps-item-number-width} / 2 + 4rpx);
        }
      }
    }

    &--column {
      @include vue-flex;
      flex-direction: row;
      justify-content: flex-start;
      min-height: 120rpx;

      .u-steps__item__line {
        position: absolute;
        z-index: 0;
        height: 50%;
        top: 75%;

        &--dot {
          left: calc(#{$u-steps-item-dot-width} / 2);
        }

        &--number {
          left: calc(#{$u-steps-item-number-width} / 2 + 4rpx);
        }
      }
    }

    &__num {
      @include vue-flex;
      align-items: center;
      justify-content: center;
      border: 8rpx solid #8799a3;
      border-radius: 50%;
      overflow: hidden;

      &__inner {
        @include vue-flex;
        align-items: center;
        justify-content: center;
        width: $u-steps-item-number-width;
        height: $u-steps-item-number-width;
        border-radius: 50%;
      }
    }

    &__dot {
      width: $u-steps-item-dot-width;
      height: $u-steps-item-dot-width;
      @include vue-flex;
      border-radius: 50%;
    }

    &__text--row {
      margin-top: 14rpx;
    }

    &__text--column {
      margin-left: 14rpx;
    }
  }
}
.line {
  transform: scaleY(1.8);
  display: block;
}
</style>
