<template lang="html">
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">
          <img src="/CapsimInbox/images/CapsimInbox_Logo.svg" alt="CapsimInbox Logo">
        </a>
      </div>
      <div class="collapse navbar-collapse" id="myNavbar">
        <ul class="nav navbar-nav navbar-right">
          <li><a class="btn mat btn-primary mat" href="/capsiminbox/admin/logout">Exit</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
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

  .navbar-nav {
    li {
      a {
        color: #003F54;
        margin: 15px;
        padding: 5px 15px;
        background-color: lightgrey;
        font-weight: 600;
      }
    }
  }
}
</style>
