<template>
    <div class="overall-chart">
        <div class="progress">
            <div v-for="(step,idx) in steps" :class="'bar-step'" :style="`left: ${step}%`">
                <div :step="idx" class="label-percent-KI">{{idx}}</div>
                <div class="label-line"></div>
            </div>
            <div class="progress-bar" :style="`width: ${steps[score]}%;`"></div>
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
            steps: [0, 14.28, 28.57, 42.88, 57.17, 71.42, 85.71, 100]
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

    }

    .label-txt {
        float: right;
    }

    .label-line {
        float: right;
        background: #003f54;
        width:1px;
    }

    .label-percent-KI {
        top: 10px;
        position: absolute;
        margin-left: -6px;
    }
}
</style>
