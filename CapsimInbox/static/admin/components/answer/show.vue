<template>
    <div id="show-question">
        <div  v-if="answer != null" class="panel panel-default">
            <div class="panel-heading">
                <h1>
                  <back-button></back-button>
                  Answer: {{ answer.answerKey }}
                </h1>
            </div>
            <div class="panel-body">
                <div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input id="description" class="form-control" type="text" v-model="answer.nameTagKey">
                    </div>
                    <div class="form-group">
                        <label for="sequence">Sequence</label>
                        <input id="sequence" class="form-control" type="text" v-model="answer.sequence">
                    </div>
                    <div class="form-group">
                        <label for="timeImpact">Time impact in seconds. Example: 10 will add 10 seconds to the time, -10 will reduce time by 10 seconds</label>
                         <input id="timeImpact" class="form-control" type="text" v-model="answer.timeImpact">
                    </div>

                    <div class="form-group">
                        <label for="not-randomized-answer">Answer will not be randomized</label>
                        <input 
                            id="not-randomized-answer" 
                            type="checkbox" 
                            class="form-check-input" 
                            v-model.number="answer.isNotRandomized" />
                    </div>
                </div>
                <br>
                <!-- Time-Answered Bonus
                <div v-if='hasPostAssessment'>
                    <div class="form-group">
                        <label for="minutes">Time Bonus - Competency</label>
                        <select v-model="answer.timeBonusCompetencyKey" class="form-control">
                            <option value="">-</option>
                            <option v-for="competency in competencies" :value="competency.competencyKey">{{ competency.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="points">Time Bonus - Points</label>
                        <input id="points" class="form-control" type="number" v-model="answer.timeBonusPoints">
                    </div>
                    <div class="form-group">
                        <label for="minutes">Time Bonus - Minutes</label>
                        <input id="minutes" class="form-control" type="number" v-model="answer.timeBonusTimeGap">
                    </div>
                </div> -->
                <!-- Skills -->
                <div class="form-inline">
                    <h3 class="mt-30">Skills</h3>
                    <div v-if="skills.length > 0" v-for="(skill, key) in answer.answerToSkill">
                        <div class="form-group">
                            <select v-model="skill.FK_skillKey" class="form-control">
                                <option v-for="sElem in skills" :value="sElem.skillKey">{{ sElem.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input v-model="skill.points" type="text" class="form-control">
                        </div>
                        <div style="display: inline-block" class="form-froup">
                            <button class="btn mat btn-danger" @click="deleteAnswerToSkill( skill.FK_skillKey )">Delete</button>
                        </div>
                        <div class="clearfix mt-20"></div>
                    </div>
                    <button class="btn mat btn-primary" @click.prevent="addSkill">Add Skill</button>
                </div>
                <br>
                <!-- Competencies -->
                <div class="form-inline">
                    <h3 class="mt-30">Competencies</h3>
                    <div v-if="competencies.length > 0" v-for="(competency, key) in answer.answerToCompetency">
                        <div class="form-group">
                            <label for="minutes">Competency:</label>
                            <select v-model="competency.FK_competencyKey" class="form-control">
                                <option v-for="sElem in competencies" :value="sElem.competencyKey">{{ sElem.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="minutes">&nbsp Point Bonus:</label>
                            <input v-model="competency.points" type="text" class="form-control">
                        </div>
                        <div v-if="hasPostAssessment" class="form-group">
                            <label for="minutes">&nbsp Time Bonus(Minutes):</label>
                            <input id="minutes" class="form-control" type="number" v-model="competency.timeGap">
                        </div>
                        <div style="display: inline-block" class="form-froup">
                            <button class="btn mat btn-danger" @click="deleteAnswerToCompetency( competency.FK_competencyKey )">Delete</button>
                        </div>
                        <div class="clearfix mt-20"></div>
                    </div>
                    <button class="btn mat btn-primary" @click.prevent="addCompetency">Add Competency</button>
                </div>
                <br>
                <!-- Learning Goals -->
                <div class="form-inline">
                    <h3 class="mt-30">Learning Goals</h3>
                    <div v-if="learningGoals.length > 0" v-for="(learningGoal, key) in answer.answerToLearningGoal">
                        <div class="form-group">
                            <select v-model="learningGoal.FK_learningGoalKey" class="form-control">
                                <option v-for="sElem in learningGoals" :value="sElem.learningGoalKey">{{ sElem.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input v-model="learningGoal.points" type="text" class="form-control">
                        </div>
                        <div style="display: inline-block" class="form-froup">
                            <button class="btn mat btn-danger" @click="deleteAnswerToLearningGoal( learningGoal.FK_learningGoalKey )">Delete</button>
                        </div>
                        <div class="clearfix mt-20"></div>
                    </div>
                    <button class="btn mat btn-primary" @click.prevent="addLearningGoal">Add LearningGoal</button>
                </div>
                <br>
                <br>
                <button v-if='edittable' class="btn mat btn-success" @click.prevent="update">Update</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "show-answer",

    props: {
        resourceKey: {
            required: true
        },
        edittable: {
            required: true
        }
    },

    data: () => ({
        answer: null,
        skills: [],
        competencies: [],
        learningGoals: [],
        versionObject: {
            versionConfigJson: {}
        }
    }),

    created() {
        this.getAnswer()
        .then( answer => this.$set(this, 'answer', answer ) )
        .then( () => this.getSkills() )
        .then( skills => this.skills = skills )
        .then( () => this.getCompetencies() )        
        .then( competencies => this.competencies = competencies )
        .then( () => this.getLearningGoals() )
        .then( learningGoals => this.learningGoals = learningGoals )
        .then(() => this.getVersion())
        .then( version => { this.$set(this, 'versionObject', version)})
        .catch( err => console.log(err) )
    },

    methods: {

        addSkill() {
            this.answer.answerToSkill.push({FK_answerKey: this.answer.answerKey, FK_skillKey: 0, points: 0, isNew: true})
        },

        addCompetency() {
            this.answer.answerToCompetency.push({FK_answerKey: this.answer.answerKey, FK_competencyKey: 0, points: 0, isNew: true})
        },

        addLearningGoal(){
            this.answer.answerToLearningGoal.push({FK_answerKey: this.answer.answerKey, FK_learningGoalKey: 0, points: 0, isNew: true})
        },

        deleteAnswerToSkill( FK_skillKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/answers/ats',
                method: 'delete',
                data: {
                    FK_skillKey,
                    FK_answerKey: this.answer.answerKey
                }
            })
            .done( () => {
                this.answer.answerToSkill = this.answer.answerToSkill
                                            .filter( ats => ats.FK_skillKey !== FK_skillKey )
            })
            .catch( err => console.log(err) )
        },

        deleteAnswerToCompetency( FK_competencyKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/answers/atc',
                method: 'delete',
                data: {
                    FK_competencyKey,
                    FK_answerKey: this.answer.answerKey
                }
            })
            .done( () => {
                this.answer.answerToCompetency = this.answer.answerToCompetency
                                            .filter( ats => ats.FK_competencyKey !== FK_competencyKey )
            })
            .catch( err => console.log(err) )
        },

        deleteAnswerToLearningGoal( FK_learningGoalKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/answers/atl',
                method: 'delete',
                data: {
                    FK_learningGoalKey,
                    FK_answerKey: this.answer.answerKey
                }
            })
            .done( () => {
                this.answer.answerToLearningGoal = this.answer.answerToLearningGoal
                .filter( ats => ats.FK_learningGoalKey !== FK_learningGoalKey )
            })
            .catch( err => console.log(err) )
        },

        getAnswer() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: `/capsiminbox/admin/api/answers/${this.resourceKey}`,
                    method: 'get',
                    dataType: 'json'
                })
                .done( answer => resolve(answer))
                .fail( err => reject(err) )
            })
        },

        getSkills() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/admin/api/skills',
                    method: 'get',
                    data: {
                        FK_versionKey: this.answer.question.questionToVersion.FK_versionKey
                    },
                    dataType: 'json'
                })
                .done( skills => resolve(skills) )
                .catch( err => reject(err) )
            })
        },

        getCompetencies() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/admin/api/competencies',
                    method: 'get',
                    data: {
                        FK_versionKey: this.answer.question.questionToVersion.FK_versionKey
                    },
                    dataType: 'json'
                })
                .done( competencies => resolve(competencies) )
                .catch( err => reject(err) )
            })
        },

        getLearningGoals() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/admin/api/learningGoals',
                    method: 'get',
                    data: {
                        FK_versionKey: this.answer.question.questionToVersion.FK_versionKey
                    },
                    dataType: 'json'
                })
                .done( learningGoals => resolve(learningGoals) )
                .catch( err => reject(err) )
            })
        },

        update() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: `/capsiminbox/admin/api/answers/${this.resourceKey}`,
                    method: 'put',
                    data: JSON.stringify({
                        answer: {
                            nameTagKey: this.answer.nameTagKey,
                            sequence: this.answer.sequence, 
                            isNotRandomized: this.answer.isNotRandomized,
                            timeImpact: this.answer.timeImpact
                        },
                        answerToSkill: this.answer.answerToSkill,
                        answerToCompetency: this.answer.answerToCompetency,
                        answerToLearningGoal: this.answer.answerToLearningGoal
                    }),
                    contentType: 'application/json'
                })
                .done( () => { 
                        this.$store.dispatch('NOTIFY', {
                        message: 'Answer was successfully updated',
                        isWarning: false
                    }) 
                })
                .fail( err => console.log(err) )
            })
        },

        getVersion(){
            this.$store.dispatch('version/GET_RESOURCE', this.versionKey)
            .then( version => { this.$set(this, 'versionObject', version); this.$set(this, 'questions', version.questions) })
            .then( () => this.$store.commit('SET_EDIT_VERSION', this.versionObject.versionKey) )
            .catch( err => console.log(err) )
        }
    },

    computed: {
        versionKey(){
            return this.$store.getters.versionKeyActive 
        },

        hasPostAssessment(){
            if(this.versionObject) return this.versionObject.versionConfigJson.postAssessment
        }
    }


}
</script>
<style lang="scss" scoped>
.question-body {
    border: 1px solid #c6c6c6;
    background-color: #eeeeee;
    border-radius: 5px;
}
</style>
