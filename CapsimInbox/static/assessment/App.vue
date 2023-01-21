<template>
    <div id="app" :class="productClass">
        <navbar v-if="$route.meta.showTopNav"></navbar>
        <div class="container-fluid" v-if="hasAccess">
            <transition>
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </transition>
        </div>
        <div class="container-fluid" v-else>
            <img :src="`/capsiminbox/images/loading_icon.svg`" alt="Loading..." width="100%" height="400px">
        </div>

    </div>
</template>

<script>

import navbar from './components/navbar.vue'

export default {

    name: 'app',

    components: {
        navbar, 
    },

    computed:{
        isExam(){
            if (this.$store.state) {
                return this.$store.state.isExam
            }
            return 0
        },
        // If no dashboard access was provided, default to start times.
        dashboardAccess () {
            return this.$store.state.dashboardAccess
        },
        accessStartDate() {
            return this.dashboardAccess.accessStartDate
        },
        accessEndDate() {
            return this.dashboardAccess.accessEndDate
        },
        productClass() {
            if (this.isExam == 1) {
                return `modx-root`;
            }
            return `inbox-root`;
        },
        now() {
            return this.$moment().format('MM/DD/YYYY hh:mm a')
        },
        hasAccess() {
            return true
            if (this.isExam != 1) return true
            const afterStart = this.$moment(this.accessStartDate).isBefore(this.now)
            const beforeEnd = this.$moment(this.now).isBefore(this.accessEndDate)
            return (afterStart && beforeEnd)
        }
    },

    created() {
        this.$store.commit('SET_APP')
        if(this.$store.state.assessmentTypeKey == 2) this.$store.dispatch('Reports/featchReportsRehearsal');
        if(this.$store.state.assessmentTypeKey == 1) this.$store.dispatch('GET_ACCESS')
        $(document).ready(function () {
            //Disable cut copy paste
             $('body').bind('cut copy paste', function (e) { e.preventDefault() })
            // Disable mouse right click
             $("body").on("contextmenu",function(e){ return false; });
         });
        history.pushState(null, null, location.href);
        window.onpopstate = function () {
            history.go(1);
        };
        $(window).keyup(function (e) {
            const key = e.which;
            if(key == 40 || key == 39) { 
                 $('#showNext').click();
            } else if(key == 37 || key == 38) {
                $('#showPrevious').click();
            }
        });
    }
}
</script>
<style lang="scss">

@import "../../assets/sass/modx.scss";
@import "../../assets/sass/UIToolKit/index.scss";
@import "../../assets/sass/content.min";
@import "../../assets/sass/skin.min";

html {
  overflow: hidden;
}

::-webkit-scrollbar {
    width: 0.8rem;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  border-radius: 5px;
  // outline: 1px solid lightgrey;
}
$brand-danger:          #DF0816;
$brand-success:         #108137;
$icon-font-path: '/capsiminbox/fonts/bootstrap/';

@import "../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";

.mat {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    border: none !important;
}

.text-mat {
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
}

.text-semibold {
    font-weight: 400;
}

.text-light {
    font-weight: 300;
}

.no-margins {
    margin: 0;
}

.no-gutters {
    padding-left: 0;
    padding-right: 0;
}

.col-md-05 {
    width: 4.166665%;
    position: relative;
    min-height: 1px;
    padding-left: 15px;
    padding-right: 15px;
    float: left;
}

.well {
    background-color: #edeff0;
    border: none;
    border-radius: 10px;
    -webkit-box-shadow: none;
    box-shadow: none;
}


$i: 1;
@while $i < 12 {
    .col-md-#{$i}5 {
        @extend .col-md-#{$i};
        width: percentage((($i + 0.5) / $grid-columns));
    }
    $i: $i + 1;
}

// Generate padding and bottom:
// For margin do: .m{side first letter}-{size desired}, eg: mt-20 for margin-top: 20px;
// For padding do: .p{side first letter}-{size desired}, eg: pt-20 for padding-top: 20px;
$sides-list: "top" "left" "right" "bottom";

@each $side in $sides-list {

    $i: 0;
    @while $i <= 30 {
        .m#{str-slice($side, 0, 1)}-#{$i} {
            margin-#{$side}: #{$i}px;
        }
        .p#{str-slice($side, 0, 1)}-#{$i} {
            padding-#{$side}: #{$i}px !important;
        }
        .m-#{$i} {
            margin: #{$i}px;
        }
        .p-#{$i} {
            padding: #{$i}px !important;
        }
        $i: $i + 5;
    }

}


</style>
