var constants = require('./constants');
var db = require('./db.js');
const Version = require('../resources/version')
const cd = require('./calcData')
const rd = require('./reportData')

GameScore = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( GameScore.prototype, {

	/**
	* Provides score in point value for each skill, sum of skills, overall measurment
	*
	* @param {String} [studentToSimKey]
	*
	* @returns {object}
	*/
	async getScore( studentToSimKey, versionKey ) {

		let FK_MeasurementTypeKey = 1
		let params = {
		  "where":{
			"FK_versionKey": versionKey
		  }
		}

		const version = await new Version({ versionKey }).fetch()
		const log            = await this.getLog( studentToSimKey )                    // Gets student log
		const answerToSkill = await this.getStudentAnswers( studentToSimKey )         // Gets student answers with skill
		const answersData    = await this.getQuestionsAndAnswers()    // Gets answers with question data
		const skills         = await rd.getMeasurement(FK_MeasurementTypeKey, params)
		const timeSpent = cd.timeSpent(log)
		const timeBonusMultiplier = await this.getTimeBonusMultiplier( timeSpent, version.toJSON() )
		const isPenalized = await this.isPenalized(log, answersData)
		//const timeGapBonus = await this.calculateTimeGapBonus(versionKey, studentToSimKey, log)

		// Sets default skills object, and sums point value for each skill
		const skillPoints = this.calculateSkills( skills, answerToSkill )

		let priorityBonus = 0
		let numberOfImportantQuestionsAnswered = await this.numberOfImportantQuestionsAnswered( log, answersData )

		if( versionKey == 1 ) {
			// Penalize for checking picnic photos
			if ( isPenalized ) skillPoints['1'] -= constants.SKILL_1_QUESTION_POINT_VALUE / 2

			// Adding points for every important email answered within first 10 responses
			priorityBonus = constants.SKILL_1_QUESTION_POINT_VALUE * ( numberOfImportantQuestionsAnswered / constants.IMPORTANT_QUESTION_COUNT)
			skillPoints['1'] += priorityBonus
		} else if( version.get('priorityBonusJson').prioritySkillKey ) {
			priorityBonus = await this.getPriorityBonus(log, answersData, version.toJSON())
			skillPoints[version.get('priorityBonusJson').prioritySkillKey] += priorityBonus
		}

		// Sums up all points
		let skillPointsSum = 0
		for (var key in skillPoints) skillPointsSum += skillPoints[key]

		// Overall score calculation
		const overAllScore = (timeBonusMultiplier) ? skillPointsSum * timeBonusMultiplier : skillPointsSum

		return {
			log,
			skillPoints,
			skillPointsSum,
			overAllScore,
			timeSpent,
			timeBonusMultiplier,
			isPenalized,
			numberOfImportantQuestionsAnswered,
			learningGoals: await this.calculateLearningGoals(versionKey, studentToSimKey),
			competencies: await this.calculateCompetencies(versionKey, studentToSimKey),
			priorityBonus
		}
	},

	async getExamScore( studentToSimKey, versionKey ) {
		const version = await new Version({ versionKey }).fetch()
		const competencies = await this.calculateCompetencies(versionKey, studentToSimKey)
		return competencies; 
	}, 

	// ===================== Get Data =====================
	getLog( FK_studentToSimKey ){
		return db('CapsimInbox').select(
			'sts.FK_studentKey',
			'sl.FK_logActionTypeKey',
			'sl.key',
			'sl.value',
			'sl.dateTime'
		)
		.from('inbox_studentLog AS sl')
		.join('inbox_studentToSim AS sts', 'sl.FK_studentToSimKey', 'sts.studentToSimKey' )
		.where( {'sl.FK_studentToSimKey': FK_studentToSimKey,'sl.historyKey':0})
		.orderBy('dateTime', 'asc')
	},

	getStudentAnswers( FK_studentToSimKey ){
		return db('CapsimInbox').select(
			'ats.FK_skillKey',
			'ats.points'
		)
		.from('inbox_studentToAnswer AS sta')
		.innerJoin('inbox_answerToSkill AS ats','ats.FK_answerKey','sta.FK_answerKey')
		.where( {'sta.FK_studentToSimKey': FK_studentToSimKey, 'sta.historyKey':0 } )
	},

	getStudentAtc( FK_studentToSimKey ){
		return db('CapsimInbox').select(
			'atc.FK_competencyKey',
			'atc.points',
			'atc.timeGap',
			'atc.FK_answerKey'
		)
		.from('inbox_studentToAnswer AS sta')
		.innerJoin('inbox_answerToCompetency AS atc','atc.FK_answerKey','sta.FK_answerKey')
		.where( {'sta.FK_studentToSimKey': FK_studentToSimKey, 'sta.historyKey':0 } )
	},

	getStudentLearningGoals( FK_studentToSimKey ){
		return db('CapsimInbox').select(
			'atl.FK_learningGoalKey',
			'atl.points'
		)
		.from('inbox_studentToAnswer AS sta')
		.innerJoin('inbox_answerToLearningGoal AS atl','atl.FK_answerKey','sta.FK_answerKey')
		.where( {'sta.FK_studentToSimKey': FK_studentToSimKey, 'sta.historyKey':0 } )
	},

	getQuestionsAndAnswers(){
		return db('CapsimInbox').select(
			'a.answerKey',
			'a.nameTagKey',
			'q.questionKey',
			'q.isImportant',
			'q.subjectTagKey'
		)
		.from('inbox_answer AS a')
		.leftJoin('inbox_question AS q', 'q.questionKey', 'a.FK_questionKey')
	},
	
	// async getSkills( FK_versionKey ) {
	// 	return db('CapsimInbox').select(['skillKey', 'name']).from('inbox_skill').where({ FK_versionKey })
	// },

	// ================= Calculate Data ===================
	async getTimeBonusMultiplier( timeSpent, version ) {
		let timeBonusMultiplier = version.timeBonusJson.multiplier1; // default time bonus

		if ( timeSpent && (timeSpent > version.timeBonusJson.range1 && timeSpent < version.timeBonusJson.range2) ) {
			timeBonusMultiplier = version.timeBonusJson.multiplier2
		}

		return parseFloat(timeBonusMultiplier)
	},

	isPenalized( log, answersData ) {
		return new Promise( ( resolve ) => {
			let isPenalize = false
			const isFileOpened = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.OPEN_FILE && log.key == 8) // picnic photos

			// checks if was clicked on picnic photos
			if (isFileOpened.length !== 0) {
				const importantAnswersArr = answersData.filter( question => question.isImportant == 1 ).map( question => question.answerKey )
				const answeredImportant   = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.SUBMIT_ANSWER && importantAnswersArr.indexOf(log.key) > 0)

				// Checks if all important questions was answered prior checking picnic photos
				isPenalize = answeredImportant.length != constants.IMPORTANT_QUESTION_COUNT || answeredImportant.filter( log => log.dateTime > isFileOpened[0].dateTime).length !== 0
			}
			// return isPenalize
			resolve( isPenalize )
		})
	},

	numberOfImportantQuestionsAnswered( log, answersData ){
		return new Promise( ( resolve ) => {
			const submitedAnswers     = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.SUBMIT_ANSWER ).sort( (a, b) => a.dateTime - b.dateTime ).map( answer => answer.key ).filter((item, pos, self) => self.indexOf(item) == pos)
			const importantAnswersArr = answersData.filter( question => question.isImportant == 1 ).map( question => question.answerKey )

			const n = 10 // first n answers
			const firstNAnswers = submitedAnswers.slice(0, n);

			const retVal = firstNAnswers.filter( key => importantAnswersArr.indexOf( key ) > -1 ).length

			resolve( retVal )
		})
	},

	getPriorityBonus( log, answersData, { priorityBonusJson } ) {
		return new Promise( (resolve) => {
			const submitedAnswers     = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.SUBMIT_ANSWER ).sort( (a, b) => a.dateTime - b.dateTime ).map( answer => answer.key ).filter((item, pos, self) => self.indexOf(item) == pos)
			const importantAnswersArr = answersData.filter( question => question.isImportant == 1 ).map( question => question.answerKey )
			let bonus = 0

			Object.keys(priorityBonusJson).forEach( key => {
				if( !isNaN(key) ) {
					let firstNAnswers = submitedAnswers.slice(0, parseInt(priorityBonusJson[key].max))
					let importantAnswers = firstNAnswers.filter( answer => importantAnswersArr.indexOf( answer ) > -1 ).length
					if( importantAnswers >= parseInt(priorityBonusJson[key].answered) ) bonus = parseFloat(priorityBonusJson[key].points)
				}
			})

			resolve(bonus)
		})
	},

	calculateSkills(skills, answerToSkill) {
		const skillPoints = {}
		skills.forEach( skill => skillPoints[skill.skillKey] = 0 )
		answerToSkill.forEach( answer => skillPoints[answer.FK_skillKey] += answer.points )
		return skillPoints
	},

	async calculateCompetencies( FK_versionKey, studentToSimKey ) {
		let competencyPerc = {}
		const competencies = await db('CapsimInbox').select(['competencyKey', 'name']).from('inbox_competency').where({ FK_versionKey })
		if( competencies.length > 0 ) {
			let answerToCompetency = await this.getStudentAtc( studentToSimKey )         // Gets student answers with competency
			competencyPerc = cd.calcCompetency( answerToCompetency, competencies )
		}
		return competencyPerc
	},

	//WE DONT ADD TIME GAP BONUS ON TO TOTAL SCORE
	// async calculateTimeGapBonus(versionKey, studentToSimKey, log){
		
	// 	let timeGapBonus = 0
	// 	let answerToCompetency = await this.getStudentAtc( studentToSimKey ) 
	// 	answerToCompetency.map( answer => {
	// 		if (answer.timeGap > 0) {
	// 			//find time responded in log
	// 			let emailAnswered = log.find(l => l.FK_logActionTypeKey == 3 && l.value == answer.FK_answerKey)
	// 			//find time delivered in log
	// 			let emailDelivered = {}
	// 			if(emailAnswered) emailDelivered = log.find(l => l.FK_logActionTypeKey == 13 && l.key == emailAnswered.key)
				
	// 			if(emailDelivered && emailAnswered ){
	// 				let timeDelivered = new Date(emailDelivered.dateTime)
	// 				let timeAnswered = new Date(emailAnswered.dateTime)
	// 				let responseTime = (timeAnswered - timeDelivered) 
	// 				if(responseTime < answer.timeGap * (60 * 1000)){
	// 					timeGapBonus += answer.points
	// 				}
	// 			}
	// 			//if difference is less than timeGap, add answer.points to timeGapBonus
	// 		}
	// 	})
	// 	return timeGapBonus
	// },

	async calculateLearningGoals( FK_versionKey, studentToSimKey ) {
		let learningGoalsPerc = {}
		const learningGoals = await db('CapsimInbox').select(['learningGoalKey', 'name']).from('inbox_learningGoal').where({ FK_versionKey })
		if( learningGoals.length > 0 ) {
			let answerToLearningGoal = await this.getStudentLearningGoals( studentToSimKey )         // Gets student answers with competency
			learningGoalsPerc = cd.calcLearningGoal( answerToLearningGoal, learningGoals )
		}
		return learningGoalsPerc
	},

	// ================= Insert Data ===================
	// =================================================
	async setScore( studentToSimKey, versionKey ){
		let scoreData = await this.getScore( studentToSimKey, versionKey )
		let hasScore = await db('CapsimInbox').select().from('inbox_score').where({"historyKey":0,"FK_studentToSimKey":studentToSimKey})

		// Prevention for duplicate score insert error
		if(hasScore.length == 0){
			await this.insertScore(
				studentToSimKey,
				scoreData.overAllScore,
				scoreData.skillPointsSum,
				JSON.stringify(scoreData.skillPoints),
				JSON.stringify(scoreData.learningGoals),
				JSON.stringify(scoreData.competencies),
				versionKey,
				scoreData.timeSpent
			)
		}

	},

	insertScore( FK_studentToSimKey, overAll, skillSum, skills, learningGoals, competencies, FK_versionKey, timeSpent ){
		return new Promise( ( resolve, reject ) => {
			db('CapsimInbox').insert({
				FK_studentToSimKey,
				overAll,
				skillSum,
				skills,
				learningGoals,
				competencies,
				FK_versionKey,
				timeSpent
			})
			.from('inbox_score')
			.then( data => resolve( data ) )
			.catch( err => reject( err ) )
		})
	},

	updateScore( studentToSimKey, versionKey ){
		return new Promise( ( resolve, reject ) => {
			this.getScore( studentToSimKey, versionKey )
			.then( scoreData => this.updateScoreSQL(
				studentToSimKey,
				scoreData.overAllScore,
				scoreData.skillPointsSum,
				JSON.stringify(scoreData.skillPoints ),
				JSON.stringify(scoreData.learningGoals),
				JSON.stringify(scoreData.competencies),
				scoreData.timeSpent
			))
			.then( data => resolve( data ) )
			.catch( err => reject( err ) )
		})
	},

	updateScoreSQL( FK_studentToSimKey, overAll, skillSum, skills, learningGoals, competencies, timeSpent ){
		return db('CapsimInbox')
		.table('inbox_score')
		.where({ FK_studentToSimKey, 'historyKey':0 })
		.update({
			FK_studentToSimKey,
			overAll,
			skillSum,
			skills,
			learningGoals,
			competencies,
			timeSpent
		})
	}

})
