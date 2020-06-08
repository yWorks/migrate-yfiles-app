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
   * @class demo.LevelOfDetailNodeStyle
   * @extends {yfiles.drawing.SimpleAbstractNodeStyle.<yfiles.drawing.Visual>}
   */
  exports.LevelOfDetailNodeStyle = new yfiles.ClassDefinition(function() {
    /** @lends {demo.LevelOfDetailNodeStyle.prototype} */
    return {
      '$extends': yfiles.drawing.SimpleAbstractNodeStyle,
      
      'constructor': {
        '$meta': function() {
          return [yfiles.system.ParameterAttribute("detailNodeStyle", yfiles.drawing.INodeStyle.$class, false), yfiles.system.ParameterAttribute("intermediateNodeStyle", yfiles.drawing.INodeStyle.$class, false), yfiles.system.ParameterAttribute("overviewNodeStyle", yfiles.drawing.INodeStyle.$class, false)];
        },
        'value': function(/**yfiles.drawing.INodeStyle*/ detailNodeStyle, /**yfiles.drawing.INodeStyle*/ intermediateNodeStyle, /**yfiles.drawing.INodeStyle*/ overviewNodeStyle) {
          yfiles.drawing.SimpleAbstractNodeStyle.call(this, yfiles.drawing.Visual.$class);
          this.detailThreshold = 0.7;
          this.intermediateThreshold = 0.4;
          this.detailNodeStyle = detailNodeStyle;
          this.intermediateNodeStyle = intermediateNodeStyle;
          this.overviewNodeStyle = overviewNodeStyle;
        }
      },
      
      /**
       * Backing field for below property 
       * @type {number}
       * @private
       */
      '$detailThreshold': 0,
      
      /** @type {number} */
      'detailThreshold': {
        '$meta': function() {
          return [yfiles.system.TypeAttribute(yfiles.lang.Number.$class)];
        },
        'get': function() {
          return this.$detailThreshold;
        },
        'set': function(/**number*/ value) {
          this.$detailThreshold = value;
        }
      },
      
      /**
       * Backing field for below property 
       * @type {number}
       * @private
       */
      '$intermediateThreshold': 0,
      
      /** @type {number} */
      'intermediateThreshold': {
        '$meta': function() {
          return [yfiles.system.TypeAttribute(yfiles.lang.Number.$class)];
        },
        'get': function() {
          return this.$intermediateThreshold;
        },
        'set': function(/**number*/ value) {
          this.$intermediateThreshold = value;
        }
      },
      
      /**
       * Backing field for below property 
       * @type {yfiles.drawing.INodeStyle}
       * @private
       */
      '$detailNodeStyle': null,
      
      /** @type {yfiles.drawing.INodeStyle} */
      'detailNodeStyle': {
        '$meta': function() {
          return [yfiles.system.TypeAttribute(yfiles.drawing.INodeStyle.$class)];
        },
        'get': function() {
          return this.$detailNodeStyle;
        },
        'set': function(/**yfiles.drawing.INodeStyle*/ value) {
          this.$detailNodeStyle = value;
        }
      },
      
      /**
       * Backing field for below property 
       * @type {yfiles.drawing.INodeStyle}
       * @private
       */
      '$intermediateNodeStyle': null,
      
      /** @type {yfiles.drawing.INodeStyle} */
      'intermediateNodeStyle': {
        '$meta': function() {
          return [yfiles.system.TypeAttribute(yfiles.drawing.INodeStyle.$class)];
        },
        'get': function() {
          return this.$intermediateNodeStyle;
        },
        'set': function(/**yfiles.drawing.INodeStyle*/ value) {
          this.$intermediateNodeStyle = value;
        }
      },
      
      /**
       * Backing field for below property 
       * @type {yfiles.drawing.INodeStyle}
       * @private
       */
      '$overviewNodeStyle': null,
      
      /** @type {yfiles.drawing.INodeStyle} */
      'overviewNodeStyle': {
        '$meta': function() {
          return [yfiles.system.TypeAttribute(yfiles.drawing.INodeStyle.$class)];
        },
        'get': function() {
          return this.$overviewNodeStyle;
        },
        'set': function(/**yfiles.drawing.INodeStyle*/ value) {
          this.$overviewNodeStyle = value;
        }
      },
      
      /** @return {yfiles.drawing.Visual} */
      'createVisual': function(/**yfiles.graph.INode*/ node, /**yfiles.drawing.IRenderContext*/ renderContext) {
        var zoom = renderContext.zoom;
        var container = new yfiles.canvas.CanvasContainer();
        if (zoom >= this.detailThreshold) {
          container.add(this.detailNodeStyle.renderer.getVisualCreator(node, this.detailNodeStyle).createVisual(renderContext));
          container.setRenderDataCache(this.detailNodeStyle.renderer);
        } else if (zoom >= this.intermediateThreshold) {
          container.add(this.intermediateNodeStyle.renderer.getVisualCreator(node, this.intermediateNodeStyle).createVisual(renderContext));
          container.setRenderDataCache(this.intermediateNodeStyle.renderer);
        } else {
          container.add(this.overviewNodeStyle.renderer.getVisualCreator(node, this.overviewNodeStyle).createVisual(renderContext));
          container.setRenderDataCache(this.overviewNodeStyle.renderer);
        }
        return container;
      },
      
      /** @return {yfiles.drawing.Visual} */
      'updateVisual': function(/**yfiles.graph.INode*/ node, /**yfiles.drawing.IRenderContext*/ renderContext, /**yfiles.drawing.Visual*/ oldVisual) {
        var zoom = renderContext.zoom;
        var container = (oldVisual instanceof yfiles.canvas.CanvasContainer) ? (/**@type {yfiles.canvas.CanvasContainer}*/(oldVisual)) : null;
        if (container === null) {
          return this.createVisual(node, renderContext);
        }
        var oldInnerVisual = container.children.get(0);
        var cache = container.getRenderDataCache(yfiles.drawing.INodeStyleRenderer.$class);
        if (zoom >= this.detailThreshold && cache === this.detailNodeStyle.renderer) {
          container.children.set(0, this.detailNodeStyle.renderer.getVisualCreator(node, this.detailNodeStyle).updateVisual(renderContext, oldInnerVisual));
          return container;
        } else if (zoom >= this.intermediateThreshold && zoom <= this.detailThreshold && cache === this.intermediateNodeStyle.renderer) {
          container.children.set(0, this.intermediateNodeStyle.renderer.getVisualCreator(node, this.intermediateNodeStyle).updateVisual(renderContext, oldInnerVisual));
          return container;
        } else if (zoom <= this.intermediateThreshold && cache === this.overviewNodeStyle.renderer) {
          container.children.set(0, this.overviewNodeStyle.renderer.getVisualCreator(node, this.overviewNodeStyle).updateVisual(renderContext, oldInnerVisual));
          return container;
        }
        return this.createVisual(node, renderContext);
      }
      
    };
  })


});
return yfiles.module('demo');
}));})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
