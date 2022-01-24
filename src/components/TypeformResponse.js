import React from "react"

const JobTitle = ({ answers }) => {
  const answer = answers.find(
    (answer) => answer.field.title === "What’s your job level?"
  )

  return answer?.choice ? <>from a {answer.choice.label}</> : null
}

export const TypeformResponse = ({ answers }) => {
  const stars = answers[0]?.number ? new Array(answers[0].number).fill(0) : []

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
      {[1, 2, 3, 4, 5].map((i) =>
        answers[i] && answers[i]?.text ? (
          <>
            <strong>{answers[i]?.field.title}</strong>
            <p>{answers[i]?.text}</p>
          </>
        ) : null
      )}
    </>
  )
}
