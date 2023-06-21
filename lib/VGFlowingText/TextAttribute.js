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



const Metric = require( '../Metric.js' ) ;



const DEFAULT_ATTR = {
	fontFamily: 'serif' ,
	fontSize: new Metric( 16 ) ,
	color: '#000' ,
	outline: false ,
	outlineWidth: new Metric( 0.025 , 'em' ) ,
	outlineColor: '#fff' ,
	underline: false ,
	lineThrough: false ,
	// line* define things for underline, lineThrough, and eventual future line-based text-decorations
	lineColor: null ,	// fallback to the text color
	lineOutline: null ,	// fallback to the text color
	lineThickness: new Metric( 0.075 , 'em' ) ,	// thickness for underline, lineThrough, etc...
	lineOutlineWidth: null ,	// fallback to text outlineWidth
	lineOutlineColor: null ,	// fallback to text outlineColor
	frame: false ,
	frameColor: '#808080' ,
	frameOutlineWidth: new Metric( 0 ) ,
	frameOutlineColor: '#808080' ,
	frameCornerRadius: new Metric( 0 )
} ;



function TextAttribute( params ) {
	// Font
	this.fontFamily = null ;
	this.fontSize = null ;
	//fontStyle?: string;
	//fontWeight?: string;

	// Styles
	this.color = null ;
	this.outline = null ;
	this.outlineWidth = null ;
	this.outlineColor = null ;

	// Decorations
	this.underline = null ;
	this.lineThrough = null ;
	this.lineColor = null ;
	this.lineThickness = null ;
	this.lineOutline = null ;
	this.lineOutlineWidth = null ;
	this.lineOutlineColor = null ;
	this.frame = null ;
	this.frameColor = null ;
	this.frameOutlineWidth = null ;
	this.frameOutlineColor = null ;
	this.frameCornerRadius = null ;

	if ( params ) { this.set( params ) ; }

	/*
	// Other attributes not ported yet, from my abandoned StructuredText code PR for BabylonJS

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

	if ( params.color ) { this.setColor( params.color ) ; }
	if ( params.outline ) { this.setOutline( params.outline ) ; }
	if ( params.outlineWidth ) { this.setOutlineWidth( params.outlineWidth ) ; }
	if ( params.outlineColor ) { this.setOutlineColor( params.outlineColor ) ; }

	if ( params.underline ) { this.setUnderline( params.underline ) ; }
	if ( params.lineThrough ) { this.setLineThrough( params.lineThrough ) ; }
	if ( params.lineColor ) { this.setLineColor( params.lineColor ) ; }
	if ( params.lineThickness ) { this.setLineThickness( params.lineThickness ) ; }
	if ( params.lineOutline ) { this.setLineOutline( params.lineOutline ) ; }
	if ( params.lineOutlineWidth ) { this.setLineOutlineWidth( params.lineOutlineWidth ) ; }
	if ( params.lineOutlineColor ) { this.setLineOutlineColor( params.lineOutlineColor ) ; }
	if ( params.frame ) { this.setFrame( params.frame ) ; }
	if ( params.frameColor ) { this.setFrameColor( params.frameColor ) ; }
	if ( params.frameOutlineWidth ) { this.setFrameOutlineWidth( params.frameOutlineWidth ) ; }
	if ( params.frameOutlineColor ) { this.setFrameOutlineColor( params.frameOutlineColor ) ; }
	if ( params.frameCornerRadius ) { this.setFrameCornerRadius( params.frameCornerRadius ) ; }
} ;



TextAttribute.prototype.isEqual = function( to ) {
	return (
		this.fontFamily === to.fontFamily
		&& this.fontSize === to.fontSize
		//&& this.fontStyle === to.fontStyle
		//&& this.fontWeight === to.fontWeight

		&& this.color === to.color
		&& this.outline === to.outline
		&& ( ! this.outline || (
			this.outlineWidth === to.outlineWidth
			&& this.outlineColor === to.outlineColor
		) )

		&& this.underline === to.underline
		&& this.lineThrough === to.lineThrough
		&& ( ( ! this.underline && ! this.lineThrough ) || (
			this.lineColor === to.lineColor
			&& this.lineThickness === to.lineThickness
			&& this.lineOutline === to.lineOutline
			&& ( ! this.lineOutline || (
				this.lineOutlineWidth === to.lineOutlineWidth
				&& this.lineOutlineColor === to.lineOutlineColor
			) )
		) )

		&& this.frame === to.frame
		&& ( ! this.frame || (
			this.frameColor === to.frameColor
			&& this.frameOutlineWidth === to.frameOutlineWidth
			&& this.frameOutlineColor === to.frameOutlineColor
			&& this.frameCornerRadius === to.frameCornerRadius
		) )
	) ;
} ;



TextAttribute.prototype.setFontFamily = function( v ) {
	this.fontFamily = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFontFamily = function( inherit = null ) {
	return this.fontFamily ?? inherit?.fontFamily ?? DEFAULT_ATTR.fontFamily ;
} ;



TextAttribute.prototype.setFontSize = function( v ) {
	if ( v instanceof Metric ) { this.fontSize = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.fontSize = new Metric( v ) ; }
	else { this.fontSize = null ; }
} ;

TextAttribute.prototype.getFontSize = function( inherit = null ) {
	return Metric.chainedGet( this.fontSize , inherit?.fontSize , DEFAULT_ATTR.fontSize ) ;
} ;



TextAttribute.prototype.setColor = function( v ) {
	this.color = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getColor = function( inherit = null ) {
	return this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
} ;



TextAttribute.prototype.setOutline = function( v ) {
	this.outline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getOutline = function( inherit = null ) {
	return this.outline ?? inherit?.outline ?? DEFAULT_ATTR.outline ;
} ;



TextAttribute.prototype.setOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.outlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.outlineWidth = new Metric( v ) ; }
	else { this.outlineWidth = null ; }
} ;

TextAttribute.prototype.getOutlineWidth = function( inherit = null , relTo = null ) {
	var outlineWidth = this.outlineWidth ?? inherit?.outlineWidth ?? DEFAULT_ATTR.outlineWidth ;
	if ( outlineWidth instanceof Metric ) { return outlineWidth.get( relTo ) ; }
	return outlineWidth ;
} ;



TextAttribute.prototype.setOutlineColor = function( v ) {
	this.outlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getOutlineColor = function( inherit = null ) {
	return this.outlineColor ?? inherit?.outlineColor ?? DEFAULT_ATTR.outlineColor ;
} ;



TextAttribute.prototype.setUnderline = function( v ) {
	this.underline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getUnderline = function( inherit = null ) {
	return this.underline ?? inherit?.underline ?? DEFAULT_ATTR.underline ;
} ;



TextAttribute.prototype.setLineThrough = function( v ) {
	this.lineThrough = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getLineThrough = function( inherit = null ) {
	return this.lineThrough ?? inherit?.lineThrough ?? DEFAULT_ATTR.lineThrough ;
} ;



TextAttribute.prototype.setLineColor = function( v ) {
	this.lineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getLineColor = function( inherit = null ) {
	var lineColor =
		this.lineColor ?? inherit?.lineColor ?? DEFAULT_ATTR.lineColor ??
		this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
	return lineColor ;
} ;



TextAttribute.prototype.setLineThickness = function( v ) {
	if ( v instanceof Metric ) { this.lineThickness = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.lineThickness = new Metric( v ) ; }
	else { this.lineThickness = null ; }
} ;

TextAttribute.prototype.getLineThickness = function( inherit = null , relTo = null ) {
	var lineThickness = this.lineThickness ?? inherit?.lineThickness ?? DEFAULT_ATTR.lineThickness ;
	if ( lineThickness instanceof Metric ) { return lineThickness.get( relTo ) ; }
	return lineThickness ;
} ;



TextAttribute.prototype.setLineOutline = function( v ) {
	this.lineOutline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getLineOutline = function( inherit = null ) {
	var lineOutline =
		this.lineOutline ?? inherit?.lineOutline ?? DEFAULT_ATTR.lineOutline ??
		this.outline ?? inherit?.outline ?? DEFAULT_ATTR.outline ;
	return lineOutline ;
} ;



TextAttribute.prototype.setLineOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.lineOutlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.lineOutlineWidth = new Metric( v ) ; }
	else { this.lineOutlineWidth = null ; }
} ;

TextAttribute.prototype.getLineOutlineWidth = function( inherit = null , relTo = null ) {
	var lineOutlineWidth =
		this.lineOutlineWidth ?? inherit?.lineOutlineWidth ?? DEFAULT_ATTR.lineOutlineWidth ??
		this.outlineWidth ?? inherit?.outlineWidth ?? DEFAULT_ATTR.outlineWidth ;
	if ( lineOutlineWidth instanceof Metric ) { return lineOutlineWidth.get( relTo ) ; }
	return lineOutlineWidth ;
} ;



TextAttribute.prototype.setLineOutlineColor = function( v ) {
	this.lineOutlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getLineOutlineColor = function( inherit = null ) {
	var lineOutlineColor =
		this.lineOutlineColor ?? inherit?.lineOutlineColor ?? DEFAULT_ATTR.lineOutlineColor ??
		this.outlineColor ?? inherit?.outlineColor ?? DEFAULT_ATTR.outlineColor ;
	return lineOutlineColor ;
} ;



TextAttribute.prototype.setFrame = function( v ) {
	this.frame = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getFrame = function( inherit = null ) {
	return this.frame ?? inherit?.frame ?? DEFAULT_ATTR.frame ;
} ;



TextAttribute.prototype.setFrameColor = function( v ) {
	this.frameColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFrameColor = function( inherit = null ) {
	return this.frameColor ?? inherit?.frameColor ?? DEFAULT_ATTR.frameColor ;
} ;



TextAttribute.prototype.setFrameOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.frameOutlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.frameOutlineWidth = new Metric( v ) ; }
	else { this.frameOutlineWidth = null ; }
} ;

TextAttribute.prototype.getFrameOutlineWidth = function( inherit = null , relTo = null ) {
	var frameOutlineWidth = this.frameOutlineWidth ?? inherit?.frameOutlineWidth ?? DEFAULT_ATTR.frameOutlineWidth ;
	if ( frameOutlineWidth instanceof Metric ) { return frameOutlineWidth.get( relTo ) ; }
	return frameOutlineWidth ;
} ;



TextAttribute.prototype.setFrameOutlineColor = function( v ) {
	this.frameOutlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFrameOutlineColor = function( inherit = null ) {
	return this.frameOutlineColor ?? inherit?.frameOutlineColor ?? DEFAULT_ATTR.frameOutlineColor ;
} ;



TextAttribute.prototype.setFrameCornerRadius = function( v ) {
	if ( v instanceof Metric ) { this.frameCornerRadius = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.frameCornerRadius = new Metric( v ) ; }
	else { this.frameCornerRadius = null ; }
} ;

TextAttribute.prototype.getFrameCornerRadius = function( inherit = null , relTo = null ) {
	var frameCornerRadius = this.frameCornerRadius ?? inherit?.frameCornerRadius ?? DEFAULT_ATTR.frameCornerRadius ;
	if ( frameCornerRadius instanceof Metric ) { return frameCornerRadius.get( relTo ) ; }
	return frameCornerRadius ;
} ;



// Utilities

TextAttribute.prototype.getTextSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getColor( inherit ) ,
		outline = this.getOutline( inherit ) ,
		outlineWidth ;

	str += 'fill:' + color + ';' ;

	if ( outline && ( outlineWidth = this.getOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getOutlineColor( inherit ) ;
		//console.error( "outlineWidth:" , outlineWidth , this.outlineWidth , inherit.outlineWidth , DEFAULT_ATTR.outlineWidth , relTo ) ; process.exit( 0 ) ;

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



TextAttribute.prototype.getLineSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getLineColor( inherit ) ,
		outline = this.getLineOutline( inherit ) ,
		outlineWidth ;

	str += 'fill:' + color + ';' ;

	if ( outline && ( outlineWidth = this.getLineOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getLineOutlineColor( inherit ) ;
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, so the outline is out of the content.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;



TextAttribute.prototype.getFrameSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getFrameColor( inherit ) ,
		outlineWidth = this.getFrameOutlineWidth( inherit , relTo ) ;

	str += 'fill:' + color + ';' ;

	if ( outlineWidth ) {
		let outlineColor = this.getFrameOutlineColor( inherit ) ;
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, so the outline is out of the content.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;

