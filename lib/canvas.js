/*
	SVG Kit

	Copyright (c) 2017 - 2023 Cédric Ronvel

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



const misc = require( './misc.js' ) ;



const canvas = {} ;
module.exports = canvas ;



// Using SVG style
canvas.fillAndStrokeUsingSvgStyle = ( canvasCtx , style , path2d = null ) =>
	canvas._fillAndStroke( canvasCtx , style , path2d , false ) ;

// Using the lib style property and a palette
canvas.fillAndStrokeUsingStyle = ( canvasCtx , style , palette , path2d = null ) =>
	canvas._fillAndStroke( canvasCtx , style , path2d , true , palette ) ;

canvas._fillAndStroke = ( canvasCtx , style , path2d = null , convertColor = false , palette = null ) => {
	var fill = false ,
		stroke = false ,
		lineWidth = + ( style.strokeWidth ?? 1 ) || 0 ;

	var fillStyle =
			style.fill && style.fill !== 'none' ?
				convertColor ?
					misc.colorToString( style.fill , palette ) :
					style.fill :
				null ;

	var strokeStyle =
			style.stroke && style.stroke !== 'none' ?
				convertColor ?
					misc.colorToString( style.stroke , palette ) :
					style.stroke :
				null ;

	canvasCtx.globalAlpha = style.opacity ?? 1 ;

	if ( fillStyle ) {
		fill = true ;
		canvasCtx.fillStyle = fillStyle ;
	}

	if ( strokeStyle && lineWidth ) {
		stroke = true ;
		canvasCtx.strokeStyle = strokeStyle ;
		canvasCtx.lineWidth = lineWidth ;
	}

	if ( ! fill && ! stroke ) { return ; }

	if ( ! style.paintOrder || style.paintOrder.startsWith( 'fill' ) ) {
		if ( fill ) {
			if ( path2d ) { canvasCtx.fill( path2d ) ; }
			else { canvasCtx.fill() ; }
		}
		if ( stroke ) {
			if ( path2d ) { canvasCtx.stroke( path2d ) ; }
			else { canvasCtx.stroke() ; }
		}
	}
	else {
		if ( stroke ) {
			if ( path2d ) { canvasCtx.stroke( path2d ) ; }
			else { canvasCtx.stroke() ; }
		}
		if ( fill ) {
			if ( path2d ) { canvasCtx.fill( path2d ) ; }
			else { canvasCtx.fill() ; }
		}
	}
} ;



// Get the Canvas element coordinates given the screen coordinates, accounting for Canvas element
// stretching (inner size different from displayed size).
// For browser mouse event, .clientX and .clientY should be used.
canvas.screenToCanvasCoords = ( $canvas , screenCoords ) => {
	var rect = $canvas.getBoundingClientRect() ,
		scaleX = $canvas.width / rect.width ,
		scaleY = $canvas.height / rect.height ;

	return {
		x: ( screenCoords.x - rect.left ) * scaleX ,
		y: ( screenCoords.y - rect.top ) * scaleY
	} ;
} ;



// Get the context coordinates given the coordinates over a Canvas element, accounting for context matrix transformations.
// E.g.: you have the coordinates of the mouse related to the Canvas element, you want the coordinates in the Canvas context
// which may have transformations.
canvas.canvasToContextCoords = ( canvasCtx , canvasCoords ) => {
	var matrix = canvasCtx.getTransform() ;
	matrix.invertSelf() ;

	return {
		x: canvasCoords.x * matrix.a + canvasCoords.y * matrix.c + matrix.e ,
		y: canvasCoords.x * matrix.b + canvasCoords.y * matrix.d + matrix.f
	} ;
} ;

