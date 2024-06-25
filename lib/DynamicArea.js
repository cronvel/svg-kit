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

	this.everyTick = 1 ;	// Divide the DynamicManager's tick by this value before setting up the DynamicArea's tick
	this.tick = 0 ;		// A tick change will trigger the redraw

	// Should be a Path2D, from time to time, we will have to check if some events are inside the area or not.
	// The boundingBox act as a fast early out test.
	this.area = null ;
	this.boundingBox = new BoundingBox( entity.boundingBox ) ;

	this.statusData = {} ;
	this.morph = null ;
	this.toEmit = [] ;	// Pending events to be emited

	this.noRedraw = params.noRedraw || false ;		// If set, this dynamic area is not used to trigger redraw (probably just to send event back)
	this.outdated = false ;		// If set, redraw is needed
	this.backgroundImageData = null ;	// Image data stored for the redraw
	this.useEntityBackgroundImageData = true ;	// Use the entity's image data instead of the dynamic area one

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
	if ( params.everyTick ) { this.everyTick = + params.everyTick || 1 ; }

	if ( params.statusData && typeof params.statusData === 'object' ) {
		for ( let statusName in params.statusData ) {
			this.setStatusMorph( statusName , params.statusData[ statusName ] ) ;
		}
	}

	if ( params.status ) { this.setStatus( params.status ) ; }

	if ( params.boundingBox && typeof params.boundingBox === 'object' ) {
		this.boundingBox.set( params.boundingBox ) ;

		if ( this.useEntityBackgroundImageData && ! this.boundingBox.isEqualTo( this.entity.boundingBox ) ) {
			this.useEntityBackgroundImageData = false ;
		}
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
	tick = Math.floor( tick / this.everyTick ) ;
	if ( tick === this.tick ) { return ; }
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
	else if ( data.eachFrame ) {
		morph = data.eachFrame( this ) ;
	}
	else {
		return ;
	}

	if ( morph === true ) {
		// Special case: force a redraw without changing anything, mostly for special FX, or random translations like tremors
		if ( ! this.noRedraw ) { this.outdated = true ; }
		return ;
	}

	if ( ! morph || morph === this.morph ) { return ; }

	this.morph = morph ;
	this.entity.set( this.morph ) ;

	if ( ! this.noRedraw ) { this.outdated = true ; }
	//console.log( "==> " , this.noRedraw , this.outdated ) ;
} ;



DynamicArea.prototype.save = function( canvasCtx ) {
	if ( this.noRedraw ) { return ; }


	if ( this.useEntityBackgroundImageData ) {
		if ( this.entity.backgroundImageUpdate ) { return ; }

		this.entity.backgroundImageData = canvasCtx.getImageData(
			this.boundingBox.x , this.boundingBox.y ,
			this.boundingBox.width , this.boundingBox.height
		) ;

		this.entity.backgroundImageUpdate = true ;
	}
	else {
		this.backgroundImageData = canvasCtx.getImageData(
			this.boundingBox.x , this.boundingBox.y ,
			this.boundingBox.width , this.boundingBox.height
		) ;
	}
} ;



DynamicArea.prototype.restore = function( canvasCtx ) {
	if ( this.noRedraw ) { return ; }

	if ( this.useEntityBackgroundImageData ) {
		if ( this.entity.backgroundImageUpdate ) { return ; }
		canvasCtx.putImageData( this.entity.backgroundImageData , this.boundingBox.x , this.boundingBox.y ) ;
		this.entity.backgroundImageUpdate = true ;
	}
	else {
		canvasCtx.putImageData( this.backgroundImageData , this.boundingBox.x , this.boundingBox.y ) ;
	}
} ;

