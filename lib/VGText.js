/*
	Spellcast

	Copyright (c) 2014 - 2019 Cédric Ronvel

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

function VGText( options ) {
	VGEntity.call( this , options ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.text = '' ;
	this.anchor = null ;		// the CSS 'text-anchors', can be 'start', 'middle' or 'end', in VG it default to 'middle' instead of 'start'
	this.length = null ;		// the length of the text, textLength in SVG
	this.adjustGlyph = false ;	// true make SVG's 'lengthAdjust' set to 'spacingAndGlyphs', false does not set it (the default for SVG being 'spacing')

	// Position text relative to the previous text element
	//this.dx = 0 ;
	//this.dy = 0 ;

	if ( options ) { this.set( options ) ; }
}

module.exports = VGText ;

VGText.prototype = Object.create( VGEntity.prototype ) ;
VGText.prototype.constructor = VGText ;
VGText.prototype.__prototypeUID__ = 'svg-kit/VGText' ;
VGText.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGText.prototype.svgTag = 'text' ;



VGText.prototype.svgAttributes = function( root = this ) {
	var attr = {
		x: this.x ,
		y: root.invertY ? -this.y : this.y ,
		'text-anchor': this.anchor || 'middle'
	} ;

	if ( this.length !== null ) { attr.textLength = this.length ; }
	if ( this.adjustGlyph !== null ) { attr.lengthAdjust = 'spacingAndGlyphs' ; }

	return attr ;
} ;



VGText.prototype.svgTextNode = function() {
	// Text-formatting should be possible
	return this.text ;
} ;



VGText.prototype.set = function( data ) {
	VGEntity.prototype.set.call( this , data ) ;

	if ( data.x !== undefined ) { this.x = data.x ; }
	if ( data.y !== undefined ) { this.y = data.y ; }

	if ( data.text !== undefined ) { this.text = data.text ; }

	// Interop'
	if ( data.textAnchor !== undefined ) { this.anchor = data.textAnchor ; }
	if ( data.anchor !== undefined ) { this.anchor = data.anchor ; }

	// Interop'
	if ( data.textLength !== undefined ) { this.length = data.textLength ; }
	if ( data.length !== undefined ) { this.length = data.length ; }

	// Interop'
	if ( data.lengthAdjust === 'spacingAndGlyphs' ) { this.adjustGlyph = true ; }
	else if ( data.lengthAdjust === 'spacing' ) { this.adjustGlyph = false ; }
	if ( data.adjustGlyph !== undefined ) { this.adjustGlyph = !! data.adjustGlyph ; }
} ;

