<template>
    <section class="component order-customer-detail">
        {{ $t('info') }} : {{ id }}
    </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component({
    components: {}
})
export default class OrderCustomerDetail extends Vue {
    @Prop()
    id: any
}
</script>

<i18n>
{
  "en-us":{
    "info":"order customer info"
  },
  "zh-cn":{
    "info":"订单客户信息"
  }
}
</i18n>
