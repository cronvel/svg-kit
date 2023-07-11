#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;

const svgKit = require( '..' ) ;



async function run() {
	var vg = new svgKit.VG( { viewBox: { x: 0 , y: 0 , width: 500 , height: 500 } } ) ;

	var vg9pImage = new svgKit.VGImage( {
		x: 50 ,
		y: 50 ,
		width: 350 ,
		height: 250 ,
		sourceLeftWidth: 70 ,
		sourceRightWidth: 70 ,
		sourceTopHeight: 70 ,
		sourceBottomHeight: 70 ,
		url: './9p.png'
	} ) ;
	vg.addEntity( vg9pImage ) ;

	var svg = await vg.renderSvgText() ;
	await fs.promises.writeFile( __dirname + '/test.tmp.svg' , svg + '\n' ) ;
}

run() ;

