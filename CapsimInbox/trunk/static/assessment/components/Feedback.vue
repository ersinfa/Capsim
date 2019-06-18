<template>
    <div id="feedback" class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
        <br>
        <div style="margin: 40px 0;">
        <img src="/capsiminbox/images/CapsimInbox_Logo.png" height="85" class="center-block" alt="Capsim Inbox Text">
        </div>
        <br>
        <div v-if="roleObj" class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading" style="background-color: #33CC99;">
                    <h1 style="font-weight: bold;">Thank you for completing the CapsimInbox demo experience!</h1>
                </div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-6" >
                            <br>
                            <p v-html="roleObj.role" class='lead'></p>
                            <br>
                        </div>
                    <div class="col-md-6 text-center">
                        <!-- <a target="_blank" :href="`${$store.state.assetsPath}/capsiminbox/pdfs/${roleObj.pdfFile}`"> -->
                        <!--This link won't work on local/dev/qa1.... it is soft-skill-development.pdf, upload via putty to get better file name-->
                            <a target="_blank" :href="`${$store.state.assetsPath}/capsiminbox/pdfs/27423d31-488c-4c7b-91fb-1ad1cc153d86.pdf`">
                                <img class="img-thumbnail" src="/capsiminbox/images/Soft_Skills_Thumbnail.png" style="width: 50%; height: 50%;" alt="results report">
                            </a>
                            <div class="clearfix"></div>
                            <!-- <a class="link-text" target="_blank" :href="`${$store.state.assetsPath}/capsiminbox/pdfs/${roleObj.pdfFile}`">View Sample Report</a> -->
                           
                        </div>
                    </div>    
                </div>
            </div>
        </div>
        <modal :showFooter="false" :show-okay="false" id="survey" ref="modal">
            <h3 slot="title" style="margin-top: 10px">Thank you for completing CapsimInbox</h3>
            <div slot="body">

                <p class="lead">How was your experience? Please provide us with your feedback below.</p>

                <form>

                    <div class="mb-20">
                       <p><strong>What is your first reaction to CapsimInbox:</strong></p>
                        <vue-slider 
                        v-model="form.demoRate1" 
                        :data="['Very negative', 'Somewhat negative', 'Neutral', 'Somewhat Positive', 'Very Positive']" 
                        :piecewiseLabel="true" 
                        :piecewiseStyle="slider.piecewiseStyle"
                        :disabled="slider.disabled"
                        :tooltip="slider.tooltip"
                        :piecewise="slider.piecewise"
                        :piecewiseActiveStyle="slider.piecewiseActiveStyle"
                        :labelActiveStyle="slider.labelActiveStyle"
                        :width="slider.width"
                        :style="slider.style"
                        ></vue-slider>
                    </div><br/>
                    
                    <div class="mb-20">
                       <p><strong>How would you rate the usefulness of CapsimInbox?</strong></p>
                        <vue-slider 
                        v-model="form.demoRate2" 
                        :data="['Poor', 'Below average', 'Average', 'Above average', 'Excellent']" 
                        :piecewiseLabel="true" 
                        :piecewiseStyle="slider.piecewiseStyle"
                        :disabled="slider.disabled"
                        :tooltip="slider.tooltip"
                        :piecewise="slider.piecewise"
                        :piecewiseActiveStyle="slider.piecewiseActiveStyle"
                        :labelActiveStyle="slider.labelActiveStyle"
                        :width="slider.width"
                        :style="slider.style"
                        ></vue-slider>
                    </div><br/>
                    
                    <div class="mb-20">
                       <p><strong>How important is soft skill development to your program?</strong></p>
                        <vue-slider 
                        v-model="form.demoRate3" 
                        :data="['Not at all important', 'Not so important', 'Somewhat important', 'Very important', 'Extremely important']" 
                        :piecewiseLabel="true" 
                        :piecewiseStyle="slider.piecewiseStyle"
                        :disabled="slider.disabled"
                        :tooltip="slider.tooltip"
                        :piecewise="slider.piecewise"
                        :piecewiseActiveStyle="slider.piecewiseActiveStyle"
                        :labelActiveStyle="slider.labelActiveStyle"
                        :width="slider.width"
                        :style="slider.style"
                        ></vue-slider>
                    </div><br/>

                    <div class="mb-20">
                       <p><strong>How likely would you be to use CapsimInbox in your own program?</strong></p>
                        <vue-slider 
                        v-model="form.demoRate4" 
                        :data="['Not at all likely', 'Not so likely', 'Somewhat likely', 'Very likely', 'Extremely likely']" 
                        :piecewiseLabel="true" 
                        :piecewiseStyle="slider.piecewiseStyle"
                        :disabled="slider.disabled"
                        :tooltip="slider.tooltip"
                        :piecewise="slider.piecewise"
                        :piecewiseActiveStyle="slider.piecewiseActiveStyle"
                        :labelActiveStyle="slider.labelActiveStyle"
                        :width="slider.width"
                        :style="slider.style"
                        ></vue-slider>
                    </div><br/>

                    <div class="mb-20">
                       <p><strong>How likely is it that you would recommend CapsimInbox to a colleague?</strong></p>
                       <div class="pull-left">Not at all likely</div>
                       <div class="pull-right">Extremely likely</div>
                       <div class="clearfix"></div>
                        <vue-slider 
                        v-model="form.demoRate5" 
                        :data="[1,2,3,4,5,6,7,8,9,10]" 
                        :piecewiseLabel="true" 
                        :piecewiseStyle="slider.piecewiseStyle"
                        :disabled="slider.disabled"
                        :tooltip="slider.tooltip"
                        :piecewise="slider.piecewise"
                        :piecewiseActiveStyle="slider.piecewiseActiveStyle"
                        :labelActiveStyle="slider.labelActiveStyle"
                        :width="slider.width"
                        :style="slider.style"
                        ></vue-slider>
                    </div><br/>
                  

                     <div class="form-group">
                        <label for="feedback1">What are the things that you like most about CapsimInbox? </label>
                        <textarea class="form-control" v-model="form.comments1" rows="3" id="feedback1"></textarea>
                    </div>
                     <div class="form-group">
                        <label for="feedback2">What are the things that you would most like to improve in CapsimInbox? </label>
                        <textarea class="form-control" v-model="form.comments2" rows="3" id="feedback2"></textarea>
                    </div>

                     <div class="mb-20">
                      <strong class="mr-10"> Would you like a full demo? <span v-show="form.fullDemo">{{ form.fullDemo }}</span></strong>
                      <span v-show="form.fullDemo == null">
                        <button @click.prevent="form.fullDemo = 'Yes'" class="btn btn-success">Yes</button>
                        <button @click.prevent="form.fullDemo = 'No'" class="btn btn-danger">No</button>
                      </span>
                    </div>

                    <p v-show="form.fullDemo == 'Yes'">
                        <a href="https://calendly.com/capsim_welcome/capsiminbox-demo" target="_blank">Schedule Demo Here</a>
                    </p>
   
                    <div class="form-submit">
                        <button @click.prevent="sendFeedback" class="btn btn-success">Submit</button>
                    </div>
                </form>
            </div>
        </modal>
    </div>
</template>
<script>

import vueSlider from 'vue-slider-component';

export default {

    name: "feedback",

    data: () => {
        return{
            windowHeight: 0,
            show:false,
        form: {
            comments1: '',
            comments2: '',
            feedback: null,
            fullDemo: null,
            demoRate1: 'Neutral',
            demoRate2: 'Average',
            demoRate3: 'Somewhat important',
            demoRate4: 'Somewhat likely',
            demoRate5: 5,
        },
        initial: true,
        slider:{
            width: "80%",
            tooltip: false,
            disabled: false,
            piecewise: true,
            piecewiseLabel: true,
            style: {
            "marginLeft": "10%"
            },
            piecewiseStyle: {
            "backgroundColor": "#ccc",
            "visibility": "visible",
            "width": "12px",
            "height": "12px"
            },
            piecewiseActiveStyle: {
            "backgroundColor": "#3498db"
            },
            labelActiveStyle: {
            "color": "#3498db"
            }
        }
        }
    },

    components: {
        modal: require('../../shared_components/Modal.vue'),
        vueSlider
    },

    computed: {
        roleObj() {
            return this.$store.state.role
        },
        pageHeight() {
            return `${this.windowHeight}px`
        },
    },

    methods: {

        toggleFeedback(feedback) {
            if( this.initial ) this.initial = false
            this.form.feedback = feedback
        },

        sendFeedback() {
            $.ajax({
                url: '/capsiminbox/demo/send-mail',
                method: 'post',
                data: JSON.stringify(this.form),
                contentType: 'application/json'
            })
            .done( () => $('#survey').modal('hide') )
            .catch( err => console.log(err) )
        }
    },

    created() {
        if( !this.$store.state.role ) this.$store.commit('SET_STATE')
        
    },

    mounted() {
        $('#survey').modal('show')
       setTimeout( () => this.$refs.modal.$children.forEach( el => el.refresh() ), 500 )

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


@mixin rangeThumb {
  width: 18px;
  height: 18px;
  margin: -8px 0  0;
  border-radius: 50%;
  background: #37adbf;
  cursor: pointer;
  border: 0 !important;
}

@mixin rangeTrack {
  width: 100%;
  height: 2px;
  cursor: pointer;
  background: #b2b2b2;
}

.range {
  position: relative;
  width: 100%;
  height: 5px;
}

.range input {
  width: 100%;
  position: absolute;
  top: 2px;
  height: 0;
  -webkit-appearance: none;

  // Thumb
  &::-webkit-slider-thumb {
    -webkit-appearance: none; // needed again for Chrome & Safari
    @include rangeThumb;
  }

  &::-moz-range-thumb {
    @include rangeThumb;
  }

  &::-ms-thumb {
    @include rangeThumb;
  }

  // Track
  &::-webkit-slider-runnable-track {
    @include rangeTrack;
  }

  &::-moz-range-track {
    @include rangeTrack;
  }

  &::-ms-track {
    @include rangeTrack;
  }

  &:focus { // override outline/background on focus
    background: none;
    outline: none;
  }

  &::-ms-track { // A little somethin' somethin' for IE
    width: 100%;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
}

// Labels below slider
.range-labels {
  margin: 18px -41px 0;
  padding: 0;
  list-style: none;
  
  li {
    position: relative;
    float: left;
    width: 90.25px;
    text-align: center;
    color: #b2b2b2;
    font-size: 14px;
    cursor: pointer;
    
    &::before {
      position: absolute;
      top: -25px;
      right: 0;
      left: 0;
      content: "";
      margin: 0 auto;
      width: 9px;
      height: 9px;
      background: #b2b2b2;
      border-radius: 50%;
    }
  }
  
  .active {
    color: #37adbf;
  }
  
  .selected::before {
    background: #37adbf;
  }
  
  .active.selected::before {
    display: none;
  }
}




// .range-labels {
//     width:100%;
//   margin: 18px -41px 0;
//   padding: 0;
//   list-style: none;
// }
// li {
//     position: relative;
//     float: left;
//     width: 20%;
//     text-align: center;
//     color: #b2b2b2;
//     font-size: 14px;
//     cursor: pointer;
    
//   }

.thumbs {
    text-align: center;
    font-size: 10rem;

    .glyphicon {

        color: lightgrey;

        &:nth-of-type(1) {
            &.active {
                color: green;
            }
            margin-right: 50px;
        }

        &:nth-of-type(2) {
            &.active {
                color: red;
            }
            margin-left: 50px;
        }
    }
}

.img-thumbnail {
    margin-bottom: 15px;
}

.link-text {
    font-size: 2rem;
    color: black;
    text-decoration: underline;
}

.form-submit {
    text-align: right;
}


</style>
