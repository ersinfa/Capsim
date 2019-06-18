module.exports = Object.freeze({
    SKILL_1_QUESTION_POINT_VALUE: 33.33
    ,IMPORTANT_QUESTION_COUNT: 5
    ,DEVELOPMENT_INDEX:{
        LABELS_1: ['Novice','Intermediate','Advanced']
        ,LABELS_2: ['Inconsistently','Somewhat inconsistently','Somewhat consistently','Consistently']
    }
    ,SELF_AWARESNESS: {
        MATCH_RANGE: 15
       ,LABELS: ["very low","low","average","average","high","very high"]
    }
    ,LOG_ACTION_KEY:{
        START_GAME          : 1
        ,END_GAME           : 2
        ,SUBMIT_ANSWER      : 3
        ,OPEN_MESSAGE       : 4
        ,OPEN_EMAIL         : 5
        ,OPEN_FILE          : 6
        ,CLICK_IMPORTANT    : 7
    },
    MEASUREMENT_TYPE_KEY:{
        SKILL               : 1
        ,COMPETENCY         : 2
        ,LEARNING_GOAL      : 3
    },
    ASSESSMENT_TYPE_KEY:{
        WEBAPP              : 1
        ,REHEARSAL          : 2
        ,DEMO               : 3
    }

});
