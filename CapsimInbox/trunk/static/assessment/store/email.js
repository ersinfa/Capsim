import { nextTimestamp, nextClockTimestamp, findDependant } from './helpers'

module.exports = {

    namespaced: true,

    state: {
        emails: []
    },

    actions: {

        ANSWER_EMAIL: ({ commit, rootGetters, getters, rootState }, { questionkey, answerkey, isSmartThreading }) => {
            return new Promise(function(resolve, reject) {
                
                if(rootState['assessmentTypeKey'] == 1){
                    let payload = { answerkey, questionkey, isSmartThreading }
                    $.post({ url: '/capsiminbox/webapp/answer', dataType: 'json', data: payload })
                    .then( () => {
                        let answers = (typeof answerkey == 'object') ? answerkey : [answerkey]
                        const dependantEmails = getters.threadEmails.reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                        const dependantMessages = rootGetters['chat/messagesFromThread'].reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                        commit('SET_DEPENDANT', {questionKeys: dependantEmails, rootGetters, time: {minutes: rootState.time.minutes, hour: rootState.time.hour }})
                        commit('chat/SET_DEPENDANT', { questionKeys: dependantMessages, rootGetters }, { root: true })
                        commit('ANSWER_EMAIL', { questionkey, answerkey, isSmartThreading })
                        resolve()
                    })
                    .catch( err => {
                        console.log('err',err)
                        // err = JSON.parse(err)
                        // console.log('err',err)
                        err.hardCodededResponse = {
                            message: 'It looks like your exam session has been disconnected. Please log out and log back in to resume your exam.',
                            displayLogOutBtutton : 1
                        }
                        // err.showLogOutButton = 1
                        // err = JSON.stringify(err)
                        console.log('err',err.status)
                        reject(err) })
                }else{
                    let answers = (typeof answerkey == 'object') ? answerkey : [answerkey]
                    const dependantEmails = getters.threadEmails.reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                    const dependantMessages = rootGetters['chat/messagesFromThread'].reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                    //Add dependant emails to queue
                    // if(dependantEmails.length > 0){
                        commit('SET_DEPENDANT', {questionKeys: dependantEmails, rootGetters, time: {minutes: rootState.time.minutes, hour: rootState.time.hour }})
                    //}
                    //Add dependant chat meesages active messages
                    //if(dependantMessages.length > 0){
                        commit('chat/SET_DEPENDANT', { questionKeys: dependantMessages, rootGetters }, { root: true })
                    //}
                    commit('ANSWER_EMAIL', { questionkey, answerkey, isSmartThreading })
    
                    resolve()
                }

                
            })
        },

        CLEAR_EMAIL:({ state, commit, rootState }, { questionkey, oldAnswerkey }) => {
            if(rootState['assessmentTypeKey'] == 1){
                return new Promise(function(resolve, reject) {
                    
                    const payload = { questionkey, oldAnswerkey }
                    $.ajax({
                        url: '/capsiminbox/webapp/delete',
                        method: 'POST',
                        dataType: 'json',
                        contentType: 'application/json;charset=utf-8',
                        data: JSON.stringify(payload)
                    })
                    .then( () => {                
                        resolve()
                    })
                    .catch( err => {
                        err.hardCodededResponse = {
                            message: 'It looks like your exam session has been disconnected. Please log out and log back in to resume your exam.',
                            displayLogOutBtutton : 1
                        }
                        reject(err)} 
                    )
                })
            }
        },

        ANSWER_EMAIL_WRITTEN: ({ commit }, { questionkey, writtenResponse }) => {
            return new Promise(function(resolve, reject) {
                let payload = { questionkey, writtenResponse }
                $.post({ url: '/capsiminbox/webapp/written', dataType: 'json', data: payload })
                .then( () => {
                    commit('ANSWER_EMAIL_WRITTEN', payload)
                    resolve()
                })
                .catch( err => reject(err) )
            })
        },

        UPDATE_EMAIL:({ state, commit, rootState }, { questionkey, oldAnswerkey, newAnswerkey }) => {
            commit('ANSWER_EMAIL', { questionkey, answerkey:newAnswerkey }) 
            if(rootState['assessmentTypeKey'] == 1){
                return new Promise(function(resolve, reject) {
                    const payload = { questionkey, oldAnswerkey, newAnswerkey }
                    $.ajax({
                        url: '/capsiminbox/webapp/update',
                        method: 'POST',
                        dataType: 'json',
                        contentType: 'application/json;charset=utf-8',
                        data: JSON.stringify(payload)
                    })
                    .then( () => {
                        commit('ANSWER_EMAIL', { questionkey, answerkey:newAnswerkey })                    
                        resolve()
                    })
                    .catch( err => reject(err) )
                })    
            }
            
        },

        READ_EMAIL: ({ commit, rootState }, { objectKey, isRead }) => {

            if(isRead) return

            if(rootState['assessmentTypeKey'] == 1){
                const payload = { actionKey: 5, objectKey }

                $.post({ url: '/capsiminbox/webapp/log-activity', dataType: 'json', data: payload })
                .done( () => commit('READ_EMAIL', objectKey))
                .fail( err => console.log(err) )
            }
        },

        TOGGLE_FLAG: ({ commit, assessmentTypeKey, rootState }, {objectKey, activityValue}) => {

            if(rootState['assessmentTypeKey'] == 1){
                const payload = { actionKey: 7, objectKey, activityValue  }

                $.post({ url: '/capsiminbox/webapp/log-activity', dataType: 'json', data: payload })
                .done( () => commit('TOGGLE_FLAG', { id: objectKey, value: activityValue }) )
                .fail( err => console.log(err) )
            }else{
                commit('TOGGLE_FLAG', { id: objectKey, value: activityValue })
            }
        }
    },

    mutations: {

        ANSWER_EMAIL: (state, { questionkey, answerkey }) => {
            const question = state.emails.find( question => question.questionKey === questionkey )
            let answers = (typeof answerkey == 'object')? answerkey : [answerkey]
            let answer = question.answers.filter( answer => answers.includes(answer.answerKey) )
            
            //Set answer property in question and isSent to true
            Vue.set(question, 'answer', answer)
            
            if(question.isSmartThreading != 1){
                Vue.set(question, 'isSent', true)
            }
        },

        ANSWER_EMAIL_WRITTEN: (state, { questionkey, writtenResponse }) => {
            const question = state.emails.find( question => question.questionKey === questionkey )
            //Set answer property in question and isSent to true
            Vue.set(question, 'writtenResponse', writtenResponse )
            Vue.set(question, 'isSent', true)
        },
        
        SET_DEPENDANT: (state, { questionKeys, rootGetters, time }) => {
            const threadEmails = state.emails.filter( e => questionKeys.indexOf(e.questionKey) !== -1 )
            const firstSequence = Math.min.apply( Math, state.emails.map( (o) => o.sequence ) )
  
            threadEmails.forEach( e => {
                if(!rootGetters['userData'].postAssessment) {
                    Vue.set( e, 'timestamp', nextTimestamp() )
                } else {
                    let additionalTime = e.timer > 0 ? Math.floor(e.timer  / (60 * 1000)) : 0
                    if(!e.timestamp) Vue.set( e, 'timestamp', nextClockTimestamp(time.hour, time.minutes, additionalTime ) )
                }
                if(e.isSmartThreading == 0){
                    Vue.set(e, 'timer', e.timer + rootGetters['time/elapsed'])
                    Vue.set( e, 'dependencies', [] ) 
                }  
                Vue.set( e, 'sequence', firstSequence - 1 )
            })

        },

        READ_EMAIL: (state, id) => state.emails.find( email => email.questionKey === id ).isRead = true,

        SET_EMAILS: (state, emails) => Vue.set(state, 'emails', emails),

        TOGGLE_FLAG: (state, {id, value}) => state.emails.find( email => email.questionKey === id ).isFlagged = Boolean(value),

        //when are emails are delivered but there are time delay ones still pending, we select one and then update the timestamp so it reflects
        //the clock time now and not the time in the future that was set based on the time delay
        AUTO_DELIVER_EMAIL: (state, newEmail) => {
            let emailToUpdate = state.emails.find( email => email.questionKey == newEmail.questionKey )
            emailToUpdate.timestamp = newEmail.timestamp
            emailToUpdate.timer = 0 
        }   

    },

    getters: {

        activeEmails: (state, getters, rootState) => {
            return getters.sortedEmails.filter( email => {
                let showThreadedEmail = false
                let isReEntry = rootState.userData.isReEntry
                let currentCycle = rootState.cycle
                if(email.isSmartThreading == 1 && !email.failsafe ){
                    let answers = email.answers.length
                    let answeredEmails = rootState.selectedSmartThreadingAnswers 
                    let dependencyKeys = email.dependencies.map(d => d.FK_answerKey )
                    let count = answeredEmails.map(a => dependencyKeys.indexOf(a) > -1).length
                    if (email.dependencies.some(d => d.FK_answerKey == rootState.recentlySelectedAnswerKey ) && count < answers){
                        showThreadedEmail = true
                    } 
                }
                if(email.isSmartThreading == 1 && email.failsafe > 0 ){
                    //If # of answers = # of answers picked on corresponding email, then show this failsafe question
                    let correspondingEmail = state.emails.filter(e => e.questionKey == email.failsafe)
                    let correspondingAnswers = correspondingEmail[0].answers ? correspondingEmail[0].answers.length : 0
                    let answeredEmails = rootState.selectedSmartThreadingAnswers
                    let dependencyKeys = email.dependencies.map(d => d.FK_answerKey )
                    let count = answeredEmails.map(a => dependencyKeys.indexOf(a) > -1).length
                    if(count >= correspondingAnswers && email.dependencies.some(d => d.FK_answerKey == rootState.recentlySelectedAnswerKey ) ){
                        showThreadedEmail = true
                    }
                }
                // checks non-smart threading questions in re-entry scenario
                if(email.isSmartThreading != 1 && email.dependencies.some(d => d.FK_answerKey == rootState.recentlySelectedAnswerKey) ){
                    showThreadedEmail = true
                }
                let triggeredInCycle = email.triggeredInCycle
                if(!triggeredInCycle) triggeredInCycle = 1
                let showReEntryEmail = !isReEntry || (isReEntry && triggeredInCycle <= currentCycle ) || rootState.assessmentTypeKey == 2
                return (email.dependencies.length == 0 || showThreadedEmail) && showReEntryEmail
            })
        },

        answeredEmails: (state, getters) => getters.activeEmails.filter( email => (email.isSent) ),

        cleanEmails: (state, getters) => getters.activeEmails.filter( email => (!email.isSent) ),

        emailsCompleted: ((state, getters) => {
            let answeredEmails = getters.activeEmails.filter( e => e.answers.length > 0 || e.isWrittenResponse == 1 )
            return answeredEmails.every( e => (e.answer !== undefined && e.isWrittenResponse == 0 && e.isSmartThreading != 1) || (e.isSent && e.isWrittenResponse == 1))
        }),
        
        flaggedEmails: (state, getters) => getters.activeEmails.filter( email => email.isFlagged === true ),

        sortedEmails: (state) => state.emails.sort( (a,b) => {
             const aSeq = a.sequence
             const bSeq = b.sequence

             return (aSeq > bSeq) ? 1 : (aSeq < bSeq) ? -1 : 0
        }),

        threadEmails: state => state.emails.filter( email => email.dependencies.length > 0),

        unansweredEmails: (state, getters) => getters.cleanEmails.filter( email => email.answers.length > 0 ),

        firstEmail: ( state ) => state.emails.find( email => email.sequence === Math.min.apply( Math, state.emails.map( (o) => o.sequence ) ) ),

        unreadEmails: (state, getters) => getters.activeEmails.filter( email => email.isRead === false ),
    }
}
