/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

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



const mathFn = require( './mathFn.js' ) ;
const TextAttribute = require( '../VGFlowingText/TextAttribute.js' ) ;



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
			}
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



exports.pulse = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		multiply = 1 / ( + params.period || 25 ) ;

	return {
		margin: {
			top: 1 , bottom: 1 , left: 1 , right: 1
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.attr ) {
							dynamicArea.entity.fxData.attr = new TextAttribute( dynamicArea.entity.attr ) ;
						}

						dynamicArea.entity.fxData.attr.setOpacity(
							mathFn.transform.cycle( multiply * dynamicArea.tick )
						) ;

						return true ;
					}
				}
			}
		}
	} ;
} ;



exports.bob = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		amplitude = + params.amplitude || 4 ,
		multiply = 1 / ( + params.period || 20 ) ,
		marginTopBottom = Math.ceil( amplitude + 1 ) ;

	return {
		margin: {
			top: marginTopBottom , bottom: marginTopBottom , left: 1 , right: 1
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						dynamicArea.entity.fxData.y = mathFn.transform.cycleAround( multiply * dynamicArea.tick ) * amplitude ;
						return true ;
					}
				}
			}
		}
	} ;
} ;



exports.quiver = ( params ) => {
	var everyTick = + params.everyTick || 2 ,
		amplitude = + params.amplitude || 4 ,
		margin = Math.ceil( amplitude + 1 ) ;

	return {
		margin: {
			top: margin , bottom: margin , left: margin , right: margin
		} ,
		dynamic: {
			everyTick ,
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



exports.shake = ( params ) => {
	var everyTick = + params.everyTick || 2 ,
		xAmplitude = params.amplitude ?? params.xAmplitude ?? 1 ,
		yAmplitude = params.amplitude ?? params.yAmplitude ?? 2 ;

	return {
		margin: {
			top: xAmplitude + 1 , bottom: xAmplitude + 1 , left: yAmplitude + 1 , right: yAmplitude + 1
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) { fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {} ; }

							fxData.x = ( 2 * Math.random() - 1 ) * xAmplitude ;
							fxData.y = ( 2 * Math.random() - 1 ) * yAmplitude ;

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



exports.wave = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		amplitude = + params.amplitude || 4 ,
		multiply = 1 / ( + params.period || 20 ) ,
		phaseShift = + params.phaseShift || 1 / 24 ,
		marginTopBottom = Math.ceil( amplitude + 1 ) ;

	return {
		margin: {
			top: marginTopBottom , bottom: marginTopBottom , left: 1 , right: 1
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) { fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {} ; }

							fxData.x = 0 ;
							//fxData.y = Math.sin( multiply * dynamicArea.tick - i * phaseShift ) * amplitude ;
							fxData.y = mathFn.transform.cycleAround( multiply * dynamicArea.tick - i * phaseShift ) * amplitude ;

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



exports.spring = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		amplitude = + params.amplitude || 4 ,
		multiply = 1 / ( + params.period || 20 ) ,
		phaseShift = + params.phaseShift || 1 / 6 ,
		pause = + params.pause || 3 ,
		marginLeftRight = Math.ceil( amplitude + 1 ) ,
		xShift = amplitude / 2 ;

	return {
		margin: {
			top: 1 , bottom: 1 , left: marginLeftRight , right: marginLeftRight
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) { fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {} ; }

							fxData.x = xShift - mathFn.transform.roundTripAndPause( multiply * dynamicArea.tick - i * phaseShift , pause ) * amplitude ;
							fxData.y = 0 ;

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



exports.jumpy = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		amplitude = + params.amplitude || 4 ,
		jumpAmplitude = + params.jumpAmplitude || 4 ,
		multiply = 1 / ( + params.period || 20 ) ,
		phaseShift = + params.phaseShift || 1 / 6 ,
		pause = + params.pause || 2 ,
		//jumpPause = 4 * pause + 1 ,	// If we want to jump only in one direction
		marginLeftRight = Math.ceil( amplitude + 1 ) ,
		marginTop = Math.ceil( jumpAmplitude + 1 ) ,
		xShift = amplitude / 2 ;

	return {
		margin: {
			top: marginTop , bottom: 1 , left: marginLeftRight , right: marginLeftRight
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) { fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {} ; }

							fxData.x = xShift - mathFn.transform.goPauseReturnPause( multiply * dynamicArea.tick - i * phaseShift , pause , pause ) * amplitude ;
							fxData.y = - mathFn.transform.roundTripAndPause( 2 * ( multiply * dynamicArea.tick - i * phaseShift ) , 2 * pause ) * jumpAmplitude ;

							// If we want to jump only in one direction
							//fxData.y = - mathFn.transform.roundTripAndPause( 2 * ( multiply * dynamicArea.tick - i * phaseShift ) , jumpPause ) * jumpAmplitude ;

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



const RAINBOW_COLOR_CYCLE = [
	'#ff0000' ,
	'#ff7f00' ,
	'#ffff02' ,
	'#00ff02' ,
	'#00abcd' ,
	'#0000e2' ,
	'#9900ff'
] ;

exports.rainbow = ( params ) => {
	var everyTick = + params.everyTick || 2 ,
		colors = Array.isArray( params.colors ) ? params.colors : RAINBOW_COLOR_CYCLE ;

	return {
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) {
								fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {
									attr: new TextAttribute( dynamicArea.entity.attr )
								} ;
							}

							fxData.attr.setColor( colors[ ( dynamicArea.tick + i ) % colors.length ] ) ;

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



exports.fade = ( params ) => {
	var everyTick = + params.everyTick || 1 ,
		multiply = 1 / ( + params.period || 25 ) ,
		phaseShift = + params.phaseShift || 1 / 6 ,
		pause = + params.pause || 2 ;

	return {
		margin: {
			top: 1 , bottom: 1 , left: 1 , right: 1
		} ,
		dynamic: {
			everyTick ,
			statusData: {
				base: {
					eachFrame: dynamicArea => {
						if ( ! dynamicArea.entity.fxData.perCharacter ) { dynamicArea.entity.fxData.perCharacter = [] ; }

						let i = 0 ;

						for ( let char of dynamicArea.entity.text ) {
							let fxData = dynamicArea.entity.fxData.perCharacter[ i ] ;
							if ( ! fxData ) {
								fxData = dynamicArea.entity.fxData.perCharacter[ i ] = {
									attr: new TextAttribute( dynamicArea.entity.attr )
								} ;
							}

							fxData.attr.setOpacity(
								mathFn.transform.goPauseReturnPause( multiply * dynamicArea.tick - i * phaseShift , pause * 0.25 , pause )
							) ;

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



