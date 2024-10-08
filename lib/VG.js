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



/*
	VG: Vector Graphics.
	A portable structure describing some vector graphics.
*/



const VGContainer = require( './VGContainer.js' ) ;
const Palette = require( 'palette-shade' ).Palette ;
const DEFAULT_PALETTE = new Palette() ;

var autoId = 0 ;



function VG( params ) {
	VGContainer.call( this , params ) ;

	this.root = this ;	// This is the root element

	this.id = ( params && params.id ) || 'vg_' + ( autoId ++ ) ;
	this.viewBox = this.boundingBox ;
	this.viewBox.set( {
		x: 0 , y: 0 , width: 100 , height: 100
	} ) ;

	this.palette = DEFAULT_PALETTE ;
	this.invertY = false ;
	this.css = [] ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VG ;



VG.prototype = Object.create( VGContainer.prototype ) ;
VG.prototype.constructor = VG ;
VG.prototype.__prototypeUID__ = 'svg-kit/VG' ;
VG.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
console.warn( "SVG-Kit version: " + require( '../package.json' ).version ) ;



VG.prototype.svgTag = 'svg' ;



VG.prototype.set = function( params ) {
	if ( params.viewBox && typeof params.viewBox === 'object' ) {
		this.viewBox.set( params.viewBox ) ;
	}

	if ( params.palette && typeof params.palette === 'object' ) {
		if ( params.palette instanceof Palette ) {
			this.palette = params.palette ;
		}
		else {
			this.palette = new Palette( params.palette ) ;
		}
	}

	if ( params.invertY !== undefined ) { this.invertY = !! params.invertY ; }

	if ( params.css && Array.isArray( params.css ) ) {
		this.css.length = 0 ;
		for ( let rule of params.css ) {
			this.addCssRule( rule ) ;
		}
	}

	VGContainer.prototype.set.call( this , params ) ;
} ;



VG.prototype.export = function( data = {} ) {
	VGContainer.prototype.export.call( this , data ) ;

	data.viewBox = {
		x: this.viewBox.x ,
		y: this.viewBox.y ,
		width: this.viewBox.width ,
		height: this.viewBox.height
	} ;

	if ( this.css.length ) { data.css = this.css ; }
	data.invertY = this.invertY ;

	return data ;
} ;



VG.prototype.svgAttributes = function( master = this ) {
	var attr = {
		xmlns: this.NS ,
		// xlink is required for image, since href works only on the browser, everywhere else we need xlink:href instead
		'xmlns:xlink': "http://www.w3.org/1999/xlink" ,
		viewBox: this.viewBox.x + ' ' + ( this.root.invertY ? - this.viewBox.y - this.viewBox.height : this.viewBox.y ) + ' ' + this.viewBox.width + ' ' + this.viewBox.height
	} ;

	return attr ;
} ;



/*
    To update a style:
    $style = $element.querySelector( 'style' ) ;
    $style.sheet <-- this is a StyleSheet object
    $style.sheet.cssRules
    $style.sheet.cssRules[0].type                   type:1 for style rules, other can be important rules (3), media rule (4), keyframes rule (7)
    $style.sheet.cssRules[0].selectorText           the selector for this rule
    $style.sheet.cssRules[0].style.<cssProperty>    it works like any $element.style
    $style.sheet.insertRule( <cssText> , index )    insert a new CSS rule, passing a pure CSS string, the index is where it should be inserted (default to 0: at the begining)
    $style.sheet.deleteRule( index )                delete the rule at this index, see $style.sheet.length
    ...
*/

VG.prototype.addCssRule = function( rule ) {
	if ( ! rule || typeof rule !== 'object' || ! rule.select || ! rule.style || typeof rule.style !== 'object' ) { return ; }
	this.css.push( rule ) ;
} ;

