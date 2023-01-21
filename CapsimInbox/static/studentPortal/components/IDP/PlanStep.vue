<template>
    <div class="mb-30">

        <div class="mb-10">
            <p class="lead visible-lg-inline"><b>Step {{stepNr}}:</b></p>

            <div v-if="canDelete" class="btn-group pull-right visible-lg-inline">
                <button type="button" class="btn btn-default dropdown-toggle" style="line-height: 0" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="glyphicon glyphicon-option-horizontal"></span>
                </button>
                <ul class="dropdown-menu">
                    <li v-if="stepNr-1 !== 0"><a href="#" @click.prevent="moveUp"><span class="glyphicon glyphicon-arrow-up"></span> Move Step Up</a></li>
                    <li v-if="!isLast"><a href="#" @click.prevent="moveDown"><span class="glyphicon glyphicon-arrow-down"></span> Move Step Down</a></li>
                    <li><a href="#" @click.prevent="deleteStep"><span class="glyphicon glyphicon-trash" style="color: red"></span> Delete Step</a></li>
                </ul>
            </div>
        </div>

        <div :class="['form-group', { 'has-error': checkErrors('action') }]">
            <textarea v-model="action" class="form-control" placeholder="Action to Take" aria-label="Action to Take"></textarea>
            <span v-if="checkErrors('action')" class="help-block">{{ validationMessage }}</span>
        </div>

        <div :class="['form-group', { 'has-error': checkErrors('date') }]">
            <label :for="`date-${stepNr}`">Date:</label>
            <div class="input-group col-md-3">
              <date-picker :id="`date-${stepNr}`" :config="dateConfig" v-model="date" :wrap="true"></date-picker>
              <div class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
              </div>
            </div>
            <span v-if="checkErrors('date')" class="help-block">{{ validationMessage }}</span>
        </div>

        <div :class="['form-group', { 'has-error': checkErrors('resources') }]">
            <label :for="`resources-${stepNr}`">Resources Needed:</label>
            <textarea :id="`resources-${stepNr}`" class="form-control" v-model="resources" placeholder="People, Money, Time, etc."></textarea>
            <span v-if="checkErrors('resources')" class="help-block">{{ validationMessage }}</span>
        </div>

    </div>
</template>

<script>
export default {

    name: "PlanStep",

    props: ['step','stepNr', 'isLast', 'canDelete'],

    data() {
        let _this = this
        return {
            dateConfig: {
                minDate: new Date(),
                format: 'MM/DD/YYYY'
            },
            hasError: {
                action: {
                    val: false,
                    validate: function() {
                        this.val = _this.action == ""
                    }
                },
                date: {
                    val: false,
                    validate: function() {
                        this.val = _this.date == ""
                    }
                },
                resources: {
                    val: false,
                    validate: function() {
                        this.val = _this.resources == ""
                    }
                }
            },
            validationMessage: 'Required Field'
        }
    },

    computed: {

        action: {
            get() {
                return this.step.action
            },
            set(val) {
                this.step.action = val
            }
        },

        resources: {
            get() {
                return this.step.resources
            },
            set(val) {
                this.step.resources = val
            }
        },

        date: {
            get() {
                return this.step.date
            },
            set(val) {
                this.step.date = val
            }
        }
    },

    methods: {
        checkErrors( key ) {
            return this.hasError[key].val
        },

        deleteStep() {
            this.$emit('deleteStep', this.stepNr-1)
        },

        moveDown() {
            this.$emit('moveDown', this.stepNr-1)
        },

        moveUp() {
            this.$emit('moveUp', this.stepNr-1)
        },

        validate() {
            let hasErrors
            Object.keys( this.hasError ).forEach( key => {
                let dataObject = this.hasError[key]
                dataObject.validate()
                if( dataObject.val ) hasErrors = true
            })
            this.step.hasError = hasErrors
        }
    },

    mounted() {
        this.$parent.$on('validateStep', () => this.validate())
    }
}

</script>

<style lang="scss" scoped>
</style>
