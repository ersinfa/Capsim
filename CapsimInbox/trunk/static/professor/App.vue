<template>
    <div :class="productClass">
        <navbar></navbar>
        <div class="container-fluid">
            <div class="row">
                <sidebar></sidebar>
                <transition>
                    <keep-alive :exclude="['student-written-responses','StudentFiles']">
                        <router-view class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main"></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>

import navbar from './components/navbar.vue'
import sidebar from './components/sidebar.vue'
export default {

    name: 'app',

    components: {
        navbar,
        sidebar
    },
    computed:{
        isExam(){
            if (this.$store.state) {
                return this.$store.state.isExam
            }
            return 0
        },
        productClass() {
            return (this.isExam == 1 ? `modx-root` : `inbox-professor-portal`)
        },
    },
    created() {
        this.$store.commit('SET_STATE')
        this.$store.dispatch('GET_PROFESSOR_SETTINGS')
    }

}
</script>
<style lang="scss">

// $brand-primary:         darken(#428bca, 6.5%) !default; // #337ab7
// $brand-success:         #5cb85c !default;
// $brand-info:            #5bc0de !default;
// $brand-warning:         #f0ad4e !default;
// $brand-danger:          #d9534f !default;

$brand-danger:          #DF0816;
$brand-success:         #108137;
@import "../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";
@import '../../node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker';
@import "../../assets/sass/UIToolKit/index.scss";

.modx-root{
    .navbar{
        background-color: #383677 !important;
    }
    .sidebar {
        background-color: #272727;
    }
}
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
    margin-top: 60px;
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

</style>
