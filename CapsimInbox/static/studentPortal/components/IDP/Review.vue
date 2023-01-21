<template>
    <!-- INBOX -->
        <div v-if="data && !isExam">

            <div ref="toPrint" class="to-print">

                <br>
                <div class="row mb-50 panel-heading" style="page-break-after: always">
                    <div class="col-md-12">
                        <h3>Individual Development Plan Structure</h3>
                        <p>
                            The following pages document your responses from completing the IDP Builder on the skill you chose to improve.
                            This process spanned three steps: 1) Reflect; 2) Set Goal; and, 3) Create Plan.
                            <br>
                            Also provided is the entire developmental tactic for the specific skill you selected for improvement.
                        </p>
                    </div>
                </div>

                <div class="row" style="page-break-after: always">
                    <div class="col-md-12">

                        <table class="table table-bordered skill-table">
                            <thead>
                                <tr>
                                    <th>Skill</th>
                                    <th>Skill Score</th>
                                    <th>Development Need</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <h4> {{skillsInfo[selectedSkill].name}} </h4>
                                        <p>
                                            {{skillsInfo[selectedSkill].description}}
                                        </p>
                                    </td>
                                    <td>{{ selectedScore.score }}</td>
                                    <td>{{ selectedScore.needDev }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <br>
                        <h2 style="color: #003f54 !important">1. Reflect</h2>

                        <table class="table table-bordered reflect-table">
                            <thead>
                                <tr>
                                    <th >Career</th>
                                    <th>Life</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 50%">
                                        <b>Describe 2-3 reasons why this skill is relevant to your career: </b>
                                        <p v-if="text.text.length > 0" v-for="text in reflect.inputs1">{{text.text}}</p>
                                    </td>
                                    <td style="width: 50%">
                                        <b>Describe 2-3 situations where you might use this skill in your life, school, job, or anywhere else: </b>
                                        <p v-if="text.text.length > 0" v-for="text in reflect.inputs2">{{text.text}}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <br>
                        <h2 style="color: #003f54 !important">2. Set Goal</h2>
                        <p class="lead text-center" style="font-size: 26px !important; width: 90%; margin-left: auto; margin-right: auto">
                            "I will improve my {{skillsInfo[selectedSkill].name}} by {{ goal.accomplishPercentage }}% no later than {{goal.accomplishDate}} as evaluated by
                            {{ goal.evaluate.join(', ') }}."
                        </p>

                        <br>
                        <h2 style="color: #003f54 !important">3. Create Plan</h2>

                        <table v-for="(step,n) in plan.steps" class="table table-bordered plan-table">
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Step {{n+1}}:</b> {{ step.action }}</td>
                            </tr>
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Date:</b> {{ step.date }}</td>
                            </tr>
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Resources Needed:</b> {{ step.resources }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Third Page End -->

                <div class="row">
                    <div class="col-md-12">
                        <a style="font-size: 18px;" href="#" @click.prevent="isDevTacticOpened = !isDevTacticOpened">
                            <span v-show="!isDevTacticOpened" class="glyphicon glyphicon-plus mr-5"></span>
                            <span v-show="isDevTacticOpened" class="glyphicon glyphicon-minus mr-5"></span>
                            Learn more about {{ selectedScore.name }}
                        </a>
                    </div>
                    <div v-show="isDevTacticOpened" class="col-md-12">
                        <h3>{{ selectedScore.name }}</h3>
                        <div v-html="selectedScore.devTactic">
                        </div>
                    </div>
                </div>

            </div>

            <br>
            <br>

            <div @click="nextStep('step-4')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>

            <div class="pull-right">
                <button v-if="isEdit" @click="generatePdf" class="btn btn-info-light mat hidden-print mr-5">Download</button>
                <button @click="nextStep('step-1')" class="btn btn-danger-outline mr-5">Exit</button>
                <button v-if="!isEdit || redirectToStep2" class="btn btn-primary mat hidden-print mr-5" @click="saveGoal">Save</button>
                <button v-else class="btn btn-primary mat hidden-print" @click="redirectToUpdate">Update</button>
            </div>

        </div>
    <!-- END INBOX -->
    <!-- MODX -->
        <div v-else-if="data && isExam" class="panel panel-body">

            <div ref="toPrint" class="to-print">

                <br>
                <div class="row mb-50" style="page-break-after: always">
                    <div class="col-md-12">
                        <h3>Individual Development Plan Structure</h3>
                        <p>
                            The following pages document your responses from completing the IDP Builder on the Subject Area that you chose to improve. 
                            This process spanned three steps: 1) Reflect; 2) Set Goal; and, 3) Create Plan. 
                            <br>
                            <!-- Also provided is the entire developmental tactic for the specific skill you selected for improvement. -->
                        </p>
                    </div>
                </div>

                <div class="row" style="page-break-after: always">
                    <div class="col-md-12">

                        <table class="table table-bordered skill-table">
                            <thead>
                                <tr>
                                    <th>Subject Area</th>
                                    <th>Score</th>
                                    <!-- <th>Development Need</th> -->
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <h4> {{ reflectedSkill.competencyName }} </h4>
                                        <p>
                                            <!-- {{skillsInfo[selectedSkill].description}} -->
                                        </p>
                                    </td>
                                    <td>{{ roundScore(parentCompetencyScore) }}%</td>
                                    <!-- <td>{{ reflectedSkill.developmentalTactic }}</td> -->
                                </tr>
                            </tbody>
                        </table>

                        <br>
                        <h2 style="color: #003f54 !important">1. Reflect</h2>

                        <table class="table table-bordered reflect-table">
                            <thead>
                                <tr>
                                    <th >Career</th>
                                    <th>Life</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 50%">
                                        <b>Describe 2-3 reasons why this subject area is relevant to your career: </b>
                                        <p v-if="text.text.length > 0" v-for="text in reflect.inputs1">{{text.text}}</p>
                                    </td>
                                    <td style="width: 50%">
                                        <b>Describe 2-3 situations where you might use this subject area in your life, school, job, or anywhere else: </b>
                                        <p v-if="text.text.length > 0" v-for="text in reflect.inputs2">{{text.text}}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <br>
                        <h2 style="color: #003f54 !important">2. Set Goal</h2>
                        <p class="lead text-center" style="font-size: 26px !important; width: 90%; margin-left: auto; margin-right: auto">
                            "I will improve my {{ reflectedSkill.competencyName }} score by {{ goal.accomplishPercentage }}% no later than {{goal.accomplishDate}} as evaluated by
                            {{ goal.evaluate.join(', ') }}."
                        </p>

                        <br>
                        <h2 style="color: #003f54 !important">3. Create Plan</h2>

                        <table v-for="(step,n) in plan.steps" class="table table-bordered plan-table">
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Step {{n+1}}:</b> {{ step.action }}</td>
                            </tr>
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Date:</b> {{ step.date }}</td>
                            </tr>
                            <tr>
                                <td class="pt-10 pb-10" style="font-size: 16px; text-align: left"><b>Resources Needed:</b> {{ step.resources }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Third Page End -->

                <div class="row">
                    <div class="col-md-12">
                        <!-- <a style="font-size: 18px;" href="#" @click.prevent="isDevTacticOpened = !isDevTacticOpened">
                            <span v-show="!isDevTacticOpened" class="glyphicon glyphicon-plus mr-5"></span>
                            <span v-show="isDevTacticOpened" class="glyphicon glyphicon-minus mr-5"></span>
                            Learn more about {{ reflectedSkill.competencyName }}
                        </a> -->
                    </div>
                    <div v-show="isDevTacticOpened" class="col-md-12">
                        <h3>{{ reflectedSkill.competencyName  }}</h3>
                        <div v-html="reflectedSkill.devTactic">
                        </div>
                    </div>
                </div>

            </div>

            <br>
            <br>

            <div @click="nextStep('step-4')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>

            <div class="pull-right">
                <button v-if="isEdit" @click="generatePdf" class="btn btn-info-light hidden-print mr-5">Download</button>
                <button @click="nextStep('step-1')" class="btn btn-danger-outline mr-5">Exit</button>
                <button v-if="!isEdit || redirectToStep2" class="btn btn-primary hidden-print mr-5" @click="saveGoal">Save</button>
                <button v-else class="btn btn-primary hidden-print" @click="redirectToUpdate">Update</button>
            </div>

        </div>
    <!-- END MODX -->
</template>

<script>
import { mapGetters } from 'vuex'

export default {

    name: "Review",

    props: ['nextStep','data'],

    data() {
        return {
            isDevTacticOpened: false,
            redirectToStep2: false
        }
    },

    beforeRouteLeave (to, from, next) {
        this.redirectToStep2 = false
    },

    computed: {

        reflect() {
            return this.data.reflect
        },

        goal() {
            return this.data.goal
        },

        plan() {
            return this.data.plan
        },

        selectedSkill() {
            return this.data.selectedSkill
        },

        parentCompetencyScore () {
            return this.reportCompetencies[this.reflectedSkill.competencyName]
        },

        ...mapGetters([
            'skillsInfo',
            'idpScore',
            'reportCompetencies'
        ]),

        reflectedSkill () {
          let skill = this.skillsInfo[this.data.selectedSkill]
          if (skill) return skill
          return this.idpScore.filter(score => {
            return score.competencyKey == this.data.selectedSkill
          })[0]
        },

        studentGoalKey: {
            get() {
                return this.data.studentGoalKey
            },
            set(val) {
                this.data.studentGoalKey = val
            }
        },

        isEdit() {
            return this.data.studentGoalKey !== undefined
        },

        selectedScore() {
            return this.idpScore.find( el => el.skillKey == this.selectedSkill )
        },
        isExam(){
            return this.$store.state.session.isExam == 1
        }

    },

    methods: {

        saveGoal(){
            //if it's already been redirected, we know this is editing of an existing goal
            if(this.redirectToStep2){
                this.redirectToStep2 = false
                this.$emit('updateGoal', 'this.data.studentGoalKey', this.redirectToStep2)
            } else {
                this.$store.dispatch( 'SET_IDP_GOAL', this.data )
                .then( data => this.studentGoalKey = data.studentGoalKey[0] )
                .then( () => this.$store.dispatch('GET_IDP_GOALS') )
                .then( () => this.$emit('selectGoal', this.studentGoalKey) )
            }
            
        },

        roundScore(score) {
            if (score % 1 !== 0) {
                const factor = Math.pow(10, 1)
                return Math.round(score * factor) / factor
            }
            return score
        },

        generatePdf() {
            if(this.isExam){
                window.open(`/capsiminbox/print/download-idp-modex/${this.data.studentGoalKey}`)
            } else {
                window.open(`/capsiminbox/print/download-idp/${this.data.studentGoalKey}`)
            }
        },
        redirectToUpdate(){
            this.redirectToStep2 = true
            this.$emit('updateGoal', 'this.data.studentGoalKey', this.redirectToStep2)
        },
        
    }
}

</script>

<style lang="scss" scoped>
h4, h3 {
    font-weight: bold;
}

th {
    background: rgb(0, 63, 84) !important;
    color: white;
    text-align: center;
}

.skill-table {

    border: 1px solid #ddd;

    th {
        width: 20%;
        &:first-of-type {
            width: 60%;
            text-align: left;
        }
    }

    td {
        text-align: center;
        vertical-align: middle;
        font-size: 16px;
        &:first-of-type {
            text-align: left;
            font-size: inherit;
        }
    }
}

.plan-table {
    tr:first-of-type {
        border-bottom: 1px solid #ddd;
    }
}

@media print {
    body {
        background-color: black;
    }
}


</style>
