<template>
    <div id="edit-question-group">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h2>
            <back-button></back-button>
              Edit Question Group
          </h2>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label for="name">Name</label>
            <input class="form-control" v-model="questionGroup.name" type="text">
          </div>
        
          <div class="form-inline">
            <h3 class="mt-30">Skills</h3>
            <div v-if="skills.length > 0" v-for="(skill, key) in questionGroup.questionGroupToSkill">
                <div class="form-group">
                    <select v-model="skill.FK_skillKey" class="form-control">
                        <option v-for="sElem in skills" :value="sElem.skillKey">{{ sElem.name }}</option>
                    </select>
                </div>
               
                <div style="display: inline-block" class="form-froup">
                    <button class="btn mat btn-danger" @click="deleteQuestionGroupToSkill( skill.FK_skillKey )">Delete</button>
                </div>
                <div class="clearfix mt-20"></div>
            </div>
            <button class="btn mat btn-primary" @click.prevent="addSkill">Add Skill</button>
        </div>
        <br>
        <!-- Competencies -->
        <div class="form-inline">
            <h3 class="mt-30">Competencies</h3>
            <div v-if="competencies.length > 0" v-for="(competency, key) in questionGroup.questionGroupToCompetency">
                <div class="form-group">
                    <select v-model="competency.FK_CompetencyKey" class="form-control">
                        <option v-for="sElem in competencies" :value="sElem.competencyKey">{{ sElem.name }}</option>
                    </select>
                </div>
                <div style="display: inline-block" class="form-froup">
                    <button class="btn mat btn-danger" @click="deleteQuestionGroupToCompetency( competency.FK_CompetencyKey )">Delete</button>
                </div>
                <div class="clearfix mt-20"></div>
            </div>
            <button class="btn mat btn-primary" @click.prevent="addCompetency">Add Competency</button>
        </div>
        <br>
          <div class="form-group">
            <button @click="updateQuestionGroup" class="btn mat btn-primary" >Update</button>
          </div>
          <br/>
          <h4 class="mb-15">
            Emails/Messages/Questions
            <router-link class="btn mat btn-primary pull-right" :to="{ name: 'create-question', query: { questionGroupKey: questionGroup.questionGroupKey}, params: { versionKey: questionGroup.FK_versionKey  } }">
              + Add question
            </router-link>
          </h4>
          <table class="table">
						<thead>
							<tr>
								<th>Question Key</th>
								<th>Subject</th>
								<th>Author</th>
								<th>Sequence</th>
								<th>Is Important</th>
								<th colspan="3">Actions</th>
							</tr>
						</thead>
            <tbody>
							<tr v-for="question in questions">
								<td>{{ question.questionKey }}</td>
								<td>{{ question.subjectTagKey }}</td>
								<td><span v-if="authors.length > 0">{{ authors.find( author => author.authorKey == question.FK_authorKey ).nameTagKey }}</span></td>
								<td>{{ question.sequence }}</td>
								<td><span :class="[question.isImportant ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-remove'] "></span></td>
								<td>
									<router-link class="btn mat btn-primary" :to="{ name: 'show-question', params: { resourceKey: question.questionKey } }">
										Show
									</router-link>
								</td>
								<td v-if="!versionActive">
									<router-link class="btn mat btn-success" :to="{ name: 'edit-question', params: { resourceKey: question.questionKey } }">
										Edit
									</router-link>
								</td>
								<td v-if="!versionActive">
									<button class="btn mat btn-danger" @click="deleteQuestion(question.questionKey)">Delete</button>
								</td>
							</tr>
              </tbody>
					</table>
        </div>
      </div>
    </div>
</template>
<script>
export default {

    name: "edit-question",

    props: {
        resourceKey: {
            required: true
        }
    },

    components: {
       
    },

    data() {
      return {
        authors:[],
        versionActive:0,
        questionGroup:{},
        questions:null,
        skills: [],
        competencies: [],
      }
    },

    created() {
      this.$store.dispatch('questionGroup/GET_RESOURCE', this.resourceKey)
      .then( questionGroup => this.$set(this, 'questionGroup', questionGroup) )
      .then(() => this.getQuestions())
      .then(questions => this.$set(this, 'questions', questions))
      .then(() => this.getCompetencies())
      .then(competencies => this.$set(this, 'competencies', competencies))
      .then(() => this.getSkills())
      .then(skills => this.$set(this, 'skills', skills))
      .then( () => this.getAuthors() )
      .catch( err => console.log(err) )
       
    },

    methods: {

      addSkill() {
            this.questionGroup.questionGroupToSkill.push({FK_questionGroupKey: this.questionGroup.questionGroupKey, FK_skillKey: 0, isNew: true})
        },

        addCompetency() {
            this.questionGroup.questionGroupToCompetency.push({FK_questionGroupKey: this.questionGroup.questionGroupKey, FK_CompetencyKey: 0, isNew: true})
        },

      getQuestions() {
          return new Promise( (resolve, reject) => {
            $.ajax({
              url: '/capsiminbox/admin/api/questionGroup/questions/'+this.resourceKey,
              method: 'get',
              dataType: 'json'
            })
            .done( fileTypes => resolve(fileTypes) )
            .catch( err => reject(err) )
          })
        },

        updateQuestionGroup() {
            $.ajax({
                url: `/capsiminbox/admin/api/questionGroup/${this.questionGroup.questionGroupKey}`,
                method: 'put',
                data: JSON.stringify({
                    name: this.questionGroup.name,
                    questionGroupToSkill: this.questionGroup.questionGroupToSkill,
                    questionGroupToCompetency: this.questionGroup.questionGroupToCompetency,
                }),
                contentType: 'application/json'
            })
            .done( () => alert('Question Group Updated') )
            .fail( err => alert('An error occurred while updating the Question Group') )
        },

        deleteQuestion(questionKey) {
          this.$store.dispatch('question/DELETE_RESOURCE', questionKey)
          .then( () => this.questions = this.questions.filter( el => el.questionKey != questionKey ) )
          .catch( err => alert("There was a problem while processing your request.") )
        },

        getAuthors( versionKey ) {
                $.ajax({
                    url: '/capsiminbox/admin/api/authors',
                    method: 'get',
                    data: {
                        FK_versionKey: this.questionGroup.FK_versionKey
                    },
                    dataType: 'json'
                })
                .done( authors => this.authors = authors )
                .fail( err => console.log(err) )
        },
         getSkills() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/admin/api/skills',
                    method: 'get',
                    data: {
                        FK_versionKey: this.questionGroup.FK_versionKey
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
                        FK_versionKey: this.questionGroup.FK_versionKey
                    },
                    dataType: 'json'
                })
                .done( competencies => resolve(competencies) )
                .catch( err => reject(err) )
            })
        },
        deleteQuestionGroupToSkill( FK_skillKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/questionGroup/questionGroupToSkill',
                method: 'delete',
                data: {
                    FK_skillKey,
                    FK_questionGroupKey: this.questionGroup.questionGroupKey
                }
            })
            .done( () => {
                this.questionGroup.questionGroupToSkill = this.questionGroup.questionGroupToSkill
                                            .filter( qgts => qgts.FK_skillKey !== FK_skillKey )
            })
            .catch( err => console.log(err) )
        },

        deleteQuestionGroupToCompetency( FK_competencyKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/questionGroup/questionGroupToCompetency',
                method: 'delete',
                data: {
                    FK_competencyKey,
                    FK_questionGroupKey: this.questionGroup.questionGroupKey
                }
            })
            .done( () => {
                this.questionGroup.questionGroupToCompetency = this.questionGroup.questionGroupToCompetency
                                            .filter( qgtc => qgtc.FK_CompetencyKey !== FK_competencyKey )
            })
            .catch( err => console.log(err) )
        },

      
    }

}
</script>
