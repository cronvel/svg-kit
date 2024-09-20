
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/

function Bezier( a , b , c , d = null ) {
	this.a = a ;
	this.b = b ;
	this.c = c ;

	if ( d ) {
		// Cubic
		this.d = d ;
		this.isCubic = true ;
		this.getArcLength = Bezier.getCubicArcLength ;
		this.getPoint = Bezier.getCubicPoint ;
		this.getDerivative = Bezier.getCubicDerivative ;
	}
	else {
		// Quadratic
		this.d = { x: 0 , y: 0 } ;
		this.isCubic = false ;
		this.getArcLength = Bezier.getQuadraticArcLength ;
		this.getPoint = Bezier.getQuadraticPoint ;
		this.getDerivative = Bezier.getQuadraticDerivative ;
	}

	this.length = this.getArcLength(
		[ this.a.x , this.b.x , this.c.x , this.d.x ] ,
		[ this.a.y , this.b.y , this.c.y , this.d.y ] ,
		1
	) ;
}

module.exports = Bezier ;



Bezier.prototype.getStartPoint = function() { return this.a ; }
Bezier.prototype.getEndPoint = function() { return this.isCubic ? this.d : this.c ; }



Bezier.prototype.getPointAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const xy = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , xy , i ) ) ;

	return this.getPoint( xs , xy , t ) ;
} ;



Bezier.prototype.getTangentAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const xy = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , xy , i ) ) ;

	const derivative = this.getDerivative( xs , xy , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;
	let tangent ;
	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}
	return tangent ;
} ;



Bezier.prototype.getPropertiesAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const xy = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , xy , i ) ) ;

	const derivative = this.getDerivative( xs , xy , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;
	let tangent ;
	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}
	const point = this.getPoint( xs , xy , t ) ;
	return {
		x: point.x , y: point.y , tangentX: tangent.x , tangentY: tangent.y
	} ;
} ;



const { tValues , cValues , binomialCoefficients } = require( './bezier-values.json' ) ;



Bezier.getQuadraticPoint = ( xs , ys , t ) => {
	const x = ( 1 - t ) * ( 1 - t ) * xs[0] + 2 * ( 1 - t ) * t * xs[1] + t * t * xs[2] ;
	const y = ( 1 - t ) * ( 1 - t ) * ys[0] + 2 * ( 1 - t ) * t * ys[1] + t * t * ys[2] ;
	return { x: x , y: y } ;
} ;



Bezier.getQuadraticDerivative = ( xs , ys , t ) => {
	return {
		x: ( 1 - t ) * 2 * ( xs[1] - xs[0] ) + t * 2 * ( xs[2] - xs[1] ) ,
		y: ( 1 - t ) * 2 * ( ys[1] - ys[0] ) + t * 2 * ( ys[2] - ys[1] )
	} ;
} ;



Bezier.getQuadraticArcLength = ( xs , ys , t ) => {
	if ( t === undefined ) {
		t = 1 ;
	}
	const ax = xs[0] - 2 * xs[1] + xs[2] ;
	const ay = ys[0] - 2 * ys[1] + ys[2] ;
	const bx = 2 * xs[1] - 2 * xs[0] ;
	const by = 2 * ys[1] - 2 * ys[0] ;

	const A = 4 * ( ax * ax + ay * ay ) ;
	const B = 4 * ( ax * bx + ay * by ) ;
	const C = bx * bx + by * by ;

	if ( A === 0 ) {
		return (
			t * Math.sqrt( Math.pow( xs[2] - xs[0] , 2 ) + Math.pow( ys[2] - ys[0] , 2 ) )
		) ;
	}
	const b = B / ( 2 * A ) ;
	const c = C / A ;
	const u = t + b ;
	const k = c - b * b ;

	const uuk = u * u + k > 0 ? Math.sqrt( u * u + k ) : 0 ;
	const bbk = b * b + k > 0 ? Math.sqrt( b * b + k ) : 0 ;
	const term = b + Math.sqrt( b * b + k ) !== 0 && ( ( u + uuk ) / ( b + bbk ) ) !== 0 ?
		k * Math.log( Math.abs( ( u + uuk ) / ( b + bbk ) ) ) :
		0 ;

	return ( Math.sqrt( A ) / 2 ) * ( u * uuk - b * bbk + term ) ;
} ;



Bezier.getCubicPoint = ( xs , ys , t ) => {
	const x =
		( 1 - t ) * ( 1 - t ) * ( 1 - t ) * xs[0] +
		3 * ( 1 - t ) * ( 1 - t ) * t * xs[1] +
		3 * ( 1 - t ) * t * t * xs[2] +
		t * t * t * xs[3] ;

	const y =
		( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ys[0] +
		3 * ( 1 - t ) * ( 1 - t ) * t * ys[1] +
		3 * ( 1 - t ) * t * t * ys[2] +
		t * t * t * ys[3] ;

	return { x: x , y: y } ;
} ;



Bezier.getCubicDerivative = ( xs , ys , t ) => {
	const derivative = Bezier.getQuadraticPoint(
		[ 3 * ( xs[1] - xs[0] ) , 3 * ( xs[2] - xs[1] ) , 3 * ( xs[3] - xs[2] ) ] ,
		[ 3 * ( ys[1] - ys[0] ) , 3 * ( ys[2] - ys[1] ) , 3 * ( ys[3] - ys[2] ) ] ,
		t
	) ;
	return derivative ;
} ;



Bezier.getCubicArcLength = ( xs , ys , t ) => {
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



Bezier.t2length = ( length , totalLength , fn ) => {
	let error = 1 ;
	let t = length / totalLength ;
	let step = ( length - fn( t ) ) / totalLength ;

	let numIterations = 0 ;
	while ( error > 0.001 ) {
		const increasedTLength = fn( t + step ) ;
		const increasedTError = Math.abs( length - increasedTLength ) / totalLength ;
		if ( increasedTError < error ) {
			error = increasedTError ;
			t += step ;
		}
		else {
			const decreasedTLength = fn( t - step ) ;
			const decreasedTError = Math.abs( length - decreasedTLength ) / totalLength ;
			if ( decreasedTError < error ) {
				error = decreasedTError ;
				t -= step ;
			}
			else {
				step /= 2 ;
			}
		}

		numIterations ++ ;
		if ( numIterations > 500 ) {
			break ;
		}
	}

	return t ;
} ;

