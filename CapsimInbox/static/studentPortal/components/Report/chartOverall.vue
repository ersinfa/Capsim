<template>
    <div class="overall-chart">
        <div class="progress">
            <div v-for="(step,idx) in steps" :class="['bar-step', { 'long': (step.toString().indexOf('5') == 1) }]" :style="`left: ${step}%`">
                <div :step="idx" class="label-percent">{{step}}</div>
                <div class="label-line"></div>
            </div>
            <div class="progress-bar" :style="`width: ${score}%;`"></div>
        </div>
    </div>
</template>

<script>

export default {
    props : {
        score : {
            required: true
        }
    },
    data() {
        return {
            steps: [0, 10, 25, 50, 75, 90, 100]
        }
    }
}


</script>
<style lang="scss">

@media print {
    .progress-bar {
        background-color: #7597a2 !important;
    }
}

.overall-chart {

    .progress-bar {
        background: #7597a2;
        box-shadow: none;
    }

    .progress {
        border: 2px solid #003f54;
        height: 45px;
        position: relative;
        border-radius: 0;
        overflow: visible;
    }

    .bar-step {
        position:absolute;
        margin-top: 10px;
        z-index: 1;
        font-size: 16px;
        bottom: -1px;

        .label-line {
            height: 10px;
        }

        &:first-of-type {
            left: -1px !important;
        }

        &.long {
            .label-line {
                height: 20px;
            }
            .label-percent {
                top: 20px;
            }
        }
    }

    .label-txt {
        float: left;
    }

    .label-line {
        float: right;
        background: #003f54;
        width:1px;
    }

    .label-percent {
        top: 10px;
        position: absolute;
        margin-left: -8px;
		&[step="0"] {
			margin-left: -2px
		}
		&[step="6"] {
			margin-left: -22px
		}
    }
}
</style>
