import { LineSegment, YPoint } from 'yfiles'

const segment = new LineSegment(new YPoint(1,1),new YPoint(2,2))
const isHorizontal = segment.isHorizontal
const isVertical = segment.isVertical
