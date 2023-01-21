<template>
  <div class="welcomepage" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div class="welcome-page" :style="{ marginTop: marginTop}" >
      <div class="col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2 logo">
        <img src="/capsiminbox/images/CapsimInbox_Logo_White_withTM.jpg" alt="">
      </div>
    </div>
    <div class="clearfix"></div>
        <div ref="userForm" class="" style="margin: auto; width: 25%;">
            <div class="well user-info">
                <h2 class="mt-0 mb-20 text-center" style="color: #044256; font-weight: bold;">Access Demo</h2>
                <form>
                    <div v-for="(input, key) in user" :class="['form-group', {'has-error': errors[key]} ]">
                        <label :for="input.label.split(' ').join('-')">{{ input.label }}</label>
                        <input v-model="input.val" type="text" class="form-control" :id="input.label.split(' ').join('-')" :placeholder="input.label">
                        <span v-if="errors[key]" class="help-block">{{ errors[key] }}</span>
                    </div>
                    <span class='text-danger'>Note: Please be aware that this demo of CapsimInbox is not meant to be shared with students.</span>
                    <br>
                    <br>
                    <button class="btn btn-success mat submit pull-right pr-15 pl-15" @click.prevent="submit">
                      <span class="start-demo-text" style>Start Demo</span>
                    </button>
                    <div class="clearfix"></div>
                </form>
            </div>
        </div>
  </div>
</template>

<script>

module.exports = {

    name: 'welcome',

    data() {
        return {
            windowHeight: 0,
            user: {
                firstname: {
                    val: '',
                    label: 'First Name',
                    validate() {
                        return (this.val.length >= 3)
                    }
                },
                lastname: {
                    val: '',
                    label: 'Last Name',
                    validate() {
                        return (this.val.length >= 3)
                    }
                },
                email: {
                    val: '',
                    label: 'Email',
                    validate() {
                        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.val)
                    }
                },
                school: {
                    val: '',
                    label: 'Institution/Organization',
                    validate() {
                        return (this.val.length > 3)
                    }
                },
            },
            errors: {}
        }
    },

    computed: {
        pageHeight() {
            return `${this.windowHeight}px`
        },
    },

    methods: {

        submit() {

            const payload = {
                firstname: this.user.firstname.val,
                lastname: this.user.lastname.val,
                email: this.user.email.val,
                school: this.user.school.val,
            }

            this.validateForm()
            .then( () => this.$store.dispatch('SET_USER', payload) )
            .then( () => this.$router.push({ name: 'assessment' }) )
            .catch( () => console.log('Error') )
        },

        validateForm() {
            return new Promise( (resolve, reject) => {
                this.$set(this.$data, 'errors', {})
                let hasErrors = false
                Object.keys(this.user).forEach( input => {
                    if(!this.user[input].validate()) {
                        this.errors[input] = `Please enter a valid ${this.user[input].label.toLowerCase()}`
                        hasErrors = true
                    }
                })
                return (hasErrors) ? reject() : resolve()
            })
        }
    },
    mounted() {
       this.windowHeight = window.innerHeight
        this.$nextTick(() => {
            window.addEventListener('resize', () => {
                this.windowHeight = window.innerHeight
            });
        })
        


    }

}

</script>

<style lang="scss" scoped>

.logo {
    margin-top: 50px;
}

.user-info {
    float: none;
    margin-left: auto;
    margin-right: auto;
    margin-top: 30px;
    box-shadow: 0px 0px 15px 1px rgba(118, 118, 118, 0.36);

    .submit {
        height: 50px;
        border-radius: 10px;
        background: #33CC99;


        .start-demo-text {
            font-size: 16px;
            letter-spacing: 1px;
            color: black;
            font-weight: bold;
        }
    }
}

label {
    font-size: 1.3em;
}

input {
    box-shadow: 1px 1px #cfd1d6;
    height: 50px;
    font-size: 18px;
}

.welcomepage {
    position:fixed;
    padding:0;
    margin:0;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    background: #003F54;
}


</style>
