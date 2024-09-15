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



const degToRad = deg => deg * Math.PI / 180 ;
const radToDeg = rad => rad * 180 / Math.PI ;



const pathUtilities = {} ;
module.exports = pathUtilities ;



// Create lines from an array of points (object with .x and .y)
pathUtilities.linePointsToD = ( points , invertY = false ) => {
	var yMul = invertY ? - 1 : 1 ,
		str = 'M' ;

	points.forEach( point => {
		str += ' ' + point.x + ',' + ( point.y * yMul ) ;
	} ) ;

	return str ;
} ;

pathUtilities.polygonPointsToD = ( points , invertY = false ) => pathUtilities.linePointsToD( points , invertY ) + ' z' ;



/*
	This part is used to build the SVG 'd' attribute from the SVG Kit's command format.
*/

pathUtilities.commandsToD = ( commands , invertY = false ) => {
	var build = {
		invertY ,
		d: '' ,
		pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
		cx: 0 ,		// cursor position x
		cy: 0 ,		// cursor position y
		ca: invertY ? - Math.PI / 2 : Math.PI / 2		// cursor angle, default to positive Y-axis
	} ;

	commands.forEach( ( command , index ) => {
		if ( index ) { build.d += ' ' ; }
		builders[ command.type ]( command , build ) ;
	} ) ;

	return build.d ;
} ;



const builders = pathUtilities.builders = {} ;

builders.close = ( command , build ) => {
	build.d += 'z' ;
} ;

builders.move = ( command , build ) => {
	var y = build.invertY ? - command.y : command.y ;

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
} ;

builders.line = ( command , build ) => {
	var y = build.invertY ? - command.y : command.y ;

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
} ;

builders.curve = ( command , build ) => {
	var cy1 = build.invertY ? - command.cy1 : command.cy1 ,
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
} ;

builders.smoothCurve = ( command , build ) => {
	var cy = build.invertY ? - command.cy : command.cy ,
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
} ;

builders.qCurve = ( command , build ) => {
	var cy = build.invertY ? - command.cy : command.cy ,
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
} ;

builders.smoothQCurve = ( command , build ) => {
	var y = build.invertY ? - command.y : command.y ;

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
} ;

builders.arc = ( command , build ) => {
	var ra = build.invertY ? - command.ra : command.ra ,
		pr = build.invertY ? ! command.pr : command.pr ,
		y = build.invertY ? - command.y : command.y ;

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
} ;

// VG-specific

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
	var angleRad = degToRad( angle ) ;
	var x0 = Math.cos( angleRad / 2 ) ,
		y0 = Math.sin( angleRad / 2 ) ,
		x1 = ( 4 - x0 ) / 3 ,
		y1 = ( 1 - x0 ) * ( 3 - x0 ) / ( 3 * y0 ) ;
	return Math.sqrt( ( x0 - x1 ) ** 2 + ( y0 - y1 ) ** 2 ) ;
}

builders.centerArc = ( command , build ) => {

	// ---------------------------------------------------------------------------------- NOT CODED ----------------------------------------------------------------

	// It's supposed to ease circle creation inside path, converting them to SVG curves...

	var { x , y , cx , cy } = command ;

	if ( command.rel ) {
		x += build.cx ;
		y += build.cy ;
		cx += build.cx ;
		cy += build.cy ;
	}

	var startAngle = Math.atan2( build.cy - cy , build.cx - cx ) ,
		endAngle = Math.atan2( y - cy , x - cx ) ;

	build.cx = x ;
	build.cy = y ;
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
	var a = build.invertY ? - command.a : command.a ;

	if ( command.rel ) {
		build.ca += degToRad( a ) ;
	}
	else {
		build.ca = degToRad( a ) ;
	}
} ;

builders.forwardTurn = ( command , build ) => {
	var a = build.invertY ? - command.a : command.a ;

	/*
		We will first transpose to a circle of center 0,0 and we are starting at x=radius,y=0 and moving positively
	*/
	var angleRad = degToRad( a ) ,
		angleSign = angleRad >= 0 ? 1 : - 1 ,
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

