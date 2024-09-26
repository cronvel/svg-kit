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
const Polyline = require( './Polyline.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



function VGPolyline( params ) {
	VGEntity.call( this , params ) ;

	this.polyline = params.polyline || new Polyline() ;
	
	if ( params ) { this.set( params ) ; }
}

module.exports = VGPolyline ;

VGPolyline.prototype = Object.create( VGEntity.prototype ) ;
VGPolyline.prototype.constructor = VGPolyline ;
VGPolyline.prototype.__prototypeUID__ = 'svg-kit/VGPolyline' ;
VGPolyline.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPolyline.prototype.noFill = true ;
VGPolyline.prototype.svgTag = 'path' ;



VGPolyline.prototype.set = function( params ) {
	var refreshBbox = !! ( params.style?.stroke || params.style?.strokeWidth ) ;

	if ( params.points ) {
		this.polyline.setPoints( params.points ) ;
		refreshBbox = true ;
	}

	VGEntity.prototype.set.call( this , params ) ;

	if ( refreshBbox ) { this.computeBoundingBox() ; }
} ;



VGPolyline.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	this.polyline.exports( data ) ;
	return data ;
} ;



// Methods that pass to Polyline methods
VGPolyline.prototype.toD = function() { return this.polyline.toD( this.root.invertY ) ; } ;
VGPolyline.prototype.isInside = function( coords ) { return this.polyline.isInside( coords ) ; } ;

VGPolyline.prototype.setPoints = function( points ) {
	this.polyline.setPoints( points ) ;
	this.computeBoundingBox() ;
} ;

VGPolyline.prototype.addPoint = function( point ) {
	this.polyline.addPoint( point ) ;
	this.computeBoundingBox() ;
} ;

VGPolyline.prototype.computeBoundingBox = function() {
	this.boundingBox.set( this.polyline.boundingBox ) ;
	var width = this.style.stroke ? this.style.strokeWidth : 0 ;
	if ( width ) { this.boundingBox.enlarge( width ) ; }
} ;



VGPolyline.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



VGPolyline.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



VGPolyline.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	path2D.addPath( new Path2D( this.toD() ) ) ;
} ;

