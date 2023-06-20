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
	fontFamily: 'serif' ,
	fontSize: 16 ,
	relFontSize: null ,
	color: '#000' ,
	outlineWidth: 0 ,
	relOutlineWidth: null ,
	outlineColor: '#000'
} ;



function TextAttribute( params ) {
	this.fontFamily = null ;
	this.fontSize = null ;
	this.relFontSize = null ;	// relative font size (em)
	//fontStyle?: string;
	//fontWeight?: string;

	this.color = null ;

	this.outlineWidth = null ;
	this.relOutlineWidth = null ;	// relative width (em)
	this.outlineColor = null ;

	if ( params ) { this.set( params ) ; }

	/*
	// From my abandoned StructuredText code for BabylonJS

	underline?: boolean;
	lineThrough?: boolean;

	frame?: boolean;
	frameColor?: string;
	frameOutlineWidth?: number;
	frameOutlineColor?: string;
	frameCornerRadius?: number;


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



// Getters/Setters

TextAttribute.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) { return ; }

	if ( params.fontFamily ) { this.setFontFamily( params.fontFamily ) ; }
	if ( params.fontSize ) { this.setFontSize( params.fontSize ) ; }
	if ( params.relFontSize ) { this.setRelFontSize( params.relFontSize ) ; }

	if ( params.color ) { this.setColor( params.color ) ; }

	if ( params.outlineWidth ) { this.setOutlineWidth( params.outlineWidth ) ; }
	if ( params.relOutlineWidth ) { this.setRelOutlineWidth( params.relOutlineWidth ) ; }
	if ( params.outlineColor ) { this.setOutlineColor( params.outlineColor ) ; }
} ;



TextAttribute.prototype.setFontFamily = function( v ) {
	this.fontFamily = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFontFamily = function( inherit = null ) {
	return this.fontFamily ?? inherit?.fontFamily ?? DEFAULT_ATTR.fontFamily ;
} ;



TextAttribute.prototype.setFontSize = function( v ) {
	if ( v && typeof v === 'number' ) {
		this.fontSize = v ;
		this.relFontSize = null ;
	}
	else {
		this.fontSize = null ;
	}
} ;

TextAttribute.prototype.setRelFontSize = function( v ) {
	if ( v && typeof v === 'number' ) {
		this.relFontSize = v ;
		this.fontSize = null ;
	}
	else {
		this.relFontSize = null ;
	}
} ;

TextAttribute.prototype.getFontSize = function( inherit = null ) {
	var relFontSize = this.relFontSize ?? inherit?.relFontSize ?? DEFAULT_ATTR.relFontSize ;
	var fontSize = this.fontSize ?? inherit?.fontSize ?? DEFAULT_ATTR.fontSize ;
	return typeof relFontSize === 'number' ? relFontSize * fontSize : fontSize ;
} ;



TextAttribute.prototype.setColor = function( v ) {
	this.color = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getColor = function( inherit = null ) {
	return this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
} ;



TextAttribute.prototype.setOutlineWidth = function( v ) {
	if ( v && typeof v === 'number' ) {
		this.outlineWidth = v ;
		this.relOutlineWidth = null ;
	}
	else {
		this.outlineWidth = null ;
	}
} ;

TextAttribute.prototype.setRelOutlineWidth = function( v ) {
	if ( v && typeof v === 'number' ) {
		this.relOutlineWidth = v ;
		this.outlineWidth = null ;
	}
	else {
		this.relOutlineWidth = null ;
	}
} ;

TextAttribute.prototype.getOutlineWidth = function( inherit = null , relTo = null ) {
	var relOutlineWidth = this.relOutlineWidth ?? inherit?.relOutlineWidth ?? DEFAULT_ATTR.relOutlineWidth ;

	if ( typeof relOutlineWidth === 'number' ) {
		return relOutlineWidth * ( relTo ?? this.getFontSize( inherit ) ) ;
	}

	return this.outlineWidth ?? inherit?.outlineWidth ?? DEFAULT_ATTR.outlineWidth ;
} ;



TextAttribute.prototype.setOutlineColor = function( v ) {
	this.outlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getOutlineColor = function( inherit = null ) {
	return this.outlineColor ?? inherit?.outlineColor ?? DEFAULT_ATTR.outlineColor ;
} ;



// Utilities

TextAttribute.prototype.getSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getColor( inherit ) ,
		outlineWidth = this.getOutlineWidth( inherit , relTo ) ,
		outlineColor = this.getOutlineColor( inherit ) ;

	str += 'fill:' + color + ';' ;

	if ( outlineWidth ) {
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, or some font will not be displayed as intended:
		// some strokes can happen in the middle of a letter.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;

