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



function Path( commands , invertY = false ) {
	this.commands = [] ;
	this.invertY = invertY ;

	this.computeCurvesBuild = null ;
	this.curves = [] ;
	this.totalLength = 0 ;

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
	if ( this.commands.length ) { data.commands = this.commands.map( command => Object.assign( {} , command ) ) ; }
	return data ;
} ;



Path.prototype.setInvertY = function( invertY ) {
	this.invertY = !! invertY ;
	this.clearComputed() ;
} ;



Path.prototype.clearComputed = function() {
	this.computeCurvesBuild = null ;
	this.curves.length = 0 ;
	this.totalLength = 0 ;
} ;



/*
	This method is used to build the SVG 'd' attribute from the SVG Kit's command format.
*/

Path.prototype.toD = function() {
	return Path.commandsToD( this.commands , this.invertY )  ;
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



Path.prototype.computeCurves = function() {
	if ( this.computeCurvesBuild && this.computeCurvesBuild.next >= this.commands.length ) { return ; }

	if ( ! this.computeCurvesBuild ) {
		this.computeCurvesBuild = {
			next: 0 ,
			invertY: this.invertY ,
			lastCurve: null ,
			openPoint: { x: 0 , y: 0 } ,	// The point the .close() command close to
			pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
			ca: this.invertY ? - Math.PI / 2 : Math.PI / 2		// cursor angle, default to positive Y-axis
		} ;
	}

	for ( ; this.computeCurvesBuild.next < this.commands.length ; this.computeCurvesBuild.next ++ ) {
		let command = this.commands[ this.computeCurvesBuild.next ] ;

		if ( Path.commands[ command.type ].toCurve ) {
			let curve = Path.commands[ command.type ].toCurve( command , this.computeCurvesBuild ) ;

			if ( curve ) {
				if ( curve instanceof Move ) {
					this.computeCurvesBuild.openPoint = { x: curve.endPoint.x , y: curve.endPoint.y } ;
				}
				else {
					this.totalLength += curve.length ;
				}

				this.computeCurvesBuild.lastCurve = curve ;
				this.curves.push( curve ) ;
			}
		}
	}
} ;



Path.prototype.getLength = function() {
	this.computeCurves() ;
	return this.totalLength ;
} ;



Path.prototype.getPointAtLength = function( length , extraData = false ) {
	this.computeCurves() ;

	if ( length < 0 ) { length = 0 ; }
	else if ( length > this.totalLength ) { length = this.totalLength ; }

	var lastCurve = null ,
		remainingLength = length ;

	for ( let curve of this.curves ) {
		if ( curve ) {
			if ( ! ( curve instanceof Move ) ) {
				if ( remainingLength <= curve.length ) {
					return extraData ? curve.getPropertiesAtLength( remainingLength ) : curve.getPointAtLength( remainingLength ) ;
				}

				remainingLength -= curve.length ;
			}

			lastCurve = curve ;
		}
	}

	// Nothing found? Return the endPoint of the last curve
	if ( ! lastCurve ) {
		return extraData ? { x: 0 , y: 0 , dx: 0 , dy: 0 } : { x: 0 , y: 0 } ;	// eslint-disable-line object-curly-newline
	}

	if ( lastCurve instanceof Move ) {
		return extraData ? { x: lastCurve.endPoint.x , y: lastCurve.endPoint.y , dx: 0 , dy: 0 } : { x: lastCurve.endPoint.x , y: lastCurve.endPoint.y } ;	// eslint-disable-line object-curly-newline
	}

	// Due to floating point error, it is possible that length = totalLength  overflow
	// This will prevent this
	return extraData ? lastCurve.getPropertiesAtLength( lastCurve.length ) : lastCurve.getPointAtLength( lastCurve.length ) ;
} ;



// Split on Move curve, grouping by shapes (closed or not)
Path.prototype.groupCurvesByShape = function() {
	var group = [] ,
		groupList = [] ;

	for ( let curve of this.curves ) {
		if ( curve instanceof Move ) {
			if ( group.length ) {
				groupList.push( group ) ;
				group = [] ;
			}
		}
		else {
			group.push( curve ) ;
		}
	}

	if ( group.length ) { groupList.push( group ) ; }

	return groupList ;
} ;



/*
	Options:
		forceKeyPoints: boolean, if true: always add points at the begining and at the end of a path's part (aka 'cusp')
		angleThreshold: if set, only add the point if its tangent angle has moved more than this threshold (in radian)
		angleThresholdDeg: the same than angleThreshold, but angle is in degree
*/
Path.prototype.getPoints = function( everyLength , options = {} ) {
	var forceKeyPoints = !! options.forceKeyPoints ,
		angleThreshold = options.angleThresholdDeg !== undefined ? degToRad( + options.angleThresholdDeg || 0 ) : + options.angleThreshold || 0 ,
		simplifyLines = !! angleThreshold ,
		pointsGroups = [] ;

	this.computeCurves() ;
	
	var length = 0 ,
		lengthRemainder = 0 ;

	for ( let group of this.groupCurvesByShape() ) {
		let data = this.getPointsOfShape( group , everyLength , forceKeyPoints , length , lengthRemainder , simplifyLines ) ;
		pointsGroups.push( data.points ) ;
		length = data.endingLength ;
		lengthRemainder = data.lengthRemainder ;
	}
	
	if ( angleThreshold ) {
		for ( let points of pointsGroups ) {
			this.simplifyShape( points , angleThreshold ) ;
		}
	}
	
	console.warn( "getPoints():" , pointsGroups.flat() ) ;
	return options.groupShape ? pointsGroups : pointsGroups.flat() ;
} ;



Path.prototype.getPointsOfShape = function( curveList , everyLength , forceKeyPoints , startingLength , lengthRemainder , simplifyLines ) {
	var pointList = [] ,
		lastPoint = null ,
		lengthUpToLastCurve = startingLength ,
		lastCurveRemainder = lengthRemainder ;

	for ( let curve of curveList ) {
		let startPoint = curve.getPropertiesAtLength( 0 ) ;

		if ( ! lastPoint ) {
			startPoint.atLength = lengthUpToLastCurve ;
			startPoint.startShape = true ;
			if ( forceKeyPoints ) { startPoint.keyPoint = true ; }
			pointList.push( startPoint ) ;
			lastPoint = startPoint ;
		}
		else {
			lastPoint.nextAngle = startPoint.angle ;
		}

		if ( forceKeyPoints ) {
			let point ,
				lengthInCurve = everyLength ,
				subdivision = Math.round( curve.length / everyLength ) || 1 ,
				everyCurveLength = curve.length / subdivision ;

			if ( ! simplifyLines || ! ( curve instanceof Line ) ) {
				for ( let i = 1 ; i < subdivision ; i ++ , lengthInCurve += everyCurveLength ) {
					point = curve.getPropertiesAtLength( lengthInCurve ) ;
					point.atLength = lengthUpToLastCurve + lengthInCurve ;
					pointList.push( point ) ;
					lastPoint = point ;
				}
			}

			// Special case for the end of the curve, we want to avoid floating point errors
			point = curve.getPropertiesAtLength( curve.length ) ;
			point.atLength = lengthUpToLastCurve + curve.length ;
			point.keyPoint = true ;
			pointList.push( point ) ;
			lastPoint = point ;
			lengthUpToLastCurve += curve.length ;
		}
		else {
			let lastLengthInCurve ,
				lengthInCurve = everyLength - lastCurveRemainder ;

			for ( ; lengthInCurve <= curve.length ; lengthInCurve += everyLength ) {
				let point = curve.getPropertiesAtLength( lengthInCurve ) ;
				point.atLength = lengthUpToLastCurve + lengthInCurve ;
				lastLengthInCurve = lengthInCurve ;
				pointList.push( point ) ;
				lastPoint = point ;
			}

			lengthUpToLastCurve += curve.length ;
			lastCurveRemainder = curve.length - lastLengthInCurve ;
		}
	}
	
	lastPoint.endShape = true ;
	
	return {
		points: pointList ,
		endingLength: lengthUpToLastCurve ,
		lengthRemainder: lastCurveRemainder
	} ;
} ;



function threePointsAngle( pointList , previousIndex , index , nextIndex ) {
	let angle ,
		previousPoint = pointList[ previousIndex ] ,
		point = pointList[ index ] ,
		nextPoint = pointList[ nextIndex ] ,
		previousDirection = Math.atan2( point.x - previousPoint.x , point.y - previousPoint.y ) ,
		nextDirection = Math.atan2( nextPoint.x - point.x , nextPoint.y - point.y ) ;
	
	// Absolute value of the angle
	angle = Math.abs( ( previousDirection - nextDirection ) % ( 2 * Math.PI ) ) ;
	angle = angle <= Math.PI ? angle : 2 * Math.PI - angle ;
	return angle ;
}

Path.prototype.simplifyShape = function( pointList , angleThreshold ) {
	var simplified = true ;

	// We need a multi-pass approch here, doing it in one-shot will produce multiple consecutive points stripped
	// and 2 consecutive points non-stripped, and so on... The previous lines eat all the “angle capital”.
	// The removal is badly distributed.
	// That's why a single pass should not remove consecutive points.
	while ( simplified ) {
		simplified = false ;

		for ( let index = 1 ; index <= pointList.length - 2 ; index ++ ) {
			// Do not remove key-points
			if ( ! pointList[ index ].keyPoint ) {
				let angle = threePointsAngle( pointList , index - 1 , index , index + 1 ) ;
				console.warn( "Angle:" , radToRoundedDeg( angle ) ) ;

				if ( angle < angleThreshold ) {
					// Now we will remove this point ONLY if the angle before and after are not
					let angleBefore = index >= 2 ? threePointsAngle( pointList , index - 2 , index - 1 , index + 1 ) : 0 ;
					let angleAfter = index <= pointList.length - 3 ? threePointsAngle( pointList , index - 1 , index + 1 , index + 2 ) : 0 ;
					console.log( "Angle before/after:" , radToRoundedDeg( angleBefore ) , radToRoundedDeg( angleAfter ) ) ;

					if ( angleBefore <= angleThreshold && angleAfter <= angleThreshold ) {
						console.log( "==> remove it!" ) ;
						pointList.splice( index , 1 ) ;
						simplified = true ;
						//index -- ;	// Can't do that, we need a mutli-pass approch
					}
				}
			}
		}
	}
} ;



/*
	Now add path commands.
	First, true SVG path commands.
*/

const degToRad = deg => deg * Math.PI / 180 ;
const radToDeg = rad => rad * 180 / Math.PI ;
const radToRoundedDeg = rad => Math.round( rad * 180 / Math.PI ) ;
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
			{ x: build.openPoint.x , y: build.openPoint.y }
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
		let ra = build.invertY ? - command.ra : command.ra ,
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
	} ,
	toCurve: ( command , build ) => {
		let lastPoint = build.lastCurve ? build.lastCurve.endPoint : ORIGIN ;

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

