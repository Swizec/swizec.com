import { useEffect, useRef, useState } from "react"

// calculates euclidean distance between 2 points
function distance(start, end) {
  return Math.round(
    Math.sqrt((start[0] - end[0]) ** 2, (start[1] - end[1]) ** 2)
  )
}

const Vision = ({ x, y }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <text textAnchor="middle" y={-10}>
        Vision
      </text>
      <circle cx={0} cy={0} r={5} />
    </g>
  )
}

export function RandomWalk() {
  const width = 600,
    height = 600,
    stepSize = 10

  // starting point, used to reset as well
  const defaultWalk = [
    { start: [width / 2, height / 2], end: [width / 2, height / 2] },
  ]

  // holds the full random walk as an array of
  // { start: [x, y ], end: [x, y]}
  // objects – this is designed to be inefficient/naive
  const [randomWalk, setRandomWalk] = useState(defaultWalk)
  const lastStep = randomWalk[randomWalk.length - 1]

  // holds the position of last focus point click
  const [vision, setVision] = useState(null)
  const svgRef = useRef()

  // adds new random step to our walk
  function addStep() {
    // we need to grab latest randomWalk value
    // because this runs from an interval in a useEffect
    setRandomWalk((randomWalk) => {
      const lastStep = randomWalk[randomWalk.length - 1]

      // bias towards moving up
      let upBias = 0.5
      // bias towards moving left
      let leftBias = 0.5

      // bias towards the vision if it exists
      if (vision) {
        // are you below the vision
        if (vision[1] - lastStep.end[1] > 0) {
          // more biased to go down
          upBias = 0.95
        } else {
          // more biased to go up
          upBias = 0.05
        }

        // are you to the right of vision
        if (vision[0] - lastStep.end[0] > 0) {
          // more biased to go left
          leftBias = 0.95
        } else {
          // more biased to go left
          leftBias = 0.05
        }
      }

      // move in negative direction randomly
      let horizontalDirection = Math.random() > leftBias ? -1 : 1
      let verticalDirection = Math.random() > upBias ? -1 : 1

      // prefer avoiding edges
      if (lastStep[0] > width) {
        horizontalDirection = -1
      } else if (lastStep[0] < 0) {
        horizontalDirection = 1
      }

      if (lastStep[1] > height) {
        verticalDirection = 1
      } else if (lastStep[1] < 0) {
        verticalDirection = -1
      }

      return [
        ...randomWalk,
        {
          // each step starts where last one finished
          start: lastStep.end,
          // add 10px in a random direction
          end: [
            lastStep.end[0] + Math.random() * stepSize * horizontalDirection,
            lastStep.end[1] + Math.random() * stepSize * verticalDirection,
          ],
        },
      ]
    })
  }

  function restartWalk() {
    setRandomWalk(defaultWalk)
  }

  function addVision(event) {
    const { clientX, clientY } = event
    const { top, left } = svgRef.current.getBoundingClientRect()

    setVision([clientX - left, clientY - top])
  }

  // start random walk on component mount
  useEffect(() => {
    const interval = setInterval(addStep, 30)

    // stop interval on unmount
    return () => clearInterval(interval)
  }, [vision])

  return (
    <div style={{ border: "1px solid black" }}>
      <h1>Your career is a random walk, it needs vision</h1>
      <p>
        Steps taken: {randomWalk.length}, Distance traveled:{" "}
        {distance(randomWalk[0].start, lastStep.end)}
      </p>
      <p>Click to add a vision. Your random decisions bias towards it.</p>
      <button onClick={restartWalk}>Restart walk</button>
      <br />
      <svg width={width} height={height} onClick={addVision} ref={svgRef}>
        {/* renders the walk path */}
        {randomWalk.map(({ start, end }, index) => (
          <line
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            key={index}
          />
        ))}
        {/* renders a red circle to show walker */}
        {lastStep && <circle cx={lastStep.end[0]} cy={lastStep.end[1]} r={3} />}
        {vision && <Vision x={vision[0]} y={vision[1]} />}
      </svg>
    </div>
  )
}
