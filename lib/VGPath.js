/*
	Spellcast

	Copyright (c) 2014 - 2019 Cédric Ronvel

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



const VGItem = require( './VGItem.js' ) ;



function VGPath( options ) {
	VGItem.call( this , options ) ;

	this.commands = [] ;
	
	if ( options ) { this.set( options ) ; }
}

module.exports = VGPath ;

VGPath.prototype = Object.create( VGItem.prototype ) ;
VGPath.prototype.constructor = VGPath ;
VGPath.prototype.__prototypeUID__ = 'svg-kit/VGPath' ;
VGPath.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPath.prototype.svgTag = 'path' ;

VGPath.prototype.svgAttributes = function() {
	var attr = {
		// That enigmatic SVG attribute 'd' probably means 'data' or 'draw'
		d: this.toD()
	} ;

	return attr ;
} ;



VGPath.prototype.set = function( data ) {
	VGItem.prototype.set.call( this , data ) ;
	if ( Array.isArray( data.commands ) ) { this.commands = data.commands ; }
} ;



// Build the SVG 'd' attribute
VGPath.prototype.toD = function() {
	var build = {
		d: '' ,
		pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
		cx: 0 ,		// cursor position x
		cy: 0 ,		// cursor position y
		ca: Math.PI / 2		// cursor angle, default to up
	} ;
	
	this.commands.forEach( ( command , index ) => {
		if ( index ) { build.d += ' ' ; }
		builders[ command.type ]( command , build ) ;
	} ) ;
	
	return build.d ;
} ;



const degToRad = deg => deg * Math.PI / 180 ; 
const radToDeg = rad => rad * 180 / Math.PI ; 



const builders = {} ;

builders.close = ( command , build ) => {
	build.d += 'z' ;
} ;

builders.move = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'm ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'M ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.line = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'l ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'L ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.curve = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'c ' + command.cx1 + ' ' + command.cy1 + ' ' + command.cx2 + ' ' + command.cy2 + ' '  + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'C ' + command.cx1 + ' ' + command.cy1 + ' ' + command.cx2 + ' ' + command.cy2 + ' '  + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.smoothCurve = ( command , build ) => {
	if ( command.rel ) {
		build.d += 's ' + command.cx + ' ' + command.cy + ' ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'S ' + command.cx + ' ' + command.cy + ' ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.qCurve = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'q ' + command.cx + ' ' + command.cy + ' ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'Q ' + command.cx + ' ' + command.cy + ' ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.smoothQCurve = ( command , build ) => {
	if ( command.rel ) {
		build.d += 't ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'T ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

builders.arc = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'a ' + command.rx + ' ' + command.ry + ' ' + command.ra + ' ' + ( + command.la ) + ' '  + ( + command.pr ) + ' ' + command.x + ' ' + command.y ;
		build.cx += command.x ;
		build.cy += command.y ;
	}
	else {
		build.d += 'A ' + command.rx + ' ' + command.ry + ' ' + command.ra + ' ' + ( + command.la ) + ' '  + ( + command.pr ) + ' ' + command.x + ' ' + command.y ;
		build.cx = command.x ;
		build.cy = command.y ;
	}
} ;

// Turtle-like

builders.pen = ( command , build ) => {
	build.pu = command.u ;
} ;

builders.forward = ( command , build ) => {
	var dx = command.l * Math.cos( build.ca ) ,
		dy = command.l * Math.sin( build.ca ) ;
		
	if ( build.pu ) { build.d += 'm ' + dx + ' ' + dy ; }
	else { build.d += 'l ' + dx + ' ' + dy ; }
	
	build.cx += dx ;
	build.cy += dy ;
} ;

builders.turn = ( command , build ) => {
	if ( command.rel ) {
		build.ca += degToRad( command.a ) ;
	}
	else {
		build.ca = degToRad( command.a ) ;
	}
} ;

builders.forwardTurn = ( command , build ) => {
	/*
		We will first transpose to a circle of center 0,0 and we are starting at x=radius,y=0 and moving positively
	*/
	var angleRad = degToRad( command.a ) ,
		angleSign = angleRad >= 0 ? 1 : -1 ,
		alpha = Math.abs( angleRad ) ,
		radius = command.l / alpha ,
		trX = radius * Math.cos( alpha ) ,
		trY = radius * Math.sin( alpha ) ,
		dist = Math.sqrt( ( radius - trX ) ** 2 + trY ** 2 ) ,
		beta = Math.atan2( radius - trX , trY ) ;	// beta is the deviation
	
	var dx = dist * Math.cos( build.ca + angleSign * beta ) ,
		dy = dist * Math.sin( build.ca + angleSign * beta ) ;

	if ( build.pu ) {
		build.d += 'm ' + dx + ' ' + dy ;
	}
	else {
		build.d += 'a ' + radius + ' ' + radius + ' 0 ' + ( alpha > Math.PI ? 1 : 0 ) + ' '  + ( angleRad >= 0 ? 1 : 0 ) + ' ' + dx + ' ' + dy ;
	}

	build.cx += dx ;
	build.cy += dy ;
	build.ca += angleRad ;
} ;



/*
	First, true SVG path commands
*/

VGPath.prototype.close = function() {
	this.commands.push( { type: 'close' } ) ;
} ;

VGPath.prototype.move = function( data ) {
	this.commands.push( {
		type: 'move' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.moveTo = function( data ) {
	this.commands.push( {
		type: 'move' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.line = function( data ) {
	this.commands.push( {
		type: 'line' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.lineTo = function( data ) {
	this.commands.push( {
		type: 'line' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
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
} ;

VGPath.prototype.smoothCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
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
} ;

VGPath.prototype.qCurveTo = function( data ) {
	this.commands.push( {
		type: 'qCurve' ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothQCurve = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothQCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.arc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.arcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: - ( data.ra || data.a || 0 ) ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! ( data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: - ( data.ra || data.a || 0 ) ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! ( data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;



/*
	Turtle-like commands
*/

VGPath.prototype.penUp = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: true
	} ) ;
} ;

VGPath.prototype.penDown = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: false
	} ) ;
} ;

VGPath.prototype.forward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: typeof data === 'number' ? data : data.length || data.l || 0
	} ) ;
} ;

VGPath.prototype.backward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: - ( typeof data === 'number' ? data : data.length || data.l || 0 )
	} ) ;
} ;

// Turn using positive as X-axis to Y-axis
VGPath.prototype.turn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
} ;

// Turn from X-axis to Y-axis
VGPath.prototype.turnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
} ;

// Turn using positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeTurn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
} ;

// Turn from Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.negativeTurnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: 90 - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
} ;

// A turtle-like way of doing a curve: combine a forward and turn, moving along a circle
VGPath.prototype.forwardTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: data.angle || data.a || 0
	} ) ;
} ;

// Turn using positive as Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.forwardNegativeTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: - ( data.angle || data.a || 0 )
	} ) ;
} ;

