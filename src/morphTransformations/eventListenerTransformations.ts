import {
  ArrowFunction,
  type CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  MethodDeclaration,
  type Node,
  ParameterDeclaration,
  type PropertyAccessExpression,
  PropertyDeclaration,
  type SourceFile,
  SyntaxKind,
  ts
} from 'ts-morph'
import {
  checkIfYfiles,
  getType,
  type ITransformation,
  type loggingFunction,
  replaceWithTextTryCatch
} from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

const eventNames = [
  'ActiveChanged',
  'BackgroundGroupChanged',
  'BendAdded',
  'BendCopied',
  'BendCreated',
  'BendLocationChanged',
  'BendRemoved',
  'BendTagChanged',
  'Canceled',
  'CanExecuteChanged',
  'CanvasClicked',
  'CanvasClicked',
  'CanvasTapped',
  'CleanedUp',
  'Clicked',
  'CloseMenu',
  'CollectSnapLines',
  'CollectSnapResults',
  'CollectSnapReferences',
  'ContentGroupChanged',
  'ContentMarginsChanged',
  'ContentRectChanged',
  'CurrentItemChanged',
  'DataParsed',
  'DataParsing',
  'DataWriting',
  'DataWritten',
  'DeletedItem',
  'DeletedSelection',
  'DeletingSelection',
  'DisplaysInvalidated',
  'DocumentParsed',
  'DocumentParsing',
  'DocumentWriting',
  'DocumentWritten',
  'DoubleClicked',
  'DoubleTapped',
  'DragCanceled',
  'DragCanceling',
  'DragDropped',
  'DragEnter',
  'DragEntered',
  'DragFinished',
  'DragFinishing',
  'Dragged',
  'Dragging',
  'DragLeave',
  'DragLeft',
  'DragOver',
  'DragStarted',
  'DragStarting',
  'Drop',
  'EdgeCopied',
  'EdgeCreated',
  'EdgeCreationStarted',
  'EdgeParsed',
  'EdgeParsing',
  'EdgePortsChanged',
  'EdgeRemoved',
  'EdgeStyleChanged',
  'EdgeTagChanged',
  'EdgeUpdated',
  'EdgeWriting',
  'EdgeWritten',
  'EditingCanceled',
  'EditingStarted',
  'EditorTextChanged',
  'FlushingContext',
  'FocusGroupChanged',
  'GestureCanceled',
  'GestureCanceling',
  'GestureFinished',
  'GestureFinishing',
  'GestureStarted',
  'GestureStarting',
  'GotPointerCapture',
  'GraphChanged',
  'GraphCopied',
  'GraphMLParsed',
  'GraphMLParsing',
  'GraphMLWriting',
  'GraphMLWritten',
  'GraphParsed',
  'GraphParsing',
  'GraphTagChanged',
  'GraphWriting',
  'GraphWritten',
  'GroupCollapsed',
  'GroupCollapsing',
  'GroupedSelection',
  'GroupEntered',
  'GroupEntering',
  'GroupExited',
  'GroupExiting',
  'GroupExpanded',
  'GroupExpanding',
  'GroupingSelection',
  'HandleDeserialization',
  'HandleSerialization',
  'HighlightGroupChanged',
  'HoveredItemChanged',
  'Initialized',
  'Initializing',
  'InputModeChanged',
  'InputModeContextChanged',
  'InputModeGroupChanged',
  'IsGroupNodeChanged',
  'ItemAdded',
  'ItemChanged',
  'ItemClicked',
  'ItemCreated',
  'ItemDoubleClicked',
  'ItemDoubleTapped',
  'ItemLeftClicked',
  'ItemLeftClicked',
  'ItemLeftDoubleClicked',
  'ItemRemoved',
  'ItemRightClicked',
  'ItemRightDoubleClicked',
  'ItemsCopied',
  'ItemsCopying',
  'ItemsCut',
  'ItemsCutting',
  'ItemsDuplicated',
  'ItemsDuplicating',
  'ItemSelectionChanged',
  'ItemsPasted',
  'ItemsPasting',
  'ItemTapped',
  'KeyDown',
  'KeyParsed',
  'KeyParsing',
  'KeyPress',
  'KeyUp',
  'KeyWriting',
  'KeyWritten',
  'LabelAdded',
  'LabelAdding',
  'LabelChanged',
  'LabelCopied',
  'LabelDeleted',
  'LabelEdited',
  'LabelEditing',
  'LabelEditingCanceled',
  'LabelEditingStarted',
  'LabelLayoutParameterChanged',
  'LabelPreferredSizeChanged',
  'LabelRemoved',
  'LabelStyleChanged',
  'LabelTagChanged',
  'LabelTextChanged',
  'LabelTextEditingCanceled',
  'LabelTextEditingStarted',
  'LabelUpdated',
  'LeftClicked',
  'LeftDoubleClicked',
  'LostPointerCapture',
  'Moved',
  'Moving',
  'MultiSelectionFinished',
  'MultiSelectionStarted',
  'MutexObtained',
  'MutexReleased',
  'NodeCopied',
  'NodeCreated',
  'NodeLayoutChanged',
  'NodeParsed',
  'NodeParsing',
  'NodeRemoved',
  'NodeReparented',
  'NodeStyleChanged',
  'NodeTagChanged',
  'NodeUpdated',
  'NodeWriting',
  'NodeWritten',
  'ObjectCopied',
  'OverrideResolveReference',
  'ParentChanged',
  'Parsed',
  'Parsing',
  'PointerClick',
  'PointerDown',
  'PointerDrag',
  'PointerEnter',
  'PointerLeave',
  'PointerLostCapture',
  'PointerMove',
  'PointerUp',
  'PopulateItemContextMenu',
  'PopulateMenu',
  'PortAdded',
  'PortAdded',
  'PortCopied',
  'PortLocationParameterChanged',
  'PortParsed',
  'PortParsing',
  'PortRemoved',
  'PortStyleChanged',
  'PortTagChanged',
  'PortWriting',
  'PortWritten',
  'PreferredCursorChanged',
  'PrepareRenderContext',
  'PriorityChanged',
  'PropertyChanged',
  'QueryClosestHandle',
  'QueryContinueDrag',
  'QueryInputHandlers',
  'QueryItemToolTip',
  'QueryLabelAdding',
  'QueryLabelEditing',
  'QueryName',
  'QueryOutputHandlers',
  'QueryPositionHandler',
  'QueryReferenceId',
  'QueryToolTip',
  'QueryType',
  'ResolveReference',
  'RightClicked',
  'RightDoubleClicked',
  'SelectionGroupChanged',
  'SelectionModelChanged',
  'ShadersCompiled',
  'ShadersCompiling',
  'SizeChanged',
  'SourcePortCandidateChanged',
  'Stopped',
  'StripeChanged',
  'StripeCreated',
  'StripeRemoved',
  'Tapped',
  'TargetPortCandidateChanged',
  'TextEdited',
  'UngroupedSelection',
  'UngroupingSelection',
  'UnitRedone',
  'UnitUndone',
  'UpdatedVisual',
  'UpdatingVisual',
  'ValidateLabelText',
  'ViewportChanged',
  'WaitingEnded',
  'WaitingStarted',
  'Wheel',
  'Writing',
  'Written',
  'ZoomChanged'
]
const toPointerNames = [
  'MouseClick',
  'MouseDown',
  'MouseDrag',
  'MouseEnter',
  'MouseLeave',
  'MouseLostCapture',
  'MouseMove',
  'MouseUp',
  'MouseWheel',
  'TouchClick',
  'TouchDrag',
  'TouchEnter',
  'TouchDown',
  'TouchLeave',
  'TouchLostCapture',
  'TouchMove',
  'TouchUp'
]

const addComment = {
  'item-selection-changed':
    'Add two listeners with "item-added" and "item-removed" to achieve the previous behavior'
}

export class EventListenerTransformations implements ITransformation {
  sourceFile: SourceFile
  loggingFunction: loggingFunction
  listenerAdderNames = new Set(eventNames.map((elem) => `add${elem}Listener`))
  listenerRemoverNames = new Set(eventNames.map((elem) => `remove${elem}Listener`))
  statisticsReporting: StatisticsReport

  pointerAdderNames = new Set(toPointerNames.map((elem) => `add${elem}Listener`))
  pointerRemoverNames = new Set(toPointerNames.map((elem) => `remove${elem}Listener`))

  addComment: Record<string, string> = addComment

  constructor(
    sourceFile: SourceFile,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }

  // generate a string from the found propertyAccessExpression
  getEventTypeString(paeName: string, prefix: string): string {
    const regExPropertyAccessExpression = new RegExp(String.raw`${prefix}(\w+)Listener`)
    const eventType = regExPropertyAccessExpression.exec(paeName)![1]
    return eventType
      .split(/(?=[A-Z])/g)
      .map((s) => s.toLowerCase())
      .join('-')
  }

  // check if a param is used later on in the function
  isUsed(
    param: ParameterDeclaration | Identifier,
    func: ArrowFunction | FunctionExpression | FunctionDeclaration | MethodDeclaration,
    checkUsage = true
  ): boolean {
    if (
      param.getChildren().length > 0 &&
      param.getChildAtIndex(0).isKind(SyntaxKind.ObjectBindingPattern)
    ) {
      //here we only check if one of them is used, if this is the case all are kept
      const ids = param.getDescendantsOfKind(SyntaxKind.Identifier)
      return ids.some((identifier) => this.isUsed(identifier, func))
    }
    const paramIdentifier = param.isKind(SyntaxKind.Identifier)
      ? param
      : param.getDescendantsOfKind(SyntaxKind.Identifier)[0]
    if (paramIdentifier.getText()[0] == '_') {
      return false
    }
    if (!checkUsage) {
      return true
    }
    const identifiers = func.getDescendantsOfKind(SyntaxKind.Identifier)
    return identifiers.some((identifier) => {
      if (identifier.getParent().isKind(SyntaxKind.Parameter)) {
        return false
      } else return identifier.getText() == paramIdentifier.getText()
    })
  }

  // make sure that the second array if used is used first and if not add underscores if applicable
  handleArguments(
    funcExpression: ArrowFunction | FunctionExpression | FunctionDeclaration | MethodDeclaration,
    checkUsage = true
  ) {
    const args = funcExpression.getParameters()
    if (args.length < 1) {
      return
    }
    //check if first arg is already event args
    //todo this should only occur if were already on 3.0
    const argType = getType(args[0])
    if (argType?.includes('EventArgs')) {
      return
    }
    const srcParam = args[0].getStructure()
    let evtParam = null

    // remove the second param if there are more than one params
    if (args.length > 1) {
      evtParam = args[1].getStructure()
      const evtUsed = this.isUsed(args[1], funcExpression, checkUsage)
      const srcUsed = this.isUsed(args[0], funcExpression, checkUsage)
      args[0].remove()
      args[1].remove()
      if (evtUsed) {
        funcExpression.insertParameter(0, evtParam)
      } else if (srcUsed) {
        funcExpression.insertParameter(0, { name: '_' })
      }
      if (srcUsed) {
        funcExpression.insertParameter(1, srcParam)
      }
    }
    if (args.length == 1) {
      if (this.isUsed(args[0], funcExpression, checkUsage)) {
        this.insertParameter(funcExpression, args)
      } else {
        args[0].remove()
      }
    }
  }

  private insertParameter(
    funcExpression: ArrowFunction | FunctionExpression | FunctionDeclaration | MethodDeclaration,
    args: ParameterDeclaration[]
  ) {
    try {
      //TODO Insert fails if only one param without ( ) is supplied, in e.g. anonymous functions
      funcExpression.insertParameter(0, { name: '_' })
    } catch {
      //TODO inserting does not check if param is supplied... setHasQuestion does.... post to issue??
      args[0].setHasQuestionToken(true)
      args[0].setHasQuestionToken(false)
      funcExpression.insertParameter(0, { name: '_' })
    }
  }

  handleFunctionObjectArg(arg: Node) {
    let argSymbol

    if (arg.isKind(SyntaxKind.CallExpression)) {
      const expression = arg.getExpression()
      if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        const name = expression.getName()
        if (name == 'bind') {
          argSymbol = expression.getExpression().getSymbol()
        } else {
          argSymbol = expression.getSymbol()
        }
      }
    } else {
      argSymbol = arg?.getSymbol()
    }
    const declarations = argSymbol?.getDeclarations()
    // check if declarations are in this file
    if (
      argSymbol &&
      declarations &&
      declarations
        .map((d) => d.getSourceFile().getFilePath())
        .every((fp) => fp == this.sourceFile.getFilePath())
    ) {
      const decl = declarations[0]
      if (decl) {
        // the function is a property declaration
        if (decl.isKind(SyntaxKind.PropertyDeclaration)) {
          return this.handlePropertyDeclaration(decl)
        }
        if (
          decl.isKind(SyntaxKind.FunctionDeclaration) ||
          decl.isKind(SyntaxKind.MethodDeclaration)
        ) {
          this.handleArguments(decl)
          return
        }
      }
    }
    return
  }

  handlePropertyDeclaration(decl: PropertyDeclaration) {
    // declaration and intialization are separate
    const functionDeclaration = decl.getFirstChildByKind(SyntaxKind.FunctionType)
    const functionExpression = decl.getFirstChildByKind(SyntaxKind.FunctionExpression)
    if (functionDeclaration) {
      this.handleArguments(functionDeclaration as unknown as FunctionExpression, false)
      // handle the initializer
      const references = decl.findReferences()
      for (const referenceSymbol of references) {
        for (const reference of referenceSymbol.getReferences()) {
          const referenceNode = reference.getNode()
          const refParent = referenceNode.getParent()
          if (refParent && refParent.isKind(SyntaxKind.PropertyAccessExpression)) {
            const expression = refParent.getParent()
            if (expression && expression.isKind(SyntaxKind.BinaryExpression)) {
              const rightSide = expression.getRight()
              if (rightSide && ts.isFunctionLike(rightSide.compilerNode)) {
                this.handleArguments(rightSide as FunctionExpression)
              }
            }
          }
        }
      }
    } else if (functionExpression) {
      //declaration and initialization are joint
      this.handleArguments(functionExpression)
    } else if (
      decl.getInitializer()?.isKind(SyntaxKind.CallExpression) ||
      decl.getInitializer()?.isKind(SyntaxKind.PropertyAccessExpression)
    ) {
      // other property bound with this
      const initializer = decl.getInitializer()
      if (initializer) {
        this.handleFunctionObjectArg(initializer)
      }
    }
  }

  private handleEventPropertyAccessExpression = (
    propertyAccessExpression: PropertyAccessExpression,
    adders: Set<string>,
    removers: Set<string>,
    handleFunction: (
      callExpression: CallExpression,
      prefix: string,
      eventString: string,
      propertyAccessExpression: PropertyAccessExpression
    ) => void
  ) => {
    const propertyAccessExpressionName = propertyAccessExpression.getName()
    const isAdder = adders.has(propertyAccessExpressionName)
    const isRemover = removers.has(propertyAccessExpressionName)
    if (checkIfYfiles(propertyAccessExpression.getExpression()) && (isAdder || isRemover)) {
      const prefix = isAdder ? 'add' : 'remove'
      let eventString = this.enrichEventString(
        this.getEventTypeString(propertyAccessExpressionName, prefix)
      )

      const callExpression = propertyAccessExpression.getParent()
      if (callExpression && callExpression.isKind(SyntaxKind.CallExpression)) {
        handleFunction(callExpression, prefix, eventString, propertyAccessExpression)
      }
    }
  }

  private handlePointer = (
    callExpression: CallExpression,
    prefix: string,
    eventString: string,
    propertyAccessExpression: PropertyAccessExpression
  ) => {
    let eventStringPointer = eventString
    if (!eventString.includes('MouseWheel')) {
      eventStringPointer = eventString.replace('mouse', 'pointer').replace('touch', 'pointer')
    }
    this.handleEvents(callExpression, prefix, eventStringPointer, propertyAccessExpression)
  }
  private handleEvents = (
    callExpression: CallExpression,
    prefix: string,
    eventString: string,
    propertyAccessExpression: PropertyAccessExpression
  ) => {
    const arg = callExpression.getArguments()[0]
    if (arg && ts.isFunctionLike(arg.compilerNode)) {
      // the function is an anonymous function
      this.handleArguments(arg as FunctionExpression)
      callExpression.insertArgument(0, `${eventString},`)
      replaceWithTextTryCatch(propertyAccessExpression.getNameNode(), `${prefix}EventListener`)
      this.statisticsReporting.addChangeCount('eventTransformation', 1)
    } else {
      // any more complex case
      this.handleFunctionObjectArg(arg)
      this.statisticsReporting.addChangeCount('eventTransformation', 1)
      callExpression.insertArgument(0, `${eventString},`)
      //TODO this was previously handled in the handleFunctionObjectArg, why?
      replaceWithTextTryCatch(propertyAccessExpression.getNameNode(), `${prefix}EventListener`)
    }
  }
  transform() {
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      this.handleEventPropertyAccessExpression(
        propertyAccessExpression,
        this.listenerAdderNames,
        this.listenerRemoverNames,
        this.handleEvents
      )
      this.handleEventPropertyAccessExpression(
        propertyAccessExpression,
        this.pointerAdderNames,
        this.pointerRemoverNames,
        this.handlePointer
      )
    }

    return
  }

  private enrichEventString(eventTypeString: string): string {
    if (Object.hasOwn(this.addComment, eventTypeString)) {
      return `'${eventTypeString}'/*TODO-Migration ${this.addComment[eventTypeString]}*/`
    } else {
      return `'${eventTypeString}'`
    }
  }
}
