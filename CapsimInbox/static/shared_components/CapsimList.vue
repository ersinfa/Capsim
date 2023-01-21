<script>
export default {
    name: 'capsim-list',
    props: {
        className: {
            type: String,
            default: ''
        },
        isHtml:{
            type: Boolean,
            default: false
        },
        collection: {
            type: [Array, Object],
            default: () => []
        },
        badges: {
            type: Array,
            default: () => []
        },
        onClick: {
            type: Function,
            default: () => {}
        }
    },
}
</script>
<template>
    <ul id="capsim-list" class="list-group">
        <template v-for="(value, key, idx) in collection">
            <li :class="className" 
                @click="onClick(idx, key)" 
                :key="value.id">
                <template v-if="isHtml">
                    <div class="row" v-html="value"></div>
                </template>
                <template v-else>
                    <span>{{ value }}</span>
                </template>
                <template v-if="badges">
                    <span class="badge">{{ badges[idx] }}</span>
                </template>
            </li>
        </template>
    </ul>
</template>
<style>
</style>