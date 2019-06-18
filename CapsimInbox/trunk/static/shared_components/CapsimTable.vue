<script>
export default {
  name: 'CapsimTable',
    props:['headers', 'collection'],
}
</script>
<template>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th v-for="header in headers">
                    {{header}}
                </th>
            </tr>
        </thead>
        <slot>
            <template v-if="collection">
                <tbody v-for="item in collection" :key="item.id" >
                    <tr v-for="(value, key) in item">
                        <td>{{key}}</td>
                        <td>{{value}}</td>
                    </tr>
                </tbody>
            </template>
        </slot>
    </table>
</template>
