<template>
    <div class="form-group">
        <label v-if="label" :for="id">{{ label }}</label>
        <input ref="input" v-model="val" class="form-control" :id="id">
    </div>
</template>
<script>
export default {

    name: "CustomInput",

    props: {
        value: {
            required: true
        },
        label: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: ''
        },
        type: {
            default: 'text',
            validator: value => 'text|number|email|password'.split('|').indexOf(value) > -1
        }
    },

    computed: {
        val: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val)
            }
        }
    },

    mounted() {
        this.$refs.input.type = this.type
    }

}
</script>
<style lang="scss" scoped>
</style>
