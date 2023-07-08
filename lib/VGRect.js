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



function VGRect( params ) {
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.width = 0 ;
	this.height = 0 ;

	// Round corner radius
	this.rx = 0 ;
	this.ry = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGRect ;

VGRect.prototype = Object.create( VGEntity.prototype ) ;
VGRect.prototype.constructor = VGRect ;
VGRect.prototype.__prototypeUID__ = 'svg-kit/VGRect' ;
VGRect.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGRect.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.width !== undefined ) { this.width = params.width ; }
	if ( params.height !== undefined ) { this.height = params.height ; }

	// Round corner radius
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; }
} ;



VGRect.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.width = this.width ;
	data.height = this.height ;

	if ( this.rx ) { data.rx = this.rx ; }
	if ( this.ry ) { data.ry = this.ry ; }

	return data ;
} ;



VGRect.prototype.svgTag = 'rect' ;

VGRect.prototype.svgAttributes = function( root = this ) {
	var attr = {
		x: this.x ,
		y: root.invertY ? - this.y - this.height : this.y ,
		width: this.width ,
		height: this.height ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGRect.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasCtx.rect( this.x , root.invertY ? - this.y - this.height : this.y , this.width , this.height ) ;
	canvas.fillAndStrokeUsingSvgStyle( canvasCtx , this.style ) ;
	canvasCtx.restore() ;
} ;

