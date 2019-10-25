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



VGPath.prototype.svgTag = 'rect' ;

VGPath.prototype.svgAttributes = function() {
	var attr = {
		// That enigmatic SVG attribute 'd' means 'data', the path data:
		d: ''
	} ;

	return attr ;
} ;



VGPath.prototype.set = function( data ) {
	VGItem.prototype.set.call( this , data ) ;
} ;



// Build the SVG 'd' attribute
VGPath.prototype.toD = function() {
	var build = {
		d: '' ,
		//lc: null ,	// last SVG command
		cx: 0 ,		// cursor position x
		cy: 0 ,		// cursor position y
		ca: 0		// cursor angle
	} ;
	
	this.commands.forEach( ( command , index ) => {
		if ( index ) { build.d += ' ' ; }
		builders[ command.type ]( command , build ) ;
	} ) ;
	
	return build.d ;
} ;

const builders = {} ;

builders.close = ( command , build ) => {
	build.d += 'z' ;
	//build.lc = 'z' ;
} ;

builders.move = ( command , build ) => {
	if ( command.rel ) {
		build.d += 'm ' + command.x + ' ' + command.y ;
		//build.lc = 'm' ;
		build.cx += command.x ;
		build.cy += command.y ;
		// Also change the angle?
	}
	else {
		build.d += 'M ' + command.x + ' ' + command.y ;
		//build.lc = 'm' ;
		build.cx = command.x ;
		build.cy = command.y ;
		// Also change the angle?
	}
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
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
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
		a: data.angle || data.a || 0 ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		cw: data.clockwise !== undefined ? !! data.clockwise :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term, but it is ambiguous, we prefer clockwise
			data.cw !== undefined ? !! data.cw :
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
		a: data.angle || data.a || 0 ,	// x-axis rotation
		la: data.largeArc !== undefined ? !! data.largeArc :
			data.la !== undefined ? !! data.la :
			false ,
		cw: data.clockwise !== undefined ? !! data.clockwise :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term, but it is ambiguous, we prefer clockwise
			data.cw !== undefined ? !! data.cw :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;



/*
	Turtle-like commands
*/

VGPath.prototype.forward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: typeof data === 'number' ? data : data.length || data.l || 0
	} ) ;
} ;

VGPath.prototype.turn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
} ;

