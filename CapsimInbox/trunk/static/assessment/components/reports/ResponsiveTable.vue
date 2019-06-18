<script>
    export default {
        name: 'capsim-responsive-table',
        props:['columns', 'data'],
        methods: {
            hasValue (item, column) {
                return item[column.toLowerCase()] !== 'undefined'
            },
            itemValue (item, column) {
                return item[column.toLowerCase()]
            }
        }
    }
</script>
<template>
    <table class="table table-responsive table-reports"  id="capsim-responsive-table">
        <slot name="caption">
               
        </slot>
        <thead>
            <slot name="columns">
                <th v-for="column in columns" :key="column.id">
                    {{column}}
                </th>
            </slot>
        </thead>
        <tbody>
            <tr v-for="item in data">
                <slot :row="item" :index="index">
                    <td v-for="column in columns" :key="column.id"
                        v-if="hasValue(item, column)">
                        {{itemValue(item, column)}}
                    </td>
                </slot>
            </tr>
        </tbody>
    </table>
</template>
