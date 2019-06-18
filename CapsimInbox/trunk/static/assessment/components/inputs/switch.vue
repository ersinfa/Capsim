<template>
  <label :class="classObject">
    <span class="vue-switcher__label">
      <span v-if="label" v-html="label"></span>
      <span v-if="!label && enabled" v-html="textEnabled"></span>
      <span v-if="!label && !enabled" v-html="textDisabled"></span>
    </span>

    <input type="checkbox" :disabled="disabled" v-model="enabled">

    <div></div>
  </label>
</template>

<script>

export default {
  name: 'switches',

  props: {
    typeBold: {
      default: false
    },

    selected: {
      default: false
    },

    disabled: {
      default: false
    },

    label: {
      default: ''
    },

    textEnabled: {
      default: ''
    },

    textDisabled: {
      default: ''
    },

    color: {
      default: 'default'
    },

    theme: {
      default: 'default'
    },

    emitOnMount: {
      default: true
    }
  },

  data () {
    return  {
      enabled: !!this.selected
    }
  },

  mounted () {
    if(this.emitOnMount) {
      this.$emit('input', this.enabled = !!this.selected)
    }
  },

  watch: {
    enabled (val) {
      this.$emit('input', val);
    },

    selected (val) {
      this.enabled = !!val;
    }
  },

  computed: {
    classObject () {

      const { color, enabled, theme, typeBold, disabled } = this;

      return {
        'vue-switcher' : true,
        ['vue-switcher--unchecked'] : !enabled,
        ['vue-switcher--disabled'] : disabled,
        ['vue-switcher--bold']: typeBold,
        ['vue-switcher--bold--unchecked']: typeBold && !enabled,
        [`vue-switcher-theme--${theme}`] : color,
        [`vue-switcher-color`] : color,
      };

    }
  }
}

</script>


<style lang="scss">
/**
* Default
*/

$dot-color: #33cc99;
$bar-color: #ADEBD6;

.vue-switcher {
  position: relative;
  display: inline-block;

  &__label {
    display: block;
    font-size: 10px;
    margin-bottom: 5px;
  }

  input {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    cursor: pointer;
  }

  div {
    height: 10px;
    width: 40px;
    position: relative;
    border-radius: 30px;
    display: -webkit-flex;
    display: -ms-flex;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    transition: all ease .4s;

    &:after {
      content: '';
      height: 18px;
      width: 18px;
      border-radius: 100px;
      display: block;
      transition: all ease .3s;
      position: absolute;
      left: 100%;
      margin-left: -17px;
      cursor: pointer;
      top: -4px;
    }
  }

  &--unchecked {
    div {
      justify-content: flex-end;

      &:after {
        left: 15px;
      }
    }
  }

  &--disabled {
    div {
      opacity: .3;
    }

    input {
      cursor: not-allowed;
    }
  }

  &--bold {
    div {
      top: -8px;
      height: 26px;
      width: 51px;

      &:after {
        margin-left: -22px;
        top: 4px;
      }
    }

    &--unchecked {
      div {
        &:after {
          left: 26px;
        }
      }
    }

    .vue-switcher__label {
      span {
        padding-bottom: 7px;
        display: inline-block;
      }
    }
  }

  &-theme--default {
    &.vue-switcher-color {

      div {
        background-color: $bar-color;
        &:after {
          background-color: $dot-color;
        }
      }

      &.vue-switcher--unchecked {
        div {
            background-color: lightgrey;

          &:after {
            background-color: darkgrey;
          }
        }
      }

    }
  }

}

</style>
