<template>
    <div id="show-question">
        <div  v-if="question != null" class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  {{ question.subjectTagKey }}
                </h2>
            </div>
            <div class="panel-body">

                <p>
                    <b>Question Key: </b>{{ question.questionKey }}
                </p>
                <br>
                <p>
                    <b>Question Type: </b>{{ question.questionType.name }}
                </p>
                <br>
                <p>
                    <b>Answer Type: </b>{{ (question.isWrittenResponse) ? 'Written Response' : 'Multiple Choice' }}
                </p>
                <br>
                <p>
                    <b>Subject: </b>{{ question.subjectTagKey }}
                </p>
                <br>
                <p>
                    <b>Author: </b>{{ question.author.nameTagKey }} {{ question.author.title }}
                </p>
                <br>
                <p>
                    <b>Is Important: {{ ( question.isImportant ) ? 'Yes' : 'No' }}</b>
                </p>
                <br>
                <p>
                    <b>Sequence: </b> {{ question.sequence }}
                </p>
                <br>
                <p>
                    <b>Timer: </b> {{ timer }}
                </p>
                <br>
                <div>
                    <b> Question Body: </b>
                    <br>
                    <p class="well" v-html="question.descriptionTagKey"></p>
                </div>

                <div class="responses col-sm-12 mt-30">
                    <div class="page-header">
                        <h3>Answers <router-link class="btn mat btn-primary pull-right" :to="{ name: 'create-answer', query: { questionKey: question.questionKey }}">+ Add</router-link></h3>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Answer Key</th>
                                <th>Sequence</th>
                                <th>Description</th>
                                <template v-if="versionKey ==70">
                                    <th>Skill Points</th>
                                </template>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="answer in question.answers">
                                <td>{{ answer.answerKey }}</td>
                                <td>{{ answer.sequence }}</td>
                                <td>{{ answer.nameTagKey }}</td>
                                <template v-if="versionKey == 70">
                                    <!--Fix this check later, sometimes there is no answer to Skills -->
                                    <template v-if="answer.answerToSkill.length > 0 ">
                                        <td>{{ sumSkillPoint(answer.answerToSkill) }}</td>
                                    </template>
                                    <template v-else>
                                        <td>0</td>
                                    </template>
                                </template>
                                <td><router-link class="btn mat btn-primary" :to="{ name: 'show-answer', params: { resourceKey: answer.answerKey, edittable: false } }">Show</router-link></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "show-question",

    props: {
        resourceKey: {
            required: true
        }
    },

    data: () => ({
        question: null,
        authors: [],
        sumSkillPoint: (skills) => skills.map(x => x.points).reduce((sum, current) => sum + current),
        html: ''
    }),

    mounted() {
        this.$store.dispatch('question/GET_RESOURCE', this.resourceKey)
        .then( question => this.$set(this, 'question', question ) )
    },

    computed: {
        timer: {
            get() {
                return this.question.timer/60000
            },
            set(val) {
                this.question.timer = val * 60000
            }
        },
        // Fix version check later.
        versionKey(){
            return this.question.questionToVersion.FK_versionKey; 
        }
    }

}
</script>
