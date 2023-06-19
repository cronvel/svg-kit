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



//const opentype = require( 'opentype.js' ) ;
const fontLib = require( './fontLib.js' ) ;



function TextMetrics( ascender , descender , lineGap  , width , x = null , baselineY = null ) {
	this.ascender = + ascender || 0 ;
	this.descender = + descender || 0 ;
	this.lineGap = + lineGap || 0 ;
	this.width = + width || 0 ;

	// Computed properties
	this.isPositionComputed = x !== null && baselineY !== null ;
	this.x = + x || 0 ;
	this.baselineY = + baselineY || 0 ;
}

module.exports = TextMetrics ;



Object.defineProperties( TextMetrics.prototype , {
	lineHeight: { get: function() { return this.ascender - this.descender + this.lineGap ; } }
} ) ;



TextMetrics.prototype.fuseWithRightPart = function( metrics ) {
	// widths are summed
	this.width += metrics.width ;

	// .ascender, .descender and .lineGap are maximized
	if ( metrics.ascender > this.ascender ) { this.ascender = metrics.ascender ; }
	if ( metrics.descender < this.descender ) { this.descender = metrics.descender ; }
	if ( metrics.lineGap > this.lineGap ) { this.lineGap = metrics.lineGap ; }

	// .x and .baselineY does not change

	this.isPositionComputed &&= metrics.isPositionComputed ;
} ;



TextMetrics.measureFontHeights = function( font , fontSize ) {
	//console.log( font.tables.head , font.tables.hhea ) ;
	var factor = fontSize / font.tables.head.unitsPerEm ,
		ascender = font.tables.hhea.ascender * factor , 
		descender = font.tables.hhea.descender * factor ,
		lineGap = font.tables.hhea.lineGap * factor ,
		lineHeight = ascender - descender + lineGap ;

	return new TextMetrics( ascender , descender , lineGap , lineHeight ) ;
} ;



TextMetrics.measureFontText = function( font , fontSize , text ) {
	var fontOptions = null ;
	var metrics = TextMetrics.measureFontHeights( font , fontSize ) ;
	metrics.width = font.getAdvanceWidth( text , fontSize , fontOptions ) ;
	return metrics ;
} ;



TextMetrics.measureStructuredTextPart = function( part , inheritedAttr ) {
	var fontOptions = null ,
		fontFamily = part.attr.getFontFamily( inheritedAttr ) ,
		fontSize = part.attr.getFontSize( inheritedAttr ) ;

	var font = fontLib.getFont( fontFamily ) ;

	var metrics = TextMetrics.measureFontText( font , fontSize , part.text ) ;

	return metrics ;
} ;

