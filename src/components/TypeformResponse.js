import React from "react"

function getAnswer(question, answers) {
  return answers.find((answer) => answer.field.title === question)
}

const JobTitle = ({ answers }) => {
  const answer = getAnswer("What’s your job level?", answers)

  return answer?.choice ? <>from a {answer.choice.label}</> : null
}

const QuestionAnswer = ({ question, answers }) => {
  const answer = getAnswer(question, answers)
  return answer?.text ? (
    <>
      <strong>{answer.field.title}</strong>
      <p>{answer.text}</p>
    </>
  ) : null
}

export const TypeformResponse = ({ answers }) => {
  const rating = getAnswer("Are you enjoying the Swizec’s Newsletter?", answers)
  const stars = rating?.number ? new Array(rating.number).fill(0) : []

  const questions = [
    "What hesitation did you have about subscribing?",
    "What did you learn from Swizec’s Newsletter?",
    "What do you like most about the Swizec’s Newsletter?",
    "What are some other benefits you got from Swizec’s Newsletter?",
    "Would you recommend Swizec’s Newsletter to a friend? Why?",
  ]

  return (
    <>
      <h3>
        {stars.map((i) => (
          <span role="img" key={i}>
            ⭐️
          </span>
        ))}{" "}
        <JobTitle answers={answers} />
      </h3>
      {questions.map((question, i) => (
        <QuestionAnswer question={question} answers={answers} key={i} />
      ))}
    </>
  )
}
