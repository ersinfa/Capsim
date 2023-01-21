<template>
    <div class="panel panel-primary">
		<h2 class="ml-10">Time-Related Tendencies</h2>
		<div class="panel-body">
            <br>
            <p>Below are your scores on three tendencies or behavior patterns that can either facilitate or impede the development of your time management skills.</p>
			<table class="table">
                <thead>
                    <tr>
                        <th class="col-md-2 center">Tendency</th>
                        <th class="col-md-1 center">Percentile</th>
                        <th class="col-md-2 center">Level</th>
                        <th class="col-md-7 center">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(construct, i) in constructs">
                        <tr :key="i">
                            <td class='font center'>
                                {{construct.constructName}}
                                <a class="hidden-print center" data-toggle="tooltip" data-placement="top" :title='construct.description' data-original-title><span class="glyphicon glyphicon-info-sign"></span></a>
                            </td>
                            <td class='center font-medium'>{{construct.zScoreProbability}}</td>                         
                            <td class='center font-medium'>{{levelName(construct.zScoreProbability, construct.constructKey)}}</td> 
                            <td>{{levelDescription(construct.zScoreProbability, construct.constructKey)}}</td>                           
                        </tr>
                    </template>
                </tbody>    
            </table>
		</div>
    </div>
</template>



<script>
import chart from './chartPDI.vue';
export default {

    props:{
        constructs:{
            required: true
        },

        levels:{
            required: true
        },
    },

    components: {
        chart
    },

    mounted(){
		$(function () {
			$('[data-toggle="tooltip"]').tooltip()
		})
	},

    //this can be moved to a function in the backend in studentReport
    methods: {
        levelDescription(z, constructKey){
            return this.getLevelObject(z, constructKey).description
        },

        levelName(z, constructKey){
            return this.getLevelObject(z, constructKey).name
        },

        getLevelObject(z, constructKey){
            let level = this.getLevel(z)
            return this.levels.find(l => l.FK_constructKey == constructKey && l.levelKey==level)
        },

		getLevel(z) {
            let level = 0
            
            if(z < 31) level = 1
            else if(z < 41 ) level = 2
            else if(z < 61 ) level = 3
            else if(z < 71 ) level = 4
            else level = 5

            return level;
        }
    }
}

</script>
<style scoped lang="scss">

	.panel-body {
		padding: 0 15px;
	}

	.col-md-7 {
		border-right: 1px solid #e3e3e3;
	}

	.col-md-5 {
		padding-top: 15px;
		&:first-of-type {
			border-right: 1px solid #f4f4f4;
		}
	}

    .center{
        text-align: center;
    }

    .font{
         font-size: 21px;
         font-weight: bold;
    }

    .font-medium{
         font-size: 17px;
         font-weight: bold;
    }
</style>