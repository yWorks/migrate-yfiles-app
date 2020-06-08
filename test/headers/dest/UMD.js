import { GraphEditorInputMode, IGraph, INode, PopulateItemContextMenuEventArgs } from "yfiles";
// this is what 1.3 looked like
;(function(r) {
  yfiles.module('demo', function(exports) {
    /**
     * Shows how to implement a dynamic context menu for the nodes and for the
     * background of a {@link demo.ContextMenuDemo#graphControl}.
     * @class demo.ContextMenuDemo
     * @extends {demo.Application}
     */
    exports.ContextMenuDemo = new yfiles.ClassDefinition(function() {
      /** @lends {demo.ContextMenuDemo.prototype} */
      return {
        $extends: demo.Application,

        /**
         * Creates the context menu and registers it at the graph control of this
         * demo.
         * Note that this is the only place that interfaces with the Context Menu
         * API. The remainder of the implementation shows how this can be
         * customized, but for simple scenarios, all that needs to be done is shown
         * in this method.
         * @private
         */
        initializeContextMenu: function() {
          var graphControl = this.graphControl
          var graphEditorInputMode =
            /**@type {GraphEditorInputMode}*/ (graphControl.inputMode)

          // Create a context menu
          var contextMenu = new demo.ContextMenu()
          // If the context menu closes itself, for example because a menu item was clicked,
          // we must inform the input mode
          contextMenu.setOnCloseCallback(function() {
            graphEditorInputMode.contextMenuInputMode.menuClosed()
          })
          // Add item-specific menu entries
          graphEditorInputMode.addPopulateItemContextMenuListener(
            function(
              sender,
              /**PopulateItemContextMenuEventArgs.<yfiles.model.IModelItem>*/ args
            ) {
              this.populateContextMenu(contextMenu, args)
            }.bind(this)
          )

          // Add a listener that closes the menu when the input mode request this
          graphEditorInputMode.contextMenuInputMode.addCloseMenuListener(function(
            sender,
            /**yfiles.system.EventArgs*/ args
          ) {
            contextMenu.close()
          })

          // Add event listeners for the 'contextmenu' event. The callback actually shows the context menu
          demo.ContextMenu.addEventListeners(
            this.graphControl.div,
            function(/**yfiles.geometry.PointD*/ location) {
              var cancelEventArgs = new yfiles.system.CancelEventArgs()
              var worldLocation = this.graphControl.toWorldCoordinates(
                this.graphControl.globalToLocal(location.clone())
              )

              // Inform the input mode that a context menu should be opened
              graphEditorInputMode.contextMenuInputMode.menuOpeningForQueryLocation(
                cancelEventArgs,
                worldLocation.clone()
              )

              // Check whether showing the context menu was not canceled
              if (!cancelEventArgs.cancel) {
                contextMenu.show(location)
              }
            }.bind(this)
          )
        },

        /** @private */
        populateContextMenu: function(
          /**demo.ContextMenu*/ contextMenu,
          /**PopulateItemContextMenuEventArgs.<yfiles.model.IModelItem>*/ e
        ) {
          contextMenu.clearItems()
          e.showMenu = true

          var node = INode.isInstance(e.item)
            ? /**@type {INode}*/ (e.item)
            : null
          // If the cursor is over a node select it
          this.updateSelection(node)

          // Create the context menu items
          var graphControl = this.graphControl
          if (graphControl.selection.selectedNodes.count > 0) {
            contextMenu.addMenuItem(
              'Cut',
              function(/**Event*/ evt) {
                yfiles.system.ApplicationCommands.CUT.executeOnTarget(null, this.graphControl)
              }.bind(this)
            )
            contextMenu.addMenuItem(
              'Copy',
              function(/**Event*/ evt) {
                yfiles.system.ApplicationCommands.COPY.executeOnTarget(null, this.graphControl)
              }.bind(this)
            )
            contextMenu.addMenuItem(
              'Delete',
              function(/**Event*/ evt) {
                yfiles.system.ApplicationCommands.DEL.executeOnTarget(null, this.graphControl)
              }.bind(this)
            )
          } else {
            // no node has been hit
            contextMenu.addMenuItem(
              'Select all',
              function(/**Event*/ evt) {
                yfiles.system.ApplicationCommands.SELECT_ALL.executeOnTarget(
                  null,
                  this.graphControl
                )
              }.bind(this)
            )
            contextMenu.addMenuItem(
              'Paste',
              function(/**Event*/ evt) {
                yfiles.system.ApplicationCommands.PASTE.executeOnTarget(
                  e.queryLocation,
                  this.graphControl
                )
              }.bind(this)
            )
          }
        },

        /**
                   * Helper method that updates the node selection state when the context menu is opened on a node.
                   * @param {INode} node The node or <code>null</code>.
                   * @private
                   */
        updateSelection: function(/**INode*/ node) {
          var graphControl = this.graphControl
          if (node === null) {
            // clear the whole selection
            graphControl.selection.clear()
          } else {
            // see if the node was selected, already
            if (!graphControl.selection.selectedNodes.isSelected(node)) {
              // no - clear the remaining selection
              graphControl.selection.clear()
              // and select the node
              graphControl.selection.selectedNodes.setSelected(node, true)
              // also update the current item
              graphControl.currentItem = node
            }
          }
        },

        loaded: function() {
          // Create a default editor input mode
          this.graphControl.inputMode = new GraphEditorInputMode()

          this.initializeContextMenu()

          // Set a nicer node style and create the sample graph
          demo.initDemoStyles(this.graphControl.graph)
          createSampleGraph(this.graphControl.graph)
        },

        /** @type {yfiles.canvas.GraphControl} */
        graphControl: null
      };

      function createSampleGraph(/**IGraph*/ graph) {
        graph.addLabel(graph.createNodeWithCenter(new yfiles.geometry.PointD(100, 100)), '1')
        graph.addLabel(graph.createNodeWithCenter(new yfiles.geometry.PointD(200, 100)), '2')
        graph.addLabel(graph.createNodeWithCenter(new yfiles.geometry.PointD(300, 100)), '3')
      }
    })
  })
  export default yfiles.module('demo');
})(
  'undefined' != typeof window
    ? window
    : 'undefined' != typeof global
    ? global
    : 'undefined' != typeof self
    ? self
    : this
)
