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



const canvas = {} ;
module.exports = canvas ;



canvas.fillAndStrokeUsingSvgStyle = ( canvasCtx , style , path2d = null ) => {
	var fill = false ,
		stroke = false ,
		fillStyle = style.fill && style.fill !== 'none' ? style.fill : null ,
		strokeStyle = style.stroke && style.stroke !== 'none' ? style.stroke : null ,
		lineWidth = + ( style.strokeWidth ?? 1 ) || 0 ;

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

