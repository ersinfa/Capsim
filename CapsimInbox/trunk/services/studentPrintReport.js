// Fix later, stole the studentSettings file, will fix later. 

const db = require('./db.js')
const path = require('path')
const pd = require('./portalData.js')
const mailer = require('../lib/mailer')
const conversion = require("phantom-html-to-pdf")()
const moment = require('moment')
const sidp = require('../services/studentIDP.js');
const sr = require('../services/studentReport.js');
const sectionSettings = require('../services/sectionSettings')

const sendErrorMail = (message) => {
        let mailOptions = {
            from: 'modex.report.error@capsim.com',
            to: 'paulius.juskevicius@capsim.com',
            subject: 'Modex Report error',
            html: message
        }
    
        mailer.sendMail(mailOptions, (error, info) => {
        })
    }

ModexScoreEmail = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( ModexScoreEmail.prototype, {

  async sendModexScoreEmail (req,res,next){
   
  let scoringAutomationSettings  = await sectionSettings.getSettingsByConfigName(req.session.simKey,'scoringAutomation')
  
  if(scoringAutomationSettings.emailScoringReportToStudents == true){ 

    // Grabs data
    let competencies = await sidp.buildIDP( req.session.stsKey, req.session.versionKey, req.session.isExam )
    const studentReport = await sr.buildReport( req.session.stsKey, req.session.versionKey )
    const participantData = await pd.getStudentInfo(req.session.stsKey)
    let overallScore = parseFloat(studentReport.overall.score).toFixed(0)

    // Formats data here instead of in handlebars
    competencies.forEach(competency=>{
        competency.score = competency.score.toFixed(0)
        competency.skills.forEach(skill=>{
            skill.score = parseFloat(skill.score).toFixed(0)
        })
    })
    const logoPath = `${process.env.ASSETS_URL}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${req.session.versionKey}.png`
    const title = 'MODX - Student Dashboard'

    // Generates report
    res.render('modexStudentReport', {
        layout: false,
        title: title,
        css: path.resolve('./public/stylesheets/build.studentportal.css'),
        data: participantData,
        competencies:competencies,
        overallScore: overallScore,
        datePrinted: moment().format('MMMM DD, YYYY'),
       logoPath
    }, (err, html) => {
        if(err) sendErrorMail('Error on rendering report, student to Sim Key:'+req.session.stsKey)

        // Converts report to pdf
        conversion({
            html,
            allowLocalFilesAccess: true,//set to true to allow request starting with file:///
            fitToPage: true,
            zoomFactor: 2,
            paperSize: {
                margin: { top: '10px', left: '50px', right: '50px' },
                headerHeight: '200px',
                format: 'Letter',
                width: '1900',
                height: '2459'
            },
            settings: {
                resourceTimeout: 3000,
                localToRemoteUrlAccessEnabled: true
            },
            viewportSize: {
                width: 1280,
                height: 768
            },
            format: {
        		quality: 100
        	},
            header: `
            <div id="header-{#pageNum}" style="text-align: center; background-color: #383677">
                <img height="100" src="${logoPath}">
            </div>

            <div id="header" >
                <img height="100" src="${logoPath}" style="background-color: #383677">
                <h2 style="float: right; font-family: sans-serif">Exam Score</h2>
            </div>

            <script type="text/javascript">
                var elem = document.getElementById('header-{#pageNum}');
                if ( {#pageNum} > 1 ) {
                    elem.style.display = 'none';
                } else {
                    var header = document.getElementById('header');
                    header.style.display = 'inline'
                }
            </script>
        `,
        footer: `
            <div id='pageNumber' style='text-align: right; font-family: sans-serif'><b>{#pageNum}</b></div>
            <script type="text/javascript">
                var elem = document.getElementById('pageNumber');
                if ( parseInt(elem.innerText) == 1 ) {
                    elem.style.display = 'none';
                }
            </script>
        `
        }, (err, result) => {
            if (err) sendErrorMail('Error on converting pdf')
            // Sends pdf report to students
            let mailOptions = {
                from: 'inbox.reports@capsim.com',
                to: participantData.email,
                subject: 'Modular Exam Report',
                html: `Hello,<br>
                <p>Please review the attached PDF document for the scoring of your recent exam attempt.</p>
                <br/>
                -Capsim Staff`
                ,
                attachments: [
                    {
                        filename: 'Report.pdf',
                        path: result.stream.path
                    }
                ]
            }
            mailer.sendMail(mailOptions, (error, info) => {
                if (error) sendErrorMail('Error on sending pdf, student to Sim Key:'+req.session.stsKey)
            })
            conversion.kill() // necessary if you use the electron-server strategy, see bellow for details            
        });
    })
}
}

  
})
