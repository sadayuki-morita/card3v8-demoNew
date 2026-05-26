/**
 * 各種制御スクリプト
 * Copyright PKB SOLUTION INC.
 */
var audioElements = {}, beepTimeOut, touchWaitTime = 700,
initAudio = function() {
	var audios = document.getElementsByTagName('audio');
	if (audios && (0 < audios.length)) {
		Array.prototype.filter.call(audios, function(elem) {
			try {
				elem.muted = true;  elem.load();  if (!elem.paused) { elem.pause(); }  elem.muted = false;
				if (elem.id) { audioElements[elem.id] = elem; } else if (elem.src) { audioElements[elem.src] = elem; }
			} catch (exception) {
				console.log(exception);
			}
		});
	}
},
playAudio = function(audio) {
	if (audio) {
		try {
			if (!audio.paused) { audio.pause(); }
			var promise = audio.play();
			if (promise !== undefined) {
				promise.then(_ => { console.log('start audio' + audio.id); }).catch(error => { console.log('error audio: ' + audio.id); self.log(error); });
			}
		} catch(e) {
			console.log(e);
		}
	}
};
var touchElemId = 'touch', analyzedCardId = '', cardAnalyze, position= '',
initCtrl = function(e) {
	if (typeof window.ontouchstart !== 'undefined') {
		/* 自動再生を行う為のモーダルがあれば閉じる */
		var done = document.getElementById('init_modal_done');
		if (done) {
			var clickDone = function(e) {
				initAudio();
				var modal = document.getElementById('init_modal');  modal.style.display = 'none';/*modal.parentNode.removeChild(modal.parentNode);*/
			};
			if (isPassive) {
				done.removeEventListener('click', clickDone, {passive: false, capture: false});  done.addEventListener('click', clickDone, {passive: false, capture: false});
			} else {
				done.removeEventListener('click', clickDone, false);  done.addEventListener('click', clickDone, false);
			}
		}
		var callback = function(result, errorCode) {
			var defaultElem = document.getElementById('default_contents');
			if (errorCode === 0) {
				if (!result) {
					/* 処理エラー */
					if (defaultElem) { defaultElem.style.display = 'block'; }
					Array.prototype.forEach.call(document.querySelectorAll('.variable_contents'), function(elem){ elem.style.display = 'none'; });
					if (playSound && (audioElements['beep_warning'] !== undefined)) { playAudio(audioElements.beep_warning); }
					alert('カードが認識出来ませんでした。');
					cardAnalyze.restart();
					return;
				}

				if ((typeof result.id === 'string') && (0 < result.id.length)) {
					analyzedCardId = '' + result.id;
					position = '' + result.point;
					console.log('analyzed card: ' + analyzedCardId);

					if (typeof cbFunctions['init'] === 'function') {
						//cbFunctions['init'](analyzedCardId);//202012
						var initResult = cbFunctions['init'](analyzedCardId);
						if (!initResult) {
							cardAnalyze.restart();
							return false;
						}
					}

					// 識別出来たが管理外のカードだった場合
					if (typeof cbFunctions[analyzedCardId] !== 'function') {
						//if (playSound && (audioElements['beep_warning'] !== undefined)) { playAudio(audioElements.beep_warning); }
						cardAnalyze.restart();
						return false;
					}
					//if (playSound && (audioElements['beep_pass'] !== undefined)) { playAudio(audioElements.beep_pass); }
					if (defaultElem) { defaultElem.style.display = 'none'; }
					Array.prototype.forEach.call(document.querySelectorAll('.variable_contents'), function(elem){
						elem.style.display = 'none';
					});
					var elem = document.getElementById(analyzedCardId);
					if (elem) { elem.style.display = 'block'; }

					/* 表示内容の切替が終わったらコールバックを実行 */
					cbFunctions[analyzedCardId]();

					/* 連続認識防止の為一定時間受け付けない */
					beepTimeOut = setTimeout(function() {
						cardAnalyze.restart();
					}, touchWaitTime);
				} else {
					cardAnalyze.restart();
				}

			} else {
				/* エラーハンドリング */
				if (defaultElem) { defaultElem.style.display = 'block'; }
				Array.prototype.forEach.call(document.querySelectorAll('.variable_contents'), function(elem){
					elem.style.display = 'none';
				});
				alert(cardAnalyze.getErrorMessage(errorCode));
				cardAnalyze.restart();
			}
		};
		/* 解析スタート */
		cardAnalyze = new Analyze(callback);
		cardAnalyze.start(touchElemId);
		//cardAnalyze.start(document);
		console.log('start card analyzing');
	}
};
