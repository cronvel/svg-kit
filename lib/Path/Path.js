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



const Move = require( './Move.js' ) ;
const Line = require( './Line.js' ) ;
const CubicBezier = require( './CubicBezier.js' ) ;
const QuadraticBezier = require( './QuadraticBezier.js' ) ;
const Arc = require( './Arc.js' ) ;



function Path( commands ) {
	this.commands = [] ;
	this.computedCurves = [] ;

	if ( commands ) { this.set( commands ) ; }
}

module.exports = Path ;

Path.prototype.__prototypeUID__ = 'svg-kit/Path' ;
Path.prototype.__prototypeVersion__ = require( '../../package.json' ).version ;



Path.prototype.set = function( commands ) {
	if ( ! Array.isArray( commands ) ) { return ; }

	for ( let command of commands ) {
		if ( Path.commands[ command.type ].add ) {
			Path.commands[ command.type ].add( this.commands , command ) ;
		}
	}
} ;



Path.prototype.export = function( data = {} ) {
	if ( this.commands.length ) { data.commands = this.commands ; }
	return data ;
} ;



/*
	This method is used to build the SVG 'd' attribute from the SVG Kit's command format.
*/

Path.prototype.toD = function( invertY = false ) {
	return Path.commandsToD( this.commands , invertY )  ;
} ;

Path.commandsToD = ( commands , invertY = false ) => {
	var build = {
		invertY ,
		d: '' ,
		pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
		cx: 0 ,		// cursor position x
		cy: 0 ,		// cursor position y
		ca: invertY ? - Math.PI / 2 : Math.PI / 2		// cursor angle, default to positive Y-axis
	} ;

	commands.forEach( ( command , index ) => {
		if ( ! Path.commands[ command.type ].toD ) { return ; }
		if ( index ) { build.d += ' ' ; }
		Path.commands[ command.type ].toD( command , build ) ;
	} ) ;

	return build.d ;
} ;



Path.prototype.computeCurves = function( invertY = false ) {
	return Path.computeCurves( this.commands , this.computedCurves , invertY )  ;
} ;

Path.computeCurves = ( commands , curves = [] , invertY = false ) => {
	var build = {
		invertY ,
		lastCurve: null ,
		start: { x: 0 , y: 0 } ,	// the last start after a move, used for the 'z' .close() command
		pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
		ca: invertY ? - Math.PI / 2 : Math.PI / 2		// cursor angle, default to positive Y-axis
	} ;

	for ( let i = curves.length ; i < commands.length ; i ++ ) {
		let curve ,
			command = commands[ i ] ;

		if ( Path.commands[ command.type ].toCurve ) {
			curve = Path.commands[ command.type ].toCurve( command , build ) ;
		}
		else {
			curve = null ;
		}

		if ( curve ) {
			if ( curve instanceof Move ) { build.start = curve.endPoint ; }
			build.lastCurve = curve ;
		}

		curves[ i ] = curve ;
	}

	return curves ;
} ;



/*
	Now add path commands.
	First, true SVG path commands.
*/

const degToRad = deg => deg * Math.PI / 180 ;
const ORIGIN = { x: 0 , y: 0 } ;
//const radToDeg = rad => rad * 180 / Math.PI ;

Path.commands = {} ;

Path.commands.close = {
	add: ( commands ) => commands.push( { type: 'close' } ) ,
	toD: ( command , build ) => build.d += 'z' ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;
		
		return new Line(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: build.start.x , y: build.start.y }
		) ;
	}
} ;

Path.commands.move = {
	add: ( commands , data ) => commands.push( {
		type: 'move' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 'm ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'M ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new Move(
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'move' (rel: false)
Path.commands.moveTo = {
	add: ( commands , data ) => commands.push( {
		type: 'move' ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

Path.commands.line = {
	add: ( commands , data ) => commands.push( {
		type: 'line' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 'l ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'L ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;
		
		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new Line(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'line' (rel: false)
Path.commands.lineTo = {
	add: ( commands , data ) => commands.push( {
		type: 'line' ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

Path.commands.hLine = {
	add: ( commands , data ) => commands.push( {
		type: 'hLine' ,
		rel: true ,
		x: data.x || 0
	} ) ,
	toD: ( command , build ) => {
		if ( command.rel ) {
			build.d += 'h ' + command.x ;
			build.cx += command.x ;
		}
		else {
			build.d += 'H ' + command.x ;
			build.cx = command.x ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let ox = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; }

		return new Line(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: ox + command.x , y: lastPoint.y }
		) ;
	}
} ;

// Converted to 'hLine' (rel: false)
Path.commands.hLineTo = {
	add: ( commands , data ) => commands.push( {
		type: 'hLine' ,
		x: data.x || 0
	} )
} ;

Path.commands.vLine = {
	add: ( commands , data ) => commands.push( {
		type: 'vLine' ,
		rel: true ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 'l ' + y ;
			build.cy += y ;
		}
		else {
			build.d += 'L ' + y ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let oy = 0 ;
		if ( command.rel ) { oy = lastPoint.y ; }

		return new Line(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: lastPoint.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'vLine' (rel: false)
Path.commands.vLineTo = {
	add: ( commands , data ) => commands.push( {
		type: 'vLine' ,
		y: data.y || 0
	} )
} ;

Path.commands.curve = {
	add: ( commands , data ) => commands.push( {
		type: 'curve' ,
		rel: true ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let cy1 = build.invertY ? - command.cy1 : command.cy1 ,
			cy2 = build.invertY ? - command.cy2 : command.cy2 ,
			y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 'c ' + command.cx1 + ' ' + cy1 + ' ' + command.cx2 + ' ' + cy2 + ' '  + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'C ' + command.cx1 + ' ' + cy1 + ' ' + command.cx2 + ' ' + cy2 + ' '  + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new CubicBezier(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: ox + command.cx1 , y: oy + command.cy1 } ,
			{ x: ox + command.cx2 , y: oy + command.cy2 } ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'curve'
Path.commands.curveTo = {
	add: ( commands , data ) => commands.push( {
		type: 'curve' ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

Path.commands.smoothCurve = {
	add: ( commands , data ) => commands.push( {
		type: 'smoothCurve' ,
		rel: true ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let cy = build.invertY ? - command.cy : command.cy ,
			y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 's ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'S ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;
		let lastControl = build.lastCurve && ( build.lastCurve instanceof CubicBezier ) ? build.lastCurve.endControl : lastPoint ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new CubicBezier(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: 2 * lastPoint.x - lastControl.x , y: 2 * lastPoint.y - lastControl.y } ,
			{ x: ox + command.cx , y: oy + command.cy } ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'smoothCurve'
Path.commands.smoothCurveTo = {
	add: ( commands , data ) => commands.push( {
		type: 'smoothCurve' ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

// q-curve = Quadratic curve, it uses just one controle point instead of two
Path.commands.qCurve = {
	add: ( commands , data ) => commands.push( {
		type: 'qCurve' ,
		rel: true ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let cy = build.invertY ? - command.cy : command.cy ,
			y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 'q ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'Q ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new QuadraticBezier(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: ox + command.cx1 , y: oy + command.cy1 } ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'qCurve'
Path.commands.qCurveTo = {
	add: ( commands , data ) => commands.push( {
		type: 'qCurve' ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

Path.commands.smoothQCurve = {
	add: ( commands , data ) => commands.push( {
		type: 'smoothQCurve' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ,
	toD: ( command , build ) => {
		let y = build.invertY ? - command.y : command.y ;

		if ( command.rel ) {
			build.d += 't ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'T ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;
		let lastControl = build.lastCurve && ( build.lastCurve instanceof QuadraticBezier ) ? build.lastCurve.control : lastPoint ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new QuadraticBezier(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: 2 * lastPoint.x - lastControl.x , y: 2 * lastPoint.y - lastControl.y } ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'smoothQCurve'
Path.commands.smoothQCurveTo = {
	add: ( commands , data ) => commands.push( {
		type: 'smoothQCurve' ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

Path.commands.arc = {
	add: ( commands , data ) => commands.push( {
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
	} ) ,
	toD: ( command , build ) => {
		if ( command.rel ) {
			build.d += 'a ' + command.rx + ' ' + command.ry + ' ' + ra + ' ' + ( + command.la ) + ' '  + ( + pr ) + ' ' + command.x + ' ' + y ;
			build.cx += command.x ;
			build.cy += y ;
		}
		else {
			build.d += 'A ' + command.rx + ' ' + command.ry + ' ' + ra + ' ' + ( + command.la ) + ' '  + ( + pr ) + ' ' + command.x + ' ' + y ;
			build.cx = command.x ;
			build.cy = y ;
		}
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;
		let lastControl = build.lastCurve && ( build.lastCurve instanceof QuadraticBezier ) ? build.lastCurve.control : lastPoint ;

		let ox = 0 , oy = 0 ;
		if ( command.rel ) { ox = lastPoint.x ; oy = lastPoint.y ; }

		return new Arc(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: command.rx , y: command.ry } ,
			command.ra ,
			command.la ,
			command.pr ,
			{ x: ox + command.x , y: oy + command.y }
		) ;
	}
} ;

// Converted to 'arc'
Path.commands.arcTo = {
	add: ( commands , data ) => commands.push( {
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
	} )
} ;

// Converted to 'arc'
// All angles use positive as Y-axis to X-axis (Spellcast usage)
Path.commands.negativeArc = {
	add: ( commands , data ) => commands.push( {
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
	} )
} ;

// Converted to 'arc'
// All angles use positive as Y-axis to X-axis (Spellcast usage)
Path.commands.negativeArcTo = {
	add: ( commands , data ) => commands.push( {
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
	} )
} ;



/*
	VG-specific commands.
*/

// NOT CODED
// Better arc-like command, but use curve behind the scene
Path.commands.centerArc = {
	add: ( commands , data ) => commands.push( {
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
	} ) ,
	toD: ( command , build ) => {
		// ---------------------------------------------------------------------------------- NOT CODED ----------------------------------------------------------------

		// It's supposed to ease circle creation inside path, converting them to SVG curves...

		let { x , y , cx , cy } = command ;

		if ( command.rel ) {
			x += build.cx ;
			y += build.cy ;
			cx += build.cx ;
			cy += build.cy ;
		}

		let startAngle = Math.atan2( build.cy - cy , build.cx - cx ) ,
			endAngle = Math.atan2( y - cy , x - cx ) ;

		build.cx = x ;
		build.cy = y ;
	}
} ;

// NOT CODED
// Converted to 'centerArc'
Path.commands.centerArcTo = {
	add: ( commands , data ) => commands.push( {
		type: 'centerArc' ,
		cx: data.cx || 0 ,
		cy: data.cy || 0 ,
		la: data.largeArc !== undefined ? !! data.largeArc :
		data.longArc !== undefined ? !! data.longArc :
		data.la !== undefined ? !! data.la :
		false ,
		x: data.x || 0 ,
		y: data.y || 0
	} )
} ;

/*
	Approximation of circles using cubic bezier curves.

	Controle point distance/radius ratio for quarter of circle: 0.55228475 or 4/3 (sqrt(2)-1)
	For half of a circle: 4/3

	From: https://www.tinaja.com/glib/bezcirc2.pdf
	The arc is bissected by the X-axis.
	x0 = cos( / 2)			y0 = sin( / 2)
	x3 = x1					y3 = - y0
	x1 = (4 - x0) / 3		y1 = (1 - x0)(3 - x0) / 3 y0
	x2 = x1					y2 = -y1

	This distance ensure that the mid-time point is exactly on the arc.
	It works very well for angle ranging from 0-90°, can be good enough for 90-180°,
	but it's bad for greater than 180°.
	In fact it's not possible to approximate a 270° arc with a single cubic bezier curve.
*/
function controleDistance( angle ) {
	if ( ! angle ) { return 0 ; }
	let angleRad = degToRad( angle ) ;
	let x0 = Math.cos( angleRad / 2 ) ,
		y0 = Math.sin( angleRad / 2 ) ,
		x1 = ( 4 - x0 ) / 3 ,
		y1 = ( 1 - x0 ) * ( 3 - x0 ) / ( 3 * y0 ) ;
	return Math.sqrt( ( x0 - x1 ) ** 2 + ( y0 - y1 ) ** 2 ) ;
}



/*
	Turtle-like commands.
*/

// Not a user command, user should use penUp or penDown
Path.commands.pen = {
	add: ( commands , data ) => commands.push( {
		type: 'pen' ,
		u: !! data.up
	} ) ,
	toD: ( command , build ) => {
		build.pu = command.u ;
	} ,
	toCurve: ( command , build ) => {
		build.pu = command.u ;
	}
} ;

// Converted to 'pen'
Path.commands.penUp = {
	add: ( commands ) => commands.push( {
		type: 'pen' ,
		u: true
	} )
} ;

// Converted to 'pen'
Path.commands.penDown = {
	add: ( commands ) => commands.push( {
		type: 'pen' ,
		u: false
	} )
} ;

Path.commands.forward = {
	add: ( commands , data ) => commands.push( {
		type: 'forward' ,
		l: typeof data === 'number' ? data : data.length || data.l || 0
	} ) ,
	toD: ( command , build ) => {
		let dx = command.l * Math.cos( build.ca ) ,
			dy = command.l * Math.sin( build.ca ) ;

		if ( build.pu ) { build.d += 'm ' + dx + ' ' + dy ; }
		else { build.d += 'l ' + dx + ' ' + dy ; }

		build.cx += dx ;
		build.cy += dy ;
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

		let dx = command.l * Math.cos( build.ca ) ,
			dy = command.l * Math.sin( build.ca ) ;

		if ( build.pu ) {
			return new Move( { x: lastPoint.x + dx , y: lastPoint.y + dy } ) ;
		}
		
		return new Line(
			{ x: lastPoint.x , y: lastPoint.y } ,
			{ x: lastPoint.x + dx , y: lastPoint.y + dy }
		) ;
	}
} ;

// Converted to 'forward'
Path.commands.backward = {
	add: ( commands , data ) => commands.push( {
		type: 'forward' ,
		l: - ( typeof data === 'number' ? data : data.length || data.l || 0 )
	} )
} ;

// Turn using positive as X-axis to Y-axis
Path.commands.turn = {
	add: ( commands , data ) => commands.push( {
		type: 'turn' ,
		rel: true ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ,
	toD: ( command , build ) => {
		let a = build.invertY ? - command.a : command.a ;

		if ( command.rel ) {
			build.ca += degToRad( a ) ;
		}
		else {
			build.ca = degToRad( a ) ;
		}
	} ,
	toCurve: ( command , build ) => {
		let a = build.invertY ? - command.a : command.a ;

		if ( command.rel ) {
			build.ca += degToRad( a ) ;
		}
		else {
			build.ca = degToRad( a ) ;
		}
	}
} ;

// Converted to 'turn'
// Turn from X-axis to Y-axis
Path.commands.turnTo = {
	add: ( commands , data ) => commands.push( {
		type: 'turn' ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} )
} ;

// Converted to 'turn'
// Turn using positive as Y-axis to X-axis (Spellcast usage)
Path.commands.negativeTurn = {
	add: ( commands , data ) => commands.push( {
		type: 'turn' ,
		rel: true ,
		a: - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} )
} ;

// Converted to 'turn'
// Turn from Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
Path.commands.negativeTurnTo = {
	add: ( commands , data ) => commands.push( {
		type: 'turn' ,
		a: 90 - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} )
} ;

// A turtle-like way of doing a curve: combine a forward and turn, moving along a circle
Path.commands.forwardTurn = {
	add: ( commands , data ) => commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: data.angle || data.a || 0
	} ) ,
	toD: ( command , build ) => {
		let a = build.invertY ? - command.a : command.a ;

		/*
			We will first transpose to a circle of center 0,0 and we are starting at x=radius,y=0 and moving positively
		*/
		let angleRad = degToRad( a ) ,
			angleSign = angleRad >= 0 ? 1 : - 1 ,
			alpha = Math.abs( angleRad ) ,
			radius = command.l / alpha ,
			trX = radius * Math.cos( alpha ) ,
			trY = radius * Math.sin( alpha ) ,
			dist = Math.sqrt( ( radius - trX ) ** 2 + trY ** 2 ) ,
			beta = Math.atan2( radius - trX , trY ) ;	// beta is the deviation

		let dx = dist * Math.cos( build.ca + angleSign * beta ) ,
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
	}
} ;

// Converted to 'forwardTurn'
// Turn using positive as Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
Path.commands.forwardNegativeTurn = {
	add: ( commands , data ) => commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: - ( data.angle || data.a || 0 )
	} )
} ;



// Create API methods
for ( let type in Path.commands ) {
	if ( Path.commands[ type ].add ) {
		Path.prototype[ type ] = function( data ) {
			Path.commands[ type ].add( this.commands , data ) ;
			return this ;
		} ;
	}
}



// Utilities

// Create lines from an array of points (object with .x and .y)
Path.linePointsToD = ( points , invertY = false ) => {
	let yMul = invertY ? - 1 : 1 ,
		str = 'M' ;

	points.forEach( point => {
		str += ' ' + point.x + ',' + ( point.y * yMul ) ;
	} ) ;

	return str ;
} ;

Path.polygonPointsToD = ( points , invertY = false ) => Path.linePointsToD( points , invertY ) + ' z' ;

