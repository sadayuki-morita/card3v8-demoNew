/**
 * カード解析
 * Copyright PKB SOLUTION INC.
 */
/**
 * カード解析
 * Copyright PKB SOLUTION INC.
 */
var Base64={
		encode: function(str) { 
			return btoa(unescape(encodeURIComponent(str))); 
		}, 
		decode: function(str) { 
			return decodeURIComponent(escape(atob(str))); 
		}
	},

	Point=function(no, point) { 
		this.no=no;
		this.inputX=point.inputX; 
		this.inputY=point.inputY; 
		this.totalLength=0; 
		this.baseX=0; this.baseY=0; 
		this.rotateX=0; 
		this.rotateY=0; 
		this.angle=0; 
		this.distance=0; 
		this.position='';
	},

	cardConfMap={},
	
	convertConf=function(confData) {
		let result={};
		if (Array.isArray(confData)) {
			for (let ix1=0; ix1 < confData.length; ix1++) {
				try {
					let row=Base64.decode(confData[ix1]), 
						cols=row.split(':');
					if (cols.length !== 9) continue;
					let cardId=cols[0], 
						points=[], 
						group=cols[8], 
						idPositions=[], 
						touchPositions=[], 
						backSide=false;
					for (let ix2=1; ix2 < 8; ix2++) {
						let pointXY=cols[ix2].replace(/\(|\)|\s/g, '').split(','), 
							pointX=parseInt(pointXY[0], 10), 
							pointY=12 - parseInt(pointXY[1], 10);
						points.push([pointX, pointY]);
					}
					for (let ix2=0; ix2 < points.length; ix2++) {
						let point=points[ix2], 
							positionX=point[0].toString(32), 
							positionY=point[1].toString(32);
						if (ix2 < 4) { 
							idPositions.push(positionY + positionX); 
						} else { 
							touchPositions.push(positionY + positionX); 
						}
					}
					if (idPositions[0] === '00' && idPositions[3] === 'ae') { 
						backSide=true; 
					} else if (idPositions[0] === '0e' && idPositions[3] === 'a0') { 
						backSide=false; 
					} else { 
						continue; 
					}
					idPositions.sort(function(val1, val2) {
						if (val1 < val2) return -1;
						if (val1 > val2) return 1;
						return 0;
					});
					if (result[group] === undefined) { 
						result[group]={}; 
					}
					var backSideKey=String(backSide);
					if (result[group][backSideKey] === undefined) { 
						result[group][backSideKey]={}; 
					}
					let positions=idPositions.join('');
					result[group][backSideKey][cardId]={
						'id': cardId, 
						'group': group, 
						'backSide': backSide, 
						'points': points, 
						'positions': positions
					};
				} catch(e) {
					console.log('ConvertError / index=' + ix1 + ', err=' + e);
				}
			}
		}
		return result;
	};
/**
 * カード解析処理
 */
var analyzeCard=function(inputPoints, group) {
	if (group === undefined) { group=1;}
	var points=[], 
		stamp={}, 
		colNum=15, 
		rowNum=11, 
		accuracy=1.0, 
		lines=[];
	if (Array.isArray(inputPoints)) {
		for (let ix1=0, len=inputPoints.length; ix1 < len; ix1++) {
			let point=new Point(ix1, inputPoints[ix1]); 
			points.push(point);
		}
	}
	let patternGroupCardInfos=cardConfMap[group];
	for (var ix1=0; ix1 < points.length - 1; ix1++) {
		for (var ix2=ix1 + 1; ix2 < points.length; ix2++) {
			var lengthX=points[ix1].inputX - points[ix2].inputX, 
				lengthY=points[ix1].inputY - points[ix2].inputY, 
				length=Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
				line={
					pointNo1: ix1, 
					pointNo2: ix2, 
					length: length
				}; 
				lines.push(line);
		}
	}
	lines.sort(function(line1, line2) {
		if (line1.length > line2.length) return -1;
		if (line1.length < line2.length) return 1;
		return 0;
	});
	lines=lines.slice(0, 1);
	var stampId='', 
		rawStampId='', 
		positions='', 
		patternMatch=false, 
		basePointNo1=null, 
		basePointNo2=null, 
		gridWidth=0, 
		gridHeight=0, 
		originX=0, 
		originY=0, 
		baseRad=0,
		tergetRad=0,
		rotateRad=0, 
		keypadPointNo=null, 
		keypadColNum=colNum, 
		keypadRowNum=2, 
		keypadGridWidth=0, 
		keypadGridHeight=0, 
		keypadOriginX=0, 
		keypadOriginY=0;

	try {
		for (var ix1=0; ix1 < lines.length; ix1++) {
			var line=lines[ix1];
			for (var pattern=0; pattern < 4; pattern++) {
				var backSide=false;
				if (pattern % 2) { 
					basePointNo1=points[line.pointNo1].no; 
					basePointNo2=points[line.pointNo2].no; 
				} else { 
					basePointNo1=points[line.pointNo2].no; 
					basePointNo2=points[line.pointNo1].no; 
				}
				if (pattern < 2) { 
					tergetRad=Math.atan2((rowNum - 1), -(colNum - 1)); 
				} else { 
					tergetRad=Math.atan2((rowNum - 1), (colNum - 1)); 
					backSide=true; 
				}
				for (var ix2=0; ix2 < points.length; ix2++) {
					var baseX=points[ix2].inputX - points[basePointNo1].inputX, 
						baseY=points[ix2].inputY - points[basePointNo1].inputY; 
					points[ix2].baseX=baseX; 
					points[ix2].baseY=baseY;
				}
				baseRad=Math.atan2(points[basePointNo2].baseY, points[basePointNo2].baseX); 
				rotateRad=tergetRad - baseRad;
				for (var ix2=0; ix2 < points.length; ix2++) {
					var rotateX=points[ix2].baseX * Math.cos(rotateRad) - points[ix2].baseY * Math.sin(rotateRad), 
						rotateY=points[ix2].baseY * Math.cos(rotateRad) + points[ix2].baseX * Math.sin(rotateRad); 
					points[ix2].rotateX=rotateX; 
					points[ix2].rotateY=rotateY;
				}
				gridWidth=Math.abs((points[basePointNo2].rotateX - points[basePointNo1].rotateX) / (colNum - 1));
				gridHeight=Math.abs((points[basePointNo2].rotateY - points[basePointNo1].rotateY) / (rowNum - 1));
				keypadOriginX=0; 
				keypadOriginY=gridHeight*rowNum; 
				keypadGridWidth=gridWidth; 
				keypadGridHeight=gridHeight;
				if (0 < points[basePointNo2].rotateX) { 
					originX=gridWidth*-0.5; 
				} else { 
					originX=gridWidth*-(colNum-0.5); 
				}
				originY=gridHeight * -0.5;
				for (var ix2=0; ix2 < points.length; ix2++) {
					points[ix2].rotateX -= originX; 
					points[ix2].rotateY -= originY;
				}
				let touchPointNo=null, maxY=0;
				for (let ix2=0; ix2 < points.length; ix2++) {
					if (ix2 == basePointNo1 || ix2 === basePointNo2) continue;
					if (touchPointNo == null || points[ix2].rotateY > maxY) { 
						touchPointNo=ix2; 
						maxY=points[ix2].rotateY; 
					}
				}
				for (let ix2=0; ix2 < points.length; ix2++) {
					let point=points[ix2], 
						gridY=point.rotateY / gridHeight, 
						diffX=0, 
					gridX=(point.rotateX - diffX) / gridWidth; 
					points[ix2].gridX=gridX; 
					points[ix2].gridY=gridY;
				}
				let otherIdPointNos=[];
				for (let ix2=0; ix2 < points.length; ix2++) {
					if (ix2 == basePointNo1 || ix2 === basePointNo2 || ix2 === touchPointNo) continue;
					otherIdPointNos.push(ix2);
				}
				let cardInfos=(patternGroupCardInfos[String(backSide)] !== undefined) ? patternGroupCardInfos[String(backSide)] : {};
				for (let key in cardInfos) {
					let cardInfo=(cardInfos[key] !== undefined) ? cardInfos[key] : {}, 
						confPoints=(cardInfo['points'] !== undefined) ? cardInfo['points'] : [], 
						matchPointNos=[];
					for (let ix2=1; ix2 < confPoints.length - 4; ix2++) {
						let confPoint=confPoints[ix2], 
							confPointX=confPoint[0] + 0.5, 
							confPointY=confPoint[1] + 0.5, 
							matchFlag=false;
						for (let ix3=0; ix3 < otherIdPointNos.length; ix3++) {
							let otherIdPointNo=otherIdPointNos[ix3];
							if (0 <= matchPointNos.indexOf(otherIdPointNo)) continue;
							let gridX=points[otherIdPointNo].gridX, 
								gridY=points[otherIdPointNo].gridY, 
								distance=Math.sqrt(Math.pow(gridX - confPointX, 2) + Math.pow(gridY - confPointY, 2));
							if (distance <= accuracy) { 
								matchFlag=true; 
								matchPointNos.push(otherIdPointNo); 
								break; 
							}
						}
						if (!matchFlag) break;
					}
					if (matchPointNos.length == otherIdPointNos.length) {
						stampId=cardInfo['id'];
						if (stampId) {
							let tmp=stampId.match(/[0-9]+/);
							if (0 < tmp.length) { 
								rawStampId=parseInt(tmp[0]); 
							}
							positions=cardInfo['positions']; 
							patternMatch=true; 
							break;
						}
					}
				}
				if (patternMatch) {
					let gridX=points[touchPointNo].gridX, 
						gridY=points[touchPointNo].gridY, 
						matchFlag=false;
					for (let key in cardInfos) {
						let cardInfo=(cardInfos[key] !== undefined) ? cardInfos[key] : {}, 
							confPositions=cardInfo['positions'];
						if (confPositions !== positions) continue;
						let confPoints=(cardInfo['points'] !== undefined) ? cardInfo['points'] : [], 
							touchNo=0;
						for (let ix2=confPoints.length - 3; ix2 < confPoints.length; ix2++) {
							touchNo++;
							let confPoint=confPoints[ix2], 
								confPointX=confPoint[0] + 0.5, 
								confPointY=confPoint[1] + 0.5, 
								distance=Math.sqrt(Math.pow(gridX - confPointX, 2) + Math.pow(gridY - confPointY, 2));
							if (distance <= accuracy) { 
								matchFlag=true; 
								keypadPointNo=touchNo; 
								stampId+='-'+touchNo; 
								positions+=confPoint[1].toString(32)+confPoint[0].toString(32); 
								break; 
							}
						}
					}
					if (!matchFlag) { 
						console.log('unknown position', positions); 
					}
				}
				if (patternMatch) { 
					break; 
				}
			}
			if (patternMatch) { 
				break; 
			}
		}
		stamp.id=stampId; 
		stamp.rawId=rawStampId; 
		stamp.point=keypadPointNo; 
		stamp.angle=rotateRad;
	} catch(e) {
		console.log(e);
	}
	return stamp;
};
console.log('警告\n本スクリプトの解析及びアルゴリズムの再利用をする事は原則禁止とさせて頂きます。');
