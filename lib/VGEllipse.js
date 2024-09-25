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
const BoundingBox = require( './BoundingBox.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



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
	let bboxChanged = false ;

	// Interop'
	if ( params.cx !== undefined ) { this.x = params.cx ; bboxChanged = true ; }
	if ( params.cy !== undefined ) { this.y = params.cy ; bboxChanged = true ; }

	if ( params.x !== undefined ) { this.x = params.x ; bboxChanged = true ; }
	if ( params.y !== undefined ) { this.y = params.y ; bboxChanged = true ; }
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; bboxChanged = true ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; bboxChanged = true ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; bboxChanged = true ; }

	if ( bboxChanged ) {
		this.boundingBox.xmin = this.x - this.rx ;
		this.boundingBox.xmax = this.x + this.rx ;
		this.boundingBox.ymin = this.y - this.ry ;
		this.boundingBox.ymax = this.y + this.ry ;
	}

	VGEntity.prototype.set.call( this , params ) ;
} ;



VGEllipse.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.rx = this.rx ;
	data.ry = this.ry ;

	return data ;
} ;



VGEllipse.prototype.computeBoundingBox = function() {
	var strokeWidth = this.style.stroke ? this.style.strokeWidth : 0 ;
	this.boundingBox.setMinMax(
		this.x - this.rx - strokeWidth ,
		this.y - this.ry - strokeWidth ,
		this.x + this.rx + strokeWidth ,
		this.y + this.ry + strokeWidth
	) ;
} ;



VGEllipse.prototype.svgAttributes = function( master = this ) {
	var attr = {
		cx: this.x ,
		cy: this.root.invertY ? - this.y : this.y ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGEllipse.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y : 0 ;

	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasCtx.ellipse( this.x , this.y + yOffset , this.rx , this.ry , 0 , 0 , 2 * Math.PI ) ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette ) ;
	canvasCtx.restore() ;
} ;



VGEllipse.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y : 0 ;
	path2D.ellipse( this.x , this.y + yOffset , this.rx , this.ry , 0 , 0 , 2 * Math.PI ) ;
} ;

