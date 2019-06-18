<template>
	<div id="questions-list">
		<div v-if="emails.length || messages.length">
			<ul class="nav nav-tabs nav-justified" role="tablist">
				<li role="presentation" class="active">
					<a href="#emails" aria-controls="emails" role="tab" data-toggle="tab">Emails</a>
				</li>
				<li role="presentation">
					<a href="#messages" aria-controls="messages" role="tab" data-toggle="tab">Messages</a>
				</li>
			</ul>
			<div class="tab-content">
				<div role="tabpanel" class="tab-pane active" id="emails">
					<table class="table">
						<thead>
							<tr>
								<th></th>
								<th>Question Key</th>
								<th>Question Group Key</th>
								<th>Subject</th>
								<th>Author</th>
								<th>Sequence</th>
								<th>Is Important</th>
								<th colspan="3">Actions</th>
							</tr>
						</thead>
						<draggable @sort="emitSort" :list="emailsToOrder" :element="'tbody'">
							<tr v-for="email in emails" :key="email.questionKey">
								<td style="cursor: move;"><span class="glyphicon glyphicon-align-justify"></span></td>
								<td>{{ email.questionKey }}</td>
								<td>{{ email.FK_questionGroupKey }}</td>
								<td>{{ email.subjectTagKey }}</td>
								<td>{{ authors.find( author => author.authorKey == email.FK_authorKey ).nameTagKey }}</td>
								<td>{{ email.sequence }}</td>
								<td><span :class="[email.isImportant ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-remove'] "></span></td>
								<td>
									<router-link class="btn mat btn-primary" :to="{ name: 'show-question', params: { resourceKey: email.questionKey } }">
										Show
									</router-link>
								</td>
								<td v-if="!versionActive">
									<router-link class="btn mat btn-success" :to="{ name: 'edit-question', params: { resourceKey: email.questionKey } }">
										Edit
									</router-link>
								</td>
								<td v-if="!versionActive">
									<button class="btn mat btn-danger" @click="deleteQuestion(email.questionKey)">Delete</button>
								</td>
							</tr>
						</draggable>
					</table>
				</div>
				<div role="tabpanel" class="tab-pane" id="messages">
					<table class="table">
						<thead>
							<tr>
								<th>Question Key</th>
								<th>Question Group Key</th>
								<th>Author</th>
								<th>Timer</th>
								<th :colspan="[ !versionActive ? '3' : '1' ]">Actions</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="message in messages" :key="message.questionKey">
								
								<td>{{ message.questionKey }}</td>
								<td>{{ message.FK_questionGroupKey }}</td>
								<td>{{ authors.find( author => author.authorKey == message.FK_authorKey ).nameTagKey }}</td>
								<td>{{ message.timer/(60*1000) }} min</td>
								<td>
									<router-link class="btn mat btn-primary" :to="{ name: 'show-question', params: { resourceKey: message.questionKey } }">
										Show
									</router-link>
								</td>
								<td v-if="!versionActive">
									<router-link class="btn mat btn-success" :to="{ name: 'edit-question', params: { resourceKey: message.questionKey } }">
										Edit
									</router-link>
								</td>
								<td v-if="!versionActive">
									<button class="btn mat btn-danger" @click="deleteQuestion(message.questionKey)">Delete</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div v-else>
			No Questions in this version
		</div>
	</div>
</template>
<script>
import draggable from 'vuedraggable'

export default {

	name: "questions-list",

	props: {

		emails: {
			type: Array,
			default: function() {
				return []
			}
		},

		messages: {
			type: Array,
			default: function() {
				return []
			}
		},

		authors: {
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

	components: {
		draggable
	},

	computed: {
		emailsToOrder: {

			get() {
				return this.emails.map( email => email )
			},

			set(val) {

			}
		}
	},

	methods: {

		emitSort(event) {
			let payload = { newIndex: event.newIndex, oldIndex: event.oldIndex }
			this.$emit('sort', payload)
		},

		deleteQuestion(questionKey) {
			this.$emit('deleteQuestion', questionKey)
		}
	}

}
</script>
