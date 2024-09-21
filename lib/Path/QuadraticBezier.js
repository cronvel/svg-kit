
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/

function QuadraticBezier( startPoint , control , endPoint ) {
	this.startPoint = startPoint ;
	this.control = control ;
	this.endPoint = endPoint ;

	this.length = this.getArcLength(
		[ this.a.x , this.b.x , this.c.x , this.d.x ] ,
		[ this.a.y , this.b.y , this.c.y , this.d.y ] ,
		1
	) ;
}

module.exports = QuadraticBezier ;



const NULL_POINT = { x: 0 , y: 0 } ;


QuadraticBezier.prototype.getPointAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const ys = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , ys , i ) ) ;

	return this.getPoint( xs , ys , t ) ;
} ;



QuadraticBezier.prototype.getTangentAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const ys = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , ys , i ) ) ;

	const derivative = this.getDerivative( xs , ys , t ) ;
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



QuadraticBezier.prototype.getPropertiesAtLength = function( length ) {
	const xs = [ this.a.x , this.b.x , this.c.x , this.d.x ] ;
	const ys = [ this.a.y , this.b.y , this.c.y , this.d.y ] ;
	const t = Bezier.t2length( length , this.length , i => this.getArcLength( xs , ys , i ) ) ;

	const derivative = this.getDerivative( xs , ys , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;
	let tangent ;
	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}
	const point = this.getPoint( xs , ys , t ) ;
	return {
		x: point.x , y: point.y , tangentX: tangent.x , tangentY: tangent.y
	} ;
} ;



const { tValues , cValues , binomialCoefficients } = require( './bezier-values.json' ) ;



QuadraticBezier.prototype.getPoint = ( xs , ys , t ) => {
	const x = ( 1 - t ) * ( 1 - t ) * xs[0] + 2 * ( 1 - t ) * t * xs[1] + t * t * xs[2] ;
	const y = ( 1 - t ) * ( 1 - t ) * ys[0] + 2 * ( 1 - t ) * t * ys[1] + t * t * ys[2] ;
	return { x: x , y: y } ;
} ;



QuadraticBezier.prototype.getQuadraticDerivative = ( xs , ys , t ) => {
	return {
		x: ( 1 - t ) * 2 * ( xs[1] - xs[0] ) + t * 2 * ( xs[2] - xs[1] ) ,
		y: ( 1 - t ) * 2 * ( ys[1] - ys[0] ) + t * 2 * ( ys[2] - ys[1] )
	} ;
} ;



QuadraticBezier.prototype.getQuadraticArcLength = ( xs , ys , t ) => {
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



// tmp:
const Bezier = {} ;
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

