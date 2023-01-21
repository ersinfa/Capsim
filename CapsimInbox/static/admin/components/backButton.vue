<template>
  <button class="btn mat btn-primary pull-left mr-20" @click="$router.go(-1)">
    <span class="glyphicon glyphicon-chevron-left"></span>Back
  </button>
</template>
<script>
export default {

  name: "back-button",

}
</script>
