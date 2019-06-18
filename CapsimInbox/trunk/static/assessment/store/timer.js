const getTimeRemaining = (endtime) => {
    const t = Date.parse(endtime) - Date.parse(new Date())
    const seconds = Math.floor((t / 1000) % 60)
    const minutes = Math.floor((t / 1000 / 60))
    return {
        total: t,
        minutes,
        seconds
    }
}

module.exports = {

    namespaced: true,

    state: {
        minutes: '',
        seconds: '',
        timeinterval: null,
        total: 1,
        totalMilliseconds: 0,
        deadline:0,
        timerClass:"",
        hour: 0
    },

    actions: {
        initializeClock: ({ commit, state, rootGetters, rootState }) => {
            state.deadline = new Date(Date.parse(new Date()) + rootState.timer * 60 * 1000)
            state.totalMilliseconds = rootState.timer * 60 * 1000
            // For inbox time management do something diferent, BUG-2928 and BUG-2922
            if(rootState.versionKey == 223){
                if(rootState.userData.startTime) {
                    state.hour = Math.floor(+rootState.userData.startTime)
                }
                state.timeinterval = setInterval(() => commit('updateClockTimeManagement', state.deadline, +rootState.userData.startTime), 1000)
            }else{
                state.timeinterval = setInterval(() => commit('updateClock', state.deadline), 1000)
            }
        }
    },

    mutations: {

        updateClock: (state, endtime, startTime) => {
            const t = getTimeRemaining(endtime)
            state.minutes = t.minutes 
            state.seconds = ('0' + t.seconds).slice(-2)
            state.total = t.total
            if (t.total <= 0) clearInterval(state.timeinterval)
        },

        updateClockTimeManagement: (state, endtime, startTime) => {
            const t = getTimeRemaining(endtime)
            //if game starts on half hour, start time will be 8.5 so we want to set minutes to 30 (can only start on hour or after 30 min)
            const additionalMinutes = startTime % 1 == 0 ? 0 : 30 * 60 * 1000
            state.seconds = ('0' + t.seconds).slice(-2)
            //handling for showTimerAsClock...if hour is populated on state we know showTimerAsClock is enabled; subtract totalMilliseconds from total to get time surpassed and count up instead of down
            state.minutes = state.hour > 0 ? ('0' + Math.floor((((state.totalMilliseconds +  additionalMinutes) - state.total ) / (1000 * 60))) % 60).slice(-2) : t.minutes 
            state.total = t.total
            if( +state.minutes % 60 == 0  && state.seconds == '59' ){
                state.hour = state.hour + 1
            }
        },

        UPDATE_DEADLINE: (state, timeImpact) => {
            if(timeImpact != 0){
                state.timerClass = "timeImpactEffect"
                state.deadline = (new Date(Date.parse(state.deadline) + timeImpact*1000))
                setTimeout(()=>{ state.timerClass = "" }, 2000);
            }
        }
    },

    getters: {
        elapsed: (state, getters, rootState) => {
            // For inbox time management do something diferent, BUG-2928 and BUG-2922
            if(rootState.versionKey == 223){
                if(state.total > 1){
                    return state.totalMilliseconds - state.total
                }
            }
            else{
                return state.totalMilliseconds - state.total
            }
        }, 
        currentTime: (state) => state.total
    }
}
