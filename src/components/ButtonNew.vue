<template>
  <v-btn 
    @click="$emit('click')"
    v-on="on"
    v-bind="$attrs"
    class="button-custom" 
    :outlined="outlined" 
    :color="color" 
    :text="!outlined && !filled"
    :class="small ? 'small-btn':''"
  >
    <div class="d-flex flex-column">
      <v-icon v-if="icon!=='none'">{{ icon }}</v-icon>
      <span :class="icon!=='none' ? 'd-none d-sm-block':''">
        <slot>

        </slot>
      </span>
    </div>
  </v-btn>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    on: Object,
    icon: {
      type: String,
      default () {
        return 'none'
      }
    },
    outlined: {
      type: Boolean,
      default () {
        return false;
      }
    },
    filled: {
      type: Boolean,
      default () {
        return false
      }
    },
    color: {
      type: String,
      default () {
        return 'accent'
      }
    },
    small: {
      type: Boolean,
      default () {
        return false
      }
    }
  }
}
</script>

<style scoped>
.button-custom:not(.v-btn--round) {
  font-size: 0.6em;
  letter-spacing: unset;
  text-transform: unset;
  height: unset !important;
  min-height: 36px;
  font-weight: 400;
  max-width: 90px;
  padding: 8px 16px;
}
.button-custom.small-btn:not(.v-btn--round) {
  padding: 4px 8px;
}
</style>