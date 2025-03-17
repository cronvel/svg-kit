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



const VGEntity = require( './VGEntity.js' ) ;
const ConvexPolygon = require( './ConvexPolygon.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



function VGConvexPolygon( params ) {
	VGEntity.call( this , params ) ;

	this.convexPolygon = new ConvexPolygon() ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGConvexPolygon ;

VGConvexPolygon.prototype = Object.create( VGEntity.prototype ) ;
VGConvexPolygon.prototype.constructor = VGConvexPolygon ;
VGConvexPolygon.prototype.__prototypeUID__ = 'svg-kit/VGConvexPolygon' ;
VGConvexPolygon.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGConvexPolygon.prototype.svgTag = 'path' ;



VGConvexPolygon.prototype.set = function( params ) {
	var refreshBbox = !! ( params.style?.stroke || params.style?.strokeWidth ) ;

	if ( params.build ) {
		// .build() call .set() again, no need to compute BBox here
		this.build( params.build ) ;
	}

	if ( params.points ) {
		this.convexPolygon.setPoints( params.points ) ;
		refreshBbox = true ;
		//console.warn( this.convexPolygon.totalAngle ) ;
		if ( ! this.convexPolygon.checkConvex() ) { throw new Error( "Not a convex polygon" ) ; }
	}

	VGEntity.prototype.set.call( this , params ) ;

	if ( refreshBbox ) { this.computeBoundingBox() ; }
} ;



VGConvexPolygon.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	this.convexPolygon.export( data ) ;
	return data ;
} ;



// Methods that pass to ConvexPolygon methods
VGConvexPolygon.prototype.toD = function() { return this.convexPolygon.toD( this.root.invertY ) ; } ;
VGConvexPolygon.prototype.isInside = function( coords ) { return this.convexPolygon.isInside( coords ) ; } ;

VGConvexPolygon.prototype.setPoints = function( points ) {
	this.convexPolygon.setPoints( points ) ;
	this.computeBoundingBox() ;
} ;

VGConvexPolygon.prototype.addPoint = function( point ) {
	this.convexPolygon.addPoint( point ) ;
	this.computeBoundingBox() ;
} ;

VGConvexPolygon.prototype.computeBoundingBox = function() {
	this.boundingBox.set( this.convexPolygon.boundingBox ) ;
	var width = this.style.stroke ? this.style.strokeWidth : 0 ;
	if ( width ) { this.boundingBox.enlarge( width ) ; }
} ;



const degToRad = deg => deg * Math.PI / 180 ;

VGConvexPolygon.prototype.build = function( data = {} ) {
	var points = [] ,
		cx = data.cx !== undefined ? + data.cx || 0 : + data.x || 0 ,
		cy = data.cy !== undefined ? + data.cy || 0 : + data.y || 0 ,
		sides = + data.sides || 1 ,
		angleInc = 2 * Math.PI / sides ,
		angle = data.angleDeg !== undefined ? degToRad( + data.angleDeg || 0 ) : + data.angle || 0 ,
		radius = + data.radius || 0 ;

	for ( let i = 0 ; i < sides ; i ++ , angle += angleInc ) {
		points.push( {
			x: cx + Math.cos( angle ) * radius ,
			y: cy + Math.sin( angle ) * radius
		} ) ;
	}
	console.warn( "points: " , points ) ;

	this.set( { points } ) ;
} ;



VGConvexPolygon.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



VGConvexPolygon.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



VGConvexPolygon.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	path2D.addPath( new Path2D( this.toD() ) ) ;
} ;

