<template>
    <div id="capsim-report-window">
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: 'capsim-report-window',
    created () { 
        this.$store.dispatch('Reports/featchReports') 
    }
}
</script>