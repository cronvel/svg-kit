
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/

function Bezier( ... args ) {
	// Cache those values for faster execution
	this.xs = args.map( v => v.x ) ;
	this.ys = args.map( v => v.y ) ;
	this.length = this.getArcLength( this.xs , this.ys , 1 ) ;
}

module.exports = Bezier ;



Bezier.prototype.getPointAtLength = function( length ) {
	const t = this.t2length( length , this.length , i => this.getArcLength( this.xs , this.ys , i ) ) ;
	return this.getPoint( this.xs , this.ys , t ) ;
} ;



Bezier.prototype.getTangentAtLength = function( length ) {
	const t = this.t2length( length , this.length , i => this.getArcLength( this.xs , this.ys , i ) ) ;

	const derivative = this.getDerivative( this.xs , this.ys , t ) ;
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
	const t = this.t2length( length , this.length , i => this.getArcLength( this.xs , this.ys , i ) ) ;

	const derivative = this.getDerivative( this.xs , this.ys , t ) ;
	const mdl = Math.sqrt( derivative.x * derivative.x + derivative.y * derivative.y ) ;
	
	let tangent ;
	
	if ( mdl > 0 ) {
		tangent = { x: derivative.x / mdl , y: derivative.y / mdl } ;
	}
	else {
		tangent = { x: 0 , y: 0 } ;
	}
	
	const point = this.getPoint( this.xs , this.ys , t ) ;
	
	return {
		x: point.x , y: point.y , tangentX: tangent.x , tangentY: tangent.y
	} ;
} ;



Bezier.prototype.t2length = ( length , totalLength , fn ) => {
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

