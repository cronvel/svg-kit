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
const VGPolygon = require( './VGPolygon.js' ) ;
const Path = require( './Path/Path.js' ) ;
const canvasUtilities = require( './canvas-utilities.js' ) ;



function VGPath( params ) {
	VGEntity.call( this , params ) ;

	this.path = new Path() ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGPath ;

VGPath.prototype = Object.create( VGEntity.prototype ) ;
VGPath.prototype.constructor = VGPath ;
VGPath.prototype.__prototypeUID__ = 'svg-kit/VGPath' ;
VGPath.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPath.prototype.svgTag = 'path' ;



VGPath.prototype.set = function( params ) {
	if ( Array.isArray( params.commands ) ) { this.path.set( params.commands ) ; }

	// /!\ Bounding box should be calculated from path

	VGEntity.prototype.set.call( this , params ) ;
} ;



VGPath.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	this.path.export( data ) ;
	return data ;
} ;



VGPath.prototype.onAttach = function() {
	this.path.setInvertY( this.root.invertY ) ;
} ;



VGPath.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



// Methods that pass to Path methods
VGPath.prototype.toD = function() { return this.path.toD( this.root.invertY ) ; } ;
VGPath.prototype.isInside = function( coords ) { return this.path.isInside( coords ) ; } ;



// Return an array of VGPolygon, the hull of the current path (non-closing path are EXCLUDED!)
VGPath.prototype.toVGPolygonHull = function( options = {} ) {
	this.path.computeHull() ;
	return this.path.polygonHull.map( polygon => new VGPolygon( { polygon , style: options.style } ) ) ;
} ;



// Return an array of VGPolygon
VGPath.prototype.toVGPolygon = function( options = {} ) {
	var polygonList = this.path.toPolygon() ;
	return polygonList.map( polygon => new VGPolygon( { polygon , style: options.style } ) ) ;
} ;



// Return an array of VGPolyline
VGPath.prototype.toVGPolyline = function( options = {} ) {
	var polylineList = this.path.toPolyline() ;
	return polylineList.map( polyline => new VGPolyne( { polyline , style: options.style } ) ) ;
} ;



// Create API methods
for ( let type in Path.commands ) {
	if ( Path.commands[ type ].add ) {
		VGPath.prototype[ type ] = function( data ) {
			this.path[ type ]( data ) ;
			return this ;
		} ;
	}
}



VGPath.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



VGPath.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	path2D.addPath( new Path2D( this.toD() ) ) ;
} ;

