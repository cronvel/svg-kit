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
const ConvexPolygon = require( './ConvexPolygon.js' ) ;
const BoundingBox = require( './BoundingBox.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



function VGConvexPolygon( params ) {
	VGEntity.call( this , params ) ;

	// Note: All properties of ConvexPolygon should be copied here
	this.points = [] ;
	this.sides = [] ;
	this.clockwise = true ;
	this.autofix = true ;
	this.badConvexPolygon = false ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGConvexPolygon ;

VGConvexPolygon.prototype = Object.create( VGEntity.prototype ) ;
VGConvexPolygon.prototype.constructor = VGConvexPolygon ;
VGConvexPolygon.prototype.__prototypeUID__ = 'svg-kit/VGConvexPolygon' ;
VGConvexPolygon.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

// Pseudo inheritance from ConvexPolygon:
Object.assign( VGConvexPolygon.prototype , ConvexPolygon.prototype ) ;



VGConvexPolygon.prototype.svgTag = 'path' ;



VGConvexPolygon.prototype.set = function( params ) {
	ConvexPolygon.prototype.set.call( this , params ) ;
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.build ) { this.build( params.build ) ; }

	if ( params.points && this.badConvexPolygon ) {
		//throw new Error( "Bad polygon (not simple, not convex, or degenerate case)" ) ;
	}
} ;



VGConvexPolygon.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	ConvexPolygon.prototype.export.call( this , data ) ;
	return data ;
} ;



VGConvexPolygon.prototype.getBoundingBox = function() {
	var xmin = Infinity ,
		xmax = - Infinity ,
		ymin = Infinity ,
		ymax = - Infinity ;

	for ( let point of this.points ) {
		if ( point.x < xmin ) { xmin = point.x ; }
		if ( point.x > xmax ) { xmax = point.x ; }
		if ( point.y < ymin ) { ymin = point.y ; }
		if ( point.y > ymax ) { ymax = point.y ; }
	}

	return new BoundingBox( xmin , ymin , xmax , ymax ) ;
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



//VGConvexPolygon.prototype.isInside = function( coords ) { return ConvexPolygon.prototype.isInside.call( this , coords ) ; } ;



VGConvexPolygon.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



// Build the SVG 'd' attribute
VGConvexPolygon.prototype.toD = function() {
	return ConvexPolygon.prototype.toD.call( this , this.root.invertY ) ;
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

