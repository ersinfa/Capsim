<template>
    <div id="capsim-question-list" class="pre-scrollable" :style="styleObject">
        <table class="table text-center" id='questionListTable'>
                <thead>
                    <tr>
                        <th class="text-center">{{prefix}}</th>
                        <th class="text-center">Complete</th>
                    </tr>
                </thead>
                <tbody>

                <template v-for="(list, key) in mapper">
                    <tr tabindex="0"
                    v-for="item in list"
                    :class="{activeEmail:item.id == selected}"
                    @click="toggle(item)"
                    @keyup.enter="toggle(item)"
                    style="cursor: pointer;">
                        <td>
                            {{ item.id }}
                        </td>
                        <td>
                            <div class="bubble" :class="{active:item.value.isSent}"></div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    name: 'capsim-question-list',
    props:['className', 'prefix',  'collection', 'onClick'],
    data(){
        return{
            windowHeight: 0,
            // styleObject: { 'max-height': `${( window.innerHeight / 2)}px` },
            selected: 1
        }
    }, 
    methods:{
        toggle(item){
            this.selected = item.id
            this.$store.state.selectedQuestionID = item.id
            this.onClick(item.value)
        },
    },
    mounted() {
        this.windowHeight = window.innerHeight
        this.$nextTick(() => {
            window.addEventListener('resize', () => {
                this.windowHeight = window.innerHeight
            });
        })
    },
    computed: {
        styleObject(){
            let temp = ((this.windowHeight < 900 && this.windowHeight > 600) ? 125 : (this.windowHeight < 651 && this.windowHeight > 400)? 150: 0)
            return { 'max-height': `${( this.windowHeight / 2)-temp}px` }
        },
        rootClass(){
            return `${this.className} pre-scrollable`
        }, 
        mapper(){
            let count = 0; 
            const keys = (Object.keys(this.collection)); 
            const map = {}; 
            const test = Object.values(this.collection).forEach((list,index) => {
                map[keys[index]] = list.map(item => {
                    // Convert to map not object, later
                    return { id:++count, value:item }
                }); 
            })
            return map;
        },
    }
} 
</script>
<style>
    .list-group-item-heading {
        /* color: #a09999 !important; */
         color: white !important;
    }
    .list-group-item{
        color: white !important;
        font-size: large;
    }
    .unAnswered{
        color: white !important;
    }
    .activeEmail{
        background: #0073AD
    }
    .bubble{
        width: 15px;
        height: 15px;
        background: transparent;
        border-radius: 50%;
        border: solid 2px white;
        margin: auto;
    }
    .bubble.active{
        background: white;
    }
</style>