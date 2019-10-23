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



function VG( options = {} ) {
	VGContainer.call( this , options ) ;

	this.id = options.id || 'vg_' + ( autoId ++ ) ;

	this.viewBox = {
		x: options.x || 0 ,
		y: options.y || 0 ,
		width: options.width || 100 ,
		height: options.height || 100
	} ;
}

module.exports = VG ;


VG.prototype = Object.create( VGContainer.prototype ) ;
VG.prototype.constructor = VG ;
VG.prototype.__prototypeUID__ = 'svg-kit/VG' ;
VG.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VG.prototype.svgTag = 'svg' ;

VG.prototype.svgAttributes = function() {
	var attr = {
		viewBox: this.viewBox.x + ' ' + this.viewBox.y + ' ' + this.viewBox.width + ' ' + this.viewBox.height
	} ;
	
	return attr ;
} ;


