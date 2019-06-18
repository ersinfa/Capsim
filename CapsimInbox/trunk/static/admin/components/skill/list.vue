<template>
    <div id="skills-list">
        <table v-if="skills.length" class="table">
            <thead>
                <th>Skill Name</th>
                <th :colspan="[ !versionActive ? '3' : '1' ]">Actions</th>
            </thead>
            <tbody>
                <tr v-for="skill in skills">
                    <td>{{ skill.name }}</td>
                    <td>
                        <router-link class="btn mat btn-primary" :to="{ name: 'show-skill', params: { resourceKey: skill.skillKey} }">
                            Show
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <router-link class="btn mat btn-success" :to="{ name: 'edit-skill', params: { resourceKey: skill.skillKey} }">
                            Edit
                        </router-link>
                    </td>
                    <td v-if="!versionActive">
                        <button class="btn mat btn-danger" @click="removeSkill(skill)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            No Skills in this version
        </div>
    </div>
</template>
<script>
export default {

    name: "skills-list",

    props: {

        skills: {
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

    methods: {

        //Check if there is any answer assign to this skill
        removeSkill(skillToRemove) {

            const skill = this.skills.find( skill => skill.skillKey == skillToRemove.skillKey )
            const hasAnswers = skill.answers.length > 0

            if( hasAnswers ) {
                const alert = {
                    resource: 'Skill',
                    message: 'This Skill is assigned to an answer/answers. Please unassign the skill first'
                }
                return this.$emit('alert', alert)
            }

            this.$store.dispatch('skill/DELETE_RESOURCE', skill.skillKey)
            .then( () => this.$emit('update:skills', this.skills.filter( el => el.skillKey != skill.skillKey )) )

        }
    }

}
</script>
