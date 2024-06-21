
"use strict" ;

async function dynamicTest() {
	//var rawDoc = await ( await fetch( 'doc.bks' ) ).text() ; console.log( rawDoc ) ;

	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: false
	} ) ;

	var vgFlowingText = new svgKit.VGFlowingText( {
		x: 20 ,
		y: 50 ,
		//width: 400 , height: 200 ,
		width: 300 , height: 400 ,
		//charLimit: 0 ,
		//clip: false ,
		debugContainer: true ,
		//textWrapping: 'ellipsis' ,
		textWrapping: 'wordWrap' ,
		//textVerticalAlignment: 'bottom' ,
		//textHorizontalAlignment: 'center' ,
		attr: {
			fontSize: 20 ,
			color: '#444' ,
			//outline: true ,
			//frameCornerRadius: '0.2em' ,
			//frameOutlineWidth: '0.1em' ,
			//outlineColor: '#afa' ,
			//lineOutline: true ,
			//lineColor: '#559'
		} ,
		fx: {
			//slowTyping: { speed: 2 }
		} ,
		//markupText: rawDoc ,
		structuredText: [
			{ text: "Hello world! What a " } ,
			//{ text: "a wonderful " , attr: { color: '#888' } , dynamic: { on: { color: '#933' } , off: { color: '#339' } } } ,
			{
				text: "wonderful wonderful wonderful" ,
				attr: { color: '#33c' , underline: true } ,
				hover: { attr: { color: '#c33' , underline: true } } ,
				click: { emit: { name: 'tooltip' , data: { text: "wonderful" } } , attr: { color: '#3c3' } }
			} ,
			{ text: " world!\nNow some " } ,
			{
				text: "bobbing text" ,
				fx: {
					//bobbing: { amplitude: 4 , period: 20 } ,
					shaking: { amplitude: 4 , everyTick: 2 } ,
				}
			} ,
			{ text: " just for fun! And more and more and more text for the test..." }
		] ,
	} ) ;
	vg.addEntity( vgFlowingText ) ;

	var vgRect1 = new svgKit.VGRect( {
		x: 10 ,
		y: 200 ,
		width: 50 ,
		height: 50 ,
		style: {
			fill: '#44a' ,
		} ,
		dynamic: {
			//boundingBox: { x: 10 , y: 200 , width: 50 , height: 50 } ,
			statusData: {
				base: {
					morph: {
						style: {
							fill: '#a44' ,
						}
					}
				} ,
				hover: {
					morph: {
						style: {
							fill: '#4a4' ,
						}
					}
				} ,
				press: {
					morph: {
						style: {
							fill: '#44a' ,
						}
					}
				} ,
				release: {
					emit: {
						name: 'ok'
					} ,
					morph: {
						style: {
							fill: '#668' ,
						}
					}
				}
			}
		}
	} ) ;
	vg.addEntity( vgRect1 ) ;

	//*
	var vgRect2 = new svgKit.VGRect( {
		x: 50 ,
		y: 300 ,
		width: 150 ,
		height: 50 ,
		style: {
			fill: '#44a' ,
		} ,
		dynamic: {
			everyTick: 2 ,
			statusData: {
				base: {
					frames: [
						{
							ticks: 2 ,
							morph: {
								style: {
									fill: '#4a4' ,
								}
							}
						} ,
						{
							ticks: 1 ,
							morph: {
								style: {
									fill: '#a44' ,
								}
							}
						} ,
						{
							ticks: 4 ,
							morph: {
								style: {
									fill: '#44a' ,
								}
							}
						} ,
					]
				}
			}
		}
	} ) ;
	vg.addEntity( vgRect2 ) ;
	//*/


	// Render

	svgKit.fontLib.setFontUrl( 'serif' , '../fonts/serif.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'italic' , '../fonts/serif-italic.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , '../fonts/serif-bold.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , 'italic' , '../fonts/serif-bold+italic.ttf' ) ;

	var $canvas = document.getElementById( 'canvas' ) ;
	var ctx = $canvas.getContext( '2d' ) ;

	// Display using the Canvas renderer
	$canvas.classList.remove( 'hidden' ) ;
	await vg.renderCanvas( ctx ) ;
	var manager = new svgKit.DynamicManager( ctx , vg , 50 ) ;
	manager.manageBrowserCanvas() ;

	console.warn( "==> vg:" , vg ) ;
	console.warn( "==> pseudoEntity:" , vgFlowingText.pseudoEntities[ 2 ] ) ;

	manager.on( "ok" , () => {
		console.log( "OK pressed" ) ;
	} ) ;

	manager.on( "tooltip" , data => {
		console.log( "Tooltip:" , data ) ;
	} ) ;
}



svgKit.domKit.ready( dynamicTest ) ;

