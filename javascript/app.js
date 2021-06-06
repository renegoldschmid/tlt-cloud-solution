// Version Number
var version = "v1.0"; // Current version
var date = new Date(); // Get current date
var email = "renegoldschmid@gmail.com";

/** 
 * ##################################################
 * ############### Support Functions ################
 * ##################################################
 */

function toggleGrid(element) {
    element.classList.toggle("grid");
}

function getDiagramTitle() {
    return document.getElementById("diagramTitle").innerHTML;
}

function setDiagramTitle(title) {
    document.getElementById("diagramTitle").innerHTML = title;
}

function setVersionInfo() {
    var text = "Current Release: " + version;
    document.getElementById("versionInfo").innerHTML = text;
}

function setFooterText() {
    var text = "Copyright 2020-" + date.getFullYear() + ", LTP Designer by Rene Goldschmid <a href=\"mailto:" + email + "\"><i class=\"far fa-envelope\"></i></a>";
    document.getElementById("footerText").innerHTML = text;
}

/** 
 * ##################################################
 * #################### App Code ####################
 * ##################################################
 */
// App starts here. This function is invoked from the onLoad event handler of the document.
function main(container) {
    // Set current version
    setVersionInfo()
    // Set Footertext
    setFooterText();
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    // If browser is supported, create App
    else {
        /** 
         * ##################################################
         * ########### Custom Shape Registration ############
         * ##################################################
         */

        /**
         * ############### Default Settings #################
         */
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

        /**
         * ################ Magnitude Shape #################
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
            c.lineTo(x, y + 1); // Repeat last line to prevent a sharp edge in the top left corner
            c.fillAndStroke();
        };
        mxCellRenderer.registerShape('magnitude', MagnitudeShape);

        // Defines the default constraints for the Magnitude Shape
        MagnitudeShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), true),
                                                new mxConnectionConstraint(new mxPoint(0.5, 0.3), false),
                                                new mxConnectionConstraint(new mxPoint(1, 0), true),
                                                new mxConnectionConstraint(new mxPoint(0, 0.5), true),
                                                new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                                                new mxConnectionConstraint(new mxPoint(0, 1), true),
                                                new mxConnectionConstraint(new mxPoint(0.5, 0.7), false),
                                                new mxConnectionConstraint(new mxPoint(1, 1), true)];

        /** 
         * ##################################################
         * ############## Sidebar Registration ##############
         * ##################################################
         */
        
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

        /** 
         * ##################################################
         * ################## App Settings ##################
         * ##################################################
         */
        
        // Creates the model and the graph inside the container
        // using the fastest rendering available on the browser
        var model = new mxGraphModel();
        var graph = new mxGraph(container, model);

        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setMultigraph(false);

        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Enables rubberband selection
        var rubberband = new mxRubberband(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();

        // Defines an icon for creating new connections in the connection handler.
        // This will automatically disable the highlighting of the source vertex.
        //mxConnectionHandler.prototype.connectImage = new mxImage('javascript/src/images/connector.gif', 16, 16);

        // Disables floating connections (only use with no connect image)
        if (graph.connectionHandler.connectImage == null) {
            graph.connectionHandler.isConnectableCell = function(cell) {
                return false;
            };
            mxEdgeHandler.prototype.isConnectableCell = function(cell) {
                return graph.connectionHandler.isConnectableCell(cell);
            };
        }

        /** 
         * ##################################################
         * ################ Defining Shapes #################
         * ##################################################
         */
        
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
        
        addVertex('javascript/src/images/shapes/rectangle.gif', 120, 60, 'shape=rectangle', null);
        addVertex('javascript/src/images/shapes/rounded.gif', 120, 60, 'rounded=1', null); // shape = rounded seems to be deprecated
        addVertex('javascript/src/images/shapes/ellipse.gif', 60, 60, 'shape=ellipse', null);
        addVertex('javascript/src/images/shapes/rhombus.gif', 60, 60, 'shape=rhombus', null);
        addVertex('javascript/src/images/shapes/triangle_right.gif', 60, 60, 'shape=triangle', null);
        addVertex('javascript/src/images/shapes/magnitude.gif', 90, 45, 'shape=magnitude', "MAG");
        
        /** 
         * ##################################################
         * ################# Style Settings #################
         * ##################################################
         */
        // Creates the default style for vertices
        var style = [];
        //style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        //style[mxConstants.STYLE_SHADOW] = true; // TODO: Make it optional
        style[mxConstants.STYLE_STROKEWIDTH] = 1.5;
        style[mxConstants.STYLE_STROKECOLOR] = '#232121'; // Dark Gray
        style[mxConstants.STYLE_FILLCOLOR] = '#F3F3F3'; // Default: #EEEEEE
        style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
        style[mxConstants.STYLE_FONTCOLOR] = '#0E0719';
        style[mxConstants.STYLE_FONTSIZE] = '11';
        style[mxConstants.STYLE_FONTSTYLE] = 1;
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        graph.getStylesheet().putDefaultVertexStyle(style);

        // Creates the default style for edges
        var edgeStyle = [];
        edgeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
        edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#0E0719'; // Default: #6482B9
        edgeStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        edgeStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_BOTTOM;
        edgeStyle[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
        edgeStyle[mxConstants.STYLE_CURVED] = '1';
        edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
        edgeStyle[mxConstants.STYLE_FONTSIZE] = '11';
        graph.getStylesheet().putDefaultEdgeStyle(edgeStyle);

        // Enables connect preview for the default edge style
        graph.connectionHandler.createEdgeState = function(me) {
            var edge = graph.createEdge(null, null, null, null, null);
            return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
        };

        /** 
         * ##################################################
         * ############## UNDO / REDO Manager ###############
         * ##################################################
         */

        var undoManager = new mxUndoManager();
        var listener = function(sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };
        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        var undoButton = mxUtils.button('Undo', function() {
            undoManager.undo();
        });
        undoButton.classList.add("button", "button-undo");
        undoButton.innerHTML = undoButton.innerHTML + "<i class=\"fas fa-undo\"></i>";

        var redoButton = mxUtils.button('Redo', function() {
            undoManager.redo();
        });
        redoButton.classList.add("button", "button-redo");
        redoButton.innerHTML = redoButton.innerHTML + "<i class=\"fas fa-redo\"></i>";

        // Add Undo/Redo-Buttons to the Toolbar
        var toolbar = document.getElementById('toolbarContainer');
        toolbar.insertBefore(redoButton, toolbar.childNodes[4]); // Amount Nodes before + 1
        toolbar.insertBefore(undoButton, toolbar.childNodes[4]); // Amount Nodes before + 1

        /** 
         * ##################################################
         * ############# Key Handling / Binding #############
         * ##################################################
         */

        // By Default, stops editing on enter or escape keypress
        var keyHandler = new mxKeyHandler(graph);

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

        /** 
         * ##################################################
         * ########### Features / Event Handling ############
         * ##################################################
         */

        /**
         * ############ Save / Load Functionality ###########
         */
        var inputFile = document.getElementById('file-upload');

        // Event Handler: Reading the input-file
        inputFile.onchange = function() {
            var file = this.files[0];
            var reader = new FileReader();  
            reader.onload = function(ev) {
                loadDiagram(ev.target.result);
            };  
            reader.readAsText(file);
        };

        // Event Handler: Downloading the Save-File
        document.getElementById("download-xml").addEventListener("click", function(){
            saveDiagram("diagram.xml");
        }, false);

        /**
         * ############ Export (PNG) Functionality ###########
         */

        // Event Handler: Export as PNG-File
        document.getElementById("export-png").addEventListener("click", function(){
            exportAsPNG("export.png");
        }, false);

        /**
         * ################# Diagram Title ##################
         */
        var diagramTitleContainer = document.getElementById("titleContainer");
        var diagramTitle = document.getElementById("diagramTitle");
        var editDiagramTitleIcon = document.getElementById("editDiagramTitleIcon");

        // Event Handler: Clicking the title
        diagramTitle.onfocus = function() {
            if (editDiagramTitleIcon.classList.contains("fa-edit-d-none")) {
                editDiagramTitleIcon.classList.toggle("fa-edit-d-none");
            }
        }

        // Event Handler: Finished editing the title
        diagramTitle.onblur = function() {
            // TODO: Use Regex for securing a clean file-name
            this.innerHTML = this.innerHTML.replace(/&/g, "&amp")
                                           .replace(/</g, "&lt;")
                                           .replace(/>/g, "&gt;");
            
            if (!editDiagramTitleIcon.classList.contains("fa-edit-d-none")) {
                editDiagramTitleIcon.classList.toggle("fa-edit-d-none");
            }
        };

        // Event Handler: Hovering the diagram title
        diagramTitleContainer.onmouseover = function() {
            editDiagramTitleIcon.classList.toggle("fa-edit-d-none");
        }
        diagramTitleContainer.onmouseout = function() {
            editDiagramTitleIcon.classList.toggle("fa-edit-d-none");
        }

        /**
         * ################ END OF APPCODE ##################
         */
    }
    
    /** 
     * ##################################################
     * ################# Core Functions #################
     * ##################################################
     */

    /**
     * Creates a clickable element that downloads the given data to the local filesystem
     * @param {*} filename
     * @param {*} data
     */
    function createLink(filename, data) {
        let link = document.createElement('a');
        link.download = filename;
        link.href = data;
        return link;
    }

    /**
     * Downloads a XML File of the current state to the user's storage
     * @param {*} filename 
     */
    function saveDiagram(filename) {
        let xml = getDiagramAsXml(false);
        let data = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml);
        createLink(filename, data).click();
    }

    /**
     * todo
     * @param {*} filename 
     */
    async function exportAsPNG(filename) {
        const svg = document.getElementById('graphContainer').firstChild;
        const svgText = document.getElementById('graphContainer').innerHTML;

        // Get Size of the image
        let style = getComputedStyle(svg);
        let width = style.minWidth;
        let height = style.minHeight;

        const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

		const v = await canvg.Canvg.from(ctx, svgText);

        //let canvasOutput = document.getElementById('canvasOutput');
        //canvasOutput.innerHTML = '';
        //canvasOutput.appendChild(canvas);
        
        // Start SVG rendering with animations and mouse handling.
        // await v.start();
        await v.render();

        var base64 = canvas.toDataURL("image/png");
        createLink(filename, base64).click();
    }

    /**
     * Loads a diagram from a given XML File
     * @param {*} xmlFile 
     */
    function loadDiagram(xmlFile) {
        //var testXml = '<title>Diagram Title</title><root><mxCell id="2" value="Hello," vertex="1"><mxGeometry x="20" y="20" width="80" height="30" as="geometry"/></mxCell><mxCell id="3" value="World!" vertex="1"><mxGeometry x="200" y="150" width="80" height="30" as="geometry"/></mxCell><mxCell id="4" value="" edge="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root>';
        // Reading the Diagram-Title
        var diagramTitle = xmlFile.substring(xmlFile.indexOf("<title>")+"<title>".length, xmlFile.indexOf("</title>"));
        // Setting the loaded title
        setDiagramTitle(diagramTitle);
        // Getting rid of the title-tag in the save-file to make it parseable
        xmlFile = xmlFile.substring(xmlFile.indexOf("</title>")+"</title>".length, xmlFile.length);

        // Parse and load the diagram
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

    /**
     * Creates an XML String of the current diagram
     * 
     * If true, the generated string gets formatted in a readable manner
     * @param {*} prettyFormatted 
     */
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
        // Adding the current set title to the save-file
        xml = "<title>" + getDiagramTitle() + "</title>" + xml;
        return xml;
    }

    /**
     * Adds Icons of all available models to the sidebar
     * @param {*} graph 
     * @param {*} sidebar 
     * @param {*} prototype 
     * @param {*} image 
     */
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