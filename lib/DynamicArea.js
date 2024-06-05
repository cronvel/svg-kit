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
	this.status = 'base' ;

	// A tick change will trigger the redraw if the number of tick since the last redraw is ≥ everyTick
	this.tick = 0 ;
	this.everyTick = 0 ;		// If non-zero, this area is sensible to time evolution, every X ticks would require a redraw
	this.lastRedrawTick = 0 ;

	// Should be a Path2D, from time to time, we will have to check if some events are inside the area or not.
	// The boundingBox act as a fast early out test.
	this.area = null ;
	this.boundingBox = new BoundingBox( 0 , 0 , 0 , 0 ) ;

	this.statusData = {} ;
	this.morph = null ;
	this.toEmit = [] ;	// Pending events to be emited

	this.noRedraw = params.noRedraw || false ;		// If set, this dynamic area is not used to trigger redraw (probably just to send event back)
	this.outdated = false ;		// If set, redraw is needed
	this.backgroundImageData = null ;	// Image data stored for the redraw

	// Non-enumerable properties (better for displaying the data)
	Object.defineProperties( this , {
		entity: { value: entity }	// The entity where to apply things
	} ) ;

	this.set( params ) ;

	// Force outdated back to false after .set()
	this.outdated = false ;
}

module.exports = DynamicArea ;

DynamicArea.prototype.__prototypeUID__ = 'svg-kit/DynamicArea' ;
DynamicArea.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



DynamicArea.prototype.set = function( params ) {
	if ( params.statusData && typeof params.statusData === 'object' ) {
		for ( let statusName in params.statusData ) {
			this.setStatusMorph( statusName , params.statusData[ statusName ] ) ;
		}
	}

	if ( params.status ) { this.setStatus( params.status ) ; }

	if ( params.boundingBox && typeof params.boundingBox === 'object' ) {
		this.boundingBox.set( params.boundingBox ) ;
	}
} ;



DynamicArea.prototype.setStatusMorph = function( statusName , data ) {
	if ( ! this.availableStatus.has( statusName ) ) { this.availableStatus.add( statusName ) ; }

	if ( data.frames ) { data.modulo = data.frames.reduce( ( v , e ) => v + ( e.ticks || 1 ) , 0 ) ; }

	this.statusData[ statusName ] = data ;
	if ( ! this.noRedraw ) { this.outdated = true ; }
} ;



DynamicArea.prototype.setStatus = function( status ) {
	if ( status && status !== this.status && this.availableStatus.has( status ) ) {
		//console.warn( "DynamicArea#setStatus() for:" , this.entity.__prototypeUID__ ) ;
		this.status = status ;
		this.updateMorph() ;

		let data = this.statusData[ this.status ] ;
		if ( data.emit ) {
			this.toEmit.push( data.emit ) ;
		}
	}
} ;



DynamicArea.prototype.setTick = function( tick ) {
	this.tick = tick ;
	this.updateMorph() ;
} ;



DynamicArea.prototype.updateMorph = function() {
	//console.warn( "> DynamicArea#updateMorph() for:" , this.entity.__prototypeUID__ ) ;
	var data = this.statusData[ this.status ] ;
	if ( ! data ) { return ; }

	var morph = null ;

	if ( data.morph ) {
		morph = data.morph ;
	}
	else if ( data.frames ) {
		let tickModulo = this.tick % data.modulo ;
		for ( let frame of data.frames ) {
			if ( tickModulo < frame.ticks ) {
				morph = frame.morph ;
				break ;
			}

			tickModulo -= frame.ticks ;
		}
	}
	else {
		return ;
	}

	if ( ! morph || morph === this.morph ) { return ; }

	this.morph = morph ;
	this.entity.set( this.morph ) ;

	if ( ! this.noRedraw ) { this.outdated = true ; }
} ;



DynamicArea.prototype.save = function( canvasCtx ) {
	if ( this.noRedraw ) { return ; }
	this.backgroundImageData = canvasCtx.getImageData(
		this.boundingBox.x , this.boundingBox.y ,
		this.boundingBox.width , this.boundingBox.height
	) ;
} ;



DynamicArea.prototype.restore = function( canvasCtx ) {
	if ( this.noRedraw ) { return ; }
	canvasCtx.putImageData( this.backgroundImageData , this.boundingBox.x , this.boundingBox.y ) ;
} ;

