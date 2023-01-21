<template lang="html">
    <div class="radio">
        <label :for="radioId">
          <input @change="onChange" :name="name" :id="radioId" type="radio" :value="inputValue" v-model="value">
          {{ label }}
        </label>
    </div>
</template>

<script>
export default {
    props: {
        name: {},
        inputValue: {},
        radioId: {
            type: String
        },
        label: {
            type: String
        }
    },

    methods: {
        onChange (event) {
            this.$emit('input', event.target.value)
        }
    }
}
</script>

<style scoped lang="scss">
input[type="radio"] {
  margin-top: 2px;
}
</style>
