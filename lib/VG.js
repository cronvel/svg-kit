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

/*
	VG: Vector Graphics.
	A portable structure describing some vector graphics.
*/

const svgKit = require( './svg-kit.js' ) ;
const VGContainer = require( './VGContainer.js' ) ;

var autoId = 0 ;



function VG( options ) {
	VGContainer.call( this , options ) ;

	this.id = ( options && options.id ) || 'vg_' + ( autoId ++ ) ;
	this.viewBox = {
		x: 0 , y: 0 , width: 100 , height: 100
	} ;

	this.css = [] ;

	if ( options ) { this.set( options ) ; }
}

module.exports = VG ;



VG.prototype = Object.create( VGContainer.prototype ) ;
VG.prototype.constructor = VG ;
VG.prototype.__prototypeUID__ = 'svg-kit/VG' ;
VG.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VG.prototype.svgTag = 'svg' ;

VG.prototype.svgAttributes = function() {
	var attr = {
		xmlns: "http://www.w3.org/2000/svg" ,
		viewBox: this.viewBox.x + ' ' + this.viewBox.y + ' ' + this.viewBox.width + ' ' + this.viewBox.height
	} ;

	return attr ;
} ;



VG.prototype.set = function( data ) {
	VGContainer.prototype.set.call( this , data ) ;

	if ( data.viewBox && typeof data.viewBox === 'object' ) {
		if ( data.viewBox.x !== undefined ) { this.viewBox.x = data.viewBox.x ; }
		if ( data.viewBox.y !== undefined ) { this.viewBox.y = data.viewBox.y ; }
		if ( data.viewBox.width !== undefined ) { this.viewBox.width = data.viewBox.width ; }
		if ( data.viewBox.height !== undefined ) { this.viewBox.height = data.viewBox.height ; }
	}

	if ( data.css && Array.isArray( data.css ) ) {
		this.css.length = 0 ;
		for ( let rule of data.css ) {
			this.addCssRule( rule ) ;
		}
	}
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

