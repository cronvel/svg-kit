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
const canvasUtilities = require( './canvas-utilities.js' ) ;
const pathUtilities = require( './path-utilities.js' ) ;



function VGPath( params ) {
	VGEntity.call( this , params ) ;

	this.commands = [] ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGPath ;

VGPath.prototype = Object.create( VGEntity.prototype ) ;
VGPath.prototype.constructor = VGPath ;
VGPath.prototype.__prototypeUID__ = 'svg-kit/VGPath' ;
VGPath.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPath.prototype.svgTag = 'path' ;



VGPath.prototype.set = function( params ) {
	if ( Array.isArray( params.commands ) ) { this.commands = params.commands ; }

	// /!\ Bounding box should be calculated from path

	VGEntity.prototype.set.call( this , params ) ;
} ;



VGPath.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;
	if ( this.commands.length ) { data.commands = this.commands ; }
	return data ;
} ;



VGPath.prototype.svgAttributes = function( master = this ) {
	var attr = {
		// SVG attribute 'd' (data)
		d: this.toD()
	} ;

	return attr ;
} ;



// Build the SVG 'd' attribute
VGPath.prototype.toD = function() {
	return pathUtilities.commandsToD( this.commands , this.root.invertY ) ;
} ;



VGPath.prototype.renderHookForCanvas = function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasUtilities.fillAndStrokeUsingStyle( canvasCtx , this.style , master?.palette , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



VGPath.prototype.renderHookForPath2D = function( path2D , canvasCtx , options = {} , master = this ) {
	path2D.addPath( new Path2D( this.toD() ) ) ;
} ;



/*
	Now add path commands.
	First, true SVG path commands.
*/

VGPath.prototype.close = function() {
	this.commands.push( { type: 'close' } ) ;
	return this ;
} ;

VGPath.prototype.move = function( data ) {
	this.commands.push( {
		type: 'move' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.moveTo = function( data ) {
	this.commands.push( {
		type: 'move' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.line = function( data ) {
	this.commands.push( {
		type: 'line' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.lineTo = function( data ) {
	this.commands.push( {
		type: 'line' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.curve = function( data ) {
	this.commands.push( {
		type: 'curve' ,
		rel: true ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.curveTo = function( data ) {
	this.commands.push( {
		type: 'curve' ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.smoothCurve = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		rel: true ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.smoothCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

// q-curve = Quadratic curve, it uses just one controle point instead of two
VGPath.prototype.qCurve = function( data ) {
	this.commands.push( {
		type: 'qCurve' ,
		rel: true ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.qCurveTo = function( data ) {
	this.commands.push( {
		type: 'qCurve' ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.smoothQCurve = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.smoothQCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.arc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr:
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.arcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr:
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: - ( data.ra || data.a || 0 ) ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! (
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true
		) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: - ( data.ra || data.a || 0 ) ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! (
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true
		) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;



/*
	VG-specific commands.
*/

// Better arc-like command, but use curve behind the scene
VGPath.prototype.centerArc = function( data ) {
	this.commands.push( {
		type: 'centerArc' ,
		rel: true ,
		cx: data.cx || 0 ,
		cy: data.cy || 0 ,
		la: data.largeArc !== undefined ? !! data.largeArc :
		data.longArc !== undefined ? !! data.longArc :
		data.la !== undefined ? !! data.la :
		false ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.centerArcTo = function( data ) {
	this.commands.push( {
		type: 'centerArc' ,
		cx: data.cx || 0 ,
		cy: data.cy || 0 ,
		la: data.largeArc !== undefined ? !! data.largeArc :
		data.longArc !== undefined ? !! data.longArc :
		data.la !== undefined ? !! data.la :
		false ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
	return this ;
} ;



/*
	Turtle-like commands.
*/

VGPath.prototype.penUp = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: true
	} ) ;
	return this ;
} ;

VGPath.prototype.penDown = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: false
	} ) ;
	return this ;
} ;

VGPath.prototype.forward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: typeof data === 'number' ? data : data.length || data.l || 0
	} ) ;
	return this ;
} ;

VGPath.prototype.backward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: - ( typeof data === 'number' ? data : data.length || data.l || 0 )
	} ) ;
	return this ;
} ;

// Turn using positive as X-axis to Y-axis
VGPath.prototype.turn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
	return this ;
} ;

// Turn from X-axis to Y-axis
VGPath.prototype.turnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
	return this ;
} ;

// Turn using positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeTurn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
	return this ;
} ;

// Turn from Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.negativeTurnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: 90 - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
	return this ;
} ;

// A turtle-like way of doing a curve: combine a forward and turn, moving along a circle
VGPath.prototype.forwardTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: data.angle || data.a || 0
	} ) ;
	return this ;
} ;

// Turn using positive as Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.forwardNegativeTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: - ( data.angle || data.a || 0 )
	} ) ;
	return this ;
} ;

