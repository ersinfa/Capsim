<template lang="html">
    <nav class="navbar navbar-inverse navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                    <span class="sr-only">Expand menu</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">
                    <img :src="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${$store.state.versionKey}.png`" alt="CapsimInbox Logo">
                </a>
            </div>
            <div class="collapse navbar-collapse" id="myNavbar">

                <div class="nav-btn" role="group" aria-label="...">
                    <button @click="$router.push({ name: 'HelpResources' })" class="btn btn-sm btn-info-light">
                        <span class="glyphicon glyphicon-question-sign"></span>
                        Help & Support
                    </button>
                    <button @click="logout" class="btn btn-sm btn-default-outline">
                        <span class="glyphicon glyphicon-off"></span>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {

    methods: {
        logout: () => window.location = '/CapsimInbox/professor/logout'
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
    z-index: 998;
    border: none;
    border-radius: 0;
    background-color: white;
    min-height: 60px;
    .navbar-brand {
        padding: 5px 10px;
        img {
            height: 50px;
        }
    }
    .nav-btn {
        margin: 15px;
        float: right;
    }
}
</style>
