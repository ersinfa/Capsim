const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const auth = require('../middleware/studentAuth')
const conversion = require("phantom-html-to-pdf")()
const moment = require('moment')
const sidp = require('../services/studentIDP.js')
const pd = require('../services/portalData.js')
const asyncWrap = require('../middleware/asyncWrap')

const footer = `
    <div id='pageNumber' style='text-align: right; font-family: sans-serif'><b>{#pageNum}</b></div>
    <script type="text/javascript">
        var elem = document.getElementById('pageNumber');
        if ( parseInt(elem.innerText) == 1 ) {
            elem.style.display = 'none';
        }
    </script>`
const buildHeader = ( logoPath, isReport = true) => {
    let headerText = (isReport) ? 'Feedback Report' : 'Individual Development Plan Report'
    return `
        <div id="header-{#pageNum}" style="text-align: center">
            <img height="100" src="${logoPath}">
        </div>

        <div id="header">
            <img height="100" src="${logoPath}">
            <h2 style="float: right; font-family: sans-serif">${headerText}</h2>
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
    `
}


router.get('/download-report', asyncWrap(auth), ( req, res, next ) => {

    const logoPath = `${process.env.ASSETS_URL}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${req.session.versionKey}.png`
    const title = (req.session.isExam == 1 ? 'MODX - Student Dashboard' : 'CapsimInbox - Student Dashboard')

    res.render('report', {
        layout: false,
        title: title,
        bundle: path.resolve('./public/javascripts/build.studentportal.js'),
        css: path.resolve('./public/stylesheets/build.studentportal.css'),
        data: JSON.stringify(Object.assign({}, req.data, { isPrint: true })),
        logoPath
    }, (err, html) => {
        conversion({
            html,
            waitForJS: true,//set to true to enable programmatically specify (via Javascript of the page) when the pdf printing starts (see Programmatic pdf printing section for an example)
            waitForJSVarName: 'PRINT_REPORT_READY',
            allowLocalFilesAccess: true,//set to true to allow request starting with file:///
            paperSize: {
                margin: { top: '10px', left: '50px', right: '50px' },
                headerHeight: '200px',
                width: '2000',
                height: '2800',
            },
            settings: {
                javascriptEnabled : true,
                resourceTimeout: 3000,
                localToRemoteUrlAccessEnabled: true
            },
            viewportSize: {
                width: 5000,
                height: 6471
            },
            header: buildHeader(logoPath),
            footer: footer
        }, (err, result) => {
            if (err) next(err)
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'filename="Report.pdf"'
            })
            result.stream.pipe(res)
            conversion.kill() // necessary if you use the electron-server strategy, see bellow for details
        });
    })

})

router.get('/download-idp/:goalKey', asyncWrap( async (req, res, next ) => {

    const versionKey = req.session.versionKey || req.session.data.versionKey
    const singleGoal = await sidp.getStudentGoal( req.params.goalKey )
    const idpData = await sidp.buildIDP( singleGoal.FK_studentToSimKey, versionKey )
   
    const goal = JSON.parse(singleGoal.goal)
    const idpSingle = idpData.find( idp => idp.skillKey == goal.selectedSkill )

    const participantData = await pd.getStudentInfo(singleGoal.FK_studentToSimKey)
    // testing
    // const test = await pd.getStudentInfo3({studentToSimKey:singleGoal.FK_studentToSimKey})
    const idpGoal = Object.assign({}, goal, idpSingle)

    const logoPath = `${process.env.ASSETS_URL}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${versionKey}.png`
    const title = (req.session.isExam == 1 ? 'MODX - Student Dashboard' : 'CapsimInbox - Student Dashboard')

    res.render('idp', {
        layout: false,
        title: title,
        css: path.resolve('./public/stylesheets/build.studentportal.css'),
        // data: req.session.data,
        data: participantData,
        goal: idpGoal,
        datePrinted: moment().format('MMMM DD, YYYY'),
       logoPath
    }, (err, html) => {
        if(err) return next(err)
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
                <div id="header-{#pageNum}" style="text-align: center">
                    <img height="100" src="${logoPath}">
                </div>

                <div id="header">
                    <img height="100" src="${logoPath}">
                    <h2 style="float: right; font-family: sans-serif">Individual Development Plan Report</h2>
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
            if (err) next(err)
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'filename="IDP.pdf"'
            })
            result.stream.pipe(res)
            conversion.kill() // necessary if you use the electron-server strategy, see bellow for details
        });
    })

}))



router.get('/download-idp-modex/:goalKey', asyncWrap( async (req, res, next ) => {

    const versionKey = req.session.versionKey || req.session.data.versionKey
    const singleGoal = await sidp.getStudentGoal( req.params.goalKey )
    const idpData = await sidp.buildIDP( singleGoal.FK_studentToSimKey, versionKey, 1 )
    const goal = JSON.parse(singleGoal.goal)
    const idpSingle = idpData.find( idp => idp.competencyKey == goal.selectedSkill )
    const participantData = await pd.getStudentInfo(singleGoal.FK_studentToSimKey)
    const idpGoal = Object.assign({}, goal, idpSingle)
    idpGoal.score = idpGoal.score.toFixed(2)
    const logoPath = `${process.env.ASSETS_URL}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${versionKey}.png`
    const title = (req.session.isExam == 1 ? 'MODX - Student Dashboard' : 'CapsimInbox - Student Dashboard')

    res.render('idpmodex', {
        layout: false,
        title: title,
        css: path.resolve('./public/stylesheets/build.studentportal.css'),
        // data: req.session.data,
        data: participantData,
        goal: idpGoal,
        datePrinted: moment().format('MMMM DD, YYYY'),
       logoPath
    }, (err, html) => {
        if(err) return next(err)
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
                    <h2 style="float: right; font-family: sans-serif">Individual Development Plan Report</h2>
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
            if (err) next(err)
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'filename="IDP.pdf"'
            })
            result.stream.pipe(res)
            conversion.kill() // necessary if you use the electron-server strategy, see bellow for details
        });
    })

}))

module.exports = router;
