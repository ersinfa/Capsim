<template>
	<div id="question-group-list">
		<div v-if="questionGroup.length">
					<table class="table">
						<thead>
							<tr>
								<th>Question group Key</th>
								<th>Name</th>
								<th colspan="3">Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="group in questionGroup">
								<td>{{ group.questionGroupKey }}</td>
								<td>{{ group.name }}</td>
								<td>
									<router-link class="btn mat btn-primary" :to="{ name: 'show-question-group', params: { resourceKey: group.questionGroupKey } }">
										Show
									</router-link>
								</td>
								<td v-if="!versionActive">
									<router-link class="btn mat btn-success" :to="{ name: 'edit-question-group', params: { resourceKey: group.questionGroupKey } }">
										Edit
									</router-link>
								</td>
								<td v-if="!versionActive">
									<button class="btn mat btn-danger" @click="deleteQuestionGroup(group.questionGroupKey)">Delete</button>
								</td>
							</tr>
						</tbody>
					</table>

		</div>
		<div v-else>
			No Question Groups in this version
		</div>
	</div>
</template>
<script>

export default {

	name: "questions-list",

	props: {

		questionGroup: {
			type: Array,
			default: function() {
				return []
			}
		},

		versionActive: {
			type: Number,
			required: true
		}
	},

	computed: {
		// emailsToOrder: {

		// 	get() {
		// 		return this.emails.map( email => email )
		// 	},

		// 	set(val) {

		// 	}
		// }
	},

	methods: {

		// emitSort(event) {
		// 	let payload = { newIndex: event.newIndex, oldIndex: event.oldIndex }
		// 	this.$emit('sort', payload)
		// },

		deleteQuestionGroup(questionGroupKey) {
			this.$emit('deleteQuestionGroup', questionGroupKey)
		}
	}

}
</script>
