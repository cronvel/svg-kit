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



const canvasUtilities = require( './canvas-utilities.js' ) ;

const LeanEvents = require( 'nextgen-events/lib/LeanEvents.js' ) ;
const Promise = require( 'seventh' ) ;



function DynamicManager( ctx , vg , tickTime ) {
	this.ctx = ctx ;
	this.vg = vg ;
	this.tickTime = tickTime || 100 ;

	this.tick = 0 ;
	this.timer = null ;
	this.running = false ;

	this.canvasListeners = [] ;

	this.babylonControl = null ;
	this.babylonControlListeners = [] ;

	this.toEmit = [] ;	// Pending events to be emited

	// A debounced redraw
	this.redraw = Promise.debounceUpdate( { delay: this.tickTime / 2 } , async () => {
		//console.warn( "###! redraw()" ) ;
		await this.vg.redrawCanvas( this.ctx ) ;
		this.emit( 'redraw' ) ;
		/*
		try {
			await this.vg.redrawCanvas( this.ctx ) ;
			this.emit( 'redraw' ) ;
		} catch ( error ) {
			console.error( "Error:" , error ) ;
			this.destroy() ;
			return ;
		}
		//*/
		//console.warn( "###! redrawn()" ) ;
	} ) ;
}

module.exports = DynamicManager ;

DynamicManager.prototype = Object.create( LeanEvents.prototype ) ;
DynamicManager.prototype.constructor = DynamicManager ;
DynamicManager.prototype.__prototypeUID__ = 'svg-kit/DynamicManager' ;
DynamicManager.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



DynamicManager.prototype.destroy = function() {
	this.reset() ;
} ;



DynamicManager.prototype.reset = function() {
	if ( this.timer ) {
		clearInterval( this.timer ) ;
		this.timer = null ;
	}

	this.clearCanvasEventListener() ;
	this.clearBabylonControlEventListener() ;
	this.babylonControl = null ;
	this.running = false ;
} ;



DynamicManager.prototype.emitPendingEvents = function() {
	for ( let event of this.toEmit ) {
		this.emit( event.name , event.data ) ;
	}

	this.toEmit.length = 0 ;
} ;



DynamicManager.prototype.onTick = function() {
	//console.warn( "###! onTick()" ) ;
	this.tick ++ ;

	let outdated = false ;

	for ( let dynamic of this.vg.dynamicAreaIterator() ) {
		dynamic.setTick( this.tick ) ;

		if ( dynamic.outdated ) {
			outdated = true ;
		}
	}

	if ( outdated ) { this.redraw() ; }
} ;



DynamicManager.prototype.onPointerMove = function( canvasCoords , convertBackCoords ) {
	let outdated = false ;
	let contextCoords = canvasUtilities.canvasToContextCoords( this.ctx , canvasCoords ) ;

	for ( let dynamic of this.vg.dynamicAreaIterator() ) {
		if ( dynamic.boundingBox.isInside( contextCoords ) ) {
			if ( dynamic.status !== 'press' ) {
				dynamic.setStatus( 'hover' ) ;
			}
		}
		else {
			dynamic.setStatus( 'base' ) ;
		}

		if ( dynamic.outdated ) {
			outdated = true ;
		}

		if ( dynamic.toEmit ) {
			for ( let event of dynamic.toEmit ) {
				this.convertEventCoords( event.data , convertBackCoords ) ;
				this.toEmit.push( event ) ;
			}

			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.onPointerPress = function( canvasCoords , convertBackCoords ) {
	let outdated = false ;
	let contextCoords = canvasUtilities.canvasToContextCoords( this.ctx , canvasCoords ) ;

	for ( let dynamic of this.vg.dynamicAreaIterator() ) {
		if ( dynamic.boundingBox.isInside( contextCoords ) ) {
			dynamic.setStatus( 'press' ) ;
		}
		else {
			dynamic.setStatus( 'base' ) ;
		}

		if ( dynamic.outdated ) {
			outdated = true ;
		}

		if ( dynamic.toEmit ) {
			for ( let event of dynamic.toEmit ) {
				this.convertEventCoords( event.data , convertBackCoords ) ;
				this.toEmit.push( event ) ;
			}

			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.onPointerRelease = function( canvasCoords , convertBackCoords ) {
	let outdated = false ;
	let contextCoords = canvasUtilities.canvasToContextCoords( this.ctx , canvasCoords ) ;

	for ( let dynamic of this.vg.dynamicAreaIterator() ) {
		if ( dynamic.boundingBox.isInside( contextCoords ) ) {
			dynamic.setStatus( 'release' ) ;
		}
		else {
			dynamic.setStatus( 'base' ) ;
		}

		if ( dynamic.outdated ) {
			outdated = true ;
		}

		if ( dynamic.toEmit ) {
			for ( let event of dynamic.toEmit ) {
				this.convertEventCoords( event.data , convertBackCoords ) ;
				this.toEmit.push( event ) ;
			}

			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.convertEventCoords = function( eventData , convertBackCoords ) {
	let min = canvasUtilities.contextToCanvasCoords( this.ctx , { x: eventData.boundingBox.xmin , y: eventData.boundingBox.ymin } ) ,
		max = canvasUtilities.contextToCanvasCoords( this.ctx , { x: eventData.boundingBox.xmax , y: eventData.boundingBox.ymax } ) ;

	min = convertBackCoords( min ) ;
	max = convertBackCoords( max ) ;

	eventData.foreignBoundingBox = {
		xmin: min.x ,
		ymin: min.y ,
		xmax: max.x ,
		ymax: max.y
	} ;
} ;



// Misc



DynamicManager.prototype.getAllEmittableEvents = function( eventName , convertBackCoords = null ) {
	var list = [] ;

	for ( let dynamic of this.vg.dynamicAreaIterator() ) {
		let eventData = dynamic.getEmittableEvent( eventName ) ;
		if ( eventData ) {
			if ( convertBackCoords ) { this.convertEventCoords( eventData , convertBackCoords ) ; }
			list.push( eventData ) ;
		}
	}

	return list ;
} ;



// Browser specifics



DynamicManager.prototype.manageBrowserCanvas = function() {
	if ( this.running ) { throw new Error( "Manager is already running!" ) ; }
	this.running = true ;

	if ( this.timer ) {
		clearInterval( this.timer ) ;
		this.timer = null ;
	}

	this.timer = setInterval( () => this.onTick() , this.tickTime ) ;

	const convertCoords = event => canvasUtilities.screenToCanvasCoords( this.ctx.canvas , { x: event.clientX , y: event.clientY } ) ;
	const convertBackCoords = coords => canvasUtilities.canvasToScreenCoords( this.ctx.canvas , coords ) ;

	this.addCanvasEventListener( 'mousemove' , event => this.onPointerMove( convertCoords( event ) , convertBackCoords ) ) ;
	this.addCanvasEventListener( 'mousedown' , event => this.onPointerPress( convertCoords( event ) , convertBackCoords ) ) ;
	this.addCanvasEventListener( 'mouseup' , event => this.onPointerRelease( convertCoords( event ) , convertBackCoords ) ) ;
} ;



DynamicManager.prototype.addCanvasEventListener = function( eventName , listener ) {
	this.canvasListeners.push( [ eventName , listener ] ) ;
	this.ctx.canvas.addEventListener( eventName , listener ) ;
} ;



DynamicManager.prototype.clearCanvasEventListener = function() {
	for ( let [ eventName , listener ] of this.canvasListeners ) {
		this.ctx.canvas.removeEventListener( eventName , listener ) ;
	}

	this.canvasListeners.length = 0 ;
} ;



DynamicManager.prototype.getAllBrowserEmittableEvents = function( eventName ) {
	return this.getAllEmittableEvents(
		eventName ,
		coords => canvasUtilities.canvasToScreenCoords( this.ctx.canvas , coords )
	) ;
} ;



// BabylonJS specifics



DynamicManager.prototype.manageBabylonControl = function( control ) {
	if ( this.running ) { throw new Error( "Manager is already running!" ) ; }
	this.running = true ;

	if ( ! control ) { throw new Error( "No Babylon Control was provided" ) ; }

	this.babylonControl = control ;

	if ( this.timer ) {
		clearInterval( this.timer ) ;
		this.timer = null ;
	}

	this.timer = setInterval( () => this.onTick() , this.tickTime ) ;

	const convertCoords = coords => {
		// This is the same than: this.babylonControl.getLocalCoordinates( coords ), except we avoid instanciation
		return {
			x: coords.x - this.babylonControl._currentMeasure.left ,
			y: coords.y - this.babylonControl._currentMeasure.top
		} ;
	} ;

	const convertBackCoords = coords => {
		return {
			x: coords.x + this.babylonControl._currentMeasure.left ,
			y: coords.y + this.babylonControl._currentMeasure.top
		} ;
	} ;

	this.addBabylonControlEventListener( 'onPointerMoveObservable' , coords => this.onPointerMove( convertCoords( coords ) , convertBackCoords ) ) ;
	this.addBabylonControlEventListener( 'onPointerDownObservable' , coords => this.onPointerPress( convertCoords( coords ) , convertBackCoords ) ) ;
	this.addBabylonControlEventListener( 'onPointerUpObservable' , coords => this.onPointerRelease( convertCoords( coords ) , convertBackCoords ) ) ;

	// Special case, acts as if the pointer was moved to the negative region
	this.addBabylonControlEventListener( 'onPointerOutObservable' , coords => this.onPointerMove( { x: - 1 , y: - 1 } , convertBackCoords ) ) ;
} ;



DynamicManager.prototype.addBabylonControlEventListener = function( observable , listener ) {
	this.babylonControlListeners.push( [ observable , listener ] ) ;
	this.babylonControl[ observable ].add( listener ) ;
} ;



DynamicManager.prototype.clearBabylonControlEventListener = function() {
	for ( let [ observable , listener ] of this.babylonControlListeners ) {
		this.babylonControl[ observable ].removeCallback( listener ) ;
	}

	this.babylonControlListeners.length = 0 ;
} ;



DynamicManager.prototype.getAllBabylonControlEmittableEvents = function( eventName ) {
	return this.getAllEmittableEvents(
		eventName ,
		coords => {
			return {
				x: coords.x + this.babylonControl._currentMeasure.left ,
				y: coords.y + this.babylonControl._currentMeasure.top
			} ;
		}
	) ;
} ;

