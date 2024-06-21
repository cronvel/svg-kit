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



/*
	FX set up dynamic data automatically.
*/


// For VGFlowingText, slow-typing displays the text letter by letter
exports.slowTyping = exports['slow-typing'] = ( params ) => {
	let everyTick = 1 , multiply = 1 ;

	if ( params.speed ) {
		if ( params.speed >= 1 ) { multiply = Math.round( params.speed ) ; }
		else { everyTick = Math.round( 1 / params.speed ) ; }
	}

	return {
		charLimit: 0 ,
		dynamic: {
			noRedraw: true ,
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						let charLimit = dynamicArea.tick * multiply ;
						if ( charLimit - multiply >= dynamicArea.entity.charCount ) { return ; }
						return { charLimit } ;
					}
				}
			} ,
		} ,
		childrenDynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						let ent = dynamicArea.entity , 
							charLimit = ent.parent.charLimit ,
							partOffset = ent.charOffset ,
							partLength = ent.metrics.charCount ;
						return charLimit > partOffset && charLimit - multiply < partOffset + partLength ;
					}
				}
			}
		}
	} ;
} ;



exports.bobbing = ( params ) => {
	var amplitude = + params.amplitude || 4 ,
		multiply = 2 * Math.PI / ( + params.period || 20 ) ,
		marginTopBottom = Math.ceil( amplitude + 1 ) ;

	return {
		margin: { top: marginTopBottom , bottom: marginTopBottom } ,
		dynamic: {
			everyTick: 1 ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						dynamicArea.entity.fxData.y = Math.sin( multiply * dynamicArea.tick ) * amplitude ;
						return true ;
					}
				}
			}
		}
	} ;
} ;



exports.shaking = ( params ) => {
	var everyTick = + params.everyTick || 2 ,
		amplitude = + params.amplitude || 4 ,
		margin = Math.ceil( amplitude + 1 ) ;

	return {
		margin: { top: margin , bottom: margin , left: margin , right: margin } ,
		dynamic: {
			everyTick: everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						dynamicArea.entity.fxData.x = ( 2 * Math.random() - 1 ) * amplitude ;
						dynamicArea.entity.fxData.y = ( 2 * Math.random() - 1 ) * amplitude ;
						return true ;
					}
				}
			}
		}
	} ;
} ;



exports.scramble = ( params ) => {
	var everyTick = + params.everyTick || 2 ,
		xAmplitude = params.amplitude ?? params.xAmplitude ?? 1 ,
		yAmplitude = params.amplitude ?? params.yAmplitude ?? 2 ;

	return {
		margin: { top: xAmplitude + 1 , bottom: xAmplitude + 1 , left: yAmplitude + 1 , right: yAmplitude + 1 } ,
		dynamic: {
			everyTick: everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) {
							dynamicArea.entity.fxData.perCharacter = [] ;
						}

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							dynamicArea.entity.fxData.perCharacter[ i ] = {
								x: ( 2 * Math.random() - 1 ) * xAmplitude ,
								y: ( 2 * Math.random() - 1 ) * yAmplitude
							} ;

							i ++ ;
						}

						dynamicArea.entity.fxData.perCharacter.length = i ;

						return true ;
					}
				}
			}
		}
	} ;
} ;

