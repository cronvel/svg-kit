
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/



const Bezier = require( './Bezier.js' ) ;
const QuadraticBezier = require( './QuadraticBezier.js' ) ;
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



CubicBezier.getPoint =
CubicBezier.prototype.getPoint = ( xs , ys , t ) => {
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



//For cubic bezier.
//(x0,y0) is start point; (x1,y1),(x2,y2) is control points; (x3,y3) is end point.
// https://stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve
function cubicBezierMinMax(x0, y0, x1, y1, x2, y2, x3, y3) {
    var tArr = [], xArr = [x0, x3], yArr = [y0, y3],
        a, b, c, t, t1, t2, b2ac, sqrt_b2ac;
    for (var i = 0; i < 2; ++i) {
        if (i == 0) {
            b = 6 * x0 - 12 * x1 + 6 * x2;
            a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
            c = 3 * x1 - 3 * x0;
        } else {
            b = 6 * y0 - 12 * y1 + 6 * y2;
            a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
            c = 3 * y1 - 3 * y0;
        }
        if (Math.abs(a) < 1e-12) {
            if (Math.abs(b) < 1e-12) {
                continue;
            }
            t = -c / b;
            if (0 < t && t < 1) {
                tArr.push(t);
            }
            continue;
        }
        b2ac = b * b - 4 * c * a;
        if (b2ac < 0) {
            if (Math.abs(b2ac) < 1e-12) {
                t = -b / (2 * a);
                if (0 < t && t < 1) {
                    tArr.push(t);
                }
            }
            continue;
        }
        sqrt_b2ac = Math.sqrt(b2ac);
        t1 = (-b + sqrt_b2ac) / (2 * a);
        if (0 < t1 && t1 < 1) {
            tArr.push(t1);
        }
        t2 = (-b - sqrt_b2ac) / (2 * a);
        if (0 < t2 && t2 < 1) {
            tArr.push(t2);
        }
    }

    var j = tArr.length, mt;
    while (j--) {
        t = tArr[j];
        mt = 1 - t;
        xArr[j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
        yArr[j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
    }

    return {
        min: {x: Math.min.apply(0, xArr), y: Math.min.apply(0, yArr)},
        max: {x: Math.max.apply(0, xArr), y: Math.max.apply(0, yArr)}
    };
}

