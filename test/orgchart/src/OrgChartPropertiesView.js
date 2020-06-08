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
(typeof define == 'function' ? define : (function(dependencies, fn) {
  fn();
}))(['yfiles/lang'], function() {
  yfiles.module("demo", function(exports) {
    /**
     * The property view displays some of the employee properties defined in the
     * source data. In addition, it creates links for easy navigation to the selected employees
     * superior, colleagues, and subordinates in the organization chart.
     * @class demo.OrgChartPropertiesView
     */
    exports.OrgChartPropertiesView = new yfiles.ClassDefinition(function() {

      /**
       * Creates a DOM element with the specified text content
       * @returns {HTMLElement}
       */
      function createElement(/*string*/ tagName, /*string*/ textContent) {
        var element = document.createElement(tagName);
        element.textContent = textContent;
        return element;
      }

      /**
       * Converts text values into "title case",
       * e.g. 'myPropertyName' => 'My Property Name'
       * @returns {string}
       */
      function toTitleCase(/*string*/ s) {
        var r = s.replace(/(\B[A-Z])/g, " $1"); // add spaces between camel-cased words
        r = r.replace(/(\b[a-z])/g, function(m) { // "title case"
          return m.toUpperCase();
        });
        return r;
      }

      /** @lends demo.OrgChartPropertiesView.prototype */
      return {

        /**
         * Creates a new OrgChartPropertiesView
         * @param element The DOM element that will be filled with the properties.
         * @param orgchart The OrgChartDemo instance
         */
        'constructor': function(/*HTMLElement*/ element, /*demo.OrgChartDemo*/orgchart) {
          this.element = element;
          this.orgchart = orgchart;
        },

        /** @type HTMLElement */
        'element': null,
        'orgchart': null,

        'showProperties': function(/*yfiles.graph.INode*/ node) {
          this.clear();

          // When the graph is created from the source data by class yfiles.binding.TreeSource,
          // The source data for each node is attached to the node as it's tag.
          var employee = node.tag;
          if(typeof employee !== undefined) {
            var heading = document.createElement("div");
            demo.ElementExtensions.addClass(heading, "user-detail");
            this.element.appendChild(heading);
            // The employee name
            heading.appendChild(createElement("h2", employee["name"]));
            heading.appendChild(createElement("div", employee["position"]));

            var svgIcon = this.createSVGIcon(employee.icon, 50, 50, "0 0 75 75");
            if(null!=svgIcon) {
              heading.appendChild(svgIcon);
            }

            // Display the individual properties
            var table = document.createElement("table");
            this.element.appendChild(table);
            // The employee business unit
            var tr = document.createElement("tr");
            table.appendChild(tr);
            tr.appendChild(createElement("td", "Dept."));
            tr.appendChild(createElement("td", employee.businessUnit));
            // The employee email
            var tr = document.createElement("tr");
            table.appendChild(tr);
            tr.appendChild(createElement("td", "Email"));
            tr.appendChild(createElement("td", employee.email));
            // The employee phone
            var tr = document.createElement("tr");
            table.appendChild(tr);
            tr.appendChild(createElement("td", "Phone"));
            tr.appendChild(createElement("td", employee.phone));
            // The employee fax
            var tr = document.createElement("tr");
            table.appendChild(tr);
            tr.appendChild(createElement("td", "Fax"));
            tr.appendChild(createElement("td", employee.fax));
            // The employee status
            var tr = document.createElement("tr");
            table.appendChild(tr);
            tr.appendChild(createElement("td", "Status"));
            var statusTd = document.createElement("td");
            tr.appendChild(statusTd);
            statusTd.appendChild(this.createSVGIcon(employee.status + "_icon", 100, 15, "-5 -2.5 70 5"));

            // Create links to the parent and colleague nodes.
            // (Note that the parent references are added to the
            // source data in method demo.OrgChartDemo#addParentReferences()).
            var parent = employee["parent"];
            if(typeof parent !== "undefined") {
              var parentTr = document.createElement("tr");
              parentTr.appendChild(createElement("td", "Superior"));
              var parentTd = document.createElement("td");
              parentTd.appendChild(this.createLinkEntry(parent));
              parentTr.appendChild(parentTd);
              table.appendChild(parentTr);

              var colleagues = parent["subordinates"];
              if(typeof colleagues !== "undefined" && colleagues.length > 1) {
                var colleagueTr = document.createElement("tr");
                colleagueTr.appendChild(createElement("td", "Colleagues"));
                var colleagueTd = document.createElement("td");
                colleagues.forEach(function(colleague) {
                  if(colleague != employee) {
                    if (colleagueTd.childElementCount > 0) {
                      colleagueTd.appendChild(document.createTextNode(", "));
                    }
                    colleagueTd.appendChild(this.createLinkEntry(colleague));
                  }
                }, this);
                colleagueTr.appendChild(colleagueTd);
                table.appendChild(colleagueTr);
              }
            }

            // Create links to subordinate nodes
            var subs = employee["subordinates"];
            if(typeof subs !== "undefined") {
              var subTr = document.createElement("tr");
              subTr.appendChild(createElement("td", "Subordinates"));
              var subTd = document.createElement("td");
              subs.forEach(function(sub) {
                if (subTd.childElementCount > 0) {
                  subTd.appendChild(document.createTextNode(", "));
                }
                subTd.appendChild(this.createLinkEntry(sub));
              }, this);
              subTr.appendChild(subTd);
              table.appendChild(subTr);
            }
          }
        },

        // Creates an SVG element that references the provided SVG icon, e.g.:
        // <svg width="50" height="50"><use xlink:href="#usericon_male1"></use></svg>
        'createSVGIcon': function(iconRef, width, height, viewBox) {
          var icon = document.getElementById(iconRef);
          if(icon!=null) {
            var svgNS = "http://www.w3.org/2000/svg";
            var xlinkNS = "http://www.w3.org/1999/xlink";
            var svgElement = document.createElementNS(svgNS, "svg");
            var useElement = document.createElementNS(svgNS, "use");
            useElement.setAttributeNS(xlinkNS,"xlink:href","#"+iconRef);
            svgElement.setAttribute("width", width);
            svgElement.setAttribute("height", height);
            svgElement.setAttribute("viewBox", viewBox);
            svgElement.appendChild(useElement);
          }
          return svgElement;
        },

        // clicking a link to another employee in the properties view will select
        // and zoom to the corresponding node in the organization chart.
        // We use the E-Mail address to identify individual employees.
        'createLinkEntry': function(employee) {
          var element = createElement("a", employee.name);
          element.setAttribute("href", "#");
          element.addEventListener("click", function(event) {
            this.orgchart.selectAndZoomToNodeWithEmail(employee.email);
            event.preventDefault();
          }.bind(this));
          return element;
        },

        'clear': function() {
          this.element.innerHTML = "";
        }

      };
    })
  });
});
