
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/



const Bezier = require( './Bezier.js' ) ;
const { tValues , cValues , binomialCoefficients } = require( './bezier-values.json' ) ;



function QuadraticBezier( startPoint , control , endPoint ) {
	this.startPoint = startPoint ;
	this.control = control ;
	this.endPoint = endPoint ;
	Bezier.call( this , startPoint , control , endPoint ) ;
}

module.exports = QuadraticBezier ;

QuadraticBezier.prototype = Object.create( Bezier.prototype ) ;
QuadraticBezier.prototype.constructor = QuadraticBezier ;



QuadraticBezier.getPoint =
QuadraticBezier.prototype.getPoint = ( xs , ys , t ) => {
	const x = ( 1 - t ) * ( 1 - t ) * xs[0] + 2 * ( 1 - t ) * t * xs[1] + t * t * xs[2] ;
	const y = ( 1 - t ) * ( 1 - t ) * ys[0] + 2 * ( 1 - t ) * t * ys[1] + t * t * ys[2] ;
	return { x: x , y: y } ;
} ;



QuadraticBezier.getDerivative =
QuadraticBezier.prototype.getDerivative = ( xs , ys , t ) => {
	return {
		x: ( 1 - t ) * 2 * ( xs[1] - xs[0] ) + t * 2 * ( xs[2] - xs[1] ) ,
		y: ( 1 - t ) * 2 * ( ys[1] - ys[0] ) + t * 2 * ( ys[2] - ys[1] )
	} ;
} ;



QuadraticBezier.getLength =
QuadraticBezier.prototype.getLength = ( xs , ys , t = 1 ) => {
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



//For quadratic bezier.
//(x0,y0) is start point; (x1,y1) is control points; (x2,y2) is end point.
// https://stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve
function quadraticBezierMinMax(x0, y0, x1, y1, x2, y2) {
    var xArr = [x0, x2], yArr = [y0, y2], a, b, c, t;
    for (var i = 0; i < 2; ++i) {
        a = i == 0 ? x0 - 2 * x1 + x2 : y0 - 2 * y1 + y2;
        b = i == 0 ? -2 * x0 + 2 * x1 : -2 * y0 + 2 * y1;
        c = i == 0 ? x0 : y0;
        if (Math.abs(a) > 1e-12) {
            t = -b / (2 * a);
            if (0 < t && t < 1) {
                [xArr, yArr][i].push(a * t * t + b * t + c);
            }
        }
    }
    return {
        min: {x: Math.min.apply(0, xArr), y: Math.min.apply(0, yArr)},
        max: {x: Math.max.apply(0, xArr), y: Math.max.apply(0, yArr)}
    };
}

