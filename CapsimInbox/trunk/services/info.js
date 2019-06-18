// Later, create an interface (for initalstate), and object assign the new values. So inbox and Exam can share the same object props. 
module.exports = (isExam) => {
    if(isExam == 1 ) return {
        type:'Exam',
        product:'Modular Exam',
        respond:'Save Answer',
        dataType:'questions',
        exit:'Submit Exam',
        assessmentComplete:{
            body:`You've answered all questions in the exam. Are you ready to submit?`,
            showClose:true, 
            confirmText:'Yes, submit my final answers', 
            closeText:`No, I'd like to review my answers`,
            exit:false
        },
        assessmentConfirmation:{
            body:`Are you sure that you'd like to submit? All submissions are final.`,
            showClose:true, 
            confirmText:'Submit Exam', 
            closeText:`Return to Exam`,
            exit:true
        },
        assessmentWarning:{
            body:`You currently have unanswered questions. Would you like to return to your exam?`,
            showClose:true, 
            confirmText:'Submit Exam', 
            closeText:`Return to Exam`,
            exit:false
        },
        assessmentRehearsal: {
            body:`Take a few minutes to walk through a sample exam. Click 'Next' and get started!`,
            title:'Welcome to your tutorial!', 
        }, 
    }
    else return {
        type:'Assessment',
        product:'CapsimInbox',
        respond:'Respond',
        dataType:'emails', 
        exit:'Exit Inbox',
        assessmentComplete:{
            body:'You have completed the CapsimInbox assessment. When your instructor has released results, you can view these on the dashboard.',
            showClose:false, 
            confirmText:'Complete', 
            closeText:``,
            exit:true,
        },
        assessmentWarning:{
            body:`WARNING: Your assessment is in-progress. If you leave, the timer will continue to run until the assessment is complete.`,
            showClose:false, 
            confirmText:'Exit', 
            closeText:``,
            exit:true,
        },
        assessmentRehearsal: {
            body:`Take a few minutes to walk through a sample CapsimInbox assessment. Think of this as your rehearsal. Click 'Next' and get started!`,
            title:'Welcome to CapsimInbox!', 
        }, 
    }
}

