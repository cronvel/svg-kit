
"use strict" ;

/*
	Derived from svg-path-properties by RogerVecianaAbzu
	(https://github.com/rveciana/svg-path-properties/blob/master/src/bezier.ts)
*/

function Arc( startPoint , radius , xAxisRotate , largeArcFlag , sweepFlag , endPoint ) {
	this.startPoint = startPoint ;
	this.radius = radius ;
	this.xAxisRotate = xAxisRotate ;
	this.largeArcFlag = largeArcFlag ;
	this.sweepFlag = sweepFlag ;
	this.endPoint = endPoint ;

	this.length = this.getLength() ;
}

module.exports = Arc ;



Arc.prototype.getLength = function() {
	const lengthProperties = this.approximateArcLengthOfCurve( 300 , t => {
		return this.pointOnEllipticalArc(
			this.startPoint ,
			this.radius ,
			this.xAxisRotate ,
			this.largeArcFlag ,
			this.sweepFlag ,
			this.endPoint ,
			t
		) ;
	} ) ;

	return lengthProperties.arcLength ;
} ;



Arc.prototype.getPointAtLength = function( length ) {
	if ( length === 0 ) { return { x: this.startPoint.x , y: this.startPoint.y } ; }
	if ( length === this.length ) { return { x: this.endPoint.x , y: this.endPoint.y } ; }

	const position = this.pointOnEllipticalArc(
		this.startPoint ,
		this.radius ,
		this.xAxisRotate ,
		this.largeArcFlag ,
		this.sweepFlag ,
		this.endPoint ,
		length / this.length
	) ;

	return { x: position.x , y: position.y } ;
} ;



Arc.prototype.getTangentAtLength = function( length ) {
	const delta = 0.001 * ( Math.min( this.radius.x , this.radius.y ) || this.length ) ; // should manage degenerate case
	const p1 = this.getPointAtLength( length - delta ) ;
	const p2 = this.getPointAtLength( length + delta ) ;
	const dx = p2.x - p1.x ;
	const dy = p2.y - p1.y ;
	const dist = Math.sqrt( dx * dx + dy * dy ) ;
	return { x: dx / dist , y: dy / dist } ;
} ;



Arc.prototype.getPropertiesAtLength = function( length ) {
	const point = this.getPointAtLength( length ) ;
	const tangent = this.getTangentAtLength( length ) ;
	return {
		x: point.x , y: point.y , dx: tangent.x , dy: tangent.y
	} ;
} ;




Arc.pointOnEllipticalArc =
Arc.prototype.pointOnEllipticalArc = function( p0 , radius , xAxisRotation , largeArcFlag , sweepFlag , p1 , t ) {
	// In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
	let rx = Math.abs( radius.x ) ,
		ry = Math.abs( radius.y ) ,
		xAxisRotationRadians = toRadians( mod( xAxisRotation , 360 ) ) ;

	// If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
	if ( p0.x === p1.x && p0.y === p1.y ) {
		return { x: p0.x , y: p0.y , ellipticalArcAngle: 0 } ; // Check if angle is correct
	}

	// If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.
	if ( rx === 0 || ry === 0 ) {
		//return this.pointOnLine(p0, p1, t);
		return { x: 0 , y: 0 , ellipticalArcAngle: 0 } ; // Check if angle is correct
	}

	// Following "Conversion from endpoint to center parameterization"
	// http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

	// Step #1: Compute transformedPoint
	const dx = ( p0.x - p1.x ) / 2 ;
	const dy = ( p0.y - p1.y ) / 2 ;
	const transformedPoint = {
		x: Math.cos( xAxisRotationRadians ) * dx + Math.sin( xAxisRotationRadians ) * dy ,
		y: - Math.sin( xAxisRotationRadians ) * dx + Math.cos( xAxisRotationRadians ) * dy
	} ;
	// Ensure radii are large enough
	const radiiCheck =
    Math.pow( transformedPoint.x , 2 ) / Math.pow( rx , 2 ) +
    Math.pow( transformedPoint.y , 2 ) / Math.pow( ry , 2 ) ;
	if ( radiiCheck > 1 ) {
		rx = Math.sqrt( radiiCheck ) * rx ;
		ry = Math.sqrt( radiiCheck ) * ry ;
	}

	// Step #2: Compute transformedCenter
	const cSquareNumerator =
    Math.pow( rx , 2 ) * Math.pow( ry , 2 ) -
    Math.pow( rx , 2 ) * Math.pow( transformedPoint.y , 2 ) -
    Math.pow( ry , 2 ) * Math.pow( transformedPoint.x , 2 ) ;
	const cSquareRootDenom =
    Math.pow( rx , 2 ) * Math.pow( transformedPoint.y , 2 ) +
    Math.pow( ry , 2 ) * Math.pow( transformedPoint.x , 2 ) ;
	let cRadicand = cSquareNumerator / cSquareRootDenom ;
	// Make sure this never drops below zero because of precision
	cRadicand = cRadicand < 0 ? 0 : cRadicand ;
	const cCoef = ( largeArcFlag !== sweepFlag ? 1 : - 1 ) * Math.sqrt( cRadicand ) ;
	const transformedCenter = {
		x: cCoef * ( ( rx * transformedPoint.y ) / ry ) ,
		y: cCoef * ( - ( ry * transformedPoint.x ) / rx )
	} ;

	// Step #3: Compute center
	const center = {
		x:
      Math.cos( xAxisRotationRadians ) * transformedCenter.x -
      Math.sin( xAxisRotationRadians ) * transformedCenter.y +
      ( p0.x + p1.x ) / 2 ,
		y:
      Math.sin( xAxisRotationRadians ) * transformedCenter.x +
      Math.cos( xAxisRotationRadians ) * transformedCenter.y +
      ( p0.y + p1.y ) / 2
	} ;

	// Step #4: Compute start/sweep angles
	// Start angle of the elliptical arc prior to the stretch and rotate operations.
	// Difference between the start and end angles
	const startVector = {
		x: ( transformedPoint.x - transformedCenter.x ) / rx ,
		y: ( transformedPoint.y - transformedCenter.y ) / ry
	} ;
	const startAngle = angleBetween(
		{
			x: 1 ,
			y: 0
		} ,
		startVector
	) ;

	const endVector = {
		x: ( - transformedPoint.x - transformedCenter.x ) / rx ,
		y: ( - transformedPoint.y - transformedCenter.y ) / ry
	} ;
	let sweepAngle = angleBetween( startVector , endVector ) ;

	if ( ! sweepFlag && sweepAngle > 0 ) {
		sweepAngle -= 2 * Math.PI ;
	}
	else if ( sweepFlag && sweepAngle < 0 ) {
		sweepAngle += 2 * Math.PI ;
	}
	// We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
	sweepAngle %= 2 * Math.PI ;

	// From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
	const angle = startAngle + sweepAngle * t ;
	const ellipseComponentX = rx * Math.cos( angle ) ;
	const ellipseComponentY = ry * Math.sin( angle ) ;

	const point = {
		x:
      Math.cos( xAxisRotationRadians ) * ellipseComponentX -
      Math.sin( xAxisRotationRadians ) * ellipseComponentY +
      center.x ,
		y:
      Math.sin( xAxisRotationRadians ) * ellipseComponentX +
      Math.cos( xAxisRotationRadians ) * ellipseComponentY +
      center.y ,
		ellipticalArcStartAngle: startAngle ,
		ellipticalArcEndAngle: startAngle + sweepAngle ,
		ellipticalArcAngle: angle ,
		ellipticalArcCenter: center ,
		resultantRx: rx ,
		resultantRy: ry
	} ;

	return point ;
} ;



Arc.approximateArcLengthOfCurve =
Arc.prototype.approximateArcLengthOfCurve = function( resolution , pointOnCurveFunc )  {
	// Resolution is the number of segments we use
	resolution = resolution ? resolution : 500 ;

	let resultantArcLength = 0 ;
	const arcLengthMap = [] ;
	const approximationLines = [] ;

	let prevPoint = pointOnCurveFunc( 0 ) ;
	let nextPoint ;
	for ( let i = 0 ; i < resolution ; i ++ ) {
		const t = clamp( i * ( 1 / resolution ) , 0 , 1 ) ;
		nextPoint = pointOnCurveFunc( t ) ;
		resultantArcLength += distance( prevPoint , nextPoint ) ;
		approximationLines.push( [ prevPoint , nextPoint ] ) ;

		arcLengthMap.push( {
			t: t ,
			arcLength: resultantArcLength
		} ) ;

		prevPoint = nextPoint ;
	}
	// Last stretch to the endpoint
	nextPoint = pointOnCurveFunc( 1 ) ;
	approximationLines.push( [ prevPoint , nextPoint ] ) ;
	resultantArcLength += distance( prevPoint , nextPoint ) ;
	arcLengthMap.push( {
		t: 1 ,
		arcLength: resultantArcLength
	} ) ;

	return {
		arcLength: resultantArcLength ,
		arcLengthMap: arcLengthMap ,
		approximationLines: approximationLines
	} ;
} ;



const mod = ( x , m ) => {
	return ( ( x % m ) + m ) % m ;
} ;

const toRadians = ( angle ) => {
	return angle * ( Math.PI / 180 ) ;
} ;

const distance = ( p0 , p1 ) => {
	return Math.sqrt( Math.pow( p1.x - p0.x , 2 ) + Math.pow( p1.y - p0.y , 2 ) ) ;
} ;

const clamp = ( val , min , max ) => {
	return Math.min( Math.max( val , min ) , max ) ;
} ;

const angleBetween = ( v0 , v1 ) => {
	const p = v0.x * v1.x + v0.y * v1.y ;
	const n = Math.sqrt(
		( Math.pow( v0.x , 2 ) + Math.pow( v0.y , 2 ) ) * ( Math.pow( v1.x , 2 ) + Math.pow( v1.y , 2 ) )
	) ;
	const sign = v0.x * v1.y - v0.y * v1.x < 0 ? - 1 : 1 ;
	const angle = sign * Math.acos( p / n ) ;

	return angle ;
} ;

