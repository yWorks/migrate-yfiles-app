import { GraphComponent, ICommand } from 'yfiles'

const gc = new GraphComponent()
gc.executeCommand(ICommand.SELECT_ALL,null)
gc.canExecuteCommand(ICommand.SELECT_ALL,null)
