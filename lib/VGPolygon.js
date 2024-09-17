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
const Polygon = require( './Polygon.js' ) ;
const BoundingBox = require( './BoundingBox.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



function VGPolygon( params ) {
	VGEntity.call( this , params ) ;

	// Note: All properties of Polygon should be copied here
	this.points = [] ;
	this.sides = [] ;
	this.clockwise = true ;
	this.autofix = true ;
	this.badPolygon = false ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGPolygon ;

VGPolygon.prototype = Object.create( VGEntity.prototype ) ;
VGPolygon.prototype.constructor = VGPolygon ;
VGPolygon.prototype.__prototypeUID__ = 'svg-kit/VGPolygon' ;
VGPolygon.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

// Pseudo inheritance from Polygon:
Object.assign( VGPolygon.prototype , Polygon.prototype ) ;



VGPolygon.prototype.svgTag = 'path' ;



VGPolygon.prototype.set = function( params ) {
	Polygon.prototype.set.call( this , params ) ;
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.build ) { this.build( params.build ) ; }

	if ( params.points && this.badPolygon ) {
		//throw new Error( "Bad polygon (not simple, not convex, or degenerate case)" ) ;
	}
} ;



VGPolygon.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	Polygon.prototype.export.call( this , data ) ;
	return data ;
} ;



VGPolygon.prototype.getBoundingBox = function() {
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

VGPolygon.prototype.build = function( data = {} ) {
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



//VGPolygon.prototype.isInside = function( coords ) { return Polygon.prototype.isInside.call( this , coords ) ; } ;



VGPolygon.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



// Build the SVG 'd' attribute
VGPolygon.prototype.toD = function() {
	return Polygon.prototype.toD.call( this , this.root.invertY ) ;
} ;



VGPolygon.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



VGPolygon.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	path2D.addPath( new Path2D( this.toD() ) ) ;
} ;

