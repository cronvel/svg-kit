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



//const svgKit = require( './svg-kit.js' ) ;
const BoundingBox = require( './BoundingBox.js' ) ;


function DynamicArea( entity , params ) {
	// A status change will trigger the redraw.
	// Can be things like on/off, or a tick number for animation.
	this.availableStatus = new Set() ;	// The list of status that this dynamic area can have
	this.status = null ;

	// A tick change will trigger the redraw if the number of tick since the last redraw is ≥ everyTick
	this.everyTick = 0 ;		// If non-zero, this area is sensible to time evolution, every X ticks would require a redraw
	this.lastRedrawTick = 0 ;

	// Should be a Path2D, from time to time, we will have to check if some events are inside the area or not.
	// The boundingBox act as a fast early out test.
	this.area = null ;
	this.boundingBox = new BoundingBox( 0 , 0 , 0 , 0 ) ;

	this.statusMorph = {} ;

	this.needRedraw = false ;

	// Non-enumerable properties (better for displaying the data)
	Object.defineProperties( this , {
		entity: { value: entity }	// The entity where to apply things
	} ) ;

	this.set( params ) ;

	// Force needRedraw back to false after .set()
	this.needRedraw = false ;
}

module.exports = DynamicArea ;

DynamicArea.prototype.__prototypeUID__ = 'svg-kit/DynamicArea' ;
DynamicArea.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



DynamicArea.prototype.set = function( params ) {
	if ( params.statusMorph && typeof params.statusMorph === 'object' ) {
		for ( let key in params.statusMorph ) {
			if ( ! this.availableStatus.has( key ) ) { this.availableStatus.add( key ) ; }
			if ( ! this.statusMorph[ key ] ) { this.statusMorph[ key ] = {} ; }
			Object.assign( this.statusMorph[ key ] , params.statusMorph[ key ] ) ;
			this.needRedraw = true ;
		}
	}

	if ( params.status ) { this.setStatus( params.status ) ; }

	if ( params.boundingBox && typeof params.boundingBox === 'object' ) {
		this.boundingBox.set( params.boundingBox ) ;
	}
} ;



DynamicArea.prototype.setStatus = function( status ) {
	if ( status && status !== this.status && this.availableStatus.has( status ) ) {
		this.status = status ;
		this.entity.set( this.statusMorph[ status ] ) ;
		this.needRedraw = true ;
	}
} ;

