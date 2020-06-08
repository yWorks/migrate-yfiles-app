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
(function(r){(function(f){if("function"==typeof define&&define.amd){define(['yfiles/lang','yfiles/core-lib'],f);}else{f(r.yfiles.lang,r.yfiles);}}(function(lang,yfiles){
yfiles.module("demo", function(exports) {
  /**
   * Helper class for printing graphs.
   * Printing is done in multiple steps. First, the graph is exported to one or
   * more SVG elements, these elements are then added to a new document in a
   * new window, and finally, this window is printed using the browser's print
   * feature.
   * @class demo.OrgChartPrintingSupport
   */
  exports.OrgChartPrintingSupport = new yfiles.ClassDefinition(function() {
    /** @lends {demo.OrgChartPrintingSupport.prototype} */
    return {
      
      /**
       * Creates a new instance of this class.
       */
      'constructor': function() {
        this.margin = 5;
        this.scale = 1.0;
        this.tiledPrinting = false;
        this.tileWidth = 595;
        this.tileHeight = 842;
        this.targetUrl = "./printdocument.html";
      },
      
      /**
       * @type {string}
       * @private
       */
      'targetUrl': null,
      
      /**
       * Specifies the margin of the printed diagram.
       * @type {number}
       */
      'margin': 0,
      
      /**
       * Specifies the scale of the the printed diagram.
       * @type {number}
       */
      'scale': 0,
      
      /**
       * Specifies whether or not to split the diagram into several tiles (pages).
       * @type {boolean}
       */
      'tiledPrinting': false,
      
      /**
       * Specifies the width of a tile if {@link demo.OrgChartPrintingSupport#tiledPrinting} is enabled.
       * @type {number}
       */
      'tileWidth': 0,
      
      /**
       * Specifies the height of a tile if {@link demo.OrgChartPrintingSupport#tiledPrinting} is enabled.
       * @type {number}
       */
      'tileHeight': 0,
      
      /**
       * Prints the given graph.
       */
      'printGraph': function(/**yfiles.graph.IGraph*/ graph) {
        this.printGraphWithClipping(graph, null);
      },
      
      /**
       * Prints the detail of the given graph that is specified by the 
       * <code>clippingRectangle</code>.
       * If no clipping rectangle is specified, the complete graph is printed.
       */
      'printGraphWithClipping': function(/**yfiles.graph.IGraph*/ graph, /**yfiles.geometry.IRectangle*/ clippingRectangle) {
        // Create a new graph control for exporting the original SVG content
        var exportControl = new yfiles.canvas.GraphControl();
        // ... and assign it the same graph.
        exportControl.graph = graph;
        exportControl.updateContentRect();
        this.print(exportControl, clippingRectangle);
      },
      
      /**
       * Prints the detail of the given GraphControl's graph that is specified by the 
       * <code>clippingRectangle</code>.
       * If no clipping rectangle is specified, the complete graph is printed.
       */
      'print': function(/**yfiles.canvas.GraphControl*/ graphControl, /**yfiles.geometry.IRectangle*/ clippingRectangle) {
        var targetRect = (clippingRectangle !== null && clippingRectangle !== undefined ? yfiles.geometry.RectD.fromRectangle(clippingRectangle) : graphControl.contentRect).clone();

        var /**number*/ rows;
        var /**number*/ columns;
        var /**yfiles.geometry.RectD[][]*/ tiles;

        if (!this.tiledPrinting) {
          // no tiles - just one row and column
          rows = columns = 1;
          tiles = [[targetRect]];
        } else {
          // get the size of the printed tiles
          var tileSize = new yfiles.geometry.SizeD(this.tileWidth, this.tileHeight);
          var tileSizeScaled = new yfiles.geometry.SizeD(tileSize.width / this.scale, tileSize.height / this.scale);

          // calculate number of rows and columns
          rows = (((/**@type {number}*/(Math.ceil((targetRect.height * this.scale) / tileSize.height)))) | 0);
          columns = (((/**@type {number}*/(Math.ceil((targetRect.width * this.scale) / tileSize.width)))) | 0);

          // calculate tile bounds
          tiles = yfiles.system.ArrayExtensions./**<yfiles.geometry.RectD>*/createMultiArray([rows, columns]);
          for (var i = 0; i < rows - 1; i++) {
            for (var k = 0; k < columns - 1; k++) {
              tiles[i][k] = new yfiles.geometry.RectD(targetRect.x + tileSizeScaled.width * k, targetRect.y + tileSizeScaled.height * i, tileSizeScaled.width, tileSizeScaled.height);
            }
          }
          // calculate bounds of last row/column
          var lastX = targetRect.x + tileSizeScaled.width * (columns - 1);
          var lastY = targetRect.y + tileSizeScaled.height * (rows - 1);
          var lastWidth = targetRect.width - (tileSizeScaled.width * (columns - 1));
          var lastHeight = targetRect.height - (tileSizeScaled.height * (rows - 1));
          // set bounds of last row
          for (var k = 0; k < columns - 1; k++) {
            tiles[rows - 1][k] = new yfiles.geometry.RectD(targetRect.x + tileSizeScaled.width * k, lastY, tileSizeScaled.width, lastHeight);
          }
          // set bounds of last column
          for (var i = 0; i < rows - 1; i++) {
            tiles[i][columns - 1] = new yfiles.geometry.RectD(lastX, targetRect.y + tileSizeScaled.height * i, lastWidth, tileSizeScaled.height);
          }
          // set bounds of bottom right tile
          tiles[rows - 1][columns - 1] = new yfiles.geometry.RectD(lastX, lastY, lastWidth, lastHeight);
        }

        // display exported svg in new window
        var w = window.open(this.targetUrl);
        // wait a little so the window can load
        window.setTimeout((function() {
          try {
            // loop through all rows and columns
            for (var i = 0; i < rows; i++) {
              for (var k = 0; k < columns; k++) {
                var lastRow = i === rows - 1;
                var lastColumn = k === columns - 1;

                var exporter = new yfiles.canvas.SvgExport.FromWorldBoundsAndScale(tiles[i][k].clone(), this.scale);
                exporter.copyDefsElements = true;
                this.configureMargin(exporter, i === 0, lastRow, k === 0, lastColumn);

                var div = (/**@type {HTMLElement}*/(w.document.createElement("div")));
                w.document.body.appendChild(div);
                if (!lastRow || !lastColumn) {
                  div.setAttribute("class", "pagebreak");
                }

                // export the svg to an XML string
                var svgXml = yfiles.canvas.SvgExport.exportSvgString(exporter.exportSvg(graphControl));
                // ...and put the xml into the DOM
                div.innerHTML += svgXml;
              }
            }

            w.document.close();
            w.print();
          } catch ( /**yfiles.lang.Exception*/ e ) {
            {
              // check if the browser complains about cross-origin page access
              // this is the case for Chrome if the demo is run from the local filesystem.
              if ((e.message).indexOf("cross", 0) >= 0) {
                window.alert("Cannot modify the printing window due to cross-origin policies in effect. Try running the demo from a server!");
              } else {
                window.alert("There was an error during printing! " + e.message);
              }
            }
          }
        }).bind(this), 200);
      },
      
      /** @private */
      'configureMargin': function(/**yfiles.canvas.SvgExport*/ exporter, /**boolean*/ firstRow, /**boolean*/ lastRow, /**boolean*/ firstColumn, /**boolean*/ lastColumn) {
        if (!this.tiledPrinting) {
          // set margin if we don't print tiles
          exporter.margin = new yfiles.geometry.InsetsD(this.margin);
          return;
        }

        // for tile printing, set margin only for border tiles
        var margin = new yfiles.geometry.InsetsD.createDefault();
        if (firstRow) {
          margin.top = this.margin;
        }
        if (firstColumn) {
          margin.left = this.margin;
        }
        if (lastRow) {
          margin.bottom = this.margin;
        }
        if (lastColumn) {
          margin.right = this.margin;
        }
        exporter.margin = margin;
      }
      
    };
  })


});
return yfiles.module('demo');
}));})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
