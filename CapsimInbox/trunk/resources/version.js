const bookshelf = require('./bookshelf')
const _ = require('lodash')

const Question = require('./questions')
const QuestionGroup = require('./questionGroup')
const Skill = require('./skill')
const Author = require('./author')
const Role = require('./role')
const Competency = require('./competency')
const LearningGoal = require('./learningGoal')
const Qtv = require('./questionToVersion')
const Answer = require('./answer')
const Atc = require('./answerToCompetency')
const Ats = require('./answerToSkill')
const Atl = require('./answerToLearningGoal')
const Dtv = require('./departmentToVersion')
const Ntv = require('./nameToVersion')
const Editors = require('./editors')
const Departments = require('./departments')
const Construct = require('./construct')
const PostAssessmentQuestion = require('./postAssessmentQuestion')

const Folder = require('./folder')

require('./versionToSim')
const Version = bookshelf.Model.extend({

  tableName: 'inbox_version',

  idAttribute: 'versionKey',

  hidden: ['combineScoring'],

  toDuplicate: [
    'questions.answers.answerToCompetency',
    'questions.answers.answerToLearningGoal',
    'questions.answers.answerToSkill',
    'questionGroups',
    'role',
    'skills',
    'learningGoals',
    'competencies',
    'authors',
    'questionToVersion',
    'folders'
  ],

  //RELATIONS
  authors: function() {
    return this.hasMany('Author', 'FK_versionKey')
  },

  competencies: function() {
    return this.hasMany('Competency', 'FK_versionKey')
  },

  learningGoals: function() {
    return this.hasMany('LearningGoal', 'FK_versionKey')
  },

  folders: function() {
    return this.hasMany('Folder', 'FK_versionKey', 'versionKey')
  },

  questions: function() {
    return this.belongsToMany('Question', 'inbox_questionToVersion', 'FK_versionKey', 'FK_questionKey')
  },

  questionGroup: function() {
    return this.hasMany('QuestionGroup', 'FK_versionKey', 'versionKey')
  },
  
  questionGroups: function() {
    return this.hasMany('QuestionGroup', 'FK_versionKey', 'versionKey')
  },

  questionToVersion: function() {
    return this.hasMany('Qtv', 'FK_versionKey')
  },

  role: function() {
    return this.hasOne('Role', 'FK_versionKey')
  },

  skills: function() {
    return this.hasMany('Skill', 'FK_versionKey')
  },

  versionToSim: function() {
    return this.hasMany('Vts', 'versionKey', 'versionKey')
  },

  files: function() {
    return this.hasMany('File', 'FK_versionKey', 'versionKey')
  },

  editor: function(){
    return this.belongsToMany('EditorName', 'inbox_editorNameToVersion', 'FK_versionKey', 'FK_editorNameKey')
  },

  department: function(){
    return this.belongsToMany('EditorDept', 'inbox_editorDeptToVersion', 'FK_versionKey', 'FK_editorDeptKey')
  },

  editorName: function() {
    return this.hasOne('Ntv', 'FK_versionKey', 'versionKey' )
  },

  editorDept: function() {
    return this.hasOne('Dtv', 'FK_versionKey', 'versionKey' )
  },

  construct: function() {
    return this.hasMany('Construct', 'FK_versionKey', 'versionKey' )
  },

  postAssessmentQuestion: function() {
    return this.hasMany('PostAssessmentQuestion', 'FK_versionKey', 'versionKey' )
  },

  //EXTENDING PROTOTYPE
  duplicate: async function() {

    //Variables to map old keys to new in case other models depend on it
    const authorKeysMap = {}
    const skillKeysMap = {}
    const competenciesKeysMap = {}
    const learningGoalsKeysMap = {}

    const questionGroupKeysMap = {}
    const questionKeysMap = {}
    const answerKeysMap = {}

    try {

      //Fetch version to duplicate with related
      await bookshelf.Model.prototype.fetch.call(this, { withRelated: this.toDuplicate })
      const {authors, role, skills, competencies, learningGoals, questionToVersion, questions, folders, questionGroups} = this.toJSON()
      const {answers, atc, ats, atl} = questions.reduce( (acc, question) => {
        acc.answers.push(...question.answers)

        for (answer of question.answers) {
          acc.atc = acc.atc.concat(answer.answerToCompetency)
          acc.ats = acc.ats.concat(answer.answerToSkill)
          acc.atl = acc.atl.concat(answer.answerToLearningGoal)
        }
		
        return acc
      }, { answers: [], atc: [], ats: [], atl: [] })

      //Clone version and save it
      const versionOmitProps = ['questions','role','skills','competencies', 'learningGoals', 'authors','versionKey', 'questionToVersion', 'folders', 'questionGroups']
      const newVersionBody = _.omit(this.toJSON({ virtuals: false }), versionOmitProps)
      const versionModel = new bookshelf.Model(newVersionBody, { tableName: 'inbox_version' })
      let newVersion = await Object.assign(versionModel, { idAttribute: 'versionKey' }).save()
      newVersion = newVersion.toJSON()

      //Clone version role
      const newRole = await new Role(Object.assign(_.omit(role, 'roleKey'), { FK_versionKey: newVersion.versionKey })).save()

      //Create an array of promises to insert author with new version key
      for( author of authors ) {
        const authorBody = Object.assign(_.omit(author, 'authorKey'), { FK_versionKey: newVersion.versionKey })
        const newAuthor = await new Author(authorBody).save()
        authorKeysMap[author.authorKey] = newAuthor.get('authorKey')
      }

      //Create an array of promises to insert author with new version key
      for( questionGroup of questionGroups ) {
        const questionGroupBody = Object.assign(_.omit(questionGroup, 'questionGroupKey'), { FK_versionKey: newVersion.versionKey })
        const newQuestionGroups = await new QuestionGroup(questionGroupBody).save()
        questionGroupKeysMap[questionGroup.questionGroupKey] = newQuestionGroups.get('questionGroupKey')
      }

      //Create an array of promises to insert skill with new version key
      for (skill of skills) {
        const skillBody = Object.assign(_.omit(skill, 'skillKey'), { FK_versionKey: newVersion.versionKey })
        const newSkill = await new Skill(skillBody).save()
        skillKeysMap[skill.skillKey] = newSkill.get('skillKey')
      }


      //If version has competencies create an array of promises to insert comptency with new version key
      if( competencies ) {
        for (comp of competencies) {
          const competencyBody = Object.assign(_.omit(comp, 'competencyKey'), { FK_versionKey: newVersion.versionKey })
          const newCompetency = await new Competency(competencyBody).save()
          competenciesKeysMap[comp.competencyKey] = newCompetency.get('competencyKey')
        }
      }

      //If version has learning goals create an array of promises to insert learning goal with new version key
      if( learningGoals ) {
        for (learningGoal of learningGoals) {
          const learningGoalBody = Object.assign(_.omit(learningGoal, 'learningGoalKey'), { FK_versionKey: newVersion.versionKey })
          const newLearningGoal = await new LearningGoal(learningGoalBody).save()
          learningGoalsKeysMap[learningGoal.learningGoalKey] = newLearningGoal.get('learningGoalKey')
        }
      }

      //Create an array of promises to add the questions
      for (question of questions) {
        const newQuestionBody = Object.assign(
          _.omit(question, ['questionKey', '_pivot_FK_questionKey', '_pivot_FK_versionKey', 'answers']),
          { FK_authorKey: authorKeysMap[question.FK_authorKey],
            FK_questionGroupKey: questionGroupKeysMap[question.FK_questionGroupKey] }
        )

        const newQuestion = await new Question(newQuestionBody).save()
        const qtvBody = {
          FK_versionKey: newVersion.versionKey,
          FK_questionKey: newQuestion.get('questionKey')
        }
        const newQtv = await new Qtv(qtvBody).save()
        questionKeysMap[question.questionKey] = newQuestion.get('questionKey')
      }

      //Create an array of answers to clone answers
      for (answer of answers) {
        const answerBody = {
          FK_questionKey: questionKeysMap[answer.FK_questionKey],
          nameTagKey: answer.nameTagKey,
          sequence: answer.sequence,
          FK_answerTypeKey: answer.FK_answerTypeKey,
          timeImpact: answer.timeImpact,
          isNotRandomized: answer.isNotRandomized
        }
        const newAnswer = await new Answer(answerBody).save()
        answerKeysMap[answer.answerKey] = newAnswer.get('answerKey')
      }

      for (atcEl of atc) {
        if(atcEl.FK_competencyKey){
          const atcBody = {
            FK_answerKey: answerKeysMap[atcEl.FK_answerKey],
            FK_competencyKey: competenciesKeysMap[atcEl.FK_competencyKey],
            points: atcEl.points
          }
          await new Atc(atcBody).save()
        }
      }

      for (atlEl of atl) {
        const atlBody = {
          FK_answerKey: answerKeysMap[atlEl.FK_answerKey],
          FK_learningGoalKey: learningGoalsKeysMap[atlEl.FK_learningGoalKey],
          points: atlEl.points
        }
        await new Atl(atlBody).save()
      }

      for (atsEl of ats) {
        const atsBody = {
          FK_answerKey: answerKeysMap[atsEl.FK_answerKey],
          FK_skillKey: skillKeysMap[atsEl.FK_skillKey],
          points: atsEl.points
        }
        await new Ats(atsBody).save()
      }

      for (folder of folders) {
        const newFolder = {
          name: folder.name,
          FK_versionKey: newVersion.versionKey
        }
        await new Folder(newFolder).save()
      }

      //sending back empty object prevents error from being triggered on front-end because .json() doesn't work on undefined
      return {}

    } catch (e) {
      
      return e
    }


  },

  //Virtual attributes
  virtuals: {

    reportComponentsJson: {
      get() {
        return ( this.get('reportComponents') ) ? JSON.parse(this.get('reportComponents')) : {}
      },

      set(val) {
        this.set('reportComponents', JSON.stringify(val))
      }
    },

    timeBonusJson: {
      get() {
        return ( this.get('timeBonus') ) ? JSON.parse(this.get('timeBonus')) : {}
      },
      set(val) {
        this.set('timeBonus', JSON.stringify(val))
      }
    },

    priorityBonusJson: {
      get() {
        return (this.get('priorityBonus')) ? JSON.parse(this.get('priorityBonus')) : {}
      },
      set(val) {
        this.set('priorityBonus', JSON.stringify(val))
      }
    },

    combineScoringJson: {
      get() {
        const combineScoring = this.get('combineScoring')
        return (combineScoring) ? combineScoring.split(',').map(Number) : []
      },
      set(val) {
        this.set('combineScoring', val.join(','))
      }
    },

    versionConfigJson: {
      get() {
        return (this.get('versionConfig')) ? JSON.parse(this.get('versionConfig')) : {}
      },
      set(val) {
        this.set('versionConfig', JSON.stringify(val))
      }
    },
  }
},{
  dependents: ['role', 'questions', 'questionToVersion', 'skills', 'authors', 'folders', 'files', 'questionGroups', 'learningGoals','editorName','editorDept'],
})

module.exports = bookshelf.model('Version', Version)
