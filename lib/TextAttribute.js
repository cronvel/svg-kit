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



const DEFAULT_ATTR = {
	color: '#000' ,
	fontFamily: 'serif' ,
	fontSize: 16 ,
} ;



function TextAttribute( params ) {
	this.color = null ;

	this.fontFamily = null ;
	this.fontSize = null ;
	//fontStyle?: string;
	//fontWeight?: string;

	/*
	// From my abandoned StructuredText code for BabylonJS

	underline?: boolean;
	lineThrough?: boolean;

	frame?: boolean;
	frameColor?: string;
	frameOutlineWidth?: number;
	frameOutlineColor?: string;
	frameCornerRadius?: number;


	outlineWidth?: number;
	outlineColor?: string;

	shadowColor?: string;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;

	// When set, change appearance of that part when the mouse is hovering it.
	// Only property that does not change the metrics should ever be supported here.
	hover?: {
		color?: string | ICanvasGradient;
		underline?: boolean;
	};
	*/
}

module.exports = TextAttribute ;



TextAttribute.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) { return ; }

	if ( params.color ) { this.setColor( params.color ) ; }
	if ( params.fontFamily ) { this.setFontFamily( params.fontFamily ) ; }
	if ( params.fontSize ) { this.setFontSize( params.fontSize ) ; }
} ;



TextAttribute.prototype.setColor = function( v ) {
	this.color = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getColor = function( inherit = null ) {
	return this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
} ;



TextAttribute.prototype.setFontFamily = function( v ) {
	this.fontFamily = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFontFamily = function( inherit = null ) {
	return this.fontFamily ?? inherit?.fontFamily ?? DEFAULT_ATTR.fontFamily ;
} ;



TextAttribute.prototype.setFontSize = function( v ) {
	this.fontSize = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFontSize = function( inherit = null ) {
	return this.fontSize ?? inherit?.fontSize ?? DEFAULT_ATTR.fontSize ;
} ;

