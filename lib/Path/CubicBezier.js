
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/



const Bezier = require( './Bezier.js' ) ;
const QuadraticBezier = require( './QuadraticBezier.js' ) ;
const BoundingBox = require( '../BoundingBox.js' ) ;
const { tValues , cValues , binomialCoefficients } = require( './bezier-values.json' ) ;



function CubicBezier( startPoint , startControl , endControl , endPoint ) {
	this.startPoint = startPoint ;
	this.startControl = startControl ;
	this.endControl = endControl ;
	this.endPoint = endPoint ;
	Bezier.call( this , startPoint , startControl , endControl , endPoint ) ;
}

module.exports = CubicBezier ;

CubicBezier.prototype = Object.create( Bezier.prototype ) ;
CubicBezier.prototype.constructor = CubicBezier ;



// The parametric formula for a given axis
function parametric( ps , t ) {
	const mt = 1 - t ;
	return ( mt * mt * mt * ps[0] ) + ( 3 * mt * mt * t * ps[1] ) + ( 3 * mt * t * t * ps[2] ) + ( t * t * t * ps[3] ) ;
}



CubicBezier.getPoint =
CubicBezier.prototype.getPoint = ( xs , ys , t ) => {
	return {
		x: parametric( xs , t ) ,
		y: parametric( ys , t )
	} ;
} ;



CubicBezier.getDerivative =
CubicBezier.prototype.getDerivative = ( xs , ys , t ) => {
	const derivative = QuadraticBezier.getPoint(
		[ 3 * ( xs[1] - xs[0] ) , 3 * ( xs[2] - xs[1] ) , 3 * ( xs[3] - xs[2] ) ] ,
		[ 3 * ( ys[1] - ys[0] ) , 3 * ( ys[2] - ys[1] ) , 3 * ( ys[3] - ys[2] ) ] ,
		t
	) ;
	return derivative ;
} ;



CubicBezier.getLength =
CubicBezier.prototype.getLength = ( xs , ys , t = 1 ) => {
	let z ;
	let sum ;
	let correctedT ;

	/*if (xs.length >= tValues.length) {
        throw new Error('too high n bezier');
      }*/

	const n = 20 ;

	z = t / 2 ;
	sum = 0 ;
	for ( let i = 0 ; i < n ; i ++ ) {
		correctedT = z * tValues[n][i] + z ;
		sum += cValues[n][i] * cubicIteration( xs , ys , correctedT ) ;
	}
	return z * sum ;
} ;



function cubicIteration( xs , ys , t ) {
	const xbase = getCurveDerivative( 1 , t , xs ) ;
	const ybase = getCurveDerivative( 1 , t , ys ) ;
	const combined = xbase * xbase + ybase * ybase ;
	return Math.sqrt( combined ) ;
}



// Compute the curve derivative (hodograph) at t.
function getCurveDerivative( derivative , t , vs ) {
	// the derivative of any 't'-less function is zero.
	const n = vs.length - 1 ;
	let _vs ;
	let value ;

	if ( n === 0 ) {
		return 0 ;
	}

	// direct values? compute!
	if ( derivative === 0 ) {
		value = 0 ;
		for ( let k = 0 ; k <= n ; k ++ ) {
			value +=
        binomialCoefficients[n][k] *
        Math.pow( 1 - t , n - k ) *
        Math.pow( t , k ) *
        vs[k] ;
		}
		return value ;
	}
	// Still some derivative? go down one order, then try
	// for the lower order curve's.
	_vs = new Array( n ) ;
	for ( let k = 0 ; k < n ; k ++ ) {
		_vs[k] = n * ( vs[k + 1] - vs[k] ) ;
	}

	return getCurveDerivative( derivative - 1 , t , _vs ) ;
}



// Derived from:For cubic bezier.
// https://stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve
CubicBezier.getBoundingBox =
CubicBezier.prototype.getBoundingBox = function( xs , ys ) {
	let tExtrema = [] ,
		xExtrema = [ xs[0] , xs[3] ] ,
		yExtrema = [ ys[0] , ys[3] ] ;

	getTExtrema( xs , tExtrema ) ;
	getTExtrema( ys , tExtrema ) ;

	for ( let t of tExtrema ) {
		xExtrema.push( parametric( xs , t ) ) ;
		yExtrema.push( parametric( ys , t ) ) ;
	}

	return new BoundingBox(
		Math.min( ... xExtrema ) ,
		Math.min( ... yExtrema ) ,
		Math.max( ... xExtrema ) ,
		Math.max( ... yExtrema )
	) ;
} ;

/* eslint-disable camelcase */
function getTExtrema( ps , tExtrema ) {
	let b = 6 * ps[0] - 12 * ps[1] + 6 * ps[2] ,
		a = - 3 * ps[0] + 9 * ps[1] - 9 * ps[2] + 3 * ps[3] ,
		c = 3 * ps[1] - 3 * ps[0] ;

	if ( Math.abs( a ) < 1e-12 ) {
		if ( Math.abs( b ) < 1e-12 ) { return ; }
		let t = - c / b ;
		if ( 0 < t && t < 1 ) { tExtrema.push( t ) ; }
		return ;
	}

	let b2ac = b * b - 4 * c * a ;

	if ( b2ac < 0 ) {
		if ( Math.abs( b2ac ) < 1e-12 ) {
			let t = - b / ( 2 * a ) ;
			if ( 0 < t && t < 1 ) { tExtrema.push( t ) ; }
		}
		return ;
	}

	let sqrt_b2ac = Math.sqrt( b2ac ) ;
	let t1 = ( - b + sqrt_b2ac ) / ( 2 * a ) ;
	if ( 0 < t1 && t1 < 1 ) { tExtrema.push( t1 ) ; }

	let t2 = ( - b - sqrt_b2ac ) / ( 2 * a ) ;
	if ( 0 < t2 && t2 < 1 ) { tExtrema.push( t2 ) ; }
}

