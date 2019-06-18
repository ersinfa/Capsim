<script>
export default {
    name: 'capsim-responsive-table',
    props: ['columns', 'data'],
    methods: {
        hasValue (item, column) {
            return item[column.toLowerCase()] !== 'undefined';
        },
        itemValue (item, column) {
            return item[column.toLowerCase()];
        }
    }
};
// ~\ModuleBuilder\src\components\common\ui\ResponsiveTable.vue
</script>
<template>
    <table id="capsim-responsive-table" class="table table-responsive table-hover table-bordered">
        <thead>
            <slot name="columns">
                <th v-for="column in columns" :key="column.id">
                    {{column}}
                </th>
            </slot>
        </thead>
        <tbody>
            <slot name="body">
                <tr v-for="(item, index) in data" :key="item.id">
                    <slot :row="item" :index="index">
                        <td v-for="column in columns" :key="column.id"
                            v-if="hasValue(item, column)">
                            {{itemValue(item, column)}}
                        </td>
                    </slot>
                </tr>
            </slot>
        </tbody>
    </table>
</template>