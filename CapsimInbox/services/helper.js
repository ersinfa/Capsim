Helper = function( data ) { return Object.assign( this, data ) }

const moment = require('moment')
module.exports = Object.assign( Helper.prototype, {
    shuffle(array, seed) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        seed = seed || 1;
        let random = function() {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },
    order(list){
        return list.map( (element,index) => {
            element.sequence = index
            return element
        })
    },
    concat(timer, sectionSettings, studentSetting) {
        // const { exam } = (sectionSettings !== undefined) ? JSON.parse(sectionSettings.settingJSON) : {}
        // const { webapp } = (studentSetting !== undefined) ? JSON.parse(studentSetting.settingJSON) : {}

        // webapp overrides exam, exam overrides timer, timer is the default 
        let exam = (sectionSettings !== undefined) ? JSON.parse(sectionSettings.settingJSON) : {}
        let webapp = (studentSetting !== undefined) ? JSON.parse(studentSetting.settingJSON) : {}

        exam = (exam.exam !== undefined) ? exam.exam : {}
        webapp = (webapp.webapp !== undefined) ? webapp.webapp : {}

        exam = (exam.data !== undefined) ? exam.data : {}
        webapp = (webapp.data !== undefined) ? webapp.data : {}
        
        exam = (exam.time !== undefined) ? exam.time : undefined
        webapp = (webapp.additionalTime !== undefined) ? webapp.additionalTime : undefined

        timer = (exam !== undefined) ? exam : timer

        let assessment = (studentSetting !== undefined) ? JSON.parse(studentSetting.settingJSON) : {}
        assessment = (assessment.assessment !== undefined) ? assessment.assessment : {}
        if(assessment.timer !== undefined) timer = assessment.timer

        timer = (webapp !== undefined) ? webapp : timer
        // (parseInt(timer) + parseInt(webapp))
        return timer
    },
    timeDifference(timer, dateTime) {
        const now = moment()
        const difference = moment(dateTime).diff(now)
        // Might want to round down because we dont want students to get extra time on the exam
        // const duration = Math.floor(moment.duration(difference).asMinutes())
        const duration = moment.duration(difference).asMinutes()
        const offset = (timer + duration)
        return (offset > 0) ? offset : 0
    },
    shuffleAnswers(emails, stsKey) {
        emails.forEach(email =>{
            let tempSortable = []
            const tempNonSortable = []
            for(let i = email.answers.length-1; i >= 0 ; i--){
                if(email.answers[i].isNotRandomized == 1){
                    tempNonSortable.push({index:i,val:email.answers[i]})
                }else{
                    tempSortable.push(email.answers[i])
                }
            }
            tempSortable = this.shuffle(tempSortable, stsKey+email.questionKey)
            for(let i = tempNonSortable.length-1; i>= 0 ; i--){
                tempSortable.splice(tempNonSortable[i].index,0,tempNonSortable[i].val)
            }
            email.answers = tempSortable
        })
        return emails
    },
})
