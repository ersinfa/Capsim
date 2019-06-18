import moment from 'moment'
import * as numberFormatter from "accounting"

const findDependant = (retVal, el, answers) => {
    // if( answers.includes(el.dependsOn) ) retVal.push(el.questionKey)

    el.dependencies.map(dependency=>{
        if (answers.indexOf(dependency.FK_answerKey) > -1 ) retVal.push(dependency.FK_questionKey)
    })
    
    return retVal
}
// const findDependant = (retVal, el, answerkey) => {
//     if( el.dependsOn === answerkey ) retVal.push(el.questionKey)
//     return retVal
// }

const nextTimestamp = () => moment().format('[Today], h:mm a')

const nextClockTimestamp = (h, m, additionalTime) => moment({day: 4, hour: h, minute: +m + additionalTime}).format('[Today], h:mm a')

const generateTimestamp = ( length, idx ) => {

    const timestamp = moment().startOf('week').subtract(2, 'days').add(8,'h')
    .add( ( (length - idx) * ( 2300000 - (idx * 1000) ) ), 'ms').format('ddd, h:mm a')

    return timestamp
}

const generateClockTimestamp = ( length, sequence, timeDelay ) => {

    let timestamp = ""
    if(timeDelay > 0){
        let additionalTime = Math.floor(timeDelay / (60 * 1000))
        timestamp = nextClockTimestamp(8, 30, additionalTime)
    } else {
        timestamp = moment({day: 4, hour: 8, minute: 30})
        .add( ( (length - sequence) * ( 1400000 - (sequence * 30000) ) ), 'ms').format('ddd, h:mm a')
    }

    return timestamp
}


const parseEmails = (data, {postAssessment}) => {
    const emailsLength = data.emails.length
    const evalRegex = /####.*?####/g; 
    const advancedReport = data.advancedReport
    return data.emails.map( (elem, idx) => {

        const timestamp = !postAssessment 
            ? (elem.dependsOn == null) ? generateTimestamp(emailsLength, idx) : null
            : (elem.dependencies.length == 0 && elem.timer == 0 ) ? generateClockTimestamp(emailsLength, elem.sequence, 0) : null

        Object.assign(elem, {
            isRead: false,
            isFlagged: false,
            timestamp
        })

        // Evaluates dynamic content
        elem.answers.map(answer => {
            const answerText = answer.nameTagKey; 
            if(answerText){
                try {
                    let mathces = answer.nameTagKey.match(evalRegex);
                    if(mathces != null){
                        for(let i=0;i<mathces.length;i++){
                            let temp = mathces[i].replace(/####/g,'')
                            answer.nameTagKey = answer.nameTagKey.replace(mathces[i],eval(temp))
                        }
                    }
                } catch (error) {
                    console.log(error); 
                }
            }
            return answer; 
        }); 

        let mathces = elem.descriptionTagKey.match(evalRegex);
        if(mathces != null){
            try {
                for(let i=0;i<mathces.length;i++){
                    let temp = mathces[i].replace(/####/g,'')
                    elem.descriptionTagKey = elem.descriptionTagKey.replace(mathces[i],eval(temp))
                }
            } catch (error) {
                console.log(error); 
            }
        }

        return elem
    })
}


const parseMessages = (data, { firstname, lastname }) => {
    return data.messages.map( elem => {
        elem.descriptionTagKey = elem.descriptionTagKey.replace(/{name}/g, `${firstname}`)
        Object.assign(elem, { isSent: false, isRead: false })
        return elem
    })
}

const parseData = ( data, userData) => {
    data.emails = parseEmails( data, userData )
    data.messages = parseMessages( data, userData )
    data.folders.forEach( elem => elem.isOpen = false )
    return data
}

module.exports = { parseData, generateTimestamp, nextTimestamp, nextClockTimestamp, findDependant }
