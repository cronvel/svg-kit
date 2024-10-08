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



const fontLib = require( '../fontLib.js' ) ;
const getImageSize = require( '../getImageSize.js' ) ;



function TextMetrics( ascender , descender , lineGap  , width , x = null , baselineY = null ) {
	this.ascender = + ascender || 0 ;
	this.descender = + descender || 0 ;
	this.lineGap = + lineGap || 0 ;
	this.width = + width || 0 ;

	// Computed properties
	//this.isPositionComputed = x !== null && baselineY !== null ;
	this.x = + x || 0 ;
	this.baselineY = + baselineY || 0 ;
	this.charCount = 0 ;
}

module.exports = TextMetrics ;



Object.defineProperties( TextMetrics.prototype , {
	lineHeight: { get: function() { return this.ascender - this.descender + this.lineGap ; } }
	//height: { get: function() { return this.ascender - this.descender ; } }	// Ambiguous?
} ) ;



TextMetrics.prototype.clear = function() {
	this.ascender = this.descender = this.lineGap = this.width = this.x = this.baselineY = 0 ;
} ;



TextMetrics.prototype.fuseWithRightPart = function( metrics ) {
	// widths and charCounts are summed
	this.width += metrics.width ;
	this.charCount += metrics.charCount ;

	// .ascender, .descender and .lineGap are maximized
	if ( metrics.ascender > this.ascender ) { this.ascender = metrics.ascender ; }
	if ( metrics.descender < this.descender ) { this.descender = metrics.descender ; }
	if ( metrics.lineGap > this.lineGap ) { this.lineGap = metrics.lineGap ; }

	// .x and .baselineY does not change

	//this.isPositionComputed &&= metrics.isPositionComputed ;
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
	var fontOptions = null , count = 0 ;
	var metrics = TextMetrics.measureFontHeights( font , fontSize ) ;
	metrics.width = font.getAdvanceWidth( text , fontSize , fontOptions ) ;

	// Probably the fastest way to count chars of an unicode string (BTW text.length dosen't work because of surrogate pairs)
	for ( let char of text ) { count ++ ; }		/* eslint-disable-line no-unused-vars */
	metrics.charCount = count ;

	return metrics ;
} ;



TextMetrics.measureImage = async function( font , fontSize , imageUrl ) {
	var imageSize = await getImageSize( imageUrl ) ;

	var metrics = TextMetrics.measureFontHeights( font , fontSize ) ;
	metrics.ascender = imageSize.height ;
	metrics.width = imageSize.width ;
	metrics.charCount = 1 ;	// Images count as 1

	return metrics ;
} ;



TextMetrics.measureStructuredTextPart = async function( part , inheritedAttr ) {
	var fontOptions = null ,
		fontFamily = part.attr.getFontFamily( inheritedAttr ) ,
		fontStyle = part.attr.getFontStyle( inheritedAttr ) ,
		fontWeight = part.attr.getFontWeight( inheritedAttr ) ,
		fontSize = part.attr.getFontSize( inheritedAttr ) ;

	var font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;

	var metrics =
		part.imageUrl ? await TextMetrics.measureImage( font , fontSize , part.imageUrl ) :
		TextMetrics.measureFontText( font , fontSize , part.text ) ;

	return metrics ;
} ;

