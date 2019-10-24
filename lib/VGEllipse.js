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



const VGItem = require( './VGItem.js' ) ;



function VGEllipse( options ) {
	VGItem.call( this , options ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.rx = 0 ;
	this.ry = 0 ;
	
	if ( options ) { this.set( options ) ; }
}

module.exports = VGEllipse ;

VGEllipse.prototype = Object.create( VGItem.prototype ) ;
VGEllipse.prototype.constructor = VGEllipse ;
VGEllipse.prototype.__prototypeUID__ = 'svg-kit/VGEllipse' ;
VGEllipse.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEllipse.prototype.svgTag = 'ellipse' ;

VGEllipse.prototype.svgAttributes = function() {
	var attr = {
		cx: this.x ,
		cy: this.y ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGEllipse.prototype.set = function( data ) {
	VGItem.prototype.set.call( this , data ) ;

	// Interop'
	if ( data.cx !== undefined ) { this.x = data.cx ; }
	if ( data.cy !== undefined ) { this.y = data.cy ; }
	
	if ( data.x !== undefined ) { this.x = data.x ; }
	if ( data.y !== undefined ) { this.y = data.y ; }
	if ( data.r !== undefined ) { this.rx = this.ry = data.r ; }
	if ( data.rx !== undefined ) { this.rx = data.rx ; }
	if ( data.ry !== undefined ) { this.ry = data.ry ; }
} ;

