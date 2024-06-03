
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
		//markupText: rawDoc ,
		structuredText: [
			{ text: "Hello world!\nWhat a " } ,
			//{ text: "a wonderful " , attr: { color: '#888' } , dynamic: { on: { color: '#933' } , off: { color: '#339' } } } ,
			{
				text: "wonderful" ,
				attr: { color: '#888' } ,
				hover: { attr: { color: '#933' } } ,
				click: { emit: { name: 'click' , data: { text: "wonderful" } } , attr: { color: '#339' } }
			} ,
			{ text: " world!" }
		]
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
			boundingBox: {
				x: 10 ,
				y: 200 ,
				width: 50 ,
				height: 50
			} ,
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

	var vgRect2 = new svgKit.VGRect( {
		x: 50 ,
		y: 300 ,
		width: 150 ,
		height: 50 ,
		style: {
			fill: '#44a' ,
		} ,
		dynamic: {
			boundingBox: {
				x: 50 ,
				y: 300 ,
				width: 150 ,
				height: 50 ,
			} ,
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
	var manager = new svgKit.DynamicManager( ctx , vg ) ;
	manager.manageBrowserCanvas() ;

	manager.on( "ok" , () => {
		console.log( "OK pressed" ) ;
	} ) ;
}



svgKit.domKit.ready( dynamicTest ) ;

