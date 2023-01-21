<template lang="html">
    <nav class="navbar navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
              <span class="sr-only">Expand menu</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
          </button>
          <template v-if="session.isExam == 1">
            <img height="55px" alt="Brand" :src="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${$store.state.versionKey}.png`">
          </template>
          <template v-else>
            <img height="55px" alt="Brand" src="/CapsimInbox/images/CapsimInbox_Logo_White_withTM.jpg">
          </template>
        
        </div>
        <template v-if="session.isExam == 1">
          <div class="collapse navbar-collapse" id="myNavbar">
                Industry ID: {{$store.state.session.simID}}
                <div class="btn-group" role="group" aria-label="...">
                    <button @click="$router.push({ name: 'HelpResources' })" class="btn btn-info-light mat btn-sm ">
                        <span class="glyphicon glyphicon-question-sign"></span>
                        Help & Support
                    </button>
                    <button @click="logout" class="btn btn-default mat btn-sm btn-default-outline">
                        <span class="glyphicon glyphicon-off"></span>
                        Logout
                    </button>
                </div>
            </div>
        </template>
        <template v-else>
          <div class="collapse navbar-collapse" id="myNavbar">
            <div class="nav-btn maxHt" role="group" aria-label="...">
                <ul class="nav navbar-nav navbar-right">
                    <!-- <li><a href="/CapsimInbox/student/logout"><span class="glyphicon glyphicon-log-in"></span> Logout</a></li> -->
                    <li>
                        <button @click="logout" class="btn btn-sm btn-default-outline  btn-logout">
                            <span class="glyphicon glyphicon-off"></span>
                            Logout
                        </button>
                    </li>
                </ul>
                <ul class="nav navbar-nav navbar-left">
                    <li><p>Welcome Back <b>{{session.firstname&nbsp}} {{session.lastname}}</b></p></li>
                    <li><p>Course: <b>{{session.courseTitle}}</b> </p></li>
                </ul>
            </div>
          </div>
        </template>
    </div>
    </nav>
</template>

<script>
import { mapState } from 'vuex'
export default {  
   methods: {
        logout: () => window.location = '/CapsimInbox/student/logout'
    },
    computed: {
        ...mapState({
            session: state => state.session,
        }),
    }
}
</script>

<style lang="scss" scoped>
.btn-logout{
    margin:21px
} 

.maxHt{
    max-height: 45px !important;
}

</style>


