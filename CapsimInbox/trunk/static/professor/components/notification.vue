<template lang="html">
  <transition name="slide-notification">
    <div v-show="isActive" class="notification-box" :class="className" role="alert" >
      <transition name="fade">
        <span>
          <button v-show="!isLoading" @click="toggleIsActive" type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>
          <span :class="[iconClass, { done: !isLoading }]" aria-hidden="true"></span>
          <span v-if="!isLoading" class="ml-10">
            <span v-if="isWarning">
              Your record failed to update
            </span>
            <span v-else>
              Your record was updated
            </span>
          </span>
        </span>
        <span>
          <div v-show="isLoading" class="lds-dual-ring"></div>
          <span v-if="isLoading" class="ml-30">Updating...</span>
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
    }
  },

  computed: {
    className() {
      return (this.isWarning) ? 'alert alert-danger' : ' alert alert-success'
    },
    iconClass() {
      return (this.isWarning) ? 'glyphicon glyphicon-info-sign' : 'glyphicon glyphicon-ok'
    }
  },

  methods: {
    toggleIsActive() {
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

.done {
  opacity: 1 !important;
}

.glyphicon {
  opacity: 0;
}

.notification-box {
  &.alert {
    position: absolute;
    top: 10px;
    right: 10px;
    box-shadow: 0 0 2px #ffffff;
    width: auto;
    z-index: 999 !important;
  }
  .close {
    margin-left: 20px;
  }
}

.fade-enter-active {
  transition: all .5s ease;
}
.fade-leave-active {
  transition: all .5s ease;
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

</style>
