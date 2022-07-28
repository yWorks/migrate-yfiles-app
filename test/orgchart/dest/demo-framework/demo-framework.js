import * as yfiles_module_demo from "yfiles.module('demo')";

import {
  Abstract,
  Class,
  Enum,
  EnumDefinition,
  EventArgs,
  Exception,
  GraphComponent,
  GraphMLIOHandler,
  GraphOverviewComponent,
  ICommand,
  IComparer,
  IEnumerable,
  IEnumerator,
  IGraph,
  ILabel,
  INode,
  IPort,
  Insets,
  InterfaceDefinition,
  List,
  ParseEventArgs,
  Point,
  Rect,
  Size,
  SvgExport,
  YString,
  delegate,
} from "yfiles";

import { BaseClass } from "yfiles";
/****************************************************************************
 **
 ** This demo file is part of yFiles for HTML 1.3.0.7.
 ** Copyright (c) 2000-2017 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
(function(r){
  (function(window)  {
    /**
     * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
     * @class demo.StylePanel
     */
    export const StylePanel = class StylePanel {
      constructor(/**HTMLDivElement*/ div) {
        /**
         * The desired maximum width of each item. This value is used to decide whether or not a
         * visualization must be scaled down.
         * @type {number}
         */
        this.maxItemWidth = 0;

        /**
         * The main element of this panel.
         * @type {HTMLDivElement}
         * @private
         */
        this.div = null;

        /**
         * A callback that is called then the user presses the mouse button on an item. 
         * It should start the actual drag and drop operation.
         * @type {function(HTMLElement, Object)}
         */
        this.beginDragCallback = null;

        this.div = div;
        this.maxItemWidth = 150;
      }

      /**
       * Adds the items provided by the given factory to this palette.
       * This method delegates the creation of the visualization of each node 
       * to the method {@link demo.StylePanel#createNodeVisual}.
       */
      populatePanel(/**function():INode[]*/ itemFactory) {
        if (!itemFactory) {
          return;
        }

        // Create the nodes that specify the visualizations for the panel.
        var items = itemFactory();

        // Convert the nodes into plain visualizations
        var graphControl = new GraphComponent();
        var /**number*/ i;
        for (i = 0; i < items.length; i++) {
          var node = items[i];
          var visual = this.createNodeVisual(node, graphControl);
          addPointerDownListener(node, visual, this.beginDragCallback);
          this.div.appendChild(visual);
        }
      }

      /**
       * Creates an element that contains the visualization of the given node.
       * This method is used by {@link demo.StylePanel#populatePanel} to create the visualization
       * for each node provided by the factory.
       * @return {HTMLDivElement}
       * @private
       */
      createNodeVisual(/**INode*/ original, /**yfiles.canvas.GraphControl*/ graphControl) {
        var graph = graphControl.graph;
        graph.clear();

        var node = graph.createNode(original.layout.toRectD(), original.style, original.tag);
        original.labels.forEach(function(/**ILabel*/ label) {
          graph.addLabel(node, label.text, label.labelModelParameter, label.style, label.preferredSize, label.tag);
        });
        original.ports.forEach(function(/**IPort*/ port) {
          graph.addPort(node, port.locationModelParameter, port.style, port.tag);
        });
        updateViewport(graphControl);

        var exporter = new SvgExport(graphControl.contentRect);
        exporter.margin = new Insets(5);

        exporter.setScaleForWidth(Math.min(this.maxItemWidth, graphControl.contentRect.width));
        var element = exporter.exportSvg(graphControl);

        // Firefox does not display the SVG correctly because of the clip - so we remove it.
        element.removeAttribute("clip-path");
        return wrapNodeVisual(element);
      }
    };

    /**
     * @class demo.DemoDialogFactory
     */
    export const DemoDialogFactory = class DemoDialogFactory {
      /** @return {Element[]} */
      static createPlainDialog(/**string*/ titleText) {
        var dialogAnchor = document.createElement("div");
        demo.ElementExtensions.addClass(dialogAnchor, "demo-dialog-anchor");

        var dialogPanel = document.createElement("div");
        demo.ElementExtensions.addClass(dialogPanel, "demo-dialog");

        var title = document.createElement("h2");
        ((/**@type {HTMLElement}*/(title))).innerHTML = titleText;

        var contentPanel = document.createElement("div");
        demo.ElementExtensions.addClass(contentPanel, "demo-dialog-content");

        dialogAnchor.appendChild(dialogPanel);
        dialogPanel.appendChild(title);
        dialogPanel.appendChild(contentPanel);

        return [dialogAnchor, dialogPanel, title, contentPanel];
      }

      /** @return {Element} */
      static createErrorDialog(
        /**string*/ errorMessage,
        /**string*/ url,
        /**number*/ lineNumber,
        /**number*/ columnNumber,
        error
      ) {
        /*final*/ var actionUrl = "http://kb.yworks.com/errorFeedback.html";
        var elements = demo.DemoDialogFactory.createPlainDialog("Report Error to yWorks");
        var dialogRoot = elements[0];
        var parent = document.body;

        demo.ElementExtensions.addClass(elements[1], "demo-error-dialog");

        var form = (/**@type {HTMLFormElement}*/(document.createElement("form")));
        demo.ElementExtensions.addClass(form, "demo-properties");
        form.setAttribute("method", "POST");
        form.setAttribute("target", "_blank");
        form.setAttribute("action", actionUrl);
        elements[3].appendChild(form);

        // create form element
        addHiddenField(form, "exact_product", yfiles.productname);
        if (key) {
          addHiddenField(form, "license_key", yfiles.license["key"].substr(0, 16));
        }
        addHiddenField(form, "license_expiry", (/**@type {string}*/(yfiles.license["expires"])));
        addHiddenField(form, "version", yfiles.version);
        var inputEmail = addFormRow(form, "email", "E-Mail <span class=\"optional\">In case we need to contact you</span>", "text", "");
        ((/**@type {HTMLTextAreaElement}*/(addFormRow(form, "system", "System Info", "textarea", "appVersion: " + window.navigator.appVersion + "\nVendor: " + window.navigator.vendor + "\nOS: " + window.navigator.platform + "\nuserAgent: " + window.navigator.userAgent)))).rows = 2;
        addFormRow(form, "url", "URL", "text", window.top.location.href);
        if (!error) {
          // The error object is not available, use the provided values
          addFormRow(form, "error_message", "Error Message", "text", errorMessage);
          addFormRow(form, "file", "File", "text", url);
          addFormRow(form, "error_Line", "Line number", "text", lineNumber + "");
          addFormRow(form, "error_column", "Column number", "text", columnNumber + "");
        } else {
          var err = (/**@type {Object}*/(error));
          tryAddFormRow(form, "error_message", "Error Message", "text", typeof(err["name"]) !== "undefined" ? err["name"] + ": " + err["message"] : err["message"]);
          tryAddFormRow(form, "stack", "Stack", "textarea", encode(typeof(err["stacktrace"]) !== "undefined" ? err["stacktrace"] : err["stack"]));
          tryAddFormRow(form, "error_line", "Error Line", "text", typeof(err["line"]) !== "undefined" ? err["line"] : err["lineNumber"]);
          tryAddFormRow(form, "error_column", "Error Column", "text", err["columnNumber"]);
          tryAddFormRow(form, "error_source", "Error Source", "text", err["sourceURL"]);
        }

        var inputComment = addFormRow(form, "comment", "Additional Comments", "textarea", "");

        // if yFiles for HTML require.js was used to load modules, also add information about the loaded modules
        var require = window["require"];
        if (typeof(require) !== "undefined" && typeof(require["getRequiredModuleStates"]) !== "undefined") {
          var moduleInfoText = "";
          var definedModules = "";
          var f = (/**@type {system.Func.<yfiles.lang.ModuleInfo[]>}*/((require["getRequiredModuleStates"])));
          var /**yfiles.lang.ModuleInfo[]*/ arr;
          var /**number*/ i;
          for (i = 0, arr = f(); i < arr.length; i++) {
            var moduleInfo = arr[i];
            if (moduleInfo.state === "defined") {
              definedModules += moduleInfo.name + "\n";
            } else {
              moduleInfoText += moduleInfo.name + ": " + moduleInfo.state + "\n";
            }
          }
          if (definedModules.length > 0) {
            moduleInfoText += "Defined:\n" + definedModules;
          }
          if (moduleInfoText.length > 0) {
            moduleInfoText = moduleInfoText.substr(0, moduleInfoText.length - 1);
          }
          addFormRow(form, "loaded_modules", "Loaded Modules", "textarea", moduleInfoText);
        }

        var submitButton = document.createElement("button");
        submitButton.setAttribute("type", "submit");
        submitButton.addEventListener("click", function(/**Event*/ evt) {
          setTimeout(function() {
            parent.removeChild(dialogRoot);
            demo.Application.errorDialogOpen = false;
          }, 10);
        }, false);
        submitButton.textContent = "Submit";
        form.appendChild(submitButton);

        var cancelButton = document.createElement("button");
        cancelButton.setAttribute("type", "reset");
        cancelButton.addEventListener("click", function(/**Event*/ evt) {
          parent.removeChild(dialogRoot);
          demo.Application.errorDialogOpen = false;
        }, false);
        cancelButton.textContent = "Cancel";
        form.appendChild(cancelButton);

        //Submit form data automatically if url is on *.yworks.com
        if ((new RegExp("^[^.]+(\\.yworks\\.com)+", "i")).test(window.top.location.href) && !inErrorState() && window["FormData"] !== undefined) {
          var xhr = new XMLHttpRequest();
          var formData = new FormData(form);
          formData.append("error_dialog_suppressResponse", "1");
          xhr.open("POST", actionUrl, true);
          xhr.send(formData);
          //After automatic submit, activate the submit button only if user enters custom information
          submitButton.setAttribute("type", "button");
          inputEmail.addEventListener("change", function(/**Event*/ args) {
            submitButton.setAttribute("type", "submit");
          }, false);
          inputComment.addEventListener("change", function(/**Event*/ args) {
            submitButton.setAttribute("type", "submit");
          }, false);
        }

        return dialogRoot;
      }
    };

    /**
     * @class demo.ElementCommand
     * @implements {yfiles.system.ICommand}
     */
    export const ElementCommand = class ElementCommand extends BaseClass(ICommand) {
      constructor(/**function(HTMLElement)*/ action) {
        super();

        /**
         * @type {function(HTMLElement)}
         * @private
         */
        this.action = null;

        /**
         * Backing field for below event.
         * @type {function(Object, yfiles.system.EventArgs)}
         * @private
         */
        this.$canExecuteChangedEvent = null;

        this.action = action;
      }

      /** @return {boolean} */
      canExecute(parameter) {
        return parameter instanceof HTMLElement;
      }

      execute(parameter) {
        this.action((parameter instanceof HTMLElement) ? (/**@type {HTMLElement}*/(parameter)) : null);
      }

      addCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.combine(this.$canExecuteChangedEvent, value);
      }

      removeCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.remove(this.$canExecuteChangedEvent, value);
      }
    };

    /**
     * @class demo.ActionCommand
     * @implements {yfiles.system.ICommand}
     */
    export const ActionCommand = class ActionCommand extends BaseClass(ICommand) {
      constructor(/**function()*/ action) {
        super();

        /**
         * @type {function()}
         * @private
         */
        this.action = null;

        /**
         * Backing field for below event.
         * @type {function(Object, yfiles.system.EventArgs)}
         * @private
         */
        this.$canExecuteChangedEvent = null;

        this.action = action;
      }

      addCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.combine(this.$canExecuteChangedEvent, value);
      }

      removeCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.remove(this.$canExecuteChangedEvent, value);
      }

      execute(parameter) {
        this.action();
      }

      /** @return {boolean} */
      canExecute(parameter) {
        return true;
      }
    };

    /**
     * Base class for yFiles for HTML demo applications.
     * @class demo.Application
     * @abstract
     */
    export const Application = class Application {
      constructor() {
        /**
         * Called after this application has been set up by the demo framework.
         */
        this.loaded = Abstract;
      }

      /**
       * Registers the JavaScript commands for the GUI elements, typically the
       * tool bar buttons, during the creation of this application.
       */
      registerCommands() {}

      setProperty(/**string*/ name, value) {
        this[name] = value;
      }

      /** @return {Object} */
      getProperty(/**string*/ name) {
        var property = this[name];
        return property ? property : null;
      }

      setTitle(/**string*/ title) {
        document.title = title;
      }

      /**
             * Reads a graph from the given filename.
             * @param {IGraph} graph The graph.
             * @param {string} filename The filename
             * @param {function(Object, ParseEventArgs)} afterParsing A function that is called after the parsing. Can be null.
             * @return {boolean} false iff we did not succeed at all
             */
      readGraph(
        /**IGraph*/ graph,
        /**string*/ filename,
        /**function(Object, ParseEventArgs)*/ afterParsing
      ) {
        graph.clear();
        var ioHandler = this.createGraphMLIOHandler();
        ioHandler.addParsedListener(afterParsing);

        var message = "Unable to open the graph.\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.";
        ioHandler.addParsedListener(function(sender, /**ParseEventArgs*/ args) {
          var parsedGraph = args.context.graph;
          if (parsedGraph.nodes.count === 0 && window.location.protocol.toLowerCase().indexOf("file") >= 0) {
            alert(message);
          }
        });

        try {
          ioHandler.readFromURL(graph, filename);
          return true;
        } catch ( /**Exception*/ e ) {
          {
            var error = (/**@type {Object}*/(e));
            if (error["message"]) {
              message += "\n" + error["message"] + "\n";
            }
            alert(message);
            return false;
          }
        }
      }

      /** @return {GraphMLIOHandler} */
      createGraphMLIOHandler() {
        return new GraphMLIOHandler();
      }

      /**
       * Returns version of IE if browser is MS Internet Explorer.
       * Tested for Internet Explorer/Edge versions up to 12.
       * http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
       * @return {number} 
       * Version of IE if browser is MS Internet Explorer/Edge or
       * -1 if browser is not InternetExplorer/Edge.
       */
      static detectInternetExplorerVersion() {
        //environments without window object
        if (typeof(window) === "undefined" || typeof(window.navigator) === "undefined") {
          return -1;
        }

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0) {
          return parseInt(ua.substr(msie + 5, yfiles.system.StringExtensions.indexOf(ua, ".", msie)), 10);
        }

        var trident = ua.indexOf("Trident/");
        if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf("rv:");
          return parseInt(ua.substr(rv + 3, yfiles.system.StringExtensions.indexOf(ua, ".", rv)), 10);
        }

        var edge = ua.indexOf("Edge/");
        if (edge > 0) {
          //IE 12 => return version number
          return parseInt(ua.substr(edge + 5, yfiles.system.StringExtensions.indexOf(ua, ".", edge)), 10);
        }

        return -1;
      }

      /**
       * Starts the creation of the given yFiles for HTML demo application.
       * This method creates the GUI widgets specified in the base HTML file,
       * then invokes {@link demo.Application#registerCommands} and finally
       * {@link demo.Application#loaded}.
       * @param {demo.Application} application The demo application to create.
       * @param {Object} appRootOrId The root element of the application, either the element itself or its ID.
       * @param {Object} config Configuration settings.
       */
      static start(/**demo.Application*/ application, appRootOrId, /**Object*/ config) {
        var internetExplorerVersion = demo.Application.detectInternetExplorerVersion();
        var windowsVersion = detectWindowsVersion();

        // Enable support for labels with consecutive spaces in IE
        if (internetExplorerVersion !== -1) {
          yfiles.workaroundIE964525 = true;
        }
        // Fix uppercase attribute names in Edge 
        if (internetExplorerVersion >= 12) {
          yfiles.workaroundEDGE2057021 = true;
        }
        // Fix broken hrefs in IE11 on windows 10
        if (internetExplorerVersion === 11 && windowsVersion === 10) {
          yfiles.workaroundIE2337112 = true;
        }

        // Prevent default for context menu key - it is handled by the context menu implementation
        yfiles.workaroundCR433873 = true;

        var chromeVersion = detectChromeVersion();
        if (chromeVersion > 46) {
          // 24: flush uses requestAnimationFrame, which might add another delay of about max. 16ms.
          // 42ms (24fps) should still be ok.
          yfiles.workaroundCR570845 = 24;
        }
        var catchErrors = !!config["catchErrors"];
        if (catchErrors) {
          Exception.catchErrors = true;
          Exception.handler = function(e) {
            demo.Application.handleError(e, "", 0);
          };
          window.onerror = function(/**string*/ message, /**string*/ url, /**number*/ lineNumber, /**number*/ columnNumber, error) {
            var cl = typeof(columnNumber) === "number" ? columnNumber : 0;
            var e = typeof(error) !== "undefined" ? error : null;
            // no automatic error reporting for GraphML parsing errors
            if (e instanceof Exception && ((/**@type {yfiles.system.IOException}*/(e))).message.indexOf("XML Parsing Error") === 0) {
              var errMessage = "File parsing failed. Maybe the provided file format was not expected or the file's integrity is corrupt.";
              var err = (/**@type {Object}*/(e));
              if (err["message"]) {
                errMessage += "\n" + err["message"] + "\n";
              }
              window.alert(errMessage);
              return true;
            }

            if (demo.Application.errorDialogOpen) {
              return true;
            }
            demo.Application.errorDialogOpen = true;
            document.body.appendChild(demo.DemoDialogFactory.createErrorDialog(message, url, lineNumber, cl, e));
            // Don't move the App Status before the error dialog creation. Otherwise, automatic sending will be disabled.
            window["yFilesAppStatus"] = message ? demo.Application.ERROR_STATE + " " + message : demo.Application.ERROR_STATE;
            return true;
          };
        }

        var appRoot = typeof(appRootOrId) === "string" ? document.getElementById((/**@type {string}*/(appRootOrId))) : (/**@type {Element}*/(appRootOrId));
        var backend = demo.BackendFactory.getBackend(typeof(config["backend"]) === "string" ? config["backend"] : "yfiles");

        var callback = function() {
          try {
            var appConverter = new demo.ApplicationParser();
            appConverter.application = application;
            appConverter.backend = backend;

            var frame = appConverter.parseApplication(appRoot);
            var loaderId = config["loaderId"];
            if (typeof(config["loaderId"]) === "string") {
              var loader = document.getElementById(loaderId);
              loader.style.setProperty("display", "none", "");
            }
            application.registerCommands();
            appConverter.bindCommands(frame);
            application.loaded();
            var loadedCallback = config["loadedCallback"];
            if (typeof(loadedCallback) === "function") {
              ((/**@type {system.Action}*/(loadedCallback)))();
            }
            setTimeout(function() {
              if (!window["yFilesAppStatus"]) {
                window["yFilesAppStatus"] = demo.Application.OK_STATE;
              }
            }, 10000);
          } catch ( /**Error*/ e ) {
            if (e instanceof Error) {
              if (catchErrors) {
                demo.Application.handleError(e, "", 0);
              } else {
                //Re-throw
                throw e;
              }
            } else if (e instanceof Exception) {
              if (catchErrors) {
                demo.Application.handleError(e, "", 0);
              } else {
                //Re-throw
                throw e;
              }
            } else {
              throw e;
            }
          }
        };
        if (document.readyState === "complete" || document.readyState === "interactive") {
          callback();
        } else {
          backend.addOnLoadCallback(callback);
        }
      }

      /** @return {boolean} */
      static handleError(error, /**string*/ url, /**number*/ lineNumber) {
        if (demo.Application.errorDialogOpen) {
          return true;// prevent default
        }
        demo.Application.errorDialogOpen = true;
        var dialogAnchor = YString.$class.isInstance(error) ? demo.DemoDialogFactory.createErrorDialog((/**@type {string}*/(error)), url, lineNumber, 0, null) : demo.DemoDialogFactory.createErrorDialog(null, url, lineNumber, 0, error);

        document.body.appendChild(dialogAnchor);
        // Don't move the App Status before the error dialog creation. Otherwise, automatic sending will be disabled.
        window["yFilesAppStatus"] = error ? demo.Application.ERROR_STATE + " " + error.toString() : demo.Application.ERROR_STATE;
        return true;// prevent default
      }

      static removeAllChildren(/**HTMLElement*/ element) {
        if (element.children !== undefined) {
          var n = element.children.length;
          for (var i = 0; i < n; i++) {
            var child = (/**@type {Element}*/(element.children[0]));
            element.removeChild(child);
          }
        }
      }
    };

    /** @type {string} */
    Application.OK_STATE = "OK";

    /** @type {string} */
    Application.ERROR_STATE = "Error!";

    /**
     * Set to <code>true</code> when {@link demo.Application#handleError} is called. Prevents opening of multiple
     * error dialogs.
     * @type {boolean}
     * @private
     */
    Application.errorDialogOpen = false;

    /**
     * @class demo.ApplicationCommand
     * @implements {yfiles.system.ICommand}
     */
    export const ApplicationCommand = class ApplicationCommand extends BaseClass(ICommand) {
      static WithParameter(
        /**yfiles.system.RoutedUICommand*/ uiCommand,
        /**yfiles.canvas.Control*/ target,
        parameter
      ) {
        throw new Error("Migrate named constructor WithParameter!");
        demo.ApplicationCommand.call(this, uiCommand, target);
        this.parameter = parameter;
      }

      constructor(
        /**yfiles.system.RoutedUICommand*/ uiCommand,
        /**yfiles.canvas.Control*/ target
      ) {
        super();

        /**
         * @type {yfiles.system.RoutedUICommand}
         * @private
         */
        this.uiCommand = null;

        /**
         * @type {yfiles.canvas.Control}
         * @private
         */
        this.target = null;

        /** @type {Object} */
        this.parameter = null;

        /**
         * Backing field for below event.
         * @type {function(Object, yfiles.system.EventArgs)}
         * @private
         */
        this.$canExecuteChangedEvent = null;

        this.uiCommand = uiCommand;
        this.target = target;

        uiCommand.addCanExecuteChangedListener(delegate(this.uiCommand_CanExecuteChanged, this));
      }

      dispose() {
        this.uiCommand.removeCanExecuteChangedListener(delegate(this.uiCommand_CanExecuteChanged, this));
      }

      /** @private */
      uiCommand_CanExecuteChanged(sender, /**yfiles.system.EventArgs*/ e) {
        if (this.$canExecuteChangedEvent !== null) {
          this.$canExecuteChangedEvent(sender, e);
        }
      }

      addCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.combine(this.$canExecuteChangedEvent, value);
      }

      removeCanExecuteChangedListener(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = delegate.remove(this.$canExecuteChangedEvent, value);
      }

      execute(ignored) {
        this.uiCommand.executeOnTarget(this.parameter, this.target);
      }

      /** @return {boolean} */
      canExecute(ignored) {
        return this.uiCommand.canExecuteOnTarget(this.parameter, this.target);
      }
    };

    /**
     * Responsible for creating or retrieving the {@link demo.IApplicationParserBackend}.
     * To register a new backend, just add it to the {@link demo.BackendFactory#BackendRegistry} field and pass the used key to
     * the {@link demo.Application#start} in
     * the "options" parameter.
     * @class demo.BackendFactory
     */
    export const BackendFactory = class BackendFactory {
      /** @return {demo.IApplicationParserBackend} */
      static getBackend(/**string*/ name) {
        if (demo.BackendFactory.BackendRegistry[name] !== undefined) {
          return demo.BackendFactory.currentBackend = (/**@type {demo.IApplicationParserBackend}*/(demo.BackendFactory.BackendRegistry[name]));
        }
        return demo.BackendFactory.currentBackend = new demo.DefaultApplicationParserBackend();
      }
    };

    /** @type {Object} */
    BackendFactory.BackendRegistry = null;

    /** @type {demo.IApplicationParserBackend} */
    BackendFactory.currentBackend = null;

    {
      demo.BackendFactory.BackendRegistry = new Object();
    }

    /**
     * @class demo.ElementDimensions
     */
    export const ElementDimensions = new yfiles.lang.StructDefinition(function() {
      /** @lends {demo.ElementDimensions.prototype} */
      return {
        'constructor': function(/**HTMLElement*/ element) {
          demo.ElementDimensions.createDefault.call(this);
          var style = getComputedStyle(element);

          if (style) {
            var pl = parseFloat(style.getPropertyValue("padding-left"));
            var pt = parseFloat(style.getPropertyValue("padding-top"));
            var pr = parseFloat(style.getPropertyValue("padding-right"));
            var pb = parseFloat(style.getPropertyValue("padding-bottom"));
            var ml = parseFloat(style.getPropertyValue("margin-left"));
            var mt = parseFloat(style.getPropertyValue("margin-top"));
            var mr = parseFloat(style.getPropertyValue("margin-right"));
            var mb = parseFloat(style.getPropertyValue("margin-bottom"));
            var w = parseFloat(style.getPropertyValue("width"));
            var h = parseFloat(style.getPropertyValue("height"));
            var bl = parseFloat(style.getPropertyValue("border-left-width"));
            var bt = parseFloat(style.getPropertyValue("border-top-width"));
            var br = parseFloat(style.getPropertyValue("border-right-width"));
            var bb = parseFloat(style.getPropertyValue("border-bottom-width"));
            this.paddingField = new Insets(pl, pt, pr, pb);
            this.marginField = new Insets(ml, mt, mr, mb);
            this.borderField = new Insets(bl, bt, br, bb);
            this.sizeField = new Size(w, h);
          } else {
            this.paddingField = Insets.EMPTY;
            this.marginField = Insets.EMPTY;
            this.borderField = Insets.EMPTY;
            this.sizeField = Size.EMPTY;
          }

          var rect = element.getBoundingClientRect();

          this.locationField = new Point(rect.left, rect.top);
          this.boundsField = new Rect(this.locationField.x - this.marginField.left, this.locationField.y - this.marginField.top, rect.width + this.marginField.left + this.marginField.right, rect.height + this.marginField.top + this.marginField.bottom);
          this.contentRectField = new Rect(this.paddingField.left, this.paddingField.top, rect.width - this.borderField.horizontalInsets - this.paddingField.horizontalInsets, rect.height - this.borderField.verticalInsets - this.paddingField.verticalInsets);
        },
        
        /**
         * @type {yfiles.geometry.InsetsD}
         * @private
         */
        'paddingField': null,
        
        /**
         * @type {yfiles.geometry.InsetsD}
         * @private
         */
        'marginField': null,
        
        /**
         * @type {yfiles.geometry.InsetsD}
         * @private
         */
        'borderField': null,
        
        /**
         * @type {yfiles.geometry.SizeD}
         * @private
         */
        'sizeField': null,
        
        /**
         * @type {yfiles.geometry.PointD}
         * @private
         */
        'locationField': null,
        
        /**
         * @type {yfiles.geometry.RectD}
         * @private
         */
        'boundsField': null,
        
        /**
         * @type {yfiles.geometry.RectD}
         * @private
         */
        'contentRectField': null,
        
        /** @type {yfiles.geometry.RectD} */
        'contentRect': {
          'get': function() {
            return this.contentRectField.clone();
          }
        },
        
        /** @type {yfiles.geometry.InsetsD} */
        'border': {
          'get': function() {
            return this.borderField.clone();
          }
        },
        
        /** @type {yfiles.geometry.InsetsD} */
        'padding': {
          'get': function() {
            return this.paddingField.clone();
          }
        },
        
        /** @type {yfiles.geometry.InsetsD} */
        'margin': {
          'get': function() {
            return this.marginField.clone();
          }
        },
        
        /** @type {yfiles.geometry.SizeD} */
        'size': {
          'get': function() {
            return this.sizeField.clone();
          }
        },
        
        /** @type {yfiles.geometry.PointD} */
        'location': {
          'get': function() {
            return this.locationField.clone();
          }
        },
        
        /** @type {yfiles.geometry.RectD} */
        'bounds': {
          'get': function() {
            return this.boundsField.clone();
          }
        }
        
      };
    });

    /**
     * @interface demo.IComponent
     */
    export const IComponent = new InterfaceDefinition(function() {
      /** @lends {demo.IComponent.prototype} */
      return {
        /** @type {Element} */
        'element': {
          'get': Abstract
        },
        
        'setSize': Abstract,
        
        'setSizeWithUnit': Abstract,
        
        'setLocation': Abstract,
        
        'setBounds': Abstract,
        
        /** @return {demo.ElementDimensions} */
        'getDimensions': Abstract,
        
        'setStyleProperty': Abstract
        
      };
    });

    /**
     * Walks through a given DOM Element and its children and modifies the DOM to represent a fully functional application.
     * @class demo.ApplicationParser
     */
    export const ApplicationParser = class ApplicationParser {
      constructor() {
        /**
         * @type {string}
         * @private
         */
        this.lastInputDevice = "mouse";

        /** @type {demo.Application} */
        this.application = null;

        /** @type {demo.IApplicationParserBackend} */
        this.backend = null;
      }

      /** @return {demo.IApplicationFrame} */
      parseApplication(/**Element*/ appRoot) {
        var conversionResult = this.convertElement((/**@type {HTMLElement}*/(appRoot)), null);
        var component = conversionResult.component;
        if (demo.IApplicationFrame.isInstance(component)) {
          var applicationFrame = ((/**@type {demo.IApplicationFrame}*/(component)));
          applicationFrame.init();
          return applicationFrame;
        }
        return null;
      }

      /**
       * @return {demo.ConversionResult}
       * @private
       */
      convertElement(/**HTMLElement*/ element, /**demo.IContainer*/ parent) {
        var conversionResult = this.convert(element);

        if (conversionResult !== null) {
          if (parent !== null) {
            parent.add(conversionResult.component);
          }

          if (!conversionResult.traverseChildren) {
            return conversionResult;
          }
        }

        var convertedElement = conversionResult !== null && conversionResult.hasReplacement ? conversionResult.replacement : element;

        var nextParent = conversionResult !== null && demo.IContainer.isInstance(conversionResult.component) ? (/**@type {demo.IContainer}*/(conversionResult.component)) : parent;

        if (!convertedElement.children) {
          // this can happen for svg elements in IE
          return conversionResult;
        }

        var /**HTMLElement[]*/ arr;
        var /**number*/ i;
        for (i = 0, arr = convertedElement.children; i < arr.length; i++) {
          var child = arr[i];
          if (child.nodeType === Node.ELEMENT_NODE) {
            this.convertElement(child, nextParent);
          }
        }
        return conversionResult;
      }

      /**
       * Adjusts hitTestRadius and dragSize depending on the input device.
       * @param {yfiles.canvas.GraphControl} control 
       * @param {HTMLElement} element 
       * @private
       */
      adjustGestureRecognizerThresholds(/**yfiles.canvas.GraphControl*/ control, /**HTMLElement*/ element) {
        var touchStartListener = (function(/**Event*/ evt) {
          if (this.lastInputDevice !== "touch") {
            control.dragSize = new Size(20, 20);
            control.hitTestRadius = 8;
            this.lastInputDevice = "touch";
          }
        }).bind(this);
        var mouseDownListener = (function(/**Event*/ evt) {
          if (this.lastInputDevice !== "mouse") {
            control.dragSize = new Size(5, 5);
            control.hitTestRadius = 3;
            this.lastInputDevice = "mouse";
          }
        }).bind(this);
        var pointerEnterListener = (function(/**Event*/ evt) {
          var pointerType = evt["pointerType"];
          switch ((/**@type {string}*/(pointerType))) {
            case "touch":
              control.dragSize = new Size(20, 20);
              control.hitTestRadius = 8;
              this.lastInputDevice = "touch";
              break;
            case "pen":
              control.dragSize = new Size(20, 20);
              control.hitTestRadius = 8;
              this.lastInputDevice = "pen";
              break;
            default:
              control.dragSize = new Size(5, 5);
              control.hitTestRadius = 3;
              this.lastInputDevice = "mouse";
              break;
          }
        }).bind(this);
        if (control) {
          // Chrome, Android, ... (touch on desktop FF are mouse events)
          element.addEventListener("touchstart", touchStartListener, false);
          // everything besides IE10+ and Edge (-> pointer first)
          element.addEventListener("mousedown", mouseDownListener, false);
          // IE 10+ and Edge
          element.addEventListener("pointerenter", pointerEnterListener, false);
          // IE 9
          element.addEventListener("MSPointerEnter", pointerEnterListener, false);
        }
      }

      /**
       * @return {demo.ConversionResult}
       * @private
       */
      convert(/**HTMLElement*/ element) {
        var /**demo.ConversionResult*/ result = null;
        var type = element.getAttribute("data-type");

        if ("application" === type) {
          result = this.backend.convertAppRoot(element, this.application);
        } else if ("button" === element.tagName.toLowerCase()) {
          if ("ToggleButton" === type) {
            result = this.backend.convertToggleButton(element, this.application);
          } else {
            result = this.backend.convertButton(element, this.application);
          }
        } else if (element.hasAttribute("data-type")) {
          if ("GraphControl" === type) {
            var control = new GraphComponent(((element)));
            this.adjustGestureRecognizerThresholds(control, element);
            // Set a large tabindex to make the GraphControl the first element that gets the focus.
            // Being able to focus the GraphControl without the mouse can be usefull especially for debugging.
            if (!element.hasAttribute("tabindex") || element.getAttribute("tabindex") === "0") {
              element.setAttribute("tabindex", "1");
            }
            result = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
          } else if ("GraphOverviewControl" === type) {
            var control = new GraphOverviewComponent();
            result = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
            result.replacement = control.div;
            result.traverseChildren = false;

          } else if ("CollapsiblePane" === type) {
            result = this.backend.convertCollapsiblePane(element, this.application);
          } else if ("ComboBox" === type) {
            result = this.backend.convertComboBox(element, this.application);
          } else if ("Panel" === type) {
            result = this.backend.convertPanel(element, this.application);
          } else if ("Separator" === type) {
            result = this.backend.convertSeparator(element, this.application);
          } else if ("ToolBar" === type) {
            result = this.backend.convertToolBar(element, this.application);
          } else if ("ToggleButton" === type) {
            result = this.backend.convertToggleButton(element, this.application);
          } else if ("TextArea" === type) {
            result = this.backend.convertTextArea(element, this.application);
          } else if ("BorderLayout" === type) {
            result = this.backend.convertBorderLayout(element, this.application);
          } else if ("Control" === type) {
            result = this.backend.convertControl(element, this.application);
          } else if ("CheckBox" === type) {
            result = this.backend.convertCheckBox(element, this.application);
          } else if ("Slider" === type) {
            result = this.backend.convertSlider(element, this.application);
          } else if ("FramerateCounter" === type) {
            result = this.backend.convertFramerateCounter(element, this.application);
          }
        }

        if (result !== null && result.hasReplacement) {
          var origElement = element;
          var replacement = result.replacement;

          demo.ApplicationParser.replaceElement(origElement, replacement);
        }

        if (element.hasAttribute("data-name")) {
          var dataObject = element;
          if (result !== null) {
            if (result.component !== null) {
              dataObject = result.component;
            } else if (result.hasReplacement) {
              dataObject = result.replacement;
            }
          }
          this.application.setProperty(element.getAttribute("data-name"), dataObject);
        }

        return result;
      }

      bindCommands(/**demo.IComponent*/ component) {
        if (demo.ICommandComponent.isInstance(component)) {
          this.backend.bindCommand((/**@type {demo.ICommandComponent}*/(component)), this.application);
        }
        if (demo.IContainer.isInstance(component)) {
          ((/**@type {demo.IContainer}*/(component))).children.forEach((function(/**demo.IComponent*/ child) {
            this.bindCommands(child);
          }).bind(this));
        }
      }

      static replaceElement(/**HTMLElement*/ origElement, /**HTMLElement*/ replacement) {
        origElement.parentNode.replaceChild(replacement, origElement);

        var attrs = origElement.attributes;
        var length = attrs.length;
        for (var i = 0; i < length; i++) {
          var attr = (/**@type {Attr}*/(attrs.item(i)));
          if (!replacement.hasAttribute(attr.name)) {
            replacement.setAttribute(attr.name, attr.value);
          } else if (attr.name === "class" && attr.value !== replacement.getAttribute(attr.name)) {
            replacement.setAttribute(attr.name, replacement.getAttribute(attr.name) + " " + attr.value);
          }
        }
      }
    };

    /**
     * Result of a conversion operation.
     * May contain a replacement DOM node and a Component that can be used to control the DOM node.
     * It also contains information on whether to process the children of the currently watched DOM node or not.
     * @class demo.ConversionResult
     */
    export const ConversionResult = class ConversionResult {
      constructor(/**demo.IComponent*/ component) {
        /** @type {HTMLElement} */
        this.replacement = null;

        /** @type {boolean} */
        this.traverseChildren = false;

        /** @type {demo.IComponent} */
        this.component = null;

        this.component = component;
        this.traverseChildren = true;
      }

      /** @type {boolean} */
      get hasReplacement() {
        return this.replacement !== null;
      }
    };

    /**
     * Converts (modifies or creates a replacement for) a DOM element so that it is suitable for usage as a component.
     * @interface demo.IApplicationParserBackend
     */
    export const IApplicationParserBackend = new InterfaceDefinition(function() {
      /** @lends {demo.IApplicationParserBackend.prototype} */
      return {
        /**
         * The given action will be executed once the DOM has been build and all scripts and style sheets have been loaded.
         * @see Specified by {@link demo.IApplicationParserBackend#addOnLoadCallback}.
         */
        'addOnLoadCallback': Abstract,
        
        /**
         * Converts the application root. Might be a div element or the document body.
         * @see Specified by {@link demo.IApplicationParserBackend#convertAppRoot}.
         * @return {demo.ConversionResult}
         */
        'convertAppRoot': Abstract,
        
        /**
         * Binds registered commands to the elements with 'command-name' attribute. 
         * This is called after {@link demo.IApplicationParserBackend#convertAppRoot} to ensure that all members already exist.
         * @see Specified by {@link demo.IApplicationParserBackend#bindCommand}.
         */
        'bindCommand': Abstract,
        
        /**
         * Creates the default yFiles for HTML demo header.
         * @see Specified by {@link demo.IApplicationParserBackend#createHeader}.
         * @return {demo.IComponent}
         */
        'createHeader': Abstract,
        
        /**
         * Creates the default yFiles for HTML demo footer.
         * @see Specified by {@link demo.IApplicationParserBackend#createFooter}.
         * @return {demo.IComponent}
         */
        'createFooter': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertPanel': Abstract,
        
        /**
         * Creates a button from the given element.
         * If there is a "data-command" attribute, then it should try to find a matching {@link yfiles.system.ICommand} from
         * either the given {@link demo.Application} or the {@link yfiles.system.CommandTypeConverter} and wrap it as the handler.
         * @see Specified by {@link demo.IApplicationParserBackend#convertButton}.
         * @return {demo.ConversionResult}
         */
        'convertButton': Abstract,
        
        /**
         * Creates a combo box from the given element.
         * @see Specified by {@link demo.IApplicationParserBackend#convertComboBox}.
         * @return {demo.ConversionResult}
         */
        'convertComboBox': Abstract,
        
        /**
         * Creates a collapsible pane for the given element.
         * The collapsible pane should contain a header and a content area.
         * The header content is contained in the "data-header" attribute, the content is the content of the element.
         * The collapse operation should be based on the value of the "data-collapse" property and should support the following values:
         * <ul>
         * <li>none - No action should be performed.</li>
         * <li>top - The content disappears, the header should not be changed.</li>
         * <li>left - The content disappears, the header is translated by -90 degrees.</li>
         * <li>right - The content disappears, the header is translated by 270 degrees.</li>
         * </ul>
         * If present, the {@link demo.ConversionResult#component} should be an instance of {@link demo.ICollapsiblePane}.
         * @see Specified by {@link demo.IApplicationParserBackend#convertCollapsiblePane}.
         * @return {demo.ConversionResult}
         */
        'convertCollapsiblePane': Abstract,
        
        /**
         * Creates a component that can be used as a separator. The input may be any type of element.
         * @see Specified by {@link demo.IApplicationParserBackend#convertSeparator}.
         * @return {demo.ConversionResult}
         */
        'convertSeparator': Abstract,
        
        /**
         * Converts an element into a toolbar which contains buttons.
         * @param {HTMLElement} element 
         * @param {demo.Application} application 
         * @return {demo.ConversionResult} 
         * @see Specified by {@link demo.IApplicationParserBackend#convertToolBar}.
         */
        'convertToolBar': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertToggleButton': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertTextArea': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertBorderLayout': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertControl': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertCheckBox': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertSlider': Abstract,
        
        /** @return {demo.ConversionResult} */
        'convertFramerateCounter': Abstract
        
      };
    });

    /**
     * A simple context menu implementation for the yFiles for HTML demos.
     * @class demo.ContextMenu
     */
    export const ContextMenu = class ContextMenu {
      constructor() {
        /**
         * @type {function(Event)}
         * @private
         */
        this.closeOnEscListener = null;

        /**
         * The main HTML element of this menu.
         * This element is created by the constructor, don't replace it in custom code.
         * @type {HTMLElement}
         */
        this.element = null;

        var contextMenu = (/**@type {HTMLElement}*/(document.createElement("ul")));
        contextMenu.setAttribute("class", "demo-context-menu");
        this.element = contextMenu;
      }

      /**
       * Sets a callback that is invoked if the context menu closes itself, for example because a
       * menu item was clicked.
       * Typically, the provided callback informs the <code>ContextMenuInputMode</code> that this menu is
       * closed.
       */
      setOnCloseCallback(/**function()*/ onCloseCallback) {
        // Add a click listener that closes the menu and calls the callback.
        // This way, the individual menu items was not call the callback by themselves.
        this.element.addEventListener("click", (function(/**Event*/ evt) {
          onCloseCallback();
          this.close();
          evt.stopPropagation();
        }).bind(this), false);

        // Create a ESC key press listener that closes the menu and calls the callback.
        this.closeOnEscListener = (function(/**Event*/ evt) {
          if (evt.keyCode === 27 && this.element.parentNode) {
            onCloseCallback();
            this.close();
            evt.stopPropagation();
          }
        }).bind(this);
      }

      /**
       * Adds a new separator to this menu.
       */
      addSeparator() {
        var separator = document.createElement("span");
        demo.ElementExtensions.addClass(separator, "demo-separator");
        this.element.appendChild(separator);
      }

      /**
       * Adds a new menu entry with the given text and click-listener to this menu.
       * @return {HTMLElement} The HTML element of the created menu entry.
       */
      addMenuItem(/**string*/ label, /**function(Event)*/ clickListener) {
        var menuItem = (/**@type {HTMLElement}*/(document.createElement("li")));
        menuItem.setAttribute("class", "demo-menu-item");
        menuItem.innerHTML = label;
        if (clickListener !== null) {
          menuItem.addEventListener("click", clickListener, false);
        }
        this.element.appendChild(menuItem);
        return menuItem;
      }

      /**
       * Removes all menu entries and separators from this menu.
       */
      clearItems() {
        var element = this.element;
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
      }

      /**
       * Sets the location of this menu to the given point.
       * @param {yfiles.geometry.PointD} location The new location in absolute coordinates (relative to the body element).
       * @private
       */
      setLocation(/**yfiles.geometry.PointD*/ location) {
        var style = this.element.style;
        style.setProperty("position", "absolute", "");
        style.setProperty("left", location.x + "px", "");
        style.setProperty("top", location.y + "px", "");
      }

      /**
       * Shows this menu.
       * @param {yfiles.geometry.PointD} location 
       */
      show(/**yfiles.geometry.PointD*/ location) {
        this.setLocation(location);
        document.body.appendChild(this.element);
        if (this.closeOnEscListener) {
          document.addEventListener("keydown", this.closeOnEscListener, false);
        }
      }

      /**
       * Closes this menu by removing its element from the DOM.
       */
      close() {
        // Test whether we are really visible.
        if (this.element.parentNode) {
          document.body.removeChild(this.element);
          if (this.closeOnEscListener) {
            document.removeEventListener("keydown", this.closeOnEscListener, false);
          }
        }
      }

      /**
       * Adds event listeners for events that should show a context menu.
       * Besides the obvious <code>contextmenu</code> event, we listen for the Context Menu key since it is
       * not handled correctly in Chrome. In other browsers, when the Context Menu key is pressed,
       * the correct <code>contextmenu</code> event is fired but the event location is not meaningful.
       * In this case, we set a better location, centered on the given element.
       * @param {Element} parent The element on which we listen for <code>contextmenu</code> events.
       * @param {function(yfiles.geometry.PointD)} openCallback This function is invoked when a context menu should be opened. 
       * It gets the desired location as parameter (in absolute coordinates relative to the body element).
       */
      static addEventListeners(/**Element*/ parent, /**function(yfiles.geometry.PointD)*/ openCallback) {
        var contextMenuListener = function(/**Event*/ evt) {
          evt.preventDefault();
          var me = (/**@type {MouseEvent}*/(evt));
          if (evt["mozInputSource"] === 1 && me.button === 0) {
            // This event was triggered by the context menu key in Firefox.
            // Thus, the coordinates of the event point to the lower left corner of the element and should be corrected.
            openCallback(getCenterInPage((/**@type {HTMLElement}*/(parent))));
          } else if (me.pageX === 0 && me.pageY === 0) {
            // Most likely, this event was triggered by the context menu key in IE.
            // Thus, the coordinates are meaningless and should be corrected.
            openCallback(getCenterInPage((/**@type {HTMLElement}*/(parent))));
          } else {
            openCallback(new Point(me.pageX, me.pageY));
          }
        };
        parent.addEventListener("contextmenu", contextMenuListener, false);

        // additionally, register to the context menu key to make it work in Chrome
        var contextMenuKeyListener = function(/**Event*/ evt) {
          if (((/**@type {KeyboardEvent}*/(evt))).keyCode === 93) {
            evt.preventDefault();
            openCallback(getCenterInPage((/**@type {HTMLElement}*/(parent))));
          }
        };
        parent.addEventListener("keyup", contextMenuKeyListener, false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend
     * @implements {demo.IApplicationParserBackend}
     */
    export const DefaultApplicationParserBackend = class DefaultApplicationParserBackend extends BaseClass(demo.IApplicationParserBackend) {
      // #region IApplicationParserBackend members

      addOnLoadCallback(/**function()*/ callback) {
        document.addEventListener("DOMContentLoaded", function(/**Event*/ evt) {
          callback();
        }, false);
      }

      bindCommand(
        /**demo.ICommandComponent*/ commandComponent,
        /**demo.Application*/ application
      ) {
        var element = commandComponent.element;
        if (element.hasAttribute("data-command")) {
          var commandName = element.getAttribute("data-command");
          var command = application.getProperty(commandName);
          if (command !== null) {
            if (ICommand.isInstance(command)) {
              commandComponent.command = (/**@type {yfiles.system.ICommand}*/(command));
            } else {
              commandComponent.addEventListener((/**@type {EventListener}*/(command)));
            }
          } else {
            var converter = new yfiles.system.CommandTypeConverter();
            command = converter.convertFrom(commandName);
            if (command !== null) {
              commandComponent.command = (/**@type {yfiles.system.ICommand}*/(command));
            } else if (typeof(window.console) !== "undefined") {
              console.log("Unknown command: " + commandName);
            }
          }
        }

        if (element.hasAttribute("data-state")) {
          commandComponent.enabled = "disabled" !== element.getAttribute("data-state");
        }
      }

      /** @return {demo.IComponent} */
      createHeader() {
        var header = document.createElement("header");
        header.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP));
        header.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER, "false");
        header.setAttribute("data-type", "Panel");
        demo.ElementExtensions.addClass(header, "demo-header");

        var leftDiv = document.createElement("div");
        demo.ElementExtensions.addClass(leftDiv, "demo-left");
        header.appendChild(leftDiv);

        leftDiv.appendChild(createImageLink("demo-yFiles", "http://www.yworks.com/en/products_yfileshtml_about.html"));

        var rightDiv = document.createElement("div");
        demo.ElementExtensions.addClass(rightDiv, "demo-right");
        header.appendChild(rightDiv);

        rightDiv.appendChild(createImageLink("demo-yLogo", "http://www.yworks.com"));
        rightDiv.appendChild(createImageLink("demo-ySlogan", "http://www.yworks.com"));
        return new demo.DefaultApplicationParserBackend.YComponent(header);
      }

      /** @return {demo.IComponent} */
      createFooter() {
        var footer = document.createElement("footer");
        ((/**@type {HTMLElement}*/(footer))).innerHTML = "Copyright &copy; 2011-2017 yWorks GmbH &middot; All rights reserved";
        footer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM));
        footer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER, "false");
        footer.setAttribute("data-type", "Panel");
        return new demo.DefaultApplicationParserBackend.YComponent(footer);
      }

      /** @return {demo.ConversionResult} */
      convertAppRoot(/**HTMLElement*/ appRoot, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(appRoot, "demo-app");

        var applicationFrame = new demo.DefaultApplicationParserBackend.YApplicationFrame(appRoot);

        this.maybeAddHeaderAndFooter(appRoot, applicationFrame);

        var result = new demo.ConversionResult(applicationFrame);
        return result;
      }

      /** @private */
      maybeAddHeaderAndFooter(
        /**Element*/ appRoot,
        /**demo.DefaultApplicationParserBackend.YApplicationFrame*/ applicationFrame
      ) {
        var shouldAddHeader = true;
        var shouldAddFooter = true;

        for (var i = 0; i < appRoot.childNodes.length; i++) {
          var child = appRoot.childNodes.item(i);
          if (child.nodeType !== Node.ELEMENT_NODE) {
            continue;
          }
          var element = (/**@type {HTMLElement}*/(child));
          switch (element.tagName) {
            case "header":
              shouldAddHeader = false;
              break;
            case "footer":
              shouldAddFooter = false;
              break;
          }
        }
        if (shouldAddHeader) {
          applicationFrame.header = this.createHeader();
        }
        if (shouldAddFooter) {
          applicationFrame.footer = this.createFooter();
        }
      }

      /** @return {demo.ConversionResult} */
      convertPanel(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-panel");
        return new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YPanel(element));
      }

      /** @return {demo.ConversionResult} */
      convertButton(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-button");
        var button = new demo.DefaultApplicationParserBackend.YButton(element);
        initButton(element, button);
        var newConversionResult = new demo.ConversionResult(button);
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertCheckBox(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-checkbox");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YCheckBox(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertToggleButton(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-toggle-button");
        var button = new demo.DefaultApplicationParserBackend.YToggleButton(element);
        initButton(element, button);
        if ("true" === element.getAttribute("data-selected")) {
          button.isChecked = true;
        }
        var newConversionResult = new demo.ConversionResult(button);
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertComboBox(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-combobox");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YComboBox(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertSlider(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-slider");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YSlider(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertTextArea(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-textarea");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YTextArea(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertBorderLayout(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-borderlayout");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YBorderLayout(element));
        newConversionResult.traverseChildren = true;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertControl(/**HTMLElement*/ element, /**demo.Application*/ application) {
        var controlType = element.getAttribute("data-control-type");
        var /**yfiles.canvas.Control*/ control = null;
        if (controlType !== null && controlType.length > 0) {
          var type = Class.forName(controlType);
          if (type !== null) {
            var instance = type.newInstance();
            control = (instance instanceof yfiles.canvas.Control) ? (/**@type {yfiles.canvas.Control}*/(instance)) : null;
            if (control !== null) {
              control.initialize((/**@type {HTMLDivElement}*/(element)));
            }
          }
        }

        if (control === null) {
          throw new Exception("Could not create control instance (" + controlType + ")");
        }

        var newConversionResult = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertCollapsiblePane(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-collapsible-pane");
        var header = document.createElement("span");
        ((/**@type {HTMLElement}*/(header))).innerHTML = element.getAttribute("data-header");
        header.setAttribute("class", "demo-collapsible-pane-header");

        var content = document.createElement("div");
        content.setAttribute("class", "demo-collapsible-pane-content");

        if (element.children !== undefined) {
          var n = element.children.length;
          for (var i = 0; i < n; i++) {
            var child = (/**@type {Element}*/(element.children[0]));
            element.removeChild(child);
            content.appendChild(child);
          }
        }

        var /**demo.CollapseStyle*/ collapseStyle;
        var style = element.hasAttribute("data-collapse") ? element.getAttribute("data-collapse").toLowerCase() : "none";
        switch (style) {
          case "left":
            collapseStyle = demo.CollapseStyle.LEFT;
            break;
          case "right":
            collapseStyle = demo.CollapseStyle.RIGHT;
            break;
          case "top":
            collapseStyle = demo.CollapseStyle.TOP;
            break;
          default:
            collapseStyle = demo.CollapseStyle.NONE;
            break;
        }

        var collapsiblePane = new demo.DefaultApplicationParserBackend.YCollapsiblePane(element);
        collapsiblePane.header = element.getAttribute("data-header");
        collapsiblePane.content = content;
        collapsiblePane.collapseStyle = collapseStyle;

        return new demo.ConversionResult(collapsiblePane);
      }

      /** @return {demo.ConversionResult} */
      convertSeparator(/**HTMLElement*/ element, /**demo.Application*/ application) {
        if (element.tagName.toLowerCase() !== "span") {
          element = (/**@type {HTMLElement}*/(document.createElement("span")));
        }
        demo.ElementExtensions.addClass(element, "demo-separator");
        var newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YSeparator(element));
        newConversionResult.replacement = element;
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      }

      /** @return {demo.ConversionResult} */
      convertToolBar(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-toolbar");
        return new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YToolBar(element));
      }

      /** @return {demo.ConversionResult} */
      convertFramerateCounter(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-fps-counter");
        var counter = new demo.DefaultApplicationParserBackend.YFramerateCounter(element);

        var smoothingAtt = element.getAttribute("smoothing");
        if (smoothingAtt !== null) {
          var smoothing = parseInt(smoothingAtt, 10);
          counter.smoothing = smoothing;
        }

        var updateInterval = element.getAttribute("updateInterval");
        if (updateInterval !== null) {
          var update = parseInt(updateInterval, 10);
          counter.updateInterval = update;
        }

        counter.start();
        return new demo.ConversionResult(counter);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.SizeChangedEventArgs
     * @augments yfiles.system.EventArgs
     */
    DefaultApplicationParserBackend.SizeChangedEventArgs = class SizeChangedEventArgs extends EventArgs {
      constructor(/**yfiles.geometry.SizeD*/ oldSize, /**yfiles.geometry.SizeD*/ newSize) {
        super();

        /**
         * @type {yfiles.geometry.SizeD}
         * @private
         */
        this.oldSizeField = null;

        /**
         * @type {yfiles.geometry.SizeD}
         * @private
         */
        this.newSizeField = null;

        /**
         * @type {yfiles.geometry.SizeD}
         * @private
         */
        this.oldSizeField = null;

        /**
         * @type {yfiles.geometry.SizeD}
         * @private
         */
        this.newSizeField = null;

        this.$initSizeChangedEventArgs();
        this.oldSizeField = oldSize.clone();
        this.newSizeField = newSize.clone();
      }

      /** @type {yfiles.geometry.SizeD} */
      get oldSize() {
        return this.oldSizeField.clone();
      }

      /** @type {yfiles.geometry.SizeD} */
      get newSize() {
        return this.newSizeField.clone();
      }

      /** @private */
      $initSizeChangedEventArgs() {
        this.oldSizeField = Size.createDefault();
        this.newSizeField = Size.createDefault();
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.IComponent
     */
    DefaultApplicationParserBackend.YComponent = class YComponent extends BaseClass(demo.IComponent) {
      constructor(/**Element*/ element) {
        super();

        /**
         * Backing field for below event.
         * @type {function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)}
         * @private
         */
        this.$sizeChangedEvent = null;

        /** @type {Element} */
        this.elementField = null;

        /**
         * Backing field for below event.
         * @type {function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)}
         * @private
         */
        this.$sizeChangedEvent = null;

        /** @type {Element} */
        this.elementField = null;

        this.elementField = element;
      }

      addSizeChangedListener(
        /**function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)*/ value
      ) {
        this.$sizeChangedEvent = delegate.combine(this.$sizeChangedEvent, value);
      }

      removeSizeChangedListener(
        /**function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)*/ value
      ) {
        this.$sizeChangedEvent = delegate.remove(this.$sizeChangedEvent, value);
      }

      /** @type {Element} */
      get element() {
        return this.elementField;
      }

      onSizeChanged(/**demo.DefaultApplicationParserBackend.SizeChangedEventArgs*/ e) {
        if (this.$sizeChangedEvent !== null) {
          this.$sizeChangedEvent(this, e);
        }
      }

      setSize(/**yfiles.geometry.SizeD*/ newSize) {
        this.setSizeWithUnit(newSize, null);
      }

      setSizeWithUnit(/**yfiles.geometry.SizeD*/ newSize, /**string*/ unit) {
        var dim = this.getDimensions();

        var oldSize = dim.contentRect.size;

        var padding = dim.padding;
        var margin = dim.margin;
        var border = dim.border;
        newSize.width = Math.max(0, newSize.width - padding.left - padding.right - margin.left - margin.right - border.left - border.right);
        newSize.height = Math.max(0, newSize.height - padding.top - padding.bottom - margin.top - margin.bottom - border.top - border.bottom);

        unit = (unit !== undefined && unit !== null) ? unit : "px";
        if (newSize.width > 0 && oldSize.width !== newSize.width) {
          this.element["data-y-size-modified"] = true;
          this.setStyleProperty("width", newSize.width + unit);
        }
        if (newSize.height > 0 && oldSize.height !== newSize.height) {
          this.element["data-y-size-modified"] = true;
          this.setStyleProperty("height", newSize.height + unit);
        }
        this.onSizeChanged(new demo.DefaultApplicationParserBackend.SizeChangedEventArgs(oldSize, newSize));
      }

      setLocation(/**yfiles.geometry.PointD*/ location) {
        this.setStyleProperty("left", location.x + "px");
        this.setStyleProperty("top", location.y + "px");
      }

      setBounds(/**yfiles.geometry.RectD*/ bounds) {
        this.setLocation(bounds.topLeft);
        this.setSize(bounds.size);
      }

      /** @return {demo.ElementDimensions} */
      getDimensions() {
        return new demo.ElementDimensions((/**@type {HTMLElement}*/(this.element)));
      }

      setStyleProperty(/**string*/ propertyName, /**string*/ value) {
        var style = ((/**@type {HTMLElement}*/(this.elementField))).style;
        style.setProperty(propertyName, value, null);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YContainer
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.IContainer
     */
    DefaultApplicationParserBackend.YContainer = class YContainer extends BaseClass(demo.DefaultApplicationParserBackend.YComponent, demo.IContainer) {
      constructor(/**Element*/ element) {
        super(element);

        /**
                     * @type {List.<demo.IComponent>}
                     * @private
                     */
        this.childrenField = null;

        /**
                     * @type {List.<demo.IComponent>}
                     * @private
                     */
        this.childrenField = null;

        this.childrenField = new List();
      }

      /** @type {IEnumerable.<demo.IComponent>} */
      get children() {
        return this.childrenField;
      }

      add(/**demo.IComponent*/ child) {
        this.childrenField.add(child);
      }

      remove(/**demo.IComponent*/ child) {
        this.childrenField.remove(child);
        this.removeWithElement(child instanceof yfiles.canvas.Control ? ((/**@type {yfiles.canvas.Control}*/(child))).div : child.element);
      }

      layoutChildren(/**boolean*/ resizeComponents) {
        this.children.forEach(function(/**demo.IComponent*/ child) {
          if (demo.IContainer.isInstance(child)) {
            ((/**@type {demo.IContainer}*/(child))).layoutChildren(resizeComponents);
          }
        });
      }

      addWithElement(/**Element*/ e) {
        if (e.parentNode !== this.element) {
          this.element.appendChild(e);
        }
      }

      removeWithElement(/**Element*/ e) {
        if (e.parentNode === this.element) {
          this.element.removeChild(e);
        }
      }

      onSizeChanged(/**demo.DefaultApplicationParserBackend.SizeChangedEventArgs*/ e) {
        this.layoutChildren(true);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YPanel
     * @augments demo.DefaultApplicationParserBackend.YContainer
     * @augments demo.IPanel
     * @private
     */
    DefaultApplicationParserBackend.YPanel = class YPanel extends BaseClass(demo.DefaultApplicationParserBackend.YContainer, demo.IPanel) {
      constructor(/**Element*/ element) {
        super(element);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YApplicationFrame
     * @augments demo.DefaultApplicationParserBackend.YContainer
     * @augments demo.IApplicationFrame
     * @private
     */
    DefaultApplicationParserBackend.YApplicationFrame = class YApplicationFrame extends BaseClass(demo.DefaultApplicationParserBackend.YContainer, demo.IApplicationFrame) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {demo.IComponent}
         * @private
         */
        this.headerField = null;

        /**
         * @type {demo.IComponent}
         * @private
         */
        this.footerField = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout}
         * @private
         */
        this.borderLayout = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YPanel}
         * @private
         */
        this.centerPanel = null;

        /**
         * @type {demo.IComponent}
         * @private
         */
        this.headerField = null;

        /**
         * @type {demo.IComponent}
         * @private
         */
        this.footerField = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout}
         * @private
         */
        this.borderLayout = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YPanel}
         * @private
         */
        this.centerPanel = null;

        var borderLayoutDiv = (/**@type {HTMLElement}*/(document.createElement("div")));
        borderLayoutDiv.setAttribute("id", "demo-app-borderlayout");
        borderLayoutDiv.setAttribute("data-type", "BorderLayout");
        this.borderLayout = new demo.DefaultApplicationParserBackend.YBorderLayout(borderLayoutDiv);
        this.borderLayout.setStyleProperty("width", "100%");
        this.borderLayout.setStyleProperty("height", "100%");

        var centerDiv = (/**@type {HTMLElement}*/(document.createElement("div")));
        centerDiv.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER));
        centerDiv.setAttribute("id", "demo-app-borderlayout-center");
        centerDiv.setAttribute("data-type", "Panel");
        this.centerPanel = new demo.DefaultApplicationParserBackend.YPanel(centerDiv);
        this.borderLayout.add(this.centerPanel);
        this.borderLayout.element.appendChild(this.centerPanel.element);

        var /**HTMLElement[]*/ arr;
        var /**number*/ i;
        for (i = 0, arr = ((/**@type {HTMLElement}*/(element))).children; i < arr.length; i++) {
          var child = arr[i];
          centerDiv.appendChild(child);
        }

        this.element.appendChild(this.borderLayout.element);
      }

      /** @type {demo.IComponent} */
      get header() {
        return this.headerField;
      }

      /** @type {demo.IComponent} */
      set header(/**demo.IComponent*/ value) {
        var headerParent = this.borderLayout.element;
        if (value.element.parentNode !== headerParent) {
          if (this.headerField !== null) {
            this.remove(this.headerField);
            headerParent.replaceChild(value.element, this.headerField.element);
          } else if (headerParent.childNodes.length > 0) {
            headerParent.insertBefore(value.element, headerParent.firstChild);
          } else {
            headerParent.appendChild(value.element);
          }
        }
        this.headerField = value;
        this.borderLayout.add(this.headerField);
      }

      /** @type {demo.IComponent} */
      get footer() {
        return this.footerField;
      }

      /** @type {demo.IComponent} */
      set footer(/**demo.IComponent*/ value) {
        var footerParent = this.borderLayout.element;
        if (value.element.parentNode !== footerParent) {
          if (this.footerField !== null) {
            this.remove(this.footerField);
            footerParent.replaceChild(value.element, this.footerField.element);
          } else {
            footerParent.appendChild(value.element);
          }
        }
        this.footerField = value;
        this.borderLayout.add(this.footerField);
      }

      removeWithElement(/**Element*/ e) {
        if (e.parentNode === this.centerPanel.element) {
          this.centerPanel.element.removeChild(e);
        }
      }

      init() {
        this.layoutChildren(true);
        window.addEventListener("resize", (function(/**Event*/ evt) {
          this.layoutChildren(true);
        }).bind(this), false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YToolBar
     * @augments demo.DefaultApplicationParserBackend.YContainer
     * @augments demo.IToolBar
     * @private
     */
    DefaultApplicationParserBackend.YToolBar = class YToolBar extends BaseClass(demo.DefaultApplicationParserBackend.YContainer, demo.IToolBar) {
      constructor(/**Element*/ element) {
        super(element);
      }

      /** @return {demo.ISeparator} */
      addSeparator() {
        var separator = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createSeparator();
        this.add(separator);
        return separator;
      }

      /** @return {demo.IButton} */
      addButton(/**string*/ label) {
        var button = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createButton(label);
        this.add(button);
        return button;
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YSeparator
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.ISeparator
     * @private
     */
    DefaultApplicationParserBackend.YSeparator = class YSeparator extends BaseClass(demo.DefaultApplicationParserBackend.YComponent, demo.ISeparator) {
      constructor(/**Element*/ element) {
        super(element);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YCommandComponent
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.ICommandComponent
     * @abstract
     */
    DefaultApplicationParserBackend.YCommandComponent = class YCommandComponent extends BaseClass(demo.DefaultApplicationParserBackend.YComponent, demo.ICommandComponent) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {yfiles.system.ICommand}
         * @private
         */
        this.commandField = null;

        /**
         * @type {Object}
         * @private
         */
        this.commandParameterField = null;

        /**
         * @type {yfiles.canvas.Control}
         * @private
         */
        this.commandTargetField = null;

        /**
         * @type {boolean}
         * @private
         */
        this.enabledField = false;

        this.addEventListener = Abstract;
        this.removeEventListener = Abstract;

        /**
         * @type {yfiles.system.ICommand}
         * @private
         */
        this.commandField = null;

        /**
         * @type {Object}
         * @private
         */
        this.commandParameterField = null;

        /**
         * @type {yfiles.canvas.Control}
         * @private
         */
        this.commandTargetField = null;

        /**
         * @type {boolean}
         * @private
         */
        this.enabledField = false;

        this.addEventListener = Abstract;
        this.removeEventListener = Abstract;
      }

      /** @type {yfiles.system.ICommand} */
      get command() {
        return this.commandField;
      }

      /** @type {yfiles.system.ICommand} */
      set command(/**yfiles.system.ICommand*/ value) {
        if (this.commandField !== value) {
          if (this.commandField !== null) {
            this.commandField.removeCanExecuteChangedListener(delegate(this.handleCommandCanExecuteChanged, this));
          }
          this.commandField = value;
          if (this.commandField !== null) {
            this.commandField.addCanExecuteChangedListener(delegate(this.handleCommandCanExecuteChanged, this));
            this.handleCommandCanExecuteChanged(null, null);
          } else {
            this.enabled = false;
          }
        }
      }

      /** @type {Object} */
      get commandParameter() {
        return this.commandParameterField;
      }

      /** @type {Object} */
      set commandParameter(value) {
        if (this.commandParameterField !== value) {
          this.commandParameterField = value;
          if (this.commandField !== null) {
            this.handleCommandCanExecuteChanged(null, null);
          }
        }
      }

      /** @type {yfiles.canvas.Control} */
      get commandTarget() {
        return this.commandTargetField;
      }

      /** @type {yfiles.canvas.Control} */
      set commandTarget(/**yfiles.canvas.Control*/ value) {
        if (this.commandTargetField !== value) {
          this.commandTargetField = value;
          if (this.commandField !== null) {
            this.handleCommandCanExecuteChanged(null, null);
          }
        }
      }

      /** @private */
      handleCommandCanExecuteChanged(sender, /**yfiles.system.EventArgs*/ e) {
        if (this.commandField !== null) {
          var canExecute = this.canExecute();
          this.enabled = canExecute;
        } else {
          this.enabled = false;
        }
      }

      /**
       * @return {boolean}
       * @private
       */
      canExecute() {
        if (this.commandField instanceof yfiles.system.RoutedCommand) {
          return ((/**@type {yfiles.system.RoutedCommand}*/(this.commandField))).canExecuteOnTarget(this.commandParameterField, this.commandTargetField);
        } else if (this.commandField instanceof demo.ElementCommand) {
          return this.commandField.canExecute(this.element);
        } else {
          return this.commandField.canExecute(this.commandParameterField);
        }
      }

      /** @private */
      maybeExecuteCommand(/**Event*/ e) {
        if (this.commandField !== null && this.enabledField) {
          var canExecute = this.canExecute();

          if (canExecute) {
            if (this.commandField instanceof yfiles.system.RoutedCommand) {
              ((/**@type {yfiles.system.RoutedCommand}*/(this.commandField))).executeOnTarget(this.commandParameterField, this.commandTargetField);
            } else if (this.commandField instanceof demo.ElementCommand) {
              ((/**@type {demo.ElementCommand}*/(this.commandField))).execute(this.element);
            } else {
              this.commandField.execute(this.commandParameterField);
            }
          }
        }
      }

      /** @type {boolean} */
      get enabled() {
        return this.enabledField;
      }

      /** @type {boolean} */
      set enabled(/**boolean*/ value) {
        if (value !== this.enabledField) {
          if (value) {
            demo.ElementExtensions.removeClass(this.elementField, "demo-disabled");
          } else {
            demo.ElementExtensions.addClass(this.elementField, "demo-disabled");
          }
          this.enabledField = value;
        }
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YButton
     * @augments demo.DefaultApplicationParserBackend.YCommandComponent
     * @augments demo.IButton
     */
    DefaultApplicationParserBackend.YButton = class YButton extends BaseClass(demo.DefaultApplicationParserBackend.YCommandComponent, demo.IButton) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {string}
         * @private
         */
        this.iconClass = null;

        /**
         * @type {string}
         * @private
         */
        this.iconClass = null;

        this.enabled = true;
        this.elementField.addEventListener("click", delegate(this.clicked, this), false);
      }

      clicked(/**Event*/ evt) {
        this.maybeExecuteCommand(evt);
      }

      /** @type {string} */
      get label() {
        return ((/**@type {HTMLElement}*/(this.elementField.firstChild))).innerHTML;
      }

      /** @type {string} */
      set label(/**string*/ value) {
        ((/**@type {HTMLElement}*/(this.elementField.firstChild))).innerHTML = value;
      }

      /** @type {string} */
      get icon() {
        return this.iconClass;
      }

      /** @type {string} */
      set icon(/**string*/ value) {
        if (this.iconClass !== value) {
          var span = ((/**@type {HTMLElement}*/(this.elementField.firstChild)));
          if (this.iconClass !== null) {
            demo.ElementExtensions.removeClass(span, this.iconClass);
          }
          if (value !== null) {
            demo.ElementExtensions.addClass(span, value);
          }
          this.iconClass = value;
        }
      }

      /** @type {boolean} */
      get enabled() {
        return demo.DefaultApplicationParserBackend.YButton.$super.getOwnProperty("enabled", this).get();
      }

      /** @type {boolean} */
      set enabled(/**boolean*/ value) {
        demo.DefaultApplicationParserBackend.YButton.$super.getOwnProperty("enabled", this).set(value);
        this.elementField["disabled"] = !value;
      }

      addEventListener(/**function(Event)*/ handler) {
        this.elementField.addEventListener("click", handler, false);
      }

      removeEventListener(/**function(Event)*/ handler) {
        this.elementField.removeEventListener("click", handler, false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YToggleButton
     * @augments demo.DefaultApplicationParserBackend.YButton
     * @augments demo.IToggleButton
     * @private
     */
    DefaultApplicationParserBackend.YToggleButton = class YToggleButton extends BaseClass(demo.DefaultApplicationParserBackend.YButton, demo.IToggleButton) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {boolean}
         * @private
         */
        this.isCheckedField = false;

        /**
         * @type {boolean}
         * @private
         */
        this.isCheckedField = false;
      }

      clicked(/**Event*/ evt) {
        this.toggleState();
      }

      /** @private */
      toggleState() {
        this.isChecked = !this.isChecked;
      }

      /** @type {boolean} */
      get isChecked() {
        return this.isCheckedField;
      }

      /** @type {boolean} */
      set isChecked(/**boolean*/ value) {
        if (this.isCheckedField !== value) {
          this.isCheckedField = value;
          if (this.isCheckedField) {
            demo.ElementExtensions.addClass(this.elementField, "demo-is-checked");
          } else {
            demo.ElementExtensions.removeClass(this.elementField, "demo-is-checked");
          }
          this.maybeExecuteCommand(null);
        }
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YTextArea
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.ITextArea
     * @private
     */
    DefaultApplicationParserBackend.YTextArea = class YTextArea extends BaseClass(demo.DefaultApplicationParserBackend.YComponent, demo.ITextArea) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {HTMLTextAreaElement}
         * @private
         */
        this.textAreaElement = null;

        /**
         * @type {HTMLTextAreaElement}
         * @private
         */
        this.textAreaElement = null;

        this.textAreaElement = (/**@type {HTMLTextAreaElement}*/(element));
      }

      /** @type {string} */
      get text() {
        return this.textAreaElement.value;
      }

      /** @type {string} */
      set text(/**string*/ value) {
        this.textAreaElement.value = value;
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout
     * @augments demo.DefaultApplicationParserBackend.YContainer
     */
    DefaultApplicationParserBackend.YBorderLayout = class YBorderLayout extends demo.DefaultApplicationParserBackend.YContainer {
      constructor(/**Element*/ element) {
        super(element);
        var idAtt = element.getAttribute("id");
        if (idAtt === null || idAtt.length === 0) {
          element.setAttribute("id", "y-border-layout-" + count);
        }
        count++;
      }

      layoutChildren(/**boolean*/ resizeComponents) {
        this.setStyleProperty("position", "relative");

        var box = this.getDimensions().contentRect;

        var sorted = this.children.toList();
        sorted.sort(new demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer(this));

        var childrenAndSplitters = new List();

        sorted.forEach(function(/**demo.IComponent*/ child) {
          childrenAndSplitters.add(child);
          if (child instanceof demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent) {
            var splitter = ((/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}*/(child))).splitter;
            if (null !== splitter) {
              childrenAndSplitters.add(splitter);
            }
          }
        });

        var /**IEnumerator*/ tmpEnumerator;
        for (tmpEnumerator = childrenAndSplitters.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var child = tmpEnumerator.current;
          {
            //Remove the height/width style property before measurement *only* if 
            //it was created in yComponent.setSize() - if it is user-set leave it. 
            //This allows for user defined height/width in css as well as dynamic
            //width/height controlled by content.
            if (resizeComponents && (/**@type {boolean}*/(child.element["data-y-size-modified"]))) {
              child.setStyleProperty("height", "");
              child.setStyleProperty("width", "");
            }
            var childDimensions = child.getDimensions();
            var childBounds = childDimensions.bounds;
            // we round the size to avoid floating point offsets due to subpixel layouts. 
            childBounds.width = (((/**@type {number}*/(childBounds.width))) | 0);
            childBounds.height = (((/**@type {number}*/(childBounds.height))) | 0);
            var region = getLayoutRegion(child);

            if (child instanceof demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent) {
              var resizableChild = ((/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}*/(child)));
              if (resizableChild.changeSize) {
                var newSize = resizableChild.newSize;
                childBounds.width = newSize.width;
                childBounds.height = newSize.height;
                resizableChild.changeSize = false;
              }
            }

            child.setLocation(box.topLeft);
            child.setStyleProperty("position", "absolute");

            switch (region) {
              case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP:
              case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM:
                child.setSize(new Size(box.width, childBounds.height));
                box.height = box.height - (childBounds.height);
                if (region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP) {
                  box.y = box.y + (childBounds.height);
                } else {
                  child.setStyleProperty("top", box.y + box.height + "px");
                }
                break;
              case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT:
              case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT:
                child.setSize(new Size(childBounds.width, box.height));
                box.width = box.width - (childBounds.width);
                if (region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT) {
                  box.x = box.x + (childBounds.width);
                } else {
                  child.setStyleProperty("left", box.x + box.width + "px");
                }
                break;
              case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER:
                child.setNodeLayout(box.clone());
                break;
            }
          }
        }


      }

      add(/**demo.IComponent*/ child) {
        var childElement = child.element;
        var layoutRegion = getLayoutRegion(child);
        if (layoutRegion !== demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER) {
          var splitterAtt = childElement.getAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER);
          var resizable = splitterAtt !== null ? splitterAtt.toLowerCase() !== "false" : true;
          if (resizable) {
            var resizableChild = demo.IContainer.isInstance(child) ? new demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer(this, (/**@type {demo.IContainer}*/(child)), layoutRegion) : new demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent(this, child, layoutRegion);
            super.add(resizableChild);
          } else {
            super.add(child);
          }
        } else {
          super.add(child);
        }

        var idAtt = child.element.getAttribute("id");
        if (idAtt === null || idAtt.length === 0) {
          var parentId = this.element.getAttribute("id");
          this.elementField.setAttribute("id", parentId + "-child-" + this.children.size);
        }
      }
    };

    YBorderLayout.LayoutRegion = new EnumDefinition(function() {
      return {
        'TOP': 0,
        'LEFT': 1,
        'BOTTOM': 2,
        'RIGHT': 3,
        'CENTER': 4,
        'UNKNOWN': 5
      };
    });

    YBorderLayout.LayoutArrangement = new EnumDefinition(function() {
      return {
        'HEADLINE': 0,
        'SIDEBAR': 1
      };
    });

    /** @type {string} */
    YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION = "data-layout-region";

    /** @type {string} */
    YBorderLayout.DATA_ATTRIBUTE_SPLITTER = "data-splitter";

    /** @type {string} */
    YBorderLayout.DATA_ATTRIBUTE_LAYOUT_ARRANGEMENT = "data-layout-arrangement";

    /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer
     * @augments demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
     * @augments demo.IContainer
     * @private
     */
    YBorderLayout.YResizableContainer = /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer
     * @augments demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
     * @augments demo.IContainer
     * @private
     */
    class YResizableContainer extends BaseClass(
      demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent,
      demo.IContainer
    ) {
      constructor(
        /**demo.DefaultApplicationParserBackend.YBorderLayout*/ parent,
        /**demo.IContainer*/ component,
        /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion
      ) {
        super(parent, component, layoutRegion);
      }

      /** @type {IEnumerable.<demo.IComponent>} */
      get children() {
        return ((/**@type {demo.IContainer}*/(this.component))).children;
      }

      add(/**demo.IComponent*/ child) {
        ((/**@type {demo.IContainer}*/(this.component))).add(child);
      }

      remove(/**demo.IComponent*/ child) {
        ((/**@type {demo.IContainer}*/(this.component))).remove(child);
      }

      layoutChildren(/**boolean*/ resizeComponents) {
        ((/**@type {demo.IContainer}*/(this.component))).layoutChildren(resizeComponents);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
     * @augments demo.IComponent
     * @private
     */
    YBorderLayout.YResizableComponent = /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
     * @augments demo.IComponent
     * @private
     */
    class YResizableComponent extends BaseClass(demo.IComponent) {
      constructor(
        /**demo.DefaultApplicationParserBackend.YBorderLayout*/ parent,
        /**demo.IComponent*/ component,
        /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion
      ) {
        super();

        /**
         * @type {demo.IComponent}
         * @private
         */
        this.componentField = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter}
         * @private
         */
        this.splitterField = null;

        /** @type {yfiles.geometry.SizeD} */
        this.newSize = null;

        /** @type {boolean} */
        this.changeSize = false;

        this.componentField = component;

        var splitterContainer = (/**@type {HTMLElement}*/(document.createElement("div")));
        demo.ElementExtensions.addClass(splitterContainer, "demo-splitter");
        if (layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT || layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT) {
          demo.ElementExtensions.addClass(splitterContainer, "demo-splitter-vertical");
        } else {
          demo.ElementExtensions.addClass(splitterContainer, "demo-splitter-horizontal");
        }
        splitterContainer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, layoutRegion));

        var splitterThumb = (/**@type {HTMLElement}*/(document.createElement("div")));
        demo.ElementExtensions.addClass(splitterThumb, "demo-splitter-thumb");
        splitterContainer.appendChild(splitterThumb);

        var sibling = this.element.nextSibling;
        if (sibling === null) {
          parent.element.appendChild(splitterContainer);
        } else {
          parent.element.insertBefore(splitterContainer, sibling);
        }

        this.splitterField = new demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter(splitterContainer, this, parent, layoutRegion);
      }

      /** @type {demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter} */
      get splitter() {
        return this.splitterField;
      }

      /** @type {demo.IComponent} */
      get component() {
        return this.componentField;
      }

      /** @type {Element} */
      get element() {
        return this.componentField.element;
      }

      setSize(/**yfiles.geometry.SizeD*/ newSize) {
        this.componentField.setSize(newSize);
      }

      setSizeWithUnit(/**yfiles.geometry.SizeD*/ newSize, /**string*/ unit) {
        this.componentField.setSizeWithUnit(newSize, unit);
      }

      setLocation(/**yfiles.geometry.PointD*/ location) {
        this.componentField.setLocation(location);
      }

      setBounds(/**yfiles.geometry.RectD*/ bounds) {
        this.componentField.setNodeLayout(bounds);
      }

      /** @return {demo.ElementDimensions} */
      getDimensions() {
        return this.componentField.getDimensions();
      }

      setStyleProperty(/**string*/ propertyName, /**string*/ value) {
        this.componentField.setStyleProperty(propertyName, value);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @private
     */
    YBorderLayout.YSplitter = /**
     * @class demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @private
     */
    class YSplitter extends demo.DefaultApplicationParserBackend.YComponent {
      constructor(
        /**Element*/ element,
        /**demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent*/ component,
        /**demo.DefaultApplicationParserBackend.YBorderLayout*/ container,
        /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion
      ) {
        super(element);

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout}
         * @private
         */
        this.container = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}
         * @private
         */
        this.component = null;

        /**
         * @type {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion}
         * @private
         */
        this.region = null;

        /**
         * @type {boolean}
         * @private
         */
        this.horizontal = false;

        /**
         * @type {boolean}
         * @private
         */
        this.topleft = false;

        /**
         * @type {boolean}
         * @private
         */
        this.dragging = false;

        /**
         * @type {number}
         * @private
         */
        this.dragStartMousePosition = 0;

        /**
         * @type {number}
         * @private
         */
        this.dragStartSize = 0;

        /**
         * @type {number}
         * @private
         */
        this.fixedChildSize = 0;

        /**
         * @type {number}
         * @private
         */
        this.dragStartSplitterPosition = 0;

        /**
         * @type {number}
         * @private
         */
        this.dragStartMaxSize = 0;

        /**
         * @type {number}
         * @private
         */
        this.dragStartMinSize = 20;

        this.$initYSplitter();
        this.container = container;
        this.region = layoutRegion;
        this.component = component;
        this.horizontal = this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP || this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM;
        this.topleft = this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP || this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT;
        element.addEventListener("mouseover", delegate(this.onMouseOver, this), false);
        element.addEventListener("mouseout", delegate(this.onMouseOut, this), false);

        element.addEventListener("mousedown", delegate(this.onMouseDown, this), false);
        window.document.addEventListener("mouseup", delegate(this.onDocumentMouseUp, this), true);
        window.document.addEventListener("mousemove", delegate(this.onDocumentMouseMove, this), true);

        element.addEventListener("touchstart", delegate(this.onTouchStart, this), false);
        window.document.addEventListener("touchend", delegate(this.onDocumentTouchEnd, this), true);
        window.document.addEventListener("touchmove", delegate(this.onDocumentTouchMove, this), true);
      }

      /** @private */
      onDragStart(/**Event*/ evt) {
        this.dragging = true;
        var /**number*/ position;
        if (evt.type === "touchstart") {
          position = this.horizontal ? ((/**@type {SVGElement}*/(evt))).touches.item(0).pageY : ((/**@type {SVGElement}*/(evt))).touches.item(0).pageX;
        } else {
          position = this.horizontal ? ((/**@type {MouseEvent}*/(evt))).pageY : ((/**@type {MouseEvent}*/(evt))).pageX;
        }
        this.dragStartMousePosition = position;
        var bounds = this.component.getDimensions().bounds;
        this.dragStartSize = this.horizontal ? bounds.height : bounds.width;
        this.fixedChildSize = this.horizontal ? bounds.width : bounds.height;
        var positionAtt = this.horizontal ? "top" : "left";
        this.dragStartSplitterPosition = parseFloat(((/**@type {HTMLElement}*/(this.element))).style.getPropertyValue(positionAtt));

        var available = 0;
        var /**demo.IComponent*/ centerComponent = null;
        var /**IEnumerator*/ tmpEnumerator;
        for (tmpEnumerator = this.container.children.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var child = tmpEnumerator.current;
          {
            var layoutRegion = getLayoutRegion(child);
            if (layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER) {
              centerComponent = child;
              break;
            }
          }
        }
        // initialize the correct sizes for the panels
        if (centerComponent !== null) {
          var centerBounds = centerComponent.getDimensions().bounds;
          available = this.horizontal ? centerBounds.height : centerBounds.width;
        }
        this.dragStartMaxSize = Math.max(0, this.dragStartSize + available - CENTER_COMPONENT_MIN_SIZE);
      }

      /** @private */
      onDrag(/**Event*/ evt) {
        var /**number*/ position;
        if (evt.type === "touchmove") {
          position = this.horizontal ? ((/**@type {SVGElement}*/(evt))).touches.item(0).pageY : ((/**@type {SVGElement}*/(evt))).touches.item(0).pageX;
        } else {
          position = this.horizontal ? ((/**@type {MouseEvent}*/(evt))).pageY : ((/**@type {MouseEvent}*/(evt))).pageX;
        }
        var delta = position - this.dragStartMousePosition;
        var newSize = this.topleft ? this.dragStartSize + delta : this.dragStartSize - delta;
        newSize = Math.max(Math.min(newSize, this.dragStartMaxSize), this.dragStartMinSize);

        var splitterPos = delta + this.dragStartSplitterPosition + "px";
        var positionAtt = this.horizontal ? "top" : "left";

        var futureSize = (this.horizontal ? new Size(this.fixedChildSize, newSize) : new Size(newSize, this.fixedChildSize)).clone();
        this.component.newSize = futureSize;
        this.component.changeSize = true;
        this.setStyleProperty(positionAtt, splitterPos);
        this.container.layoutChildren(false);

      }

      /** @private */
      onDragEnd(/**Event*/ evt) {
        this.dragging = false;
      }

      /** @private */
      onDocumentMouseMove(/**Event*/ evt) {
        if (this.dragging) {
          this.onDrag(evt);
          evt.preventDefault();
        }
      }

      /** @private */
      onDocumentMouseUp(/**Event*/ evt) {
        this.onDragEnd(evt);
      }

      /** @private */
      onMouseDown(/**Event*/ evt) {
        this.onDragStart(evt);
        evt.preventDefault();
      }

      /** @private */
      onDocumentTouchMove(/**Event*/ evt) {
        if (this.dragging) {
          this.onDrag(evt);
          evt.preventDefault();
        }
      }

      /** @private */
      onDocumentTouchEnd(/**Event*/ evt) {
        this.onDragEnd(evt);
      }

      /** @private */
      onTouchStart(/**Event*/ evt) {
        this.onDragStart(evt);
        evt.preventDefault();
      }

      /** @private */
      onMouseOver(/**Event*/ evt) {}

      /** @private */
      onMouseOut(/**Event*/ evt) {}

      /** @private */
      $initYSplitter() {
        this.region = demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP;
      }
    };

    /**
                   * @class demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer
                   * @augments IComparer.<demo.IComponent>
                   * @private
                   */
    YBorderLayout.BorderLayoutComparer = /**
                   * @class demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer
                   * @augments IComparer.<demo.IComponent>
                   * @private
                   */
    class BorderLayoutComparer extends BaseClass(IComparer) {
      constructor(/**demo.IContainer*/ borderLayout) {
        super();

        /**
         * @type {demo.IContainer}
         * @private
         */
        this.borderLayout = null;

        this.borderLayout = borderLayout;
      }

      /**
       * @return {number}
       * @private
       */
      getWeight(/**demo.IComponent*/ x) {
        var layoutRegion = getLayoutRegion(x);
        switch (layoutRegion) {
          case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT:
          case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT:
            return (getLayoutArrangement(this.borderLayout) === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.SIDEBAR) ? 0 : 1;
          case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP:
          case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM:
            return (getLayoutArrangement(this.borderLayout) === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.SIDEBAR) ? 1 : 0;
          case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER:
            return yfiles.system.Math.INT32_MAX_VALUE;
        }
        return 0;
      }

      /** @return {number} */
      compare(/**demo.IComponent*/ x, /**demo.IComponent*/ y) {
        var weightX = this.getWeight(x);
        var weightY = this.getWeight(y);
        return weightX - weightY;
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YComboBox
     * @augments demo.DefaultApplicationParserBackend.YCommandComponent
     * @augments demo.IComboBox
     * @private
     */
    DefaultApplicationParserBackend.YComboBox = class YComboBox extends BaseClass(demo.DefaultApplicationParserBackend.YCommandComponent, demo.IComboBox) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {HTMLSelectElement}
         * @private
         */
        this.selectElement = null;

        /**
                     * @type {IEnumerable.<string>}
                     * @private
                     */
        this.itemsField = null;

        /**
         * @type {HTMLSelectElement}
         * @private
         */
        this.selectElement = null;

        /**
                     * @type {IEnumerable.<string>}
                     * @private
                     */
        this.itemsField = null;

        this.selectElement = (/**@type {HTMLSelectElement}*/(element));
        element.setAttribute("size", "1");
        this.addEventListener(delegate(this.maybeExecuteCommand, this));
      }

      /** @type {IEnumerable.<string>} */
      get items() {
        return this.itemsField;
      }

      /** @type {IEnumerable.<string>} */
      set items(/**IEnumerable.<string>*/ value) {
        if (!this.isEmpty) {
          demo.DefaultApplicationParserBackend.YToolkit.removeAllChildren((/**@type {HTMLElement}*/(this.element)));
        }

        this.itemsField = value;
        this.enabled = !this.isEmpty;

        if (value !== null) {
          value.forEach((function(/**string*/ s) {
            var optionElement = document.createElement("option");
            optionElement.textContent = s;
            this.element.appendChild(optionElement);
          }).bind(this));
          this.setSelectedIndexCore(0);
        } else {
          this.maybeExecuteCommand(null);
        }
      }

      /**
       * @return {boolean}
       * @private
       */
      isEmpty() {
        return this.itemsField === null || this.itemsField.size === 0;
      }

      /** @private */
      setSelectedIndexCore(/**number*/ value) {
        this.selectElement.selectedIndex = value;
        this.maybeExecuteCommand(null);
      }

      /** @type {number} */
      get length() {
        return this.selectElement.length;
      }

      /** @return {string} */
      elementAt(/**number*/ index) {
        var elementAt = this.selectElement.options.item(index);
        return elementAt === null ? null : elementAt.textContent;
      }

      /** @type {number} */
      get selectedIndex() {
        return this.selectElement.selectedIndex;
      }

      /** @type {number} */
      set selectedIndex(/**number*/ value) {
        if (value !== this.selectElement.selectedIndex) {
          this.setSelectedIndexCore(value);
        }
      }

      /** @type {string} */
      get selectedItem() {
        return this.elementAt(this.selectedIndex);
      }

      /** @type {string} */
      set selectedItem(/**string*/ value) {
        var n = this.length;
        for (var i = 0; i < n; i++) {
          if (value === this.elementAt(i)) {
            this.selectedIndex = i;
            break;
          }
        }
      }

      addEventListener(/**function(Event)*/ handler) {
        this.element.addEventListener("change", handler, false);
      }

      removeEventListener(/**function(Event)*/ handler) {
        this.element.removeEventListener("change", handler, false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YCheckBox
     * @augments demo.DefaultApplicationParserBackend.YCommandComponent
     * @augments demo.ICheckBox
     * @private
     */
    DefaultApplicationParserBackend.YCheckBox = class YCheckBox extends BaseClass(demo.DefaultApplicationParserBackend.YCommandComponent, demo.ICheckBox) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {HTMLInputElement}
         * @private
         */
        this.checkBoxElement = null;

        /**
         * @type {HTMLInputElement}
         * @private
         */
        this.checkBoxElement = null;

        this.checkBoxElement = (/**@type {HTMLInputElement}*/(element));
        this.addEventListener(delegate(this.maybeExecuteCommand, this));
      }

      /** @type {boolean} */
      get isChecked() {
        return this.checkBoxElement.checked;
      }

      /** @type {boolean} */
      set isChecked(/**boolean*/ value) {
        if (value !== this.checkBoxElement.checked) {
          this.checkBoxElement.checked = value;
          this.maybeExecuteCommand(null);
        }
      }

      addEventListener(/**function(Event)*/ handler) {
        this.element.addEventListener("change", handler, false);
      }

      removeEventListener(/**function(Event)*/ handler) {
        this.element.removeEventListener("change", handler, false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YCollapsiblePane
     * @augments demo.DefaultApplicationParserBackend.YPanel
     * @augments demo.ICollapsiblePane
     * @private
     */
    DefaultApplicationParserBackend.YCollapsiblePane = class YCollapsiblePane extends BaseClass(demo.DefaultApplicationParserBackend.YPanel, demo.ICollapsiblePane) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {Element}
         * @private
         */
        this.headerField = null;

        /**
         * @type {Element}
         * @private
         */
        this.contentField = null;

        /**
         * Backing field for below property 
         * @type {boolean}
         * @private
         */
        this.$isExpanded = false;

        /**
         * Backing field for below property 
         * @type {demo.CollapseStyle}
         * @private
         */
        this.$collapseStyle = null;

        /**
         * @type {Element}
         * @private
         */
        this.headerField = null;

        /**
         * @type {Element}
         * @private
         */
        this.contentField = null;

        /**
         * Backing field for below property 
         * @type {boolean}
         * @private
         */
        this.$isExpanded = false;

        /**
         * Backing field for below property 
         * @type {demo.CollapseStyle}
         * @private
         */
        this.$collapseStyle = null;

        this.$initYCollapsiblePane();
      }

      collapse() {
        if (this.collapseStyle === demo.CollapseStyle.NONE) {
          return;
        }
        if (this.isExpanded) {
          demo.ElementExtensions.addClass(this.elementField, "demo-collapsed");
        }
        this.isExpanded = false;
      }

      expand() {
        if (this.collapseStyle === demo.CollapseStyle.NONE) {
          return;
        }
        if (!this.isExpanded) {
          demo.ElementExtensions.removeClass(this.elementField, "demo-collapsed");
        }
        this.isExpanded = true;
      }

      toggle() {
        if (this.isExpanded) {
          this.collapse();
        } else {
          this.expand();
        }
      }

      /** @type {boolean} */
      get isExpanded() {
        return this.$isExpanded;
      }

      /** @type {boolean} */
      set isExpanded(/**boolean*/ value) {
        this.$isExpanded = value;
      }

      /** @type {string} */
      get header() {
        return ((/**@type {HTMLElement}*/(this.headerField))).innerHTML;
      }

      /** @type {string} */
      set header(/**string*/ value) {
        if (this.headerField === null) {
          this.headerField = document.createElement("span");
          this.headerField.setAttribute("class", "demo-collapsible-pane-header");
          if (this.contentField !== null) {
            this.elementField.insertBefore(this.headerField, this.contentField);
          } else {
            this.elementField.appendChild(this.headerField);
          }
          this.headerField.addEventListener("click", (function(/**Event*/ e) {
            this.toggle();
          }).bind(this), false);
        }
        ((/**@type {HTMLElement}*/(this.headerField))).innerHTML = value;
      }

      /** @type {Element} */
      get content() {
        return this.contentField;
      }

      /** @type {Element} */
      set content(/**Element*/ value) {
        if (this.contentField !== null) {
          this.elementField.replaceChild(value, this.contentField);
        } else {
          this.elementField.appendChild(value);
        }
        this.contentField = value;
      }

      /** @type {demo.CollapseStyle} */
      get collapseStyle() {
        return this.$collapseStyle;
      }

      /** @type {demo.CollapseStyle} */
      set collapseStyle(/**demo.CollapseStyle*/ value) {
        this.$collapseStyle = value;
      }

      /** @private */
      $initYCollapsiblePane() {
        this.$collapseStyle = demo.CollapseStyle.TOP;
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YToolkit
     * @private
     */
    DefaultApplicationParserBackend.YToolkit = class YToolkit {
      constructor() {}

      /** @return {demo.DefaultApplicationParserBackend.YSeparator} */
      createSeparator() {
        var element = document.createElement("span");
        demo.ElementExtensions.addClass(element, "demo-separator");
        return new demo.DefaultApplicationParserBackend.YSeparator(element);
      }

      /** @return {demo.DefaultApplicationParserBackend.YButton} */
      createButton(/**string*/ label) {
        var button = document.createElement("button");
        button.setAttribute("class", "demo-button");
        ((/**@type {HTMLElement}*/(button))).innerHTML = label;
        return new demo.DefaultApplicationParserBackend.YButton(button);
      }

      /** @return {demo.DefaultApplicationParserBackend.YToolBar} */
      createToolBar() {
        var e = document.createElement("div");
        e.setAttribute("class", "demo-toolbar");
        return new demo.DefaultApplicationParserBackend.YToolBar(e);
      }

      /** @return {demo.IButton} */
      createMenuItem(/**string*/ label) {
        var button = document.createElement("li");
        button.setAttribute("class", "demo-menu-item");
        ((/**@type {HTMLElement}*/(button))).innerHTML = label;
        return new demo.DefaultApplicationParserBackend.YButton(button);
      }

      /** @type {demo.DefaultApplicationParserBackend.YToolkit} */
      static get INSTANCE() {
        return (instanceField) !== null ? instanceField : (instanceField = new demo.DefaultApplicationParserBackend.YToolkit());
      }

      static removeAllChildren(/**HTMLElement*/ element) {
        if (element.children !== undefined) {
          var n = element.children.length;
          for (var i = 0; i < n; i++) {
            var child = (/**@type {Element}*/(element.children[0]));
            element.removeChild(child);
          }
        }
      }

      /** @type {yfiles.geometry.SizeD} */
      static get BROWSER_SIZE() {
        if (typeof(window["innerWidth"]) !== "undefined") {
          return new Size(window.innerWidth, window.innerHeight);
        }
        if (typeof(document["documentElement"]) !== "undefined" && (/**@type {number}*/(document.documentElement["clientWidth"])) !== 0) {
          return new Size(((document.documentElement["clientWidth"])), (/**@type {number}*/(document.documentElement["clientHeight"])));
        }
        if (typeof(document.body) !== "undefined") {
          return new Size(document.body.clientWidth, document.body.clientHeight);
        }
        return new Size(0, 0);
      }

      /** @type {boolean} */
      static get IS_LANDSCAPE() {
        var size = demo.DefaultApplicationParserBackend.YToolkit.BROWSER_SIZE;
        return size.width > size.height;
      }

      /** @type {boolean} */
      static get IS_PORTRAIT() {
        return !demo.DefaultApplicationParserBackend.YToolkit.IS_LANDSCAPE;
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YSlider
     * @augments demo.DefaultApplicationParserBackend.YComponent
     * @augments demo.ISlider
     */
    DefaultApplicationParserBackend.YSlider = class YSlider extends BaseClass(demo.DefaultApplicationParserBackend.YComponent, demo.ISlider) {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {HTMLInputElement}
         * @private
         */
        this.sliderElement = null;

        /**
         * @type {boolean}
         * @private
         */
        this.enabled1 = false;

        /**
         * @type {number}
         * @private
         */
        this.min1 = 0;

        /**
         * @type {number}
         * @private
         */
        this.max1 = 0;

        /**
         * @type {HTMLInputElement}
         * @private
         */
        this.sliderElement = null;

        /**
         * @type {boolean}
         * @private
         */
        this.enabled1 = false;

        /**
         * @type {number}
         * @private
         */
        this.min1 = 0;

        /**
         * @type {number}
         * @private
         */
        this.max1 = 0;

        this.sliderElement = (/**@type {HTMLInputElement}*/(element));
      }

      /** @type {number} */
      get value() {
        return parseFloat(this.sliderElement.value);
      }

      /** @type {number} */
      set value(/**number*/ value) {
        this.sliderElement.value = value.toString();
      }

      /** @type {number} */
      get min() {
        return this.min1;
      }

      /** @type {number} */
      set min(/**number*/ value) {
        this.min1 = value;
        this.elementField["min"] = value;
      }

      /** @type {number} */
      get max() {
        return this.max1;
      }

      /** @type {number} */
      set max(/**number*/ value) {
        this.max1 = value;
        this.elementField["max"] = value;
      }

      /** @type {boolean} */
      get enabled() {
        return this.enabled1;
      }

      /** @type {boolean} */
      set enabled(/**boolean*/ value) {
        this.enabled1 = value;
        this.elementField["disabled"] = !value;
      }

      addEventListener(/**function(Event)*/ handler) {
        this.element.addEventListener("change", handler, false);
      }

      removeEventListener(/**function(Event)*/ handler) {
        this.element.removeEventListener("change", handler, false);
      }
    };

    /**
     * @class demo.DefaultApplicationParserBackend.YFramerateCounter
     * @augments demo.DefaultApplicationParserBackend.YComponent
     */
    DefaultApplicationParserBackend.YFramerateCounter = class YFramerateCounter extends demo.DefaultApplicationParserBackend.YComponent {
      constructor(/**Element*/ element) {
        super(element);

        /**
         * @type {number}
         * @private
         */
        this.lastUpdate = null;

        /**
         * @type {number}
         * @private
         */
        this.fps = 0;

        /** @type {number} */
        this.smoothing = 0;

        /** @type {number} */
        this.updateInterval = 0;

        /**
         * @type {number}
         * @private
         */
        this.lastUpdate = null;

        /**
         * @type {number}
         * @private
         */
        this.fps = 0;

        /** @type {number} */
        this.smoothing = 0;

        /** @type {number} */
        this.updateInterval = 0;

        this.$initYFramerateCounter();
        this.smoothing = 1;
        this.updateInterval = 1000;
      }

      start() {
        setTimeout(delegate(this.tick, this), 1);
        setTimeout(delegate(this.drawFPSTimeout_Tick, this), this.updateInterval);
      }

      /** @private */
      tick() {
        var now = Date.now();
        var d = now - this.lastUpdate;
        var current = d !== 0 ? 1000 / d : 0;
        this.fps += (current - this.fps) / this.smoothing;
        this.lastUpdate = now;

        setTimeout(delegate(this.tick, this), 1);
      }

      /** @private */
      drawFPSTimeout_Tick() {
        this.drawFPS();
        setTimeout(delegate(this.drawFPSTimeout_Tick, this), this.updateInterval);
      }

      /** @private */
      drawFPS() {
        ((/**@type {HTMLElement}*/(this.element))).innerHTML = ((/**@type {Number}*/((this.fps)))).toFixed(1) + " fps";
      }

      /** @private */
      $initYFramerateCounter() {
        this.lastUpdate = Date.now();
      }
    };

    /**
     * @interface demo.ICheckBox
     * @implements {demo.IComponent}
     */
    export const ICheckBox = new InterfaceDefinition(function() {
      /** @lends {demo.ICheckBox.prototype} */
      return {
        '$with': [demo.IComponent],
        
        /** @type {boolean} */
        'isChecked': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.ITextArea
     * @implements {demo.IComponent}
     */
    export const ITextArea = new InterfaceDefinition(function() {
      /** @lends {demo.ITextArea.prototype} */
      return {
        '$with': [demo.IComponent],
        
        /** @type {string} */
        'text': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.IToolBar
     * @implements {demo.IContainer}
     */
    export const IToolBar = new InterfaceDefinition(function() {
      /** @lends {demo.IToolBar.prototype} */
      return {
        '$with': [demo.IContainer],
        
        /** @return {demo.ISeparator} */
        'addSeparator': Abstract,
        
        /** @return {demo.IButton} */
        'addButton': Abstract
        
      };
    });

    /**
     * Provides helper methods for file saving.
     * @class demo.FileSaveSupport
     */
    export const FileSaveSupport = class FileSaveSupport {
      /**
       * Saves the file to the file system using the HTML5 File download or
       * the proprietary msSaveOrOpenBlob function in Internet Explorer.
       * @param {string} fileContent The file contents to be saved.
       * @param {string} fileName The default filename for the downloaded file.
       * @param {function(Object, yfiles.canvas.FileEventArgs)} handler The handler that is executed when saving has succeeded or failed.
       */
      saveToFile(
        /**string*/ fileContent,
        /**string*/ fileName,
        /**function(Object, yfiles.canvas.FileEventArgs)*/ handler
      ) {
        // extract file format
        var format = yfiles.system.StringExtensions.split(fileName, ['.'])[1].toLowerCase();

        if (demo.FileSaveSupport.isFileConstructorAvailable()) {
          if (format === "svg") {
            // work around the 'May harm browser experience' message in chrome
            // when downloading svg files.
            var options = new Object();
            options["type"] = "image/svg+xml";
            var blob = new Blob([fileContent], options);
            fileContent = URL.createObjectURL(blob);
          }
          var aElement = (/**@type {HTMLElement}*/(document.createElement("a")));
          aElement.setAttribute("href", fileContent);
          aElement.setAttribute("download", fileName);
          aElement.style.setProperty("display", "none", "");
          document.body.appendChild(aElement);
          aElement.click();
          document.body.removeChild(aElement);
          this.saveSucceeded(handler);
          return;
        }
        if (demo.FileSaveSupport.isMsSaveAvailable()) {
          var arr = yfiles.system.StringExtensions.split(fileContent, [',']);
          var bstr = window.atob(arr[1]);
          var u8Arr = new Uint8Array(bstr.length);
          // extract mime
          var options = new Object();
          options["type"] = (arr[0]).match(new RegExp(":(.*?);", ""))[1];

          var byteArray = new Array(bstr.length);
          for (var i = bstr.length - 1; i >= 0; i--) {
            byteArray[i] = (/**@type {number}*/(bstr.charCodeAt(i)));
          }
          u8Arr.set(byteArray);

          if (window.navigator.msSaveOrOpenBlob(new Blob([u8Arr], options), fileName)) {
            this.saveSucceeded(handler);
          }
          this.saveFailed(handler, "A failure occurred during saving.");
          return;
        }
      }

      /** @private */
      saveSucceeded(/**function(Object, yfiles.canvas.FileEventArgs)*/ handler) {
        handler(this, yfiles.canvas.FileEventArgs.EMPTY_SUCCESS);
      }

      /** @private */
      saveFailed(
        /**function(Object, yfiles.canvas.FileEventArgs)*/ handler,
        /**string*/ reason
      ) {
        handler(this, yfiles.canvas.FileEventArgs.createFailArgs(reason));
      }

      /**
       * Returns whether the File Constructor-based save technique is available.
       * This works in Firefox 28+, Chrome 38+, Opera 25+, and recent mobile browsers.
       * Currently not working in Internet Explorer nor Safari (OS X and iOS).
       * See the related demo for more details.
       * @return {boolean}
       */
      static isFileConstructorAvailable() {
        // Test whether required functions exist
        if (typeof(window.URL) !== "function" || typeof(window.Blob) !== "function" || typeof(window.File) !== "function") {
          return false;
        }
        // Test whether the constructor works as expected
        try {
          new File(["Content"], "fileName", demo.FileSaveSupport.createFilePropertyBag());
        } catch ( /**Exception*/ ignored ) {
          {
            return false;
          }
        }
        // Everything is available
        return true;
      }

      /**
       * Returns whether the MS Internet Explorer specific save technique is available.
       * This works in IE 10+. See the related demo for more details.
       * for more details.
       * @return {boolean}
       */
      static isMsSaveAvailable() {
        return typeof(window.Blob) === "function" && typeof(window.navigator["msSaveOrOpenBlob"]) === "function";
      }

      /** @return {Object} */
      static createFilePropertyBag() {
        var blobPropertyBag = new Object();
        blobPropertyBag["type"] = "image/png";
        blobPropertyBag["lastModified"] = Date.now();
        return blobPropertyBag;
      }
    };

    /**
     * A dialog for showing messages. It provides some common button configurations.
     * @class demo.MessageDialog
     */
    export const MessageDialog = class MessageDialog {
      constructor(
        /**string*/ title,
        /**string*/ message,
        /**demo.MessageDialog.MessageDialogButtons*/ buttonConfig
      ) {
        /** @type {Element} */
        this.div = null;

        /** @type {function()} */
        this.abortHandler = null;

        /** @type {function()} */
        this.retryHandler = null;

        /** @type {function()} */
        this.ignoreHandler = null;

        /** @type {function()} */
        this.okHandler = null;

        /** @type {function()} */
        this.cancelHandler = null;

        /** @type {function()} */
        this.yesHandler = null;

        /** @type {function()} */
        this.noHandler = null;

        /**
         * @type {HTMLFormElement}
         * @private
         */
        this.form = null;

        var elements = demo.DemoDialogFactory.createPlainDialog(title);
        this.div = elements[0];

        var label = (/**@type {HTMLDivElement}*/(document.createElement("label")));
        label.textContent = message;
        label.setAttribute("style", "margin: 20px 7px 17px 2px");

        this.form = (/**@type {HTMLFormElement}*/(document.createElement("form")));
        var contentPanel = elements[3];
        contentPanel.setAttribute("class", "demo-properties " + contentPanel.getAttribute("class"));
        contentPanel.appendChild(this.form);
        this.form.appendChild(label);

        var buttonContainer = (/**@type {HTMLFormElement}*/(document.createElement("div")));
        buttonContainer.setAttribute("style", "text-align:right");
        this.form.appendChild(buttonContainer);

        switch (buttonConfig) {
          case demo.MessageDialog.MessageDialogButtons.ABORT_RETRY_IGNORE:
            buttonContainer.appendChild(this.createButton("Abort", true, false));
            buttonContainer.appendChild(this.createButton("Retry", true, false));
            buttonContainer.appendChild(this.createButton("Ignore", true, false));
            break;
          case demo.MessageDialog.MessageDialogButtons.OK:
            buttonContainer.appendChild(this.createButton("Ok", true, false));
            break;
          case demo.MessageDialog.MessageDialogButtons.OK_CANCEL:
            buttonContainer.appendChild(this.createButton("Ok", true, false));
            buttonContainer.appendChild(this.createButton("Cancel", true, false));
            break;
          case demo.MessageDialog.MessageDialogButtons.RETRY_CANCEL:
            buttonContainer.appendChild(this.createButton("Retry", true, false));
            buttonContainer.appendChild(this.createButton("Cancel", true, false));
            break;
          case demo.MessageDialog.MessageDialogButtons.YES_NO:
            buttonContainer.appendChild(this.createButton("Yes", true, false));
            buttonContainer.appendChild(this.createButton("No", true, false));
            break;
          case demo.MessageDialog.MessageDialogButtons.YES_NO_CANCEL:
            buttonContainer.appendChild(this.createButton("Yes", true, false));
            buttonContainer.appendChild(this.createButton("No", true, false));
            buttonContainer.appendChild(this.createButton("Cancel", true, false));
            break;
        }
      }

      /**
       * @return {function()}
       * @private
       */
      getButtonHandler(/**string*/ name) {
        switch (name) {
          case "Abort":
            return this.abortHandler;
          case "Retry":
            return this.retryHandler;
          case "Ignore":
            return this.ignoreHandler;
          case "Ok":
            return this.okHandler;
          case "Cancel":
            return this.cancelHandler;
          case "Yes":
            return this.yesHandler;
          case "No":
            return this.noHandler;
        }
        return null;
      }

      /**
       * @return {Element}
       * @private
       */
      createButton(/**string*/ label, /**boolean*/ close, /**boolean*/ submit) {
        var btn = document.createElement("button");
        btn.textContent = label;
        var wrappedHandler = (function(/**Event*/ evt) {
          if (close) {
            removeFromParent(this.div);
          }
          var buttonHandler = this.getButtonHandler(label);
          if (buttonHandler) {
            buttonHandler();
          }
          evt.preventDefault();
        }).bind(this);

        if (submit) {
          this.form.addEventListener("submit", wrappedHandler, false);
        }
        btn.addEventListener("click", wrappedHandler, false);
        return btn;
      }
    };

    /**
     * The button configurations supported by this dialog.
     */
    MessageDialog.MessageDialogButtons = new EnumDefinition(function() {
      return {
        'ABORT_RETRY_IGNORE': 0,
        'OK': 1,
        'OK_CANCEL': 2,
        'RETRY_CANCEL': 3,
        'YES_NO': 4,
        'YES_NO_CANCEL': 5
      };
    });

    /**
     * @class demo.ElementExtensions
     */
    export const ElementExtensions = class ElementExtensions {
      /** @return {Element} */
      static addClass(/**Element*/ e, /**string*/ className) {
        var classes = e.getAttribute("class");
        if (classes === null || classes === "") {
          e.setAttribute("class", className);
        } else if (!demo.ElementExtensions.hasClass(e, className)) {
          e.setAttribute("class", classes + ' ' + className);
        }
        return e;
      }

      /** @return {Element} */
      static removeClass(/**Element*/ e, /**string*/ className) {
        var classes = e.getAttribute("class");
        if (classes !== null && classes !== "") {
          if (classes === className) {
            e.setAttribute("class", "");
          } else {
            var result = ((classes.split(" ")).filter(function(/**String*/ s) {
              return s !== className;
            })).join(" ");
            e.setAttribute("class", result);
          }
        }
        return e;
      }

      /** @return {boolean} */
      static hasClass(/**Element*/ e, /**string*/ className) {
        var classes = e.getAttribute("class");
        var r = new RegExp("\b" + className + "\b", "");
        return r.test(classes);
      }
    };

    /**
     * @class demo.LayoutDirection
     */
    export const LayoutDirection = new EnumDefinition(function() {
      /** @lends {demo.LayoutDirection.prototype} */
      return {
        'VERTICAL': 0,
        'HORIZONTAL': 1,
        'UNKNOWN': 2
      };
    });

    /**
     * @class demo.DemoFrameworkConstants
     */
    export const DemoFrameworkConstants = class DemoFrameworkConstants {};

    /** @type {string} */
    DemoFrameworkConstants.DATA_ATTRIBUTE_LAYOUT_ORIENTATION = "data-layout-orientation";

    /**
     * @interface demo.ISlider
     * @implements {demo.IComponent}
     */
    export const ISlider = new InterfaceDefinition(function() {
      /** @lends {demo.ISlider.prototype} */
      return {
        '$with': [demo.IComponent],
        
        /** @type {number} */
        'value': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {boolean} */
        'enabled': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {number} */
        'min': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {number} */
        'max': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.ISeparator
     * @implements {demo.IComponent}
     */
    export const ISeparator = new InterfaceDefinition(function() {
      /** @lends {demo.ISeparator.prototype} */
      return {
        '$with': [demo.IComponent]
        
      };
    });

    /**
     * @interface demo.ICollapsiblePane
     * @implements {demo.IPanel}
     */
    export const ICollapsiblePane = new InterfaceDefinition(function() {
      /** @lends {demo.ICollapsiblePane.prototype} */
      return {
        '$with': [demo.IPanel],
        
        'collapse': Abstract,
        
        'expand': Abstract,
        
        /** @type {boolean} */
        'isExpanded': {
          'get': Abstract
        },
        
        /** @type {string} */
        'header': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {Element} */
        'content': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {demo.CollapseStyle} */
        'collapseStyle': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.IApplicationFrame
     * @implements {demo.IPanel}
     */
    export const IApplicationFrame = new InterfaceDefinition(function() {
      /** @lends {demo.IApplicationFrame.prototype} */
      return {
        '$with': [demo.IPanel],
        
        /** @type {demo.IComponent} */
        'header': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {demo.IComponent} */
        'footer': {
          'get': Abstract,
          'set': Abstract
        },
        
        'init': Abstract
        
      };
    });

    /**
     * @interface demo.IPanel
     * @implements {demo.IContainer}
     */
    export const IPanel = new InterfaceDefinition(function() {
      /** @lends {demo.IPanel.prototype} */
      return {
        '$with': [demo.IContainer]
        
      };
    });

    /**
     * @interface demo.IContainer
     * @implements {demo.IComponent}
     */
    export const IContainer = new InterfaceDefinition(function() {
      /** @lends {demo.IContainer.prototype} */
      return {
        '$with': [demo.IComponent],
        
        /** @type {IEnumerable.<demo.IComponent>} */
        'children': {
          'get': Abstract
        },
        
        'add': Abstract,
        
        'remove': Abstract,
        
        'layoutChildren': Abstract
        
      };
    });

    /**
     * @interface demo.IComboBox
     * @implements {demo.ICommandComponent}
     */
    export const IComboBox = new InterfaceDefinition(function() {
      /** @lends {demo.IComboBox.prototype} */
      return {
        '$with': [demo.ICommandComponent],
        
        /** @return {string} */
        'elementAt': Abstract,
        
        /** @type {IEnumerable.<string>} */
        'items': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {number} */
        'length': {
          'get': Abstract
        },
        
        /** @type {number} */
        'selectedIndex': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {string} */
        'selectedItem': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.IToggleButton
     * @implements {demo.IButton}
     */
    export const IToggleButton = new InterfaceDefinition(function() {
      /** @lends {demo.IToggleButton.prototype} */
      return {
        '$with': [demo.IButton],
        
        /** @type {boolean} */
        'isChecked': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @interface demo.IButton
     * @implements {demo.ICommandComponent}
     */
    export const IButton = new InterfaceDefinition(function() {
      /** @lends {demo.IButton.prototype} */
      return {
        '$with': [demo.ICommandComponent],
        
        /** @type {string} */
        'label': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {string} */
        'icon': {
          'get': Abstract,
          'set': Abstract
        }
        
      };
    });

    /**
     * @class demo.CollapseStyle
     */
    export const CollapseStyle = new EnumDefinition(function() {
      /** @lends {demo.CollapseStyle.prototype} */
      return {
        'TOP': 0,
        'LEFT': 1,
        'RIGHT': 2,
        'NONE': 3
      };
    });

    /**
     * @interface demo.ICommandComponent
     * @implements {demo.IComponent}
     */
    export const ICommandComponent = new InterfaceDefinition(function() {
      /** @lends {demo.ICommandComponent.prototype} */
      return {
        '$with': [demo.IComponent],
        
        /** @type {yfiles.system.ICommand} */
        'command': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {Object} */
        'commandParameter': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {yfiles.canvas.Control} */
        'commandTarget': {
          'get': Abstract,
          'set': Abstract
        },
        
        /** @type {boolean} */
        'enabled': {
          'get': Abstract,
          'set': Abstract
        },
        
        'addEventListener': Abstract,
        
        'removeEventListener': Abstract
        
      };
    });
  })(r);


  export default yfiles_module_demo;
})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
