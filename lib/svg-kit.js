/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const svgKit = {} ;
module.exports = svgKit ;

Object.assign( svgKit , require( './core-utilities.js' ) ) ;
Object.assign( svgKit , require( './color-utilities.js' ) ) ;
svgKit.canvas = require( './canvas-utilities.js' ) ;

svgKit.BoundingBox = require( './BoundingBox.js' ) ;
svgKit.Polygon = require( './Polygon.js' ) ;
svgKit.ConvexPolygon = require( './ConvexPolygon.js' ) ;
svgKit.Polyline = require( './Polyline.js' ) ;
svgKit.Path = require( './Path/Path.js' ) ;
svgKit.Style = require( './Style.js' ) ;

svgKit.VG = require( './VG.js' ) ;
svgKit.VGEntity = require( './VGEntity.js' ) ;
svgKit.VGContainer = require( './VGContainer.js' ) ;
svgKit.VGGroup = require( './VGGroup.js' ) ;
svgKit.VGClip = require( './VGClip.js' ) ;
svgKit.VGRect = require( './VGRect.js' ) ;
svgKit.VGPolygon = require( './VGPolygon.js' ) ;
svgKit.VGConvexPolygon = require( './VGConvexPolygon.js' ) ;
svgKit.VGPolyline = require( './VGPolyline.js' ) ;
svgKit.VGEllipse = require( './VGEllipse.js' ) ;
svgKit.VGPath = require( './VGPath.js' ) ;
svgKit.VGText = require( './VGText.js' ) ;
svgKit.VGImage = require( './VGImage.js' ) ;

svgKit.fontLib = require( './fontLib.js' ) ;
svgKit.VGFlowingText = require( './VGFlowingText/VGFlowingText.js' ) ;
svgKit.StructuredTextLine = require( './VGFlowingText/StructuredTextLine.js' ) ;
svgKit.StructuredTextPart = require( './VGFlowingText/StructuredTextPart.js' ) ;
svgKit.TextAttribute = require( './VGFlowingText/TextAttribute.js' ) ;
svgKit.TextMetrics = require( './VGFlowingText/TextMetrics.js' ) ;

svgKit.DynamicArea = require( './DynamicArea.js' ) ;
svgKit.DynamicManager = require( './DynamicManager.js' ) ;

svgKit.fx = require( './fx/fx.js' ) ;

svgKit.domKit = require( 'dom-kit' ) ;
svgKit.opentype = require( 'opentype.js' ) ;



// Best to *NOT* move to core-utilities.js, because it depends on the whole svgKit lib (would produce a bad dependency graph)
svgKit.unserializeVG = str => svgKit.objectToVG( JSON.parse( str ) ) ;

svgKit.objectToVG = function( object , clone = false ) {
	if ( ! object || typeof object !== 'object' ) { return null ; }

	if ( object instanceof svgKit.VGEntity ) {
		if ( clone ) { return new object.constructor( object ) ; }
		return object ;
	}

	if ( ! object._type || ! object._type.startsWith( 'svg-kit/' ) ) { return null ; }

	var className = object._type.slice( 8 ) ;
	if ( ! svgKit[ className ] ) { return null ; }

	return new svgKit[ className ]( object ) ;
} ;

