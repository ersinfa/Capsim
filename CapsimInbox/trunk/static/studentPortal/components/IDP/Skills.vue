<template>
    <div v-if="idpScore.length > 0 && data">
        <template v-if="!isExam">

            <template v-if="$store.state.versionKey == 42">
                <a target="_blank" href="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/ADA/Capsim_Inbox_IDP_Ethics_Audio_Descriptions.mp4">Audio Description</a>
            </template>
            <template v-else>
                <a target="_blank" href="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/ADA/Capsim_Inbox_IDP_Audio_Descriptions.mp4">Audio Description</a>
            </template>

            <div class="embed-responsive embed-responsive-16by9">
                <video ref="video" controls name="media">
                    <template v-if="$store.state.versionKey == 42"> <!-- Hardcoed for Ethics Only -->
                        <source src="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/CapsimInbox_IDP_Video_Ethics_v1.mp4" type="video/mp4">
                    </template>
                    <template v-else>
                        <source src="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/CapsimInbox_IDP_Video.mp4" type="video/mp4">
                    </template>
                    <track src="/capsiminbox/resources/vtt/CapsimInbox_IDP_Video.vtt" default kind="subtitles" srclang="en" label="English">
                </video>
            </div>
        
        <h1><strong>Developmental Tactics</strong></h1>
        <p>Learning how to make skill improvements is a critical skill in its own right, and is essential for professionals at all career stages. To truly master a skill requires both knowledge (&ldquo;knowing <em>about</em>&rdquo;) and application (&ldquo;knowing
            <em>how</em>&rdquo;). To improve the skills assessed in CapsimInbox you will need to learn about what the skills look like when effectively performed. You will also need to frequently and consistently practice these skills, which will often involve
            trial and error. It sometimes can be a frustrating process, but if you stick with it, you <em>can</em> improve. Research suggests five key steps can help guide you on the path to development:</p>
            <ol>
                <li><strong>Observe Your Current Skill Level.</strong> Observe and collect information about the specific behaviors you have targeted for change. Completing CapsimInbox is a great first start!</li>
                <li><strong>Set a Specific Goal</strong>: Determine how much you need to improve and focus on one key behavior or skill at a time. Avoid trying to do too many things at once.</li>
                <li><strong>Learn About the Skill:</strong> Seek out information to better understand the skill you want to improve. Find challenging situations where you will be forced to learn and practice your targeted skill.</li>
                <li><strong>Practice and Seek Feedback:</strong> Actually practice the new behavior during all available opportunities and seek as much feedback as possible to track your success.</li>
                <li><strong>Reward Yourself:</strong> Provide yourself with rewards that you find valuable and are directly linked to performing the desired behavior.</li>
            </ol>

                <h2>Skills</h2>
                <table class="table develop-skills">
                    <thead>
                        <tr>
                            <th>Skill</th>
                            <th>Score</th>
                            <th>Development Need</th>
                            <th>Improve</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="skill in idpScore">
                            <tr>
                                <th data-toggle="collapse" :data-target="`#collapseExample${skill.skillKey}`" aria-expanded="false" class="collapsed">
                                    <span class="glyphicon glyphicon-play"></span>
                                    {{ skillsInfo[skill.skillKey].name }}
                                </th>
                                <td>
                                    {{ skill.score }}
                                </td>
                                <td>
                                    {{ skill.needDev }}
                                </td>
                                <td>
                                    <button @click="selectSkill(skill.skillKey)" class="btn btn-primary mat">Improve</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <div v-html="skillsInfo[skill.skillKey].developmentalTactic" class="collapse" :id="`collapseExample${skill.skillKey}`"></div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>

                 <h2>Saved Skills</h2>
            <table class="table saved-skills">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Created On</th>
                        <th><span class="sr-only">Preview</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(goal, key) in goals">
                        <td>
                            {{ skillsInfo[goal.selectedSkill].name }}
                        </td>
                        <td>
                            {{ $moment(goal.dateTime).format('MM/DD/YYYY')  }}
                        </td>
                        <td>
                            <button @click="selectGoal(goal.studentGoalKey)" class="btn btn-primary mat">Preview</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            </template>

            <template v-else>

                 <template v-if="schoolKey == 900">
                    <br/>
                    <div class="alert alert-warning" role="alert">This exam will be taken at the start of your program, as well as before registering for EMC. Prior to registering for EMC, you’ll need to achieve a score of 80% in each subject area. Failure to do so will result in having to retake the exam for that specific subject area. </div>
                </template>

                <h1><strong>Full Results</strong></h1>
            <template v-if="overall">
            <h2 class="text-center">Overall Score: {{overall}}%</h2>
            <div class="row page-break">
				<div class="col-md-10 col-md-offset-1">
					
                        <ChartOverall class="mt-20" :score="overall"></ChartOverall>
					
				</div>
			</div>
            <br/>
            </template>
            <h2 class="text-center">Score Breakdown</h2>

            <ColumnChart class="mt-20" :series="competencyChartData.series" :categories="competencyChartData.categories"></ColumnChart>

       
        <h2><strong>Individual Development Plan</strong></h2>
        <p>Learning how to make improvements is a critical skill in its own right, and is essential for professionals at all career stages. To truly master a skill requires both knowledge  (&ldquo;knowing <em>about</em>&rdquo;)
            and application (&ldquo;knowing <em>how</em>&rdquo;). To improve in the areas assessed in your exam, you will need to learn about what the skills look like when effectively performed. 
            You will also need to frequently and consistently practice these skills, which will often involve trial and error. It sometimes can be a frustrating process, but if you stick with it, you can improve. 
            Research suggests five key steps can help guide you on the path to development</p>

            <ol class="col-md-offset-1">
                <li><strong>Observe Your Current Level.</strong> Observe and collect information about the specific behaviors you have targeted for change. Completing CapsimInbox is a great first start!</li>
                <li><strong>Set a Specific Goal</strong>: Determine how much you need to improve and focus on one key behavior or skill at a time. Avoid trying to do too many things at once.</li>
                <li><strong>Learn About the Objective:</strong> Seek out information to better understand what you want to improve. Find challenging situations where you will be forced to learn and practice your targeted skill. </li>
                <li><strong>Practice and Seek Feedback:</strong> Actually practice the new behavior during all available opportunities and seek as much feedback as possible to track your success. </li>
                <li><strong>Reward Yourself:</strong> Provide yourself with rewards that you find valuable and are directly linked to performing the desired behavior. </li>
            </ol>

        <br/>
            <table class="table develop-skills">
                <thead>
                    <tr>
                        <th>Subject Area</th>
                        <th>Development Need</th>
                        <th>Improve</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="competency in idpScore">
                        <tr>
                            <th data-toggle="collapse" :data-target="`#collapseExample${competency.competencyKey}`" aria-expanded="false" class="collapsed">
                                <span class="glyphicon glyphicon-play"></span>
                                {{ competency.competencyName }}
                            </th>
                            <th data-toggle="collapse">
                                {{ devNeedLevel(competencies[competency.competencyName]) }}
                            </th>
                            <th data-toggle="collapse">                                
                                <button @click="selectSkill(competency.competencyKey)" class="btn btn-primary mat">Improve </button>
                            </th>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <div class="collapse sub-table" :id="`collapseExample${competency.competencyKey}`">
                                    <div v-html="competency.developmentalTactic"></div>
                                    <table class="skill-table">
                                        <thead>
                                            <tr>
                                                <th>Score</th>
                                                <th>Learning Objectives</th>
                                            </tr>
                                        </thead>
                                        <template v-for="skill in competency.skills">
                                            <tr> 
                                                <td >
                                                    {{roundScore(skill.score)}}%
                                                </td>
                                                <td class="v-output" >
                                                    {{skill.name}}
                                                    <br>
                                                    <div class="tab"></div> 
                                                    <p><b>Recommended Resource: </b></p>
                                                    <div v-html="skill.devTactic"></div>
                                                </td>
                                            </tr>
                                        </template>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
                <h2>Saved Skills</h2>
                <table class="table saved-skills">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Created On</th>
                            <th><span class="sr-only">Preview</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(goal, key) in goals">
                            <td>
                                {{ (getSkill(goal.selectedSkill)).competencyName }}
                            </td>
                            <td>
                                {{ $moment(goal.dateTime).format('MM/DD/YYYY')  }}
                            </td>
                            <td>
                                <button @click="selectGoal(goal.studentGoalKey)" class="btn btn-info-light">Preview</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </template>
        <!-- </template> -->
            
                
        </div>
    </template>
    

    <script>
    import { mapGetters, mapState } from 'vuex'
    import ChartOverall from '../Report/chartOverall.vue'
    import ColumnChart from './ColumnChart.vue'

    export default {

        name: "Skills",

        props: ['nextStep', 'data'],

        data() {
            return {
            }
        },

        computed: {
            ...mapState({
                competencies: state => state.report.competencies,
                schoolKey: state => state.session.schoolKey,
                overall: state => state.report.overall.score
            }),
            ...mapGetters(['goals', 'idpScore', 'skillsInfo',]
            ),
            isExam(){
                return this.$store.state.session.isExam == 1
            },
            competencyChartData(){
                let retVal={categories:[],series:[{name:'',data:[],showInLegend: false}]}
                this.idpScore.forEach(e=>{
                    retVal.categories.push(e.competencyName)
                    retVal.series[0].data.push(Math.round( e.score * 10 ) / 10)
                })
                return retVal
            },
        },
        components: {
            ChartOverall,
            ColumnChart
        },

        methods: {
            devNeedLevel(data) {
                const score = parseInt(data)
                let retVal = ""
                if (score > 70) {
                    retVal = "Low"
                } else if (score <= 30) {
                    retVal = "High"
                } else {
                    retVal = "Medium"
                }
                return retVal
            },
            roundScore(score) {
                if (score % 1 !== 0) {
                    const factor = Math.pow(10, 1)
                    return Math.round(score * factor) / factor
                }
                return score
            },
            getSkill(key) {
                return this.idpScore.filter(score => {
                    return score.competencyKey == key
                })[0]
            },
            selectSkill(key) {
                this.data.selectedSkill = key
                this.nextStep('step-2')
            },
            selectGoal(studentGoalKey) {
                this.$emit( 'goalSelected', studentGoalKey )
            }
        },

    }
    </script>
    <style lang="scss" scoped>
   
    </style>
