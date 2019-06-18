const constants = require('./constants')
const db = require('./db');

CalcData = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( CalcData.prototype, {

  calcPercentile( score, scoreAll ) {
    scoreAll = scoreAll.sort( (a, b)=> {return b - a} )
    const n = scoreAll.length
    const index = n - scoreAll.indexOf(score);
    return ( index / n ) * 100
  },

  calcPercentage( score, possibleScore ) {
    return ( score / possibleScore ) * 100
  },
  
  sumObjectKeyValues( obj ) {
    return Object.values(obj).reduce((a, b) => a + b);
  },
 

  calcCompetencyPercentageScore(competenciesScore, competencies, posibleCompetenciesScore, isRoundedValues ) {
    const retVal={}
    competencies.forEach(item =>{
      retVal[item.name] = (posibleCompetenciesScore[item.competencyKey] > 0 ) ? ((competenciesScore[item.name] / posibleCompetenciesScore[item.competencyKey])*100) : ((competenciesScore[item.name] / 1)*100)
      if(isRoundedValues == 1)
        retVal[item.name] = retVal[item.name].toFixed(0)
    })
    return retVal
  },

  calcSkillPercentageScore(skillsScore, skills, posibleSkillsScore, isRoundedValues ) {
    const retVal={}
    skills.forEach(item =>{
      retVal[item.name] = (posibleSkillsScore[item.skillKey] > 0 ) ? ((skillsScore[item.skillKey] / posibleSkillsScore[item.skillKey])*100) : ((skillsScore[item.skillKey] / 1)*100)
      if(isRoundedValues == 1)
        retVal[item.name] = retVal[item.name].toFixed(0)
    })
    return retVal
  },

  calcAverages( collection ) {
    const total = collection.length; 
    const sum = {}
    for (let index = 0; index < total; index++) {
      const element = collection[index];
      for (let key in element) {
        if(sum[key]){
          sum[key] = parseInt(sum[key]) +  parseInt(element[key])
        }else{
          sum[key] = element[key]
        }
      }
    }
    for (let key in sum) {
      sum[key] = ( sum[key] / total)
    }
    return (sum)
  },

  timeSpent(log) {
      const startDate   = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.START_GAME )
      const endDate     = log.filter( log => log.FK_logActionTypeKey == constants.LOG_ACTION_KEY.END_GAME )
      return (endDate[0].dateTime - startDate[0].dateTime)/60000
  },

  /**
   * calcCompetency - Calculates percentage for each competency
   *
   * @param  {Array} answerToCompetency Answer to competency with points
   * @param  {Array} competencies       Competencies for version
   * @returns {Object}                 Competencies score
   */
  calcCompetency( answerToCompetency, competencies ) {
    let competencyPoints = {}

	competencies.forEach( competency => competencyPoints[competency.name] = 0 )  // Sets default skills object

	// Sums point value for each competency
	answerToCompetency.forEach( answer => {
    if (answer.FK_competencyKey != 0) competencyPoints[competencies.find( comp => comp.competencyKey == answer.FK_competencyKey ).name] += answer.points
	})

    // Object.keys(competencyPoints).forEach( key => competencyPoints[key] = Math.round(competencyPoints[key]) )

	return competencyPoints
  },

  calcLearningGoal( answerToLearningGoal, learningGoals ) {
    let learningGoalPoints = {}

    learningGoals.forEach( learningGoal => {
      if(learningGoal.name) {
        learningGoalPoints[learningGoal.name] = 0   // Sets default skills object
      }
    })
     

    // Sums point value for each learningGoal
    answerToLearningGoal.forEach( answer => {
      //if statement to prevent error
      if (answer.FK_learningGoalKey && answer.FK_learningGoalKey != 0 ) learningGoalPoints[learningGoals.find( comp => comp.learningGoalKey == answer.FK_learningGoalKey ).name] += answer.points
    })

    // Object.keys(learningGoalPoints).forEach( key => learningGoalPoints[key] = Math.round(learningGoalPoints[key]) )

	  return learningGoalPoints
  },

  skillScore( rawScore, rawScoreAll ){
    let pSkillScore = {}
    for (let k in rawScore) {
      pSkillScore[k] = this.calcPercentile( rawScore[k], rawScoreAll[k] )
    }
    return pSkillScore;
  },


  developmentIndex( pSkillScore, FK_versionKey, nSkills ){
    let score1 = 0;
    let score2 = 0;

    let high = 0;
    let medium = 0;
    let low = 0;
    for (let key in pSkillScore) {
      if (pSkillScore[key] > 70) {
        high++;
      }else if(pSkillScore[key] <= 30){
        low++;
      }else{
        medium++;
      }
    }

    let scoreSum = high * 8 + medium * 5 + low * 1;

    if( scoreSum > 32){ // Advanced
      score1 = 2;
    }else if( scoreSum < 16){ // Novice
      score1 = 0;
    }else{ // Intermediate
      score1 = 1;
    }

    // Gets label 2 for report
    if(high == nSkills || medium == nSkills || low == nSkills ){
      score2 = 3
    }else if(
      high == 4 && (medium == 1 || low == 1)
      || medium == 4 && (high == 1 || low == 1)
      || low == 4 && (medium == 1 || high == 1)
    ){
      score2 = 2
    }else if(
      high == 3 && medium == 2
      || medium == 3 && high == 2
      || medium == 3 && low == 2
      || low == 3 && medium == 2
    ){
      score2 = 1
    }else{
      score2 = 0
    }

    let retVal = {
      score1
      ,score2
      ,label1 : constants.DEVELOPMENT_INDEX.LABELS_1[score1]
      ,label2 : constants.DEVELOPMENT_INDEX.LABELS_2[score2]
    }

    return retVal
  },

  selfAwarenessScore( pSkillScore, selfSkillScore ){
    let retVal = {
      matchCount: 0
      ,overRatedCount: 0
      ,underRatedCount: 0
    }
    for (let k in pSkillScore) {
      let rangeMin = selfSkillScore[k] - constants.SELF_AWARESNESS.MATCH_RANGE;
      let rangeMax = selfSkillScore[k] + constants.SELF_AWARESNESS.MATCH_RANGE;
      if ( pSkillScore[k] < rangeMin  ) {
        // Overrated
        retVal.overRatedCount++;
      }else if(pSkillScore[k] > rangeMax){
        // Underrated
        retVal.underRatedCount++
      }else{
        // Match
        retVal.matchCount++
      }
    }

    retVal.selfAwarenessScore = retVal.matchCount + 1
    return retVal
  },

})






// ==============================================================================
// ======================================= Specs ================================
// ==============================================================================

// OverAll score
// Specs
// Your overall performance was {___}. This overall score is based on how quickly and accurately you responded to the emails and messages during the exercise. The score is a percentile, which means show your overall performance relative to the CapsimInbox database. A score of 70% means that you performed higher than 70% of the individuals in the database.

// Formula:
// score = sum of total points earned * time bonus

// Note that time bonus value is TBD, but will likely have 3 levels
// For example,
// ~ complete inbox between 5-60 min, time bonus =  * 1.5
// ~ complete inbox between 60:01-70 min, time bonus = * 1.25
// ~ complete inbox after 70:01 min, time bonus = *1.0





// Specs Self Score
// Text:
// Your self-awareness index is a {__label 1__}. This score reflects how accurately your self-assessments match the objective assessments produced by CapsimInbox. Higher scores equate to more accurate self-awareness. Your score indicates that you are currently {___label 2___} in self-awareness accuracy. {__label 3__}. It is important to recognize that an accurate understanding of your skills is the essential first step to improving these skills.


// Formula:
// score = # match/(# match + # mistmatch)*100
// ~ match = a self-rating that is within +/- 15% of skill score
//   Note that we should convert the scores to a 0-6 index (this will better fit the dial graphic too)

// Formula score	Index Score	Label 1	Label 2
// 100	6	6	very high
// 80	5	5	high
// 60	4	4	average
// 40	3	3	average
// 20	2	2	low
// 0	1	1	very low


// Label 3 also requires counting the type of mismatches
// ~ OVR = self-rating is > 15% of skill score
// ~ UDR = self-rating is < 15% of skill score

// Label 1	Label 2	Profile	Label 3
// 6	very high	none	no label
// 5	high	1 OVR	When you are inaccurate, it is due to over-rating yourself.
// 5	high	1 UDR	When you are inaccurate, it is due to under-rating yourself.
// 4	average	2 OVR	When you are inaccurate, it is due to over-rating yourself.
// 4	average	1 OVR, 1 UDR	When you are inaccurate, it is due to both over- and under-rating yourself.
// 4	average	2 UDR	When you are inaccurate, it is due to under-rating yourself.
// 3	average	3 OVR	When you are inaccurate, it is due to over-rating yourself.
// 3	average	2 OVR, 1 UDR	When you are inaccurate, it is due to over-rating yourself.
// 3	average	2 UDR, 1 OVR	When you are inaccurate, it is due to under-rating yourself.
// 3	average	3 UDR	When you are inaccurate, it is due to under-rating yourself.
// 2	low	4 OVR	When you are inaccurate, it is due to over-rating yourself.
// 2	low	3 OVR, 1 UDR	When you are inaccurate, it is due to over-rating yourself.
// 2	low	2 ODR, 2 UDR	When you are inaccurate, it is due to both over- and under-rating yourself.
// 2	low	3 UDR, 1 OVR	When you are inaccurate, it is due to under-rating yourself.
// 2	low	4 UDR	When you are inaccurate, it is due to under-rating yourself.
// 1	very low	5 OVR	When you are inaccurate, it is due to over-rating yourself.
// 1	very low	4 OVR, 1 UDR	When you are inaccurate, it is due to over-rating yourself.
// 1	very low	3 OVR, 2 UDR	When you are inaccurate, it is due to over-rating yourself.
// 1	very low	3 UDR, 2 OVR	When you are inaccurate, it is due to under-rating yourself.
// 1	very low	4 UDR, 1 OVR	When you are inaccurate, it is due to under-rating yourself.
// 1	very low	5 UDR	When you are inaccurate, it is due to under-rating yourself.







// DevelopmentIndex
// Specs

// Text:
// Your development index shows your current level of skill proficiency is at the {___label1___} level. Across the five skills, you {___label2___} demonstrated this {___label1___} level of proficiency. Your ultimate goal for professional development is to consistently demonstrate an advanced level across all five skills.

// Formula:
// This score is categorical in nature.The categories are the low, medium, and high categories for each skill score (red, yellow, and green)
// Low = 0 to 30 percentile
// Medium = 30.01 to 70 percentile
// High = 70.01 to 100 percentile

// Label 1	Label 2	Category profile
// advanced	consistently	5 high
// advanced	somewhat consistently	4 high, 1 medium
// advanced	somewhat consistently	4 high, 1 low
// advanced	somewhat inconsistently	3 high, 2 medium
// intermediate	inconsistently	3 high, 2 low
// intermediate	inconsistently	3 high, 1 medium, 1 low
// intermediate	somewhat inconsistently	2 high, 3 medium
// intermediate	inconsistently	2 high, 3 low
// intermediate	inconsistently	2 high, 2 medium, 1 low
// intermediate	somewhat consistently	1 high, 4 medium
// intermediate	inconsistently	1 high, 2 medium, 2 low
// intermediate	consistently	5 medium
// intermediate	somewhat consistently	4 medium, 1 low
// intermediate	somewhat inconsistently	3 medium, 2 low
// intermediate	inconsistently	2 high, 2 low, 1 medium
// intermediate	inconsistently	3 medium, 1 high, 1 low
// novice	somewhat consistently	1 high, 4 low
// novice	inconsistently	1 high, 1 medium, 3 low
// novice	somewhat inconsistently	2 medium, 3 low
// novice	somewhat consistently	1 medium, 4 low
// novice	consistently	5 low
