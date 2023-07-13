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



const VGEntity = require( './VGEntity.js' ) ;
const canvas = require( './canvas.js' ) ;



function VGEllipse( params ) {
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.rx = 0 ;
	this.ry = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGEllipse ;

VGEllipse.prototype = Object.create( VGEntity.prototype ) ;
VGEllipse.prototype.constructor = VGEllipse ;
VGEllipse.prototype.__prototypeUID__ = 'svg-kit/VGEllipse' ;
VGEllipse.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEllipse.prototype.svgTag = 'ellipse' ;



VGEllipse.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	// Interop'
	if ( params.cx !== undefined ) { this.x = params.cx ; }
	if ( params.cy !== undefined ) { this.y = params.cy ; }

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; }
} ;



VGEllipse.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.rx = this.rx ;
	data.ry = this.ry ;

	return data ;
} ;



VGEllipse.prototype.svgAttributes = function( root = this ) {
	var attr = {
		cx: this.x ,
		cy: root.invertY ? - this.y : this.y ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGEllipse.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	var yOffset = root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y : 0 ;

	if ( ! options.clipMode ) {
		canvasCtx.save() ;
		canvasCtx.beginPath() ;
	}

	canvasCtx.ellipse( this.x , this.y + yOffset , this.rx , this.ry , 0 , 0 , 2 * Math.PI ) ;

	if ( ! options.clipMode ) {
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , this.style ) ;
		canvasCtx.restore() ;
	}
} ;

