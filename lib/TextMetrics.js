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



//const TextAttribute = require( './TextAttribute.js' ) ;
//const opentype = require( 'opentype.js' ) ;
const fontLib = require( './fontLib.js' ) ;



function TextMetrics( width , height , ascent , descent ) {
	// Those properties are always defined on creation
	this.width = width ;
	this.height = height ;
	this.ascent = ascent ;
	this.descent = descent ;

	// Computed properties
	this.isDirty = true ;
	this.x = 0 ;
	this.baselineY = 0 ;

}

module.exports = TextMetrics ;



TextMetrics.prototype.fuseWithRightPart = function( metrics ) {
	// widths are summed
	this.width += metrics.width ;

	// while .height, .ascent and .descent are maximized
	if ( metrics.height > this.height ) { this.height = metrics.height ; }
	if ( metrics.ascent > this.ascent ) { this.ascent = metrics.ascent ; }
	if ( metrics.descent > this.descent ) { this.descent = metrics.descent ; }

	this.isDirty ||= metrics.isDirty ;
	// .x and .baselineY does not change
} ;



TextMetrics.measure = function( text , attr , inheritAttr ) {
	var width , height , ascent , descent ,
		fontFamily = attr.getFontFamily( inheritAttr ) ,
		fontSize = attr.getFontSize( inheritAttr ) ,
		fontOptions = null ;

	var font = fontLib.getFont( fontFamily ) ;

	width = font.getAdvanceWidth( text , fontSize , fontOptions ) ;

	return { width , height , ascent , descent } ;
} ;

