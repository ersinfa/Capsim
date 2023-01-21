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
            <label for="name">Name:</label>  {{questionGroup.name}}
          </div>
        <div class="form-group">
          <label for="name">Skills:</label>
          <ul>
            <li v-for="skill in questionGroupSkills">
              {{skill.name}}
            </li> 
          </ul>
        </div>
        <div class="form-group">
          <label for="name">Competencies:</label>  
          <ul>
            <li v-for="competency in questionGroupCompetencies">
              {{competency.name}}
            </li> 
          </ul>
        </div>
          <br/>
          

      <br/>
          <h4 class="mb-15">
            Emails/Messages/Questions

          </h4>
          <table class="table">
						<thead>
							<tr>
								<th>Question Key</th>
								<th>Subject</th>
                <th>Author</th>
								<th>Sequence</th>
								<th>Is Important</th>
							</tr>
						</thead>
            <tbody>
							<tr v-for="question in questions">
								<td>{{ question.questionKey }}</td>
								<td>{{ question.subjectTagKey }}</td>
								<td><span v-if="authors.length > 0">{{ authors.find( author => author.authorKey == question.FK_authorKey ).nameTagKey }}</span></td>
								<td>{{ question.sequence }}</td>
								<td><span :class="[question.isImportant ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-remove'] "></span></td>
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
        competencies: []
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

    computed: {
       questionGroupCompetencies(){
        //  questionGroupToCompetency
        let retVal = this.questionGroup.questionGroupToCompetency.map(e=> e.FK_CompetencyKey)
         return this.competencies.filter(e=> retVal.includes(e.competencyKey))
       },
       questionGroupSkills(){
          let retVal = this.questionGroup.questionGroupToSkill.map(e=> e.FK_skillKey)
         return this.skills.filter(e=> retVal.includes(e.skillKey))
       },

    },

    methods: {

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



      
    }

}
</script>
