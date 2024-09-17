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



VGRect.prototype.svgTag = 'rect' ;



VGRect.prototype.set = function( params ) {
	if ( params.x !== undefined ) { this.boundingBox.x = this.x = params.x ; }
	if ( params.y !== undefined ) { this.boundingBox.y = this.y = params.y ; }
	if ( params.width !== undefined ) { this.boundingBox.width = this.width = params.width ; }
	if ( params.height !== undefined ) { this.boundingBox.height = this.height = params.height ; }

	// Round corner radius
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; }

	VGEntity.prototype.set.call( this , params ) ;
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



VGRect.prototype.getBoundingBox = function() {
	return new BoundingBox( this.x , this.y , this.x + this.width , this.y + this.height ) ;
} ;



VGRect.prototype.svgAttributes = function( master = this ) {
	var attr = {
		x: this.x ,
		y: this.root.invertY ? - this.y - this.height : this.y ,
		width: this.width ,
		height: this.height ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGRect.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	canvasCtx.save() ;
	canvasCtx.beginPath() ;

	if ( this.rx || this.ry ) {
		canvasCtx.roundRect( this.x , this.y + yOffset , this.width , this.height , Math.max( this.rx || 0 , this.ry || 0 ) ) ;
	}
	else {
		canvasCtx.rect( this.x , this.y + yOffset , this.width , this.height ) ;
	}

	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette ) ;
	canvasCtx.restore() ;
} ;



VGRect.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	if ( this.rx || this.ry ) {
		path2D.roundRect( this.x , this.y + yOffset , this.width , this.height , Math.max( this.rx || 0 , this.ry || 0 ) ) ;
	}
	else {
		path2D.rect( this.x , this.y + yOffset , this.width , this.height ) ;
	}
} ;

