import { GraphComponent, ICommand } from 'yfiles'

const gc = new GraphComponent()
ICommand.SELECT_ALL.execute(null, gc)
ICommand.SELECT_ALL.canExecute(null, gc)
