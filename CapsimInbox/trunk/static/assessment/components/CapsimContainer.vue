<template>
    <div id="capsim-container" class="capsim-wrapper">
        <slot name="top"></slot>
        <span v-if="header" class="container-header"><div v-html="header"></div></span>
        <!-- <div class="container"> -->
        <div class="container-row">
            <slot>
            </slot>
        </div>
        <slot name="bottom"></slot>
    </div> 
</template>
<script>
export default {
    name: 'capsim-container',
    props:['className', 'header'],
}
</script>
