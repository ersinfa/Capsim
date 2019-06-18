<template>
    <div class="modx-root" :class="rootClass">
        <navbar></navbar>
        <div class="container-fluid">
            <div class="row">
                <sidebar></sidebar>
                <transition>
                    <keep-alive :exclude="['Walkthrough']">
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

    created() {
      this.$store.commit('SET_STATE')
      this.$store.dispatch('GET_SETTINGS')
      if(this.$store.state.isPrint) this.$router.push({ name: 'Report' })

    },

    computed: {

        isExam(){
            return this.$store.state.session.isExam
        },

        rootClass(){
            return ( this.isExam == 1? 'modex-student-portal' : 'inbox-student-portal' )
        },    

        isOnRehearsal() {
            return this.$route.name === 'Onboarding'
        },

        colClass() {
            return (this.isOnRehearsal) ? 'main col-md-12' : 'main col-md-12 col-lg-8 col-lg-offset-2'
        }
    },


}
</script>
<style lang="scss">
// @import "../../assets/sass/modx.scss";
@import "../../assets/sass/UIToolKit/index.scss";
.main{
    margin-top:77px;
}
// ----------------- scroll bar styling -----------------
body {
    background-color: #f4f4f4 !important;
}

body::-webkit-scrollbar {
  width: 0.8em;
}

body::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}

body::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
}

// ----------------- scroll bar styling -----------------

@media print
{
    body {
        background-color: transparent !important;
    }
    .main {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .hidden-print *
    {
        display: none !important;
    }
    .progress {
      -webkit-print-color-adjust: exact !important;

      .progress-bar {

        &.progress-bar-danger {
            background-color: #d9534f !important;
            -webkit-print-color-adjust: exact !important;
        }

        &.progress-bar-warning {
            background-color: #f0ad4e !important;
            -webkit-print-color-adjust: exact !important;
        }

        &.progress-bar-success {
            background-color: #5cb85c !important;
            -webkit-print-color-adjust: exact !important;
        }
      }
    }

}


// $brand-primary:         darken(#428bca, 6.5%) !default; // #337ab7
// $brand-success:         #5cb85c !default;
// $brand-info:            #5bc0de !default;
// $brand-warning:         #f0ad4e !default;
// $brand-danger:          #d9534f !default;

$brand-danger:          #DF0816;
$brand-success:         #108137;



$icon-font-path: "/capsiminbox/fonts/bootstrap/";
@import "../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";
@import "../../assets/sass/steps.scss";
@import '../../node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker';

.mat {
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.08);
    border-radius: 2px;
    border: none!important;
}

.breadcrumb {
    background: none;

    li {
        &:before {
            color: black !important;
            padding: 0 5px 0 10px !important;
        }
    }
}

$sides-list: "top" "left" "right" "bottom";

@each $side in $sides-list {

    $i: 0;
    @while $i <= 100 {
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

.no-gutters {
    padding-left: 0;
    padding-right: 0;
}

</style>
