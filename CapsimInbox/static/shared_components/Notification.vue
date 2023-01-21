<template lang="html">
  <transition name="slide-notification">
    <div v-show="isActive" class="notification-box" :class="className" role="alert" :style="styles">
      <transition name="fade">
        <span>
          <button v-show="!isLoading" @click="toggleIsActive" type="button" class="close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
          <template v-if="!isWarning && !isLoading">
            <slot name="icon" aria-hidden="true"></slot>
          </template>
          <template v-else>
            <span v-if="isWarning" class="glyphicon glyphicon-info-sign" ></span>
          </template>
          <span v-if="!isLoading" class="ml-10">
            <slot name="success-icon"></slot>
            {{ message }}
          </span>
        </span>
      </transition>
      <transition name="fade">
        <span>
          <div v-show="isLoading" class="lds-dual-ring"></div>
          <span v-show="isLoading" class="ml-50">Updating...</span>
        </span>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {

  name: "notification",

  props: {

    isActive: {
      type: Boolean,
      default: true
    },

    isWarning: {
      type: Boolean,
      default: false
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    message: {
      type: String,
      required: true
    },

    styles: {
      type: String,
      default: ""
    },
  },

  computed: {
    className() {
      return (this.isWarning) ? 'alert alert-danger' : ' alert alert-success'
    }
  },

  methods: {
    toggleIsActive() {
      this.$emit('dismiss')
      this.$emit('update:isActive', !this.isActive)
    }
  }
}
</script>

<style scoped lang="scss">

@-webkit-keyframes lds-dual-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes lds-dual-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.lds-dual-ring {
  position: absolute;
  width: 35px;
  height: 35px;
  top: 7px;
  left: 12px;
  border-radius: 50%;
  border: 3px solid #000;
  border-color: #3c763d transparent;
  -webkit-animation: lds-dual-ring 1.3s linear infinite;
  animation: lds-dual-ring 1.3s linear infinite;
}

.notification-box {
  &.alert {
    position: fixed;
    top: 10px;
    right: 10px;
    box-shadow: 0 0 2px #ffffff;
    width: auto;
  }
  .close {
    margin-left: 20px;
  }
}

.fade-enter-active {
  transition: all .8s ease;
}
.fade-leave-active {
  transition: all .3s ease;
}
.fade-enter {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}

.slide-notification-enter-active {
  transition: all .3s ease;
}
.slide-notification-leave-active {
  transition: all .3s ease;
}
.slide-notification-enter {
  transform: translateX(100px);
  opacity: 0;
}
.slide-notification-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

.alert-success{
    background-color: #cee6d6;
    color:#000000;
}


</style>
