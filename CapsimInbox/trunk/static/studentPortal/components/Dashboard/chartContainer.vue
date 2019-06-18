<template>
    <div id="chart-list" v-if="useTabs">
        <div>
            <ul class="nav nav-tabs nav-justified" role="tablist">
                <template v-for="(versionKey, i) in versionKeys">
                    <li role="presentation" :class="{ 'active': i == 0 }">
                        <a :href="`#t-${versionKey}`" :aria-controls="`${mappedTabs}[${versionKey}]`" role="tab" data-toggle="tab">Skill Set {{i + 1}}</a>
                    </li>
                </template>    
            </ul>
            <div class="tab-content">
                <template v-for="(versionKey, i) in versionKeys">
                    <div role="tabpanel" class="tab-pane" :class="{ 'active': i == 0 }" :id="`t-${versionKey}`">
                        <table class='table overall-table'>
                            <thead>
                                <tr>
                                    <th style="width: 250px;" class="version-col">Skill</th>
                                    <th>Percentile</th>
                                    <th style="width: 200px;">
                                        Net Change
                                        <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="`${tooltip.netChange}`"></span>    
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(skill, key) in mappedTabs[versionKey]">   
                                    <tr v-if="skill.scores.length >= 2">
                                        <td class="version-col">
                                            {{skill.skillName}}
                                            <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="`${skill.skillDescription}`"></span>
                                        </td>
                                        <td>
                                            <chart v-bind:score="skill" key="key"></chart>
                                        </td>
                                        <td><p :class="`${getChangeClass(skill.scores)}`">{{getChangeNum(skill.scores)}}</p></td>
                                    </tr>
                                </template>    
                            </tbody>    
                        </table>
                    </div>
                </template>
            </div>
        </div>
    </div>
    <div v-else>
        <table class='table overall-table'>
            <thead>
                <tr>
                    <th style="width: 250px;" class="version-col">Skill</th>
                    <th>Percentile</th>
                    <th style="width: 200px;">
                        Net Change
                        <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="`${tooltip.netChange}`"></span>    
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(skill, key) in mappedSkillScores">   
                    <tr v-if="skill.scores.length >= 2">
                        <td class="version-col">
                            {{skill.skillName}}
                            <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="`${skill.skillDescription}`"></span>
                        </td>
                        <td>
                            <chart v-bind:score="skill" key="key"></chart>
                        </td>
                        <td><p :class="`${getChangeClass(skill.scores)}`">{{getChangeNum(skill.scores)}}</p></td>
                    </tr>
                </template>    
            </tbody>    
        </table>
    </div>
</template> 

<script>
import chart from './chartSkillTrends.vue';
import jquery from 'jquery'
import { version } from 'punycode';

export default {

	name: "chart-container",

	props: {
		mappedSkillScores: {
			type: Object,
			default: function() {
				return {}
			}
        },
        useTabs:{
            type: Boolean,
            default: function(){
                return false
            }
        }
	},

	components: {
		chart
    },
    
    data() {
        return { 
            tooltip: {
                submission: "If the submission has not been uploaded, select the link below to upload document. If submission has been uploaded but the professor has not yet provided a grade, await the results. If the submission has been reviewed by the professor, click the link below for further information."
                ,netChange: "Difference between first score and last score"
                ,assessment: "Assessment Status reflects the current state of your CapsimInbox assessment. When the assessment is available to complete, select the option to 'Take Assessment'. Once the assessment has been completed in it's entirety, the status will show as 'Complete'."
                ,feedback: "The Feedback Report is generated once the CapsimInbox has been completed and will display information regarding performance in the assessment. If the Feedback Report is unavailable, please wait until the reports have been released by the administrator/professor."
                ,idp: "The Individual Development Plan(IDP) was designed to assist in skill improvement. Click the link below to improve a skill or view saved IDPs"
            }
        }    
    },

	computed: {
        mappedTabs(){
            let mappedTabs = {}
            for(let a in this.mappedSkillScores){
                let versionKey = this.mappedSkillScores[a].versionKey
                if(!mappedTabs.hasOwnProperty(versionKey) ) mappedTabs[versionKey] = {}
                mappedTabs[versionKey][a] = this.mappedSkillScores[a]
            }    
            return mappedTabs
        },

        versionKeys(){
            return Object.keys(this.mappedTabs)
        },

        versionNames(){
            let versionNameObj = {}
            this.versionKeys.map(e => {
                let skillsObj = this.mappedTabs[e]
                let firstKey = Object.keys(skillsObj)[0]
                versionNameObj[e] = skillsObj[firstKey].versionName
            })
            return versionNameObj
        }

	},

	methods: {
         getChangeClass: function(numObj){
            let numArr = []
            for(let key in numObj){
                 if(numObj[key].y) numArr.push(numObj[key].y)
            }
            let change = (numArr[numArr.length-1]) - numArr[0] 
            if (change < 0) return "number negative"
            if (change > 0) return "number positive"
            return "number equal"
        },
        getChangeNum: function(numObj){
            let numArr = []
            for(let key in numObj){
                if(numObj[key].y) numArr.push(numObj[key].y)
            }
            let change =  (numArr[numArr.length-1]) - numArr[0] 
            let symbol = ""
            if (change > 0) symbol = "+"
            return symbol + change
        },

	}

}
</script>
