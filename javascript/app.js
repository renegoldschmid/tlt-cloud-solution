/**
 * Helper Functions
 */
function toggleGrid(element) {
    element.classList.toggle("grid");
}

/**
* Create and register Magnitude Shape
*/
function MagnitudeShape() {
    mxEllipse.call(this);
};
mxUtils.extend(MagnitudeShape, mxEllipse);
MagnitudeShape.prototype.paintVertexShape = function(c, x, y, w, h) {
    c.begin();
    c.moveTo(x, y);
    c.lineTo(x, y + h);
    c.lineTo(x + (w / 2), y + (h * 0.65));
    c.lineTo(x + w, y + h);
    c.lineTo(x + w, y);
    c.lineTo(x + (w / 2), y + (h * 0.35));
    c.lineTo(x, y);
    c.fillAndStroke();
};
mxCellRenderer.registerShape('magnitude', MagnitudeShape);

// Overridden to define per-shape connection points
mxGraph.prototype.getAllConnectionConstraints = function(terminal, source) {
    if (terminal != null && terminal.shape != null) {
        if (terminal.shape.stencil != null) {
            if (terminal.shape.stencil.constraints != null) {
                return terminal.shape.stencil.constraints;
            }
        } else if (terminal.shape.constraints != null) {
            return terminal.shape.constraints;
        }
    }
    return null;
};

// Defines the default constraints for all shapes
mxShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
                                    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                    new mxConnectionConstraint(new mxPoint(0.75, 0), true),
                                    new mxConnectionConstraint(new mxPoint(0, 0.25), true),
                                    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
                                    new mxConnectionConstraint(new mxPoint(0, 0.75), true),
                                    new mxConnectionConstraint(new mxPoint(1, 0.25), true),
                                    new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                                    new mxConnectionConstraint(new mxPoint(1, 0.75), true),
                                    new mxConnectionConstraint(new mxPoint(0.25, 1), true),
                                    new mxConnectionConstraint(new mxPoint(0.5, 1), true),
                                    new mxConnectionConstraint(new mxPoint(0.75, 1), true)];

// Edges have no connection points
mxPolyline.prototype.constraints = null;

// Defines the default constraints for all shapes
MagnitudeShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), true),
                                        new mxConnectionConstraint(new mxPoint(0.5, 0.3), false),
                                        new mxConnectionConstraint(new mxPoint(1, 0), true),
                                        new mxConnectionConstraint(new mxPoint(0, 0.5), true),
                                        new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                                        new mxConnectionConstraint(new mxPoint(0, 1), true),
                                        new mxConnectionConstraint(new mxPoint(0.5, 0.7), false),
                                        new mxConnectionConstraint(new mxPoint(1, 1), true)];


// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main(container) {
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        // Defines an icon for creating new connections in the connection handler.
        // This will automatically disable the highlighting of the source vertex.
        //mxConnectionHandler.prototype.connectImage = new mxImage('javascript/src/images/connector.gif', 16, 16);
        
        // Gets div-element of the sidebar
        var sidebarContainer = document.getElementById('sidebarContainer');
        // Creates new sidebar without event processing
        var sidebar = new mxToolbar(sidebarContainer);
        sidebar.enabled = false;

        // Workaround for Internet Explorer ignoring certain styles
        if (mxClient.IS_QUIRKS) {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(sidebarContainer);
            new mxDivResizer(container);
        }

        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);
        
        // Creates the model and the graph inside the container
        // using the fastest rendering available on the browser
        var model = new mxGraphModel();
        var graph = new mxGraph(container, model);

        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setMultigraph(false);

        // Disables floating connections (only use with no connect image)
        if (graph.connectionHandler.connectImage == null) {
            graph.connectionHandler.isConnectableCell = function(cell) {
                return false;
            };
            mxEdgeHandler.prototype.isConnectableCell = function(cell) {
                return graph.connectionHandler.isConnectableCell(cell);
            };
        }

        // Stops editing on enter or escape keypress
        var keyHandler = new mxKeyHandler(graph);
        // Enables rubberband selection
        var rubberband = new mxRubberband(graph);

        var addVertex = function(icon, w, h, style, value) {
            var vertex = new mxCell(value, new mxGeometry(0, 0, w, h), style);
            vertex.setVertex(true);
        
            var img = addSidebarItem(graph, sidebar, vertex, icon);
            img.enabled = true;
            
            graph.getSelectionModel().addListener(mxEvent.CHANGE, function() {
                var tmp = graph.isSelectionEmpty();
                mxUtils.setOpacity(img, (tmp) ? 100 : 20);
                img.enabled = tmp;
            });
        };
        
        addVertex('javascript/src/images/shapes/rectangle.gif', 100, 50, 'shape=rectangle', null);
        addVertex('javascript/src/images/shapes/rounded.gif', 100, 50, 'shape=rounded', null);
        addVertex('javascript/src/images/shapes/ellipse.gif', 50, 50, 'shape=ellipse', null);
        addVertex('javascript/src/images/shapes/rhombus.gif', 50, 50, 'shape=rhombus', null);
        addVertex('javascript/src/images/shapes/triangle_right.gif', 50, 50, 'shape=triangle', null);
        addVertex('javascript/src/images/shapes/magnitude.gif', 80, 40, 'shape=magnitude', "MAG");
        
        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();

        // Creates the default style for vertices
        var style = [];
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_STROKECOLOR] = 'gray';
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
        style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
        style[mxConstants.STYLE_FONTCOLOR] = '#774400';
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        style[mxConstants.STYLE_FONTSIZE] = '11';
        style[mxConstants.STYLE_FONTSTYLE] = 1;
        graph.getStylesheet().putDefaultVertexStyle(style);

        // Creates the default style for edges
        style = [];
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
        style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        //style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EDGESTYLE_ORTHOGONAL;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
        style[mxConstants.STYLE_FONTSIZE] = '10';
        graph.getStylesheet().putDefaultEdgeStyle(style);

        // Enables connect preview for the default edge style
        graph.connectionHandler.createEdgeState = function(me) {
            var edge = graph.createEdge(null, null, null, null, null);
            return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
        };

        // Specifies the default edge style
        graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle';
        //style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_CURVED] = '1';

        /**
        * Undo / Redo Manager
        */
        var undoManager = new mxUndoManager();
        var listener = function(sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };
        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        // Add Undo/Redo-Buttons to the Toolbar
        var toolbar = document.getElementById('toolbarContainer');

        var undoButton = mxUtils.button('Undo', function() {
            undoManager.undo();
        });
        undoButton.classList.add("button", "button-undo");

        var redoButton = mxUtils.button('Redo', function() {
            undoManager.redo();
        });
        redoButton.classList.add("button", "button-redo");

        toolbar.insertBefore(redoButton, toolbar.childNodes[0]);
        toolbar.insertBefore(undoButton, toolbar.childNodes[0]);

        /**
        * Event Handling on key strokes
        */
        // "DEL" - Delete an Entity
        keyHandler.bindKey(46, function(evt) {
            if (graph.isEnabled()) {
                graph.removeCells();
            }
        });

        // "S" - Open Popup with XML-Code (Save)
        keyHandler.bindKey(83, function(evt) {
            var xml = getDiagramAsXml(true);
            mxUtils.popup(xml, true);
        });

        // "Z" - Undo Action
        keyHandler.bindKey(90, function(evt) {
            undoManager.undo();
        });

        // "U" - Redo Action
        keyHandler.bindKey(85, function(evt) {
            undoManager.redo();
        });

        // "G" - Toggle Grid
        keyHandler.bindKey(71, function(evt) {
            toggleGrid(document.getElementById('graphContainer'));
        });

        // Filereader for Loading the diagram
        var inputFile = document.getElementById('file-upload');
        inputFile.onchange = function() {
            var file = this.files[0];
            var reader = new FileReader();  
            reader.onload = function(ev) {
                loadDiagram(ev.target.result);
            };  
            reader.readAsText(file);
        };

        // Event Listener for saving the diagram as XML
        document.getElementById("download-xml").addEventListener("click", function(){
            saveDiagram("diagram.xml");
        }, false);
    }

    function saveDiagram(filename) {
        var xml = getDiagramAsXml(false);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function loadDiagram(xmlFile) {
        //var testXml = '<root><mxCell id="2" value="Hello," vertex="1"><mxGeometry x="20" y="20" width="80" height="30" as="geometry"/></mxCell><mxCell id="3" value="World!" vertex="1"><mxGeometry x="200" y="150" width="80" height="30" as="geometry"/></mxCell><mxCell id="4" value="" edge="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root>';
        var parsedXml = mxUtils.parseXml(xmlFile);
        var codec = new mxCodec(parsedXml);
        var element = parsedXml.documentElement.firstChild;
        var cells = [];

        while (element != null) {
            cells.push(codec.decode(element));
            element = element.nextSibling;
        }

        graph.addCells(cells);
    }

    function getDiagramAsXml(prettyFormatted) {
        var encoder = new mxCodec();
        var encodedModel = encoder.encode(graph.getModel());

        var xml;
        if (prettyFormatted) {
            xml = mxUtils.getPrettyXml(encodedModel);
        } else {
            xml = mxUtils.getXml(encodedModel);
        }
        
        // Getting rid of the mxGraphModel-tag
        xml = xml.substring(xml.indexOf("<mxGraphModel>")+"<mxGraphModel>".length, xml.indexOf("</mxGraphModel>"));
        return xml;
    }

    function addSidebarItem(graph, sidebar, prototype, image) {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var funct = function(graph, evt, cell, x, y) {
            graph.stopEditing(false);

            var vertex = graph.getModel().cloneCell(prototype);
            vertex.geometry.x = x;
            vertex.geometry.y = y;
                
            graph.addCell(vertex);
            graph.setSelectionCell(vertex);
        }
        
        // Creates the image which is used as the drag icon (preview)
        var img = sidebar.addMode(null, image, function(evt, cell) {
            var pt = this.graph.getPointForEvent(evt);
            funct(graph, evt, cell, pt.x, pt.y);
        });
        
        // Disables dragging if element is disabled. This is a workaround
        // for wrong event order in IE. Following is a dummy listener that
        // is invoked as the last listener in IE.
        mxEvent.addListener(img, 'mousedown', function(evt) {
            // do nothing
        });
        
        // This listener is always called first before any other listener
        // in all browsers.
        mxEvent.addListener(img, 'mousedown', function(evt) {
            if (img.enabled == false) {
                mxEvent.consume(evt);
            }
        });	
        mxUtils.makeDraggable(img, graph, funct);
        return img;
    }
};