interface User {
  uid: String,
  firstName: String,
  lastName: String
}

interface Stroke {
  points: Array<Point>
  color: String,
  startTime: Number,
  endTime: Number
  width: Number,
}

interface Point {
  x: number,
  y: number
}