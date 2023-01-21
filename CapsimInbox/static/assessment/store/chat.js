import { findDependant } from './helpers'

module.exports = {

    namespaced: true,

    state: {
        messages: [],
        messagesCompleted: false
    },

    actions: {
        ANSWER_MESSAGE: ({ commit, rootGetters, getters, rootState }, { questionkey, answerkey, isMessage }) => {
            return new Promise(function(resolve, reject) {
                if(rootState['assessmentTypeKey'] == 1){
                    $.post({ url: '/capsiminbox/webapp/answer', dataType: 'json', data: { answerkey, questionkey, isMessage } })
                    .then( () => {
                        let answers = (typeof answerkey == 'object')? answerkey : [answerkey]
                        const dependantEmails = rootGetters['email/threadEmails'].reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                        const dependantMessages = getters.messagesFromThread.reduce( (retVal, el) => findDependant(retVal, el, answers), [])
        
                        //Add dependant emails to active emails
                        commit('email/SET_DEPENDANT', {questionKeys: dependantEmails, rootGetters, time: {minutes: rootState.time.minutes, hour: rootState.time.hour }}, { root: true })
                        //Add dependant messages to queue
                        commit('SET_DEPENDANT', { questionKeys: dependantMessages, rootGetters })
                        commit('ANSWER_MESSAGE', { questionkey, answerkey, rootGetters })
                        resolve()
                       
                    })
                    .catch( err => {
                        err.hardCodededResponse = {
                            message: 'It looks like your exam session has been disconnected. Please log out and log back in to resume your exam.',
                            displayLogOutBtutton : 1
                        }
                        reject(err)} 
                    )
                }else{
                    let answers = (typeof answerkey == 'object')? answerkey : [answerkey]
                    const dependantEmails = rootGetters['email/threadEmails'].reduce( (retVal, el) => findDependant(retVal, el, answers), [])
                    const dependantMessages = getters.messagesFromThread.reduce( (retVal, el) => findDependant(retVal, el, answers), [])

                    //Add dependant emails to active emails
                    commit('email/SET_DEPENDANT', {questionKeys: dependantEmails, rootGetters, time: {minutes: rootState.time.minutes, hour: rootState.time.hour }}, { root: true })
                    //Add dependant messages to queue
                    commit('SET_DEPENDANT', { questionKeys: dependantMessages, rootGetters })
                    commit('ANSWER_MESSAGE', { questionkey, answerkey, rootGetters })
                    resolve()
                }
                
            })
        }
    },

    mutations: {

        ANSWER_MESSAGE: (state, { questionkey, answerkey, rootGetters }) => {

            const message = state.messages.find( question => question.questionKey === questionkey )
            let answers = (typeof answerkey == 'object')? answerkey : [answerkey]

            //Set answer picked on question
            Vue.set(message, 'answer', message.answers.filter( answer => answers.includes(answer.answerKey) ))
            // Vue.set(message, 'answer', message.answers.find( answer => answer.answerKey === answerkey ))
            Vue.set(message, 'isSent', true)
            Vue.set(message, 'isRead', true)
        },

        SET_DEPENDANT: (state, { questionKeys, rootGetters }) => {

            state.messages
            .filter( e => questionKeys.indexOf(e.questionKey) !== -1 )
            .forEach( messageToPush => {
                Vue.set(messageToPush, 'timer', messageToPush.timer + rootGetters['time/elapsed'])
                //Vue.delete(messageToPush, 'dependsOn')
                Vue.set( messageToPush, 'dependencies', [] )
            })
        },

        SET_MESSAGES: (state, messages) => state.messages = messages,

        SET_IS_READ: (state, questionKeys) => state.messages.forEach( m => {
            if(questionKeys.indexOf(m.questionKey) !== -1 && !m.isRead) Vue.set(m, 'isRead', true)
        })
    },

    getters: {

        messages: ( state ) => state.messages,

        messagesFromThread: ( state ) => state.messages.filter( m => m.dependencies.length > 0 ),

        activeMessages: ( state ) => state.messages.filter( m => m.dependencies.length == 0),

        messagesCompleted: ( state, getters ) => getters.activeMessages.filter( m => m.answers.length > 0 ).every( m => m.answer !== undefined )

    }

}
