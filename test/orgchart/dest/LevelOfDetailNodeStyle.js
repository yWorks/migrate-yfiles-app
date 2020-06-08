import * as yfiles_module_demo from "yfiles.module('demo')";

import {
  ClassDefinition,
  INode,
  INodeStyle,
  INodeStyleRenderer,
  NodeStyleBase,
  SvgVisualGroup,
  Visual,
  YNumber,
} from "yfiles";

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
  /**
   * @class demo.LevelOfDetailNodeStyle
   * @extends {yfiles.drawing.SimpleAbstractNodeStyle.<yfiles.drawing.Visual>}
   */
  export const LevelOfDetailNodeStyle = new ClassDefinition(function() {
    /** @lends {demo.LevelOfDetailNodeStyle.prototype} */
    return {
      '$extends': NodeStyleBase,
      
      'constructor': {
        '$meta': function() {
          return [yfiles.system.ParameterAttribute("detailNodeStyle", INodeStyle.$class, false), yfiles.system.ParameterAttribute("intermediateNodeStyle", INodeStyle.$class, false), yfiles.system.ParameterAttribute("overviewNodeStyle", INodeStyle.$class, false)];
        },
        'value': function(/**yfiles.drawing.INodeStyle*/ detailNodeStyle, /**yfiles.drawing.INodeStyle*/ intermediateNodeStyle, /**yfiles.drawing.INodeStyle*/ overviewNodeStyle) {
          NodeStyleBase.call(this, Visual.$class);
          this.detailThreshold = 0.7;
          this.intermediateThreshold = 0.4;
          this.detailNodeStyle = detailNodeStyle;
          this.intermediateNodeStyle = intermediateNodeStyle;
          this.nodeStyle = overviewNodeStyle;
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
          return [yfiles.system.TypeAttribute(YNumber.$class)];
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
          return [yfiles.system.TypeAttribute(YNumber.$class)];
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
          return [yfiles.system.TypeAttribute(INodeStyle.$class)];
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
          return [yfiles.system.TypeAttribute(INodeStyle.$class)];
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
          return [yfiles.system.TypeAttribute(INodeStyle.$class)];
        },
        'get': function() {
          return this.$overviewNodeStyle;
        },
        'set': function(/**yfiles.drawing.INodeStyle*/ value) {
          this.$overviewNodeStyle = value;
        }
      },
      
      /** @return {yfiles.drawing.Visual} */
      'createVisual': function(/**yfiles.drawing.IRenderContext*/ renderContext, /**INode*/ node) {
        const zoom = renderContext.zoom;
        const container = new SvgVisualGroup();
        if (zoom >= this.detailThreshold) {
          container.add(this.detailNodeStyle.renderer.getVisualCreator(node, this.detailNodeStyle).createVisual(undefined, renderContext));
          container.svgElement["data-renderDataCache"] = this.detailNodeStyle.renderer;
        } else if (zoom >= this.intermediateThreshold) {
          container.add(this.intermediateNodeStyle.renderer.getVisualCreator(node, this.intermediateNodeStyle).createVisual(undefined, renderContext));
          container.svgElement["data-renderDataCache"] = this.intermediateNodeStyle.renderer;
        } else {
          container.add(this.nodeStyle.renderer.getVisualCreator(node, this.nodeStyle).createVisual(undefined, renderContext));
          container.svgElement["data-renderDataCache"] = this.nodeStyle.renderer;
        }
        return container;
      },
      
      /** @return {yfiles.drawing.Visual} */
      'updateVisual': function(/**yfiles.drawing.IRenderContext*/ renderContext, /**yfiles.drawing.Visual*/ oldVisual, /**INode*/ node) {
        const zoom = renderContext.zoom;
        const container = (oldVisual instanceof SvgVisualGroup) ? (/**@type {yfiles.canvas.CanvasContainer}*/(oldVisual)) : null;
        if (container === null) {
          return this.createVisual(renderContext, node);
        }
        const oldInnerVisual = container.children.get(0);
        const cache = container.getRenderDataCache(INodeStyleRenderer.$class);
        if (zoom >= this.detailThreshold && cache === this.detailNodeStyle.renderer) {
          container.children.set(0, this.detailNodeStyle.renderer.getVisualCreator(node, this.detailNodeStyle).updateVisual(oldInnerVisual, undefined, renderContext));
          return container;
        } else if (zoom >= this.intermediateThreshold && zoom <= this.detailThreshold && cache === this.intermediateNodeStyle.renderer) {
          container.children.set(0, this.intermediateNodeStyle.renderer.getVisualCreator(node, this.intermediateNodeStyle).updateVisual(oldInnerVisual, undefined, renderContext));
          return container;
        } else if (zoom <= this.intermediateThreshold && cache === this.nodeStyle.renderer) {
          container.children.set(0, this.nodeStyle.renderer.getVisualCreator(node, this.nodeStyle).updateVisual(oldInnerVisual, undefined, renderContext));
          return container;
        }
        return this.createVisual(renderContext, node);
      }
      
    };
  });

  export default yfiles_module_demo;
})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
