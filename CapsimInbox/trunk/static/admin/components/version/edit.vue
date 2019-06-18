<template>
	<div id="edit-version" class="panel panel-default">

		<loader v-if="isLoading"></loader>

		<template v-else>

			<modal id="warning-modal" :show-okay="false">
				<h4 slot="title">Delete {{ alert.resource }}</h4>
				<div slot="body">
					<span class="text-danger">
						{{ alert.message }}
					</span>
				</div>
			</modal>

			<div class="panel-heading">
				<h1>
					<back-button></back-button>
					{{ versionObject.versionName }}
				</h1>
			</div>

			<div class="panel-body">
				
				<!-- VERSION -->
				<div class="page-header mt-0 pb-0">
					<h2>
						Edit Version
						<small>
							<button v-if="isAdmin" @click="duplicate" class="btn mat btn-success pull-right mr-15">Duplicate</button>
						</small>
					</h2>
				</div>

				<div class="row">
					<custom-input class="col-md-4 col-sm-6 mr-20" v-model="versionObject.versionName" :id="'name'" :label="'Name: '"></custom-input>
				</div>


				<div class="mt-20">
					<div class="radio-inline ">
						<label><input type="radio" name="isExam" value="0" v-model="versionObject.isExam">Inbox Version</label>
					</div>
					<div class="radio-inline">
						<label><input type="radio" name="isExam" value="1" v-model="versionObject.isExam">Exam Version</label>
					</div>
					<div class="form-group mt-20">
						<label>Re-Entry (multi-cycle)&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.reEntry" v-model="versionObject.versionConfigJson.reEntry"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Re-Entry (single-cycle)&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.reEntrySingle" v-model="versionObject.versionConfigJson.reEntrySingle"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>File Upload&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.fileUpload" v-model="versionObject.versionConfigJson.fileUpload"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>File Re-Upload&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.fileReUpload" v-model="versionObject.versionConfigJson.fileReUpload"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>File Review&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.fileReview" v-model="versionObject.versionConfigJson.fileReview"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Skip Welcome Video&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.skipWelcome" v-model="versionObject.versionConfigJson.skipWelcome"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Hide Timer&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.hideTimer" v-model="versionObject.versionConfigJson.hideTimer"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Enable Post Assessment&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.postAssessment" v-model="versionObject.versionConfigJson.postAssessment"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Show Timer as Clock&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.showTimerAsClock" v-model="versionObject.versionConfigJson.showTimerAsClock"></switcher>
					</div>
					<div class="form-group mt-20">
						<label>Hide Welcome PDF&nbsp</label>
						<switcher :selected="versionObject.versionConfigJson.hideWelcomePDF" v-model="versionObject.versionConfigJson.hideWelcomePDF"></switcher>
					</div>
					<div v-if="versionObject.versionConfigJson.showTimerAsClock" class="form-group mt-20">
						<label>Start Time&nbsp</label>
						<select v-model="versionObject.versionConfigJson.startTime">
							<option value="8">8:00 AM</option>
							<option value="8.5">8:30 AM</option>
							<option value="9">9:00 AM</option>
							<option value="9.5">9:30 AM</option>
							<option value="10">10:00 AM</option>
							<option value="10.5">10:30 AM</option>
							<option value="11">11:00 AM</option>
							<option value="11.5">11:30 AM</option>
						</select>
					</div>
					<!-- <custom-input class="col-md-4 col-sm-6 mr-20" v-model="versionObject.isExam" :id="'isExam'" :label="'isExam: '"></custom-input> -->
				</div>

				<!-- Post Assessment -->
				<template v-if='versionObject.versionConfigJson.postAssessment'>
					<div class="row">
						<div class="col-md-12">
							<div class="page-header">
								<h3>Constructs for Post Assessment</h3>
							</div>
						</div>
						<custom-input class="col-md-3" v-model="construct.name"  :type="'text'" :label="'Construct Name: '">
						</custom-input>
						<custom-input class="col-md-6" v-model="construct.description"  :type="'text'" :label="'Construct Description: '">
						</custom-input>
					</div>
					<button @click.prevent="addConstruct" class="btn mat btn-primary">Add Construct</button>

					<div class="panel-body">
						<table class="table">
							<thead>
								<tr>
									<th>Construct Name</th>
									<th>Construct Description</th>
									<th>Construct Key</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="construct in versionObject.construct">
									<td>{{ construct.name }}</td>
									<td>{{ construct.description }}</td>
									<td>{{ construct.constructKey }}</td>
									<td><button class="btn mat btn-danger btn-sm" @click="deleteConstruct(construct.constructKey)">Delete</button></td>
								</tr>
							</tbody>
						</table>
					</div>

					<div class="row">
						<div class="col-md-12">
							<div class="page-header">
								<h3>Questions for Post Assessment</h3>
							</div>
						</div>
						<custom-input class="col-md-6" v-model="postAssessmentQuestion.description"  :type="'text'" :label="'Question: '">
						</custom-input>
						<custom-input class="col-md-1" v-model="postAssessmentQuestion.sequence"  :type="'number'" :label="'Sequence: '">
						</custom-input>
					</div>
					<div class="form-group w-50">
						<label>Construct?&nbsp</label>
						<select v-model="postAssessmentQuestion.FK_constructKey">
							<option value=0>--Choose Construct--</option>
							<option :key="construct.constructKey" :value="construct.constructKey" v-for="construct in versionObject.construct">{{construct.name}}</option>
						</select>
					</div>
					<div class="form-group mt-20">
						<label>Is Reversed?&nbsp</label>
						<switcher :selected="postAssessmentQuestion.isReversed" v-model="postAssessmentQuestion.isReversed"></switcher>
					</div>
					<button @click.prevent="addPostAssessmentQuestion" class="btn mat btn-primary">Add Question</button>

					<div class="panel-body">
						<table class="table">
							<thead>
								<tr>
									<th>Question</th>
									<th>Construct Key</th>
									<th>Reversed?</th>
									<th>Sequence</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="question in versionObject.postAssessmentQuestion">
									<td>{{ question.description }}</td>
									<td>{{ question.FK_constructKey }}</td>
									<td>{{ question.isReversed ? "Yes" : "No" }}</td>
									<td>{{ question.sequence }}</td>
									<td><button class="btn mat btn-danger btn-sm" @click="deletePostAssessmentQuestion(question.questionKey)">Delete</button></td>
								</tr>
							</tbody>
						</table>
					</div>
				</template>
				<!-- End of Post Assessment-->

				<!-- Assessment timer -->

				<div class="row">
					<div class="col-md-12">
						<div class="page-header">
							<h3>Assessment Length</h3>
						</div>
						<p>Determine how much time (in minutes) that participants will have to complete the assessment.</p>
					</div>
					<custom-input class="col-md-2" v-model.number="versionObject.timer" :id="'timer'" :type="'number'" :label="'Timer: '">
					</custom-input>
				</div>

				<!-- End of assessment timer -->

				<!-- Skills and competencies -->

				<div class="row">

					<div id="skills" class="col-md-12 mb-20">
						<div class="page-header">
							<h3>
								Assessment Measures
							</h3>
						</div>
						<p>Set the skills on which participants will be assessed. Most assessments measure 5 skills.</p>
					</div>

					<div class="col-md-12 mb-20">
						<h4>
							Skills 
							<router-link class="btn mat btn-primary pull-right btn-sm" :to="{ name: 'create-skill', query: { versionKey: versionObject.versionKey}}">+ Add</router-link>
						</h4>
						<p>
							Participants will complete a self-assessment on these measures before they begin your assessment.
						</p>
					</div>

					<div class="col-md-12 mb-30">
						<skill-list @alert="showAlert" :versionActive="versionObject.isActive" :skills.sync="versionObject.skills"></skill-list>
					</div>

					<div id="competencies" class="col-md-12 mb-20">
						<h4>
							Additional Competencies(optional)
							<router-link v-if="isAdmin" class="btn mat btn-success pull-right btn-sm" :to="{ name: 'edit-competency-component', params: { versionKey: versionObject.versionKey}}">Edit Component</router-link>
							<router-link class="btn mat btn-primary pull-right btn-sm mr-10" :to="{ name: 'create-competency', query: { versionKey: versionObject.versionKey}}">+ Add</router-link>
						</h4>
						<p>List any additional competencies you would like to measure. Participants will NOT complete a self-assessment on these measures.</p>
					</div>

					<div class="col-md-12">
						<competencies-list @alert="showAlert" :versionActive="versionObject.isActive" :competencies.sync="versionObject.competencies"></competencies-list>
					</div>

					<!-- Learning Goals -->
					<template v-if="versionObject.isExam === 1">
						<div id="learningGoals" class="col-md-12 mb-20">
							<h4>
								learningGoals (optional)
								<!-- <router-link v-if="isAdmin" class="btn mat btn-success pull-right btn-sm" :to="{ name: 'edit-learningGoal', params: { versionKey: versionObject.versionKey}}">Edit Component</router-link> -->
								<router-link class="btn mat btn-primary pull-right btn-sm mr-10" :to="{ name: 'create-learningGoal', query: { versionKey: versionObject.versionKey}}">+ Add</router-link>
							</h4>
							<p>List any additional competencies you would like to measure. Participants will NOT complete a self-assessment on these measures.</p>
						</div>

						<div class="col-md-12">
							<learningGoal-list @alert="showAlert" :versionActive="versionObject.isActive" :learningGoals.sync="versionObject.learningGoals"></learningGoal-list>
						</div>
					</template>
					<!-- End of Skills and competencies -->

				</div>

				<!-- End of Skills and competencies -->

				<!-- Authors, Questions, and Drive -->

				<div class="row">

					<div class="col-md-12">
						<div class="page-header">
							<h3>Assessment Content</h3>
						</div>
						<p>
							Create the content that will make up your assessment. This includes the scenario your participants will enter into, the participant's role in the scenario, emails and messages that participants will receive, email/message authors, and email attachments.
						</p>
					</div>

					<div class="col-md-12 mb-20">
						<h4>Scenario</h4>
						<p>Create the scenario around the assessment. Typically this includes the company your participants will work in and their role in the company.</p>
						<router-link class="btn mat btn-primary" :to="{ name: 'edit-role-version', params: { resourceKey: versionObject.versionKey }}">
							Edit
						</router-link>
					</div>

					<div class="col-md-12 mb-10">
						<h4 class="mb-15">
							Authors
							<router-link class="btn mat btn-sm btn-primary pull-right" :to="{ name: 'create-author', query: { versionKey: versionObject.versionKey} }">
								+ Add
							</router-link>
						</h4>
						<p>
							Create names and positions for the authors of the emails and messages in the assessment. These are the people that send your participants emails and messages. Responses to these authors are what determines correct and incorrect answers.
						</p>
					</div>

					<div class="col-md-12 mb-30">
						<authors-list @removeAuthor="removeAuthor"  @alert="showAlert" :authors="versionObject.authors" :version-active="versionObject.isActive"></authors-list>
					</div>

					<div id="questionGroup" class="col-md-12 mb-10">
						<h4 class="mb-15">
							Question group
								<router-link class="btn mat btn-sm btn-primary pull-right" :to="{ name: 'create-question-group', params: { versionKey: versionObject.versionKey } }">
									+ Add
								</router-link>
						</h4>
						<p>
						Create a group of questions for parallel question.
						</p>
					</div>
					<div class="col-md-12 mb-30">
						<question-group-list  :questionGroup="versionObject.questionGroup"  @deleteQuestionGroup="deleteQuestionGroup" :versionActive="versionObject.isActive">
						</question-group-list>
					</div>

					<!-- <div class="col-md-12">
						<folders-list :folders="versionObject.folders" :versionActive="versionObject.isActive"></folders-list>
					</div> -->

					<div id="questions" class="col-md-12 mb-10">
						<h4 class="mb-15">
							Emails/Messages/Questions
							<!-- <small>
								<router-link class="btn mat btn-sm btn-primary pull-right" :to="{ name: 'create-question', params: { versionKey: versionObject.versionKey } }">
									+ Add
								</router-link>
							</small> -->
						</h4>
						<p>
							Create the emails and IMs that fill up your participants' inboxes. For each email or IM, you can create responses that earn full and/or partial credit. On average, each email/message will take between 1-3 minutes on average.
						</p>
					</div>

					<div class="col-md-12 mb-30">
						<questions-list @sort="sortEmails" @deleteQuestion="deleteQuestion" :emails="emails" :messages="messages" :authors="versionObject.authors" @alert="showAlert" :versionActive="versionObject.isActive">
						</questions-list>
					</div>

					<div id="drive" class="col-md-12 mb-10">
						<h4 class="mb-15">
							Attachments
							<router-link class="btn mat btn-primary pull-right btn-sm" :to="{ name: 'create-folder', query: { versionKey: versionObject.versionKey}}">+ Add</router-link>
						</h4>
						<p>
							Add any files or images that participants will need to use in order to correctly answer your emails or =. These typically include organizational charts, budgets, or historical data.
						</p>
					</div>

					<div class="col-md-12">
						<folders-list :folders="versionObject.folders" :versionActive="versionObject.isActive"></folders-list>
					</div>

				</div>

				<!-- End of Authors, Questions, and Drive -->

				<!-- Scoring bonuses -->

				<div class="row">
					<div class="col-md-12">
						<div class="page-header">
							<h3>
								Assessment Scoring Bonuses (optional)
							</h3>
						</div>
						<p>
							Customize your scoring with bonus options for time completion and priority responses.
						</p>
					</div>

					<div class="col-md-12">
						<h4>Time Bonus</h4>
						<p>
							Add the option to give additional points to participants who complete the assessment in a certain time. If, on average, your assessment takes 45 minutes, you may want to reward participants that complete the assessment in 35 minutes or less (around 20% faster than normal).
						</p>
					</div>

					<div class="col-md-12 mb-20">

						<form class="form-inline">

							<div class="form-group">
								<strong>Up to <input style="width: 60px" class="form-control" v-model.number="range1" type="text"> minutes</strong>
							</div>
							-
							<div class="form-group ml-10">
								<strong> Multiplier <input style="width: 60px" class="form-control" type="text" v-model="versionObject.timeBonusJson.multiplier1"> x </strong>
							</div>

							<div class="clearfix mb-10"></div>

							<div class="form-group">
								<strong>Up to <input style="width: 60px" class="form-control" v-model.number="range2" type="text"> minutes</strong>
							</div>
							-
							<div class="form-group ml-10">
								<strong> Multiplier <input style="width: 60px" class="form-control" type="text" v-model="versionObject.timeBonusJson.multiplier2"> x </strong>
								<span>(i.e. entering 1.1 would give participants a 10% boost in this range)</span>
							</div>

						</form>

					</div>


					<div class="col-md-12">
						<h4>
							Priority Bonus
							<small>
								<button class="btn mat btn-primary" @click.prevent="addPriorityCriteria">Add Criteria</button>
							</small>
						</h4>
						<p>
							Add the option to give additional points to participants who answer important emails or IMs first to reward their organization skills. Typically, participants have between 3-7 priority emails/IMs in a list of 20 total.
						</p>
					</div>

					<div class="col-md-12">
						<div v-if="Object.keys(versionObject.priorityBonusJson).length" class="form-group mb-5">
							<label for="priority-bonus-key">Skill affected: </label>
							<select id="priority-bonus-key" class="form-control" v-model="versionObject.priorityBonusJson.prioritySkillKey">
								<option v-for="skill in versionObject.skills" :value="skill.skillKey">{{ skill.name }}</option>
							</select>
						</div>
						<table class="table">
							<thead>
								<tr>
									<th>Points</th>
									<th>Answered</th>
									<th>Max</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								<tr v-if="!isNaN(key)" v-for="(obj, key) in versionObject.priorityBonusJson">
									<td><input v-model="obj.points" type="text" class="form-control"></td>
									<td><input v-model="obj.answered" type="text" class="form-control"></td>
									<td><input v-model="obj.max" type="text" class="form-control"></td>
									<td><button @click.prevent="removePriorityCriteria(key)" class="btn mat btn-danger">Delete</button></td>
								</tr>
							</tbody>
						</table>
					</div>

				</div>

				<!-- End of Scoring bonuses -->

				<!-- Entry questionnaire -->

				<div class="row">
					<div class="col-md-12">

						<div class="page-header">
								<h3>Entry Questionnaire</h3>
						</div>
						<p>This is the entry questionnaire participants will answer prior to completing the walkthrough.</p>
						<router-link :to="{ name: 'list-questionnaire-questions', params: { versionKey: versionObject.versionKey } }" class="btn btn-primary mat">Edit Questionnaire</router-link>
					</div>
				</div>

				<!-- End Entry Questionnaire -->

				<!-- Professor Resources -->

				<div class="row">
					<div class="col-md-12">

						<div class="page-header">
								<h3>Professor Resources</h3>
						</div>
						<p>Meaningful text, Meaningful text, Meaningful text, Meaningful text</p>
						<router-link class="btn mat btn-primary btn-sm" :to="{ name: 'create-professor-resources', query: { versionKey: versionObject.versionKey}}">Edit Professor Resources</router-link>
					</div>
				</div>

				<!-- End of Professor Resources -->

				<div v-if="isAdmin" class="row mt-50">

					<div class="col-md-12">

						<span>
							<a :href="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${versionObject.versionKey}.png`" target="_blank" class="btn mat btn-info">Main Logo Link</a>
						</span>

						<span>
							<a :href="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_assessment_${versionObject.versionKey}.png`" target="_blank" class="btn mat btn-info">Assessment Logo Link</a>
						</span>
						<br>
						<div class="clearfix"></div>

						<form>

							<h4>Product Information</h4>
							<hr class="mt-5">

							<div class="form-group">
								<label for="is-sellable">Is Sellable</label>
								<switcher :selected="versionObject.isSellable" v-model="versionObject.isSellable"></switcher>
							</div>

							<div class="form-group pl-0 pr-0 w-100">
								<label for="description">Description</label>
								<wysiwyg id="description" v-model="productDescription"></wysiwyg>
							</div>

							<hr>

							<div class="form-group mb-20">
								<span class="btn mat btn-primary btn-file">
									Upload Main Logo
									<span class="glyphicon glyphicon-upload"></span>
									<input @change="handleFile($event.target.files, 'mainLogo')" type="file" id="main-logo">
								</span>
							</div>

							<div class="form-group mb-20">
								<span class="btn mat btn-primary btn-file">
									Upload Assessment Logo
									<span class="glyphicon glyphicon-upload"></span>
									<input @change="handleFile($event.target.files, 'assessment')" type="file" id="assessment-logo">
								</span>
							</div>

							<div class="form-group w-50">
								<label for="demo-url"> Demo URL: </label>
								<input v-model="versionObject.demoUrl" class="form-control" type="text" disabled>
							</div>

							<div class="form-group w-30">
								<label for="demo-url"> Demo Email: </label>
								<input v-model="versionObject.demoEmail" class="form-control" type="text">
							</div>

							<custom-input class="w-50" v-model="versionObject.surveyLink" :id="'survey-link'" :label="'Survey Link'"></custom-input>

							<div class="form-group w-50">
								<label for="combine-scoring">Combine Scoring With: </label>
								<select v-model="versionObject.combineScoringJson" multiple class="form-control" id="combine-scoring">
									<option v-for="version in validVersions" :value="version.versionKey">{{ version.versionName }}</option>
								</select>
							</div>

							<!-- <div class="clearfix"></div> -->

							<div class="form-group w-50">
								<label for="combine-scoring">Rehearsal Version: </label>
								<select v-model="versionObject.rehearsalVersionKey" class="form-control" id="combine-scoring">
									<option v-for="version in allVersions" :value="version.versionKey">{{ version.versionName }}</option>
								</select>
								<p class="help-block">This is the version that will be used as the rehearsal for the student/participant.</p>
							</div>

							<div class="form-group w-50">
								<label for="department">Department  </label>
								<select class="form-control" id="department" v-model="selectedDept" @change="setEditorDept">
									<option value=0>--Choose Department--</option>
									<option v-for="dept in editorDepts" :value="dept.EditorDeptKey">{{ dept.Department }}</option>
								</select>
							</div>

							<div class="form-group w-50">
								<label for="owner">Owner  </label>
								<select class="form-control" id="owner" v-model="selectedName" @change="setEditorName">
									<option value=0>--Choose Owner--</option>
									<option v-for="name in editorNames" :value="name.EditorNameKey">{{name.LastName}}, {{name.FirstName}}</option>
								</select>
							</div>

							<div class="clearfix mb-20"></div>

						</form>

					</div>

				</div>

				<button class="btn mat btn-success pull-right" @click.prevent="update">Update</button>

			</div>

		</template>

	</div>
</template>
<script>

export default {

	name: "edit-version",

	props: {
		resourceKey: {
			required: true
		}
	},

	components: {
		skillList: require('../skill/list.vue'),
		competenciesList: require('../competency/list.vue'),
		questionsList: require('../question/list.vue'),
		learningGoalList: require('../learningGoal/list.vue'),
		questionGroupList: require('../questionGroup/list.vue'),
		authorsList: require('../author/list.vue'),
		foldersList: require('../drive/list.vue')
	},

	data() {
		return {
			versionObject: {
				timeBonusJson: {},
				priorityBonusJson: {},
				combineScoringJson: [],
				description: '',
				editorDept: {},
				editorName: {},
				versionConfig: {}

			},
			questions: [],
			alert: {
				resource: '',
				message: ''
			},
			logos: {
				assessment: {},
				mainLogo: {}
			},
			allVersions: [],
			isLoading: true,
			editorNames: {},
			editorDepts: {},
			selectedDept: 0,
			selectedName: 0,
			construct: {
				name: '',
				description: ''
			},
			postAssessmentQuestion: {
				description: "",
				sequence: "",
				isReversed: false,
				FK_constructKey: 0
			}
		}
	},

	methods: {

		addPriorityCriteria() {
			let keys = Object.keys(this.versionObject.priorityBonusJson)
			let defaultValues = { points: 0, answered: 0, max: 0 }
			if( keys.length > 0 ) this.$set(this.versionObject.priorityBonusJson, `${keys.length}`, defaultValues)
			else this.$set(this.versionObject.priorityBonusJson, "0", defaultValues)
		},

		deleteQuestion(questionKey) {
			this.$store.dispatch('question/DELETE_RESOURCE', questionKey)
			.then( () => this.versionObject.questions = this.versionObject.questions.filter( el => el.questionKey != questionKey ) )
			.catch( err => alert("There was a problem while processing your request.") )
		},
		deleteQuestionGroup(questionGroupKey) {
			this.$store.dispatch('questionGroup/DELETE_RESOURCE', questionGroupKey)
			.then( () => this.versionObject.questionGroup = this.versionObject.questionGroup.filter( el => el.questionGroupKey != questionGroupKey ) )
			.catch( err => alert("There was a problem while processing your request.") )
		},

		duplicate() {
			$.ajax({
				url: `/capsiminbox/admin/api/versions/duplicate/${this.resourceKey}`,
				method: 'get'
			})
			.done( data => {
            this.$store.dispatch('NOTIFY', {
              message: 'Version was successfully duplicated',
              isWarning: false
            })
          })
          .fail( err => {
				console.log('err',err)
            this.$store.dispatch('NOTIFY', {
              message: 'There was a problem while duplicating version.',
              isWarning: true
            })
          })
		},

		getEditorNames() {
			$.ajax({
				url: `/capsiminbox/admin/api/versions/editorNames`,
				method: 'get'
			})
			.done( data => {
            this.$set(this, 'editorNames', data) 
          })
          .fail( err => console.log('err',err))
		},

		getEditorDepts() {
			$.ajax({
				url: `/capsiminbox/admin/api/versions/editorDepts`,
				method: 'get'
			})
			.done( data => {
				this.$set(this, 'editorDepts', data)
          })
          .fail( err => console.log('err',err))
		},

		setEditorName() {
			$.ajax({
				url: `/capsiminbox/admin/api/versions/editorNames/${this.resourceKey}`,
				method: 'post',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify({ FK_editorNameKey: this.selectedName })
			})
			.done( result => console.log(result) )
			.fail( err => console.log(err) )
		},

		setEditorDept() {
			$.ajax({
				url: `/capsiminbox/admin/api/versions/editorDepts/${this.resourceKey}`,
				method: 'post',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify({ FK_editorDeptKey: this.selectedDept })
			})
			.done( result => {
				console.log(result)
          })
          .fail( err => console.log('err',err))
		},

		addConstruct() {
			let payload = {
				name: this.construct.name,
				description: this.construct.description,
				FK_versionKey: this.versionObject.versionKey
			}

			this.$store.dispatch('construct/CREATE_RESOURCE', payload)
			.then( (newConstruct) => {
				this.versionObject.construct.push(newConstruct)
				this.construct.name = ''
				this.construct.description = ''
			})
		},

		addPostAssessmentQuestion() {
			let payload = {
				description: this.postAssessmentQuestion.description,
				sequence: this.postAssessmentQuestion.sequence,
				isReversed: this.postAssessmentQuestion.isReversed ? 1 : 0,
				FK_constructKey: this.postAssessmentQuestion.FK_constructKey,
				FK_versionKey: this.versionObject.versionKey
			}

			this.$store.dispatch('postAssessmentQuestion/CREATE_RESOURCE', payload)
			.then( (newQuestion) => {
				this.versionObject.postAssessmentQuestion.push(newQuestion)
				this.postAssessmentQuestion.description = ''
				this.postAssessmentQuestion.sequence = ''
				this.postAssessmentQuestion.isReversed = false
				this.postAssessmentQuestion.constructKey = 0
			})
		},

		deleteConstruct(constructKey) {
			this.$store.dispatch('construct/DELETE_RESOURCE', constructKey)
				.then( () => {
					let constructs = this.versionObject.construct.filter(e => e.constructKey != constructKey)
					this.versionObject.construct = constructs
				})
				.then( () => {
					this.$store.dispatch('NOTIFY', {
						message: 'Construct was successfully deleted',
						isWarning: false
				})
            })
		},

		deletePostAssessmentQuestion(questionKey){
			this.$store.dispatch('postAssessmentQuestion/DELETE_RESOURCE', questionKey)
				.then( () => {
					let questions = this.versionObject.postAssessmentQuestion.filter(e => e.questionKey != questionKey)
					this.versionObject.postAssessmentQuestion = questions
				})
				.then( () => {
					this.$store.dispatch('NOTIFY', {
						message: 'Post Assessment Question was successfully deleted',
						isWarning: false
				})
            })
		},

		getValidVersions(versions) {
			const mainSkills = this.versionObject.skills.map( s => s.name )
			const validVersions = versions.filter( v => {

				let isValid = false

				if( v.versionKey == this.resourceKey ) return false
				else if( v.skills.length > 0 ) isValid = v.skills.map( s => s.name ).every( name => mainSkills.indexOf(name) > -1 )

				return isValid
			})

			return validVersions
		},

		getVersion() {
			return this.$store.dispatch('version/GET_RESOURCE', this.resourceKey)
		},

		getVersions() {
			return new Promise( (resolve, reject) => {
				$.get('/capsiminbox/admin/api/versions')
				.done( versions => resolve(versions) )
				.catch( err => reject(err) )
			})
		},

		handleFile( files, logoType ) {
			this.logos[logoType].fileFormat = files[0].name.match(/\.[0-9a-z]+$/i)[0]
			const reader = new FileReader()
			reader.onload = ( e ) => this.logos[logoType].file = e.target.result.replace(/^data:image\/\w+;base64,/, '')
			reader.readAsDataURL(files[0])
		},

		removeAuthor(authorKey) {
			this.versionObject.authors = this.versionObject.authors.filter( el => el.authorKey != authorKey )
		},

		removePriorityCriteria(key) {
			this.$delete(this.versionObject.priorityBonusJson, key)
			if( Object.keys(this.versionObject.priorityBonusJson).length == 1 ) {
				this.$delete(this.versionObject.priorityBonusJson, 'prioritySkillKey')
			}
		},

		saveOrder(questionsToUpdate) {

			$.ajax({
				url: '/capsiminbox/admin/api/questions/save-order',
				method: 'post',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify({ questionsToUpdate })
			})
			.done( result => console.log(result) )
			.fail( err => console.log(err) )
		},

		showAlert( alert ) {
			this.alert = alert
			return $('#warning-modal').modal('show')
		},

		sortEmails({ oldIndex, newIndex }) {

			let questionsToUpdate = null
			let question = this.emails[oldIndex]
			question.sequence = newIndex + 1

			if( newIndex < oldIndex ) {
				questionsToUpdate = this.emails.slice(newIndex, oldIndex + 1).filter( el => el.questionKey !== question.questionKey )
				.map( (el, idx) => {
					el.sequence = (newIndex + 2 + idx)
					return { questionKey: el.questionKey, sequence: el.sequence }
				})
			} else if( newIndex > oldIndex ) {
				let emailsToChange = this.emails.slice(oldIndex, newIndex + 1).filter( el => el.questionKey !== question.questionKey )
				questionsToUpdate = emailsToChange.reverse().map( (el, idx) => {
					el.sequence = newIndex - idx
					return { questionKey: el.questionKey, sequence: el.sequence }
				})
			}

			questionsToUpdate.push({ questionKey: question.questionKey, sequence: question.sequence })

			this.saveOrder(questionsToUpdate)

		},

		update() {

			const logos = Object.keys( this.logos ).reduce( (retVal, key) => {
				if( this.logos[key].file ) retVal[key] = this.logos[key]
				return retVal
			}, {})

			let payload = {
				versionName: this.versionObject.versionName,
				isExam: this.versionObject.isExam,
				timeBonusJson: this.versionObject.timeBonusJson,
				priorityBonusJson: this.versionObject.priorityBonusJson,
				timer: this.versionObject.timer,
				surveyLink: this.versionObject.surveyLink,
				combineScoringJson: this.versionObject.combineScoringJson,
				isSellable: this.versionObject.isSellable,
				description: this.versionObject.description,
				demoEmail: this.versionObject.demoEmail,
				rehearsalVersionKey: this.versionObject.rehearsalVersionKey,
				versionConfigJson: this.versionObject.versionConfigJson,
				logos
			}

			this.$store.dispatch('version/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
			.then( version => Object.assign(this.versionObject, version) )
		},

	},

	computed: {

		productDescription: {
			get() {
				return (this.versionObject.description == null) ? '' : this.versionObject.description
			},

			set(val) {
				this.versionObject.description = val
			}
		},

		emails() {
			return this.versionObject.questions.filter( question => question.FK_questionDisplayTypeKey === 1 )
			.sort( (e1, e2) => (e1.sequence < e2.sequence) ? -1 : (e1.sequence > e2.sequence) ? 1 : 0 )
		},

		messages() {
			return this.versionObject.questions.filter( question => question.FK_questionDisplayTypeKey === 2 )
		},

		range1: {

			get() {
				return this.versionObject.timeBonusJson.range1/60000
			},

			set(val) {
				this.versionObject.timeBonusJson.range1 = val * 60000
			}
		},

		range2: {

			get() {
				return this.versionObject.timeBonusJson.range2/60000
			},

			set(val) {
				this.versionObject.timeBonusJson.range2 = val * 60000
			}
		},

		validVersions() {
			return this.getValidVersions(this.allVersions)
		}
	},

	mounted() {
		

		this.getVersion()
		.then( version => { this.$set(this, 'versionObject', version); this.$set(this, 'questions', version.questions) })
		.then( () => this.$store.commit('SET_EDIT_VERSION', this.versionObject.versionKey) )
		.then( () => this.getVersions() )
		.then( versions => this.$set(this, 'allVersions', versions) )
		.then( () => this.getEditorNames() )
		.then( () => this.getEditorDepts() )
		.then( () => this.$set(this, 'selectedName', this.versionObject.editorName.FK_editorNameKey || 0 ) )
		.then( () => this.$set(this, 'selectedDept', this.versionObject.editorDept.FK_editorDeptKey || 0 ) )
		.then( () => setTimeout( () => this.isLoading = false, 500 ) )
		.catch( err => console.log(err) )
	},

}
</script>
<style lang="scss" scoped>

h3 {
	font-weight: 800 !important;
}

</style>
<style lang="scss">

.btn-file {
	position: relative;
	overflow: hidden;
}
.btn-file input[type=file] {
	position: absolute;
	top: 0;
	right: 0;
	min-width: 100%;
	min-height: 100%;
	font-size: 100px;
	text-align: right;
	filter: alpha(opacity=0);
	opacity: 0;
	outline: none;
	background: white;
	cursor: inherit;
	display: block;
}

.table {
	th {
		padding: 8px;
	}
	tbody {
		tr {
			td {
				vertical-align: middle;
			}
		}
	}
}

</style>
