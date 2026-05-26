/**
 * 各種制御スクリプト
 * Ver 1.0.0
 * Copyright PKB SOLUTION INC.
 */

/**
 * カード解析処理制御設定
 */
var MTCardConfig = function(argument) {
	this.touchWaitTime = 700;							/* カード識別成功時に次のタッチを受け付けるまでのインターバル(msec) */
	this.showErrorAlert = true;							/* エラーアラート表示フラグ */
	this.touchElement = 'touch';						/* タッチを受け付ける要素(ID又は要素で指定) */
	this.initModalElemId = 'init_modal';				/* メディア読込用モーダルの要素のID */
	this.initModalDoneElemId = 'init_modal_done';		/* メディア読込用モーダルを閉じる(ボタン)要素のID */
	this.defaultContentsId = 'default_contents';		/* 初期表示要素のID */
	this.variableContentsClass = '.variable_contents';	/* 動的表示切替要素のクラス */
	this.elemIdPrefix = 'i';							/* この値+[1-3]のIDで定義された要素がタッチ時に表示されるようになる ※[1-3]はカードの持ち手と紐付き、1:上部、2:中部、3:下部になる -> 最終的にi1,i2,i3のようなIDになる */
	this.willStartCollbackKey = 'start';				/* カード解析処理実行直前に呼ばれるコールバックに指定するキー名 */
	this.onErrorCallbackKey = 'error';					/* カード解析処理失敗に呼ばれるコールバックに指定するキー名 */
	this.okSoundElemId = 'beep_ok';						/* カードタッチ成功時効果音要素のID */
	this.ngSoundElemId = 'beep_ng';						/* カードタッチ失敗時効果音要素のID */
	this.playSound = true;								/* カードタッチ後に効果音を鳴らすか否かの設定(true:鳴らす、false:鳴らさない) */
	this.commonErrorMsg = 'カードが認識出来ませんでした。';	/* 汎用エラーメッセージ */
	var self = this;
	/* 値の指定があればセット */
	if ((typeof argument === 'object') && (argument !== null)) {
		Object.keys(argument).forEach(function (key) {
			self[key] = argument[key];
		});
	}
};
if (typeof isPassive === 'undefined') {
	try { 
		var options = Object.defineProperty({}, 'passive', { get: function() { isPassive = true; } });  
		window.addEventListener('test', options, options);  
		window.removeEventListener('test', options, options); 
	} catch (exception) { 
		isPassive = false; 
	}
}

var _cardAnalyzer,		/* カード解析オブジェクト */
_callbacks = {},		/* 各処理段階でのコールバック格納用 */
_cardConf = {},			/* 動作設定オブジェクト */
_audioElements = {},	/* audio要素格納用 */
_videoElements = {},	/* video要素格納用 */
_ytElements = {},		/* video要素格納用 */
_beepTimeOut,			/* 解析再スタート用 */
analyzedCardId = '',	/* カード解析結果 */
position = '',			/* カードの持ち手 */
/**
 * 各種メディアファイルの初期化
 * クリックイベント内で実行する必要有り、強制的に全対象ファイルを読込開始して再生可能状態にする
 * @param type number 0:何もしない、(1 & type): audioタグを初期化、(2 & type): videoタグを初期化、(4 & type): youtube埋め込みタグを初期化
 * ※ type具体例  1: audioのみ、2: videoのみ、3:audioとvideo、4:youtubeのみ、7:audioとvideoとyoutubeの全て
 * ※ youtube埋め込みタグに対する制御はyoutubeクラスを埋め込みタグに指定した場合動作
 */
_initMedia = function(type) {
	if (0 < (1 & type)) {
		var audios = document.getElementsByTagName('audio');
		if (audios && (0 < audios.length)) {
			Array.prototype.filter.call(audios, function(elem) {
				try { 
					elem.muted = true;  
					elem.load();  
					if (!elem.paused) { 
						elem.pause(); 
					}  
					elem.muted = false;  
					if (elem.id) { 
						_audioElements[elem.id] = elem; 
					} else if (elem.src) { 
						_audioElements[elem.src] = elem; 
					} 
				} catch (exception) { 
					console.log(exception); 
				}
			});
		}
	}
	if (0 < (2 & type)) {
		var videos = document.getElementsByTagName('video');
		if (videos && (0 < videos.length)) {
			Array.prototype.filter.call(videos, function(elem) {
				try { 
					elem.muted = true;  
					elem.load();  
					if (!elem.paused) { 
						elem.pause();
					}  
					elem.muted = false;  
					if (elem.id) { 
						_videoElements[elem.id] = elem; 
					} else if (elem.src) { 
						_videoElements[elem.src] = elem; 
					} 
				} catch (exception) { 
					console.log(exception); 
				}
			});
		}
	}
	if (0 < (4 & type)) {
		var youtube = document.getElementsByClassName('youtube');
		if (youtube && (0 < youtube.length)) {
			Array.prototype.filter.call(youtube, function(elem) {
				try { 
					var playerWindow = elem.contentWindow;  
					playerWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');  
					playerWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); 
					if (elem.id) { 
						_ytElements[elem.id] = elem; 
					} else if (elem.src) { 
						_ytElements[elem.src] = elem; 
					} 
				} catch (exception) { 
					console.log(exception); 
				}
			});
		}
	}
},
/**
 * メディアファイルの再生制御
 */
_playMedia = function(media) { 
	if (media) { 
		try { 
			if (!media.paused) { 
				media.pause(); 
			} 
			var promise = media.play(); 
			if (promise !== undefined) { 
				promise.then(_ => { 
					console.log('start media: ' + media.id); 
				}).catch(error => { 
					console.log('error media: ' + media.id); 
					self.log(error); 
				}); 
			} 
		} catch(exception) { 
			console.log(exception); 
		} 
	} 
},
_pauseMedia = function(media) { 
	if (media && (typeof media.pause === 'function')) { 
		media.pause(); 
	} 
},
_stopMedia = function(media) { 
	_pauseMedia();  
	if (media && (typeof media.currentTime !== 'undefined')) { 
		media.currentTime = 0; 
	} 
},
/**
 * YouTube埋め込みタグの再生制御
 */
_playYT = function(iFrame) { 
	if (iFrame) { 
		try { 
			var playerWindow = iFrame.contentWindow;  
			if (playerWindow) { 
				playerWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
			} 
		} catch (exception) { 
			console.log(exception); 
		} 
	} 
},
_pauseYT = function(iFrame) { 
	if (iFrame) { 
		try { 
			var playerWindow = iFrame.contentWindow;  
			if (playerWindow) { 
				playerWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); 
			} 
		} catch (exception) { 
			console.log(exception); 
		} 
	} 
},
_stopYT = function(iFrame) { 
	if (iFrame) { 
		try { 
			var playerWindow = iFrame.contentWindow; 
			if (playerWindow) { 
				playerWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');  
				playerWindow.postMessage('{"event":"command","func":"seekTo","args":[0, true]};', '*');
			} 
		} catch (exception) { 
			console.log(exception); 
		} 
	} 
},
/** audioの初期化 */
initAudio = function() { 
	_initMedia(1); 
},
/** audioの再生 */
playAudio = function(audio) { 
	_playMedia(audio); 
},
/** audioの一時停止 */
pauseAudio = function(audio) { 
	_pauseMedia(audio); 
},
/** audioの停止 */
stopAudio = function(audio) { 
	_stopMedia(audio); 
},
/** videoの初期化 */
initVideo = function() { 
	_initMedia(2); 
},
/** videoの再生 */
playVideo= function(video) { 
	_playMedia(video); 
},

/**
 * コントローラ初期化
 * @param cb object 各コールバック処理を格納したオブジェクト
 * @param conf object カード解析処理制御設定を格納したオブジェクト(設定値はMTCardConfigに準ずる)
 * @return _cardAnalyzer object カード解析オブジェクト
 */
initCtrl = function(cb, conf) {
	_callbacks = cb;
	_cardConf = new MTCardConfig(conf);
	/**
	 * カード解析に失敗した時のコールバック
	 * @param errorCode number エラーコード
	 * @param errorMsg string エラーメッセージ
	 * @param errorId null|string エラー発生ID(持ち手のみ判定出来なかった場合カード自体のIDのみ返却、その他はnull)
	 */
	var onError = function(errorCode, errorMsg, errorId) {
		if (typeof _callbacks[_cardConf.onErrorCallbackKey] === 'function') {
			/* 解析に失敗した時のコールバックを呼び出し */
			_callbacks[_cardConf.onErrorCallbackKey](errorCode, errorMsg, errorId);
		}
	};

	if (typeof window.ontouchstart !== 'undefined') {
		/*
		 * JSから再生を行うメディア読込用のモーダルがあれば初期化して閉じるイベントを設定
		 * カードの効果音自体はフラグで制御しているのでモーダルを表示したから必ず音が鳴る訳ではなく、あくまで音声や動画ファイルをJSから再生可能な待機状態にする為に使用
		 */
		var done = document.getElementById(_cardConf.initModalDoneElemId);
		if (done) {
			/* モーダル閉じるボタンのコールバック、解析をスタートして全audioファイルの初期化をし、モーダルを非表示にしてタッチイベント観測状態にする */
			var clickDone = function(e) {
				_cardAnalyzer.start(_cardConf.touchElement);/* 解析スタート */
				//initAudio();
				_initMedia(7); //<- 動画等もカードタッチで再生可能にしたい場合は「initAudio();」をコメントアウト又は削除し、こちらの初期化を使用する
				var modal = document.getElementById(_cardConf.initModalElemId); 
				if (modal) { 
					modal.style.display = 'none';		/*modal.parentNode.removeChild(modal.parentNode);*/ 
				}
			};
			if (isPassive) { 
				done.removeEventListener('click', clickDone, {passive: false, capture: false});  
				done.addEventListener('click', clickDone, {passive: false, capture: false}); 
			} else { 
				done.removeEventListener('click', clickDone, false);  
				done.addEventListener('click', clickDone, false); 
			}
		}


		/**
		 * カード解析を開始するタイミングでのコールバック
		 */
		var willStart = function() {
			if (typeof _callbacks[_cardConf.willStartCollbackKey] === 'function') {
				_callbacks[_cardConf.willStartCollbackKey]();
			}
		};

		/**
		 * カード解析処理のコールバック
		 * @param result object 解析結果
		 * @param errorCode number エラーコード(0: 正常, !0: 異常)
		 */
		var callback = function(result, errorCode) {
			/******************************************
			 * 解析結果
			 ******************************************/
			var defaultElem = document.getElementById(_cardConf.defaultContentsId);
			if (errorCode === 0) {
				if (!result) {
					/* カード解析処理エラー */
					if (defaultElem) { 
						defaultElem.style.display = 'block'; 
					}
					Array.prototype.forEach.call(document.querySelectorAll(_cardConf.variableContentsClass), function(elem) { 
						elem.style.display = 'none'; 
					});
					if (_cardConf.playSound && (_audioElements[_cardConf.ngSoundElemId] !== undefined)) { 
						playAudio(_audioElements[_cardConf.ngSoundElemId]); 
					}
					if (_cardConf.showErrorAlert) { 
						alert(_cardConf.commonErrorMsg); 
					}
					_cardAnalyzer.restart();
					onError(3, 'Process error', null); /* onError callback */
					return;
				}

				if ((typeof result.id === 'string') && (0 < result.id.length)) {
					/*******************************************
					 * カード解析成功時
					 *******************************************/
					if (_cardConf.playSound && (_audioElements[_cardConf.okSoundElemId] !== undefined)) {
						playAudio(_audioElements[_cardConf.okSoundElemId]);
					}
					analyzedCardId = '' + result.id; 
					position = '' + result.point;
					var autoPageCtrl = false, 
						autoRestart = true;
					if (typeof _callbacks[position] === 'function') {
						/* 持ち手個別処理が存在 */
						var tmp = _callbacks[position](analyzedCardId);
						if (typeof tmp === 'boolean') {
							autoPageCtrl = tmp;
						} else if (typeof tmp === 'object') {
							if (!Array.isArray(tmp)) { 
								autoPageCtrl = tmp['pageCtrl'];  
								autoRestart = tmp['restart']; 
							} else if (1 < tmp.length) { 
								autoPageCtrl = tmp[0];  
								autoRestart = tmp[1]; 
							}
						}
						if (!autoPageCtrl) {
							_cardAnalyzer.restart();
							return false; /* falseを受け取ったら処理を終了 */
						}
					}

					/* 初期表示コンテンツと動的表示コンテンツを一旦全て非表示にする */
					if (defaultElem) { 
						defaultElem.style.display = 'none'; 
					}
					Array.prototype.forEach.call(document.querySelectorAll(_cardConf.variableContentsClass), function(elem) { 
						elem.style.display = 'none'; 
					});
					/* 動的表示コンテンツより持ち手と合致する要素を表示状態にする */
					var elem = document.getElementById(_cardConf.elemIdPrefix + position); // Element Id(i1,i2,i3)
					if (elem) { 
						elem.style.display = 'block'; 
					}

					if (autoRestart) {
						/* 効果音再生待ち&連続解析防止の為一定時間タッチの受け付けを再開しない */
						_beepTimeOut = setTimeout(function() {
							_cardAnalyzer.restart();
						}, _cardConf.touchWaitTime);
					}

				} else {
					/*******************************************
					 * カード解析失敗時(解析処理は成功したが結果が有効なカードと識別できなかった場合)
					 *******************************************/
					_cardAnalyzer.restart();
					onError(1, 'Error', null); /* onError callback */
				}

			} else {
				/* エラーハンドリング */
				if (defaultElem) { 
					defaultElem.style.display = 'block'; 
				}
				Array.prototype.forEach.call(document.querySelectorAll(_cardConf.variableContentsClass), function(elem) { 
					elem.style.display = 'none'; 
				});
				if (_cardConf.playSound && (_audioElements[_cardConf.ngSoundElemId] !== undefined)) { 
					playAudio(_audioElements[_cardConf.ngSoundElemId]); 
				}
				if (_cardConf.showErrorAlert) { 
					alert(_cardAnalyzer.getErrorMessage(errorCode)); 
				}
				_cardAnalyzer.restart();
				onError(3, 'Process error', null); /* onError callback */
			}
		};

		/*
		 * 解析用オブジェクト生成
		 * @param callback function 解析処理終了時に呼ばれる処理
		 * @param willStart function カード解析処理実行直前に呼ばれる処理
		 * @param onError function カード識別エラー発生時に呼ばれる処理(解析して該当カード情報が無い場合にも呼ばれ、その際onErrorは呼ばれるが処理はそのまま継続される)
		 * @return object カード解析オブジェクト
		 */
		_cardAnalyzer = new Analyze(callback, willStart, onError);
		/*
		 * 解析スタート(メディア読込用のモーダル表示があった場合はモーダルを閉じる段階で実行)
		 * @param argument (string | element) カードのタッチを観測する要素の指定、string型での指定は要素のID指定となり、存在する場合はその要素を対象にする。存在しない場合はこのIDで画面最前面(z-index:1000)に透明な要素を追加して観測する
		 *                                    element(document等)を指定した場合はその要素を対象にカードのタッチ観測を行う
		 */
		if (done === null) {
			_cardAnalyzer.start(_cardConf.touchElement);
		}

	} else {
		/* タッチ操作非対応端末からのアクセス */
		onError(1, 'Disable device', null); /* onError callback */
	}
	return _cardAnalyzer;
};