// 缺省/默认图片
import { staticURL } from '@/config'
const changeURL = staticURL(true) + 'change/'
const couponURL = staticURL(true) + 'coupon/'
let changeIndexBg, activeColor, operateBgColor, couponHeadBg, arrowIcon
// #ifdef MP-MEMBER
changeIndexBg = changeURL + 'myChange-Bg.png'
activeColor = '#ffa200'
// #endif
// #ifdef MP-CLOUDSHOP
changeIndexBg = changeURL + 'myChange-Bg.png'
activeColor = '#FF5C53'
// #endif

// #ifdef MP-RETAIL
changeIndexBg = changeURL + 'bg.jpg'
activeColor = '#FF7640'
operateBgColor = '#FF7640'
couponHeadBg = couponURL + 'retail-coupon-bg.png'
arrowIcon = 'icon-more'
// #endif

// #ifdef MP-SALE
activeColor = '#3246C3'
operateBgColor = '#5A70F9'
couponHeadBg = couponURL + 'sale-coupon-bg.png'
arrowIcon = 'iconjiantou'
// #endif

// #ifdef MP-DISTRIBUTION
activeColor = '#5D76FF'
operateBgColor = '#8698FB'
couponHeadBg = couponURL + 'distribution-coupon-bg.png'
arrowIcon = 'icon-more'
// #endif

export { changeIndexBg, activeColor, operateBgColor, couponHeadBg, arrowIcon }
