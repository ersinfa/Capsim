<template>
    <div>
        <template v-if="$store.getters.authenticated">
            <navbar></navbar>
            <div class="container-fluid">
                <notify style="z-index: 999" :isWarning="alert.isWarning" :isActive.sync="alert.isActive" :message="alert.message"></notify>
                <div class="row">
                    <sidebar></sidebar>
                    <transition>
                        <router-view class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main"></router-view>
                    </transition>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="container-fluid">
                <div class="row">
                    <transition>
                        <router-view class="col-md-12">
                        </router-view>
                    </transition>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {

    name: 'app',

    components: {
        sidebar: require('./components/sidebar.vue'),
        navbar: require('./components/navbar.vue'),
        loginForm: require('./components/loginForm.vue')
    },

    computed: {
      alert() {
        return this.$store.getters.alert
      }
    },

    created() {
        this.$store.commit('SET_STATE')
    }

}
</script>
<style lang="scss">
@import "../../assets/sass/content.min";
@import "../../assets/sass/skin.min";
@import "../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";

body {
    background-color: #f5f5f5;
}

.slide-fade-enter-active {
    transition: all .3s ease;
}
.slide-fade-leave-active {
    transition: all .3s ease;
}
.slide-fade-enter {
    transform: translateX(-100px);
    opacity: 0;
}
.slide-fade-leave-to {
    transform: translateX(100px);
    opacity: 0;
}

.main {
    padding-right: 40px;
    padding-left: 40px;
    margin-top: 100px;
}

.mat {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    border: none !important;
}

$sides-list: "top" "left" "right" "bottom";

@each $side in $sides-list {

    $i: 0;
    @while $i <= 50 {
        .m#{str-slice($side, 0, 1)}-#{$i} {
            margin-#{$side}: #{$i}px;
        }
        .p#{str-slice($side, 0, 1)}-#{$i} {
            padding-#{$side}: #{$i}px;
        }
        .m-#{$i} {
            margin: #{$i}px;
        }
        .p-#{$i} {
            padding: #{$i}px;
        }
        $i: $i + 5;
    }

}

$i: 0;
@while $i <= 100 {
	.w-#{$i} {
		width: #{$i}% !important;
	}
	$i: $i + 10;
}

</style>
