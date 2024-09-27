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



const VGEntity = require( './VGEntity.js' ) ;



/*
	/!\ Must support text on path
*/

function VGText( params ) {
	console.warn( "VGText is DEPRECATED, should use probably use VGFLowingText instead, or discrepancy should be fixed (Style does not support font anymore, should use TextAttribute like VGFLowingText)" ) ;
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.text = '' ;
	this.anchor = null ;		// the CSS 'text-anchors', can be 'start', 'middle' or 'end', in VG it default to 'middle' instead of 'start'
	this.length = null ;		// the length of the text, textLength in SVG
	this.adjustGlyph = false ;	// true make SVG's 'lengthAdjust' set to 'spacingAndGlyphs', false does not set it (the default for SVG being 'spacing')

	// Position text relative to the previous text element
	//this.dx = 0 ;
	//this.dy = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGText ;

VGText.prototype = Object.create( VGEntity.prototype ) ;
VGText.prototype.constructor = VGText ;
VGText.prototype.__prototypeUID__ = 'svg-kit/VGText' ;
VGText.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGText.prototype.svgTag = 'text' ;



VGText.prototype.set = function( params ) {
	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }

	if ( params.text !== undefined ) { this.text = params.text ; }

	// Interop'
	if ( params.textAnchor !== undefined ) { this.anchor = params.textAnchor ; }
	if ( params.anchor !== undefined ) { this.anchor = params.anchor ; }

	// Interop'
	if ( params.textLength !== undefined ) { this.length = params.textLength ; }
	if ( params.length !== undefined ) { this.length = params.length ; }

	// Interop'
	if ( params.lengthAdjust === 'spacingAndGlyphs' ) { this.adjustGlyph = true ; }
	else if ( params.lengthAdjust === 'spacing' ) { this.adjustGlyph = false ; }
	if ( params.adjustGlyph !== undefined ) { this.adjustGlyph = !! params.adjustGlyph ; }

	// /!\ Should compute bounding box, but it's not possible at this stage, since this doesn't use open-type

	VGEntity.prototype.set.call( this , params ) ;
} ;



VGText.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.text = this.text ;

	if ( this.anchor ) { data.anchor = this.anchor ; }
	if ( this.length !== null ) { data.length = this.length ; }
	if ( this.adjustGlyph ) { data.adjustGlyph = this.adjustGlyph ; }

	return data ;
} ;



VGText.prototype.svgTextNode = function() {
	// Text-formatting should be possible
	return this.text ;
} ;



VGText.prototype.svgAttributes = function( master = this ) {
	var attr = {
		x: this.x ,
		y: this.root.invertY ? - this.y : this.y ,
		'text-anchor': this.anchor || 'middle'
	} ;

	if ( this.length !== null ) { attr.textLength = this.length ; }
	if ( this.adjustGlyph !== null ) { attr.lengthAdjust = 'spacingAndGlyphs' ; }

	return attr ;
} ;



VGText.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y : 0 ,
		style = this.style ,
		fill = false ,
		stroke = false ,
		fillStyle = style.fill && style.fill !== 'none' ? style.fill : null ,
		strokeStyle = style.stroke && style.stroke !== 'none' ? style.stroke : null ,
		lineWidth = + ( style.strokeWidth ?? 1 ) || 0 ;

	canvasCtx.save() ;
	canvasCtx.font = '' + style.fontSize + 'px ' + style.fontFamily ;
	canvasCtx.textBaseline = 'alphabetic' ;
	canvasCtx.direction = 'ltr' ;

	// /!\ It produces different result when direction is right-to-left, but SVG Kit does not support that for instance...
	canvasCtx.textAlign =
		this.anchor === 'start' ? 'left' :
		this.anchor === 'end' ? 'right' :
		'center' ;

	if ( fillStyle ) {
		fill = true ;
		canvasCtx.fillStyle = fillStyle ;
	}

	if ( strokeStyle && lineWidth ) {
		stroke = true ;
		canvasCtx.strokeStyle = strokeStyle ;
		canvasCtx.lineWidth = lineWidth ;
	}


	for ( let part of style.paintOrder ) {
		switch ( part ) {
			case 'fill' : {
				if ( fill ) { canvasCtx.fillText( this.text , this.x , this.y + yOffset ) ; }
				break ;
			}
			case 'stroke' : {
				if ( stroke ) { canvasCtx.strokeText( this.text , this.x , this.y + yOffset ) ; }
				break ;
			}
		}
	}

	canvasCtx.restore() ;
} ;

