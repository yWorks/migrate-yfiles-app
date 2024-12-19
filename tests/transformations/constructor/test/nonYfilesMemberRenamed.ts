import { NewLineKind, Project } from 'ts-morph'

const project = new Project({manipulationSettings: {newLineKind: NewLineKind.LineFeed}})
