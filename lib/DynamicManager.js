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



const canvas = require( './canvas.js' ) ;

const LeanEvents = require( 'nextgen-events/lib/LeanEvents.js' ) ;
const Promise = require( 'seventh' ) ;



function DynamicManager( ctx , vg ) {
	this.ctx = ctx ;
	this.vg = vg ;

	this.tick = 0 ;
	this.tickTime = 100 ;
	this.timer = null ;

	this.canvasListeners = [] ;
	this.toEmit = [] ;	// Pending events to be emited

	// A debounced redraw
	this.redraw = Promise.debounceUpdate( { delay: 50 } , () => this.vg.redrawCanvas( this.ctx ) ) ;
}

module.exports = DynamicManager ;

DynamicManager.prototype = Object.create( LeanEvents.prototype ) ;
DynamicManager.prototype.constructor = DynamicManager ;
DynamicManager.prototype.__prototypeUID__ = 'svg-kit/DynamicManager' ;
DynamicManager.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



DynamicManager.prototype.emitPendingEvents = function() {
	for ( let event of this.toEmit ) {
		this.emit( event.name , event.data ) ;
	}

	this.toEmit.length = 0 ;
} ;



DynamicManager.prototype.onTick = function() {
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



DynamicManager.prototype.onPointerMove = function( x , y ) {
	let outdated = false ;
	let canvasCoords = canvas.screenToCanvasCoords( this.ctx.canvas , { x , y } ) ;
	let contextCoords = canvas.canvasToContextCoords( this.ctx , canvasCoords ) ;

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
			this.toEmit.push( ... dynamic.toEmit ) ;
			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.onPointerPress = function( x , y ) {
	let outdated = false ;
	let canvasCoords = canvas.screenToCanvasCoords( this.ctx.canvas , { x , y } ) ;
	let contextCoords = canvas.canvasToContextCoords( this.ctx , canvasCoords ) ;

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
			this.toEmit.push( ... dynamic.toEmit ) ;
			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.onPointerRelease = function( x , y ) {
	let outdated = false ;
	let canvasCoords = canvas.screenToCanvasCoords( this.ctx.canvas , { x , y } ) ;
	let contextCoords = canvas.canvasToContextCoords( this.ctx , canvasCoords ) ;

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
			this.toEmit.push( ... dynamic.toEmit ) ;
			dynamic.toEmit.length = 0 ;
		}
	}

	if ( outdated ) { this.redraw() ; }
	if ( this.toEmit.length ) { this.emitPendingEvents() ; }
} ;



DynamicManager.prototype.manageBrowserCanvas = function() {
	if ( this.timer ) {
		clearInterval( this.timer ) ;
		this.timer = null ;
	}

	this.timer = setInterval( () => this.onTick() , this.tickTime ) ;

	this.addCanvasEventListener( 'mousemove' , event => this.onPointerMove( event.clientX , event.clientY ) ) ;
	this.addCanvasEventListener( 'mousedown' , event => this.onPointerPress( event.clientX , event.clientY ) ) ;
	this.addCanvasEventListener( 'mouseup' , event => this.onPointerRelease( event.clientX , event.clientY ) ) ;
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

