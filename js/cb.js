/**
 * カード認識結果ハンドリング
 * カードタッチ後の動作を定義
 */
//playMedia(media)

var ssObj = new SS(), lastAnalyzedCard = null, lastAnalyzedId = null, lastTouchNo = 1, DIALOGELEMENTID = 'dialog', item225Exchanged = [], toggleChangeTimer = null, changeTimer = null, selectedWeaponNo = 1, videoPlaying = false;
var equipIdNo = 1;
var playingCallback = function(e) { videoPlaying = true; };
var pauseCallback = function(e) { videoPlaying = false; };
var errorCallback = function(e) {
	console.log('media errorCallback');
	console.log('type: ' + e.type);
	if (e.target) {
		console.log(e.target);
		if (e.target.currentTime) {
			console.log('currentTime: ' + e.target.currentTime);
			//e.target.currentTime = 0;
		}
		if (e.type === 'error') {
			if (typeof e.target.pause === 'function') {
				console.log('error pause();');
				e.target.pause();
			}
			videoPlaying = false;
		}
	}
}
var initMediaEvents = function(media) {
	if (media) {
		media.removeEventListener('playing', playingCallback, true);  media.removeEventListener('pause', pauseCallback, true);  media.removeEventListener('error', errorCallback, true);
		media.removeEventListener('stalled', errorCallback, true);
		media.addEventListener('playing', playingCallback, true);  media.addEventListener('pause', pauseCallback, true);  media.addEventListener('error', errorCallback, true);
		media.addEventListener('stalled', errorCallback, true);
	}
}
var cbFunctions = {
	// 初期処理
	'init': function(card){
		console.log('init: ' + card);
		stopMedia();
		cancelDialog();
		if (toastr) { toastr.clear(); }
		if (typeof card !== 'undefined') {
			$('#floating_button_area').removeClass('hidden');
			if (lastAnalyzedCard == null) { lastAnalyzedCard = card; }
			var id = card.split('-')[0];
			if ((id !== null) && (id != lastAnalyzedId)) {
				// changed card
				if (lastAnalyzedId === 'ID10482') { ssObj.clear(); item225Exchanged = []; }
				if (lastAnalyzedId === 'ID10367') { ssObj.clear(); }
				if (lastAnalyzedId === 'ID10490') {
					if (changeTimer !== null) { clearInterval(changeTimer); changeTimer = null; }
					if (toggleChangeTimer !== null) { clearInterval(toggleChangeTimer); toggleChangeTimer = null; }
					selectedWeaponNo = 1;
					equipIdNo = 1;
				}
				lastAnalyzedId = id;

				/* /202012
				if (id === 'ID10381') { //if (id === 'ID10307') {
					$('#floating_button_area').addClass('hidden');
					playPass();
					if (card === 'ID10381-1') {//if (card === 'ID10307-1') {
						location.href='https://youtu.be/TGF-QgSAZ_I';
					} else if (card === 'ID10381-2') {//} else if (card === 'ID10307-2') {
						location.href='https://youtu.be/gD7Yx439QNY';
					} else if (card === 'ID10381-3') {//} else if (card === 'ID10307-3') {
						location.href='https://youtu.be/B5aAK9zEuGc';
					}
					return false;
				}
				//202012 */

				var video = $('#vd'+lastAnalyzedCard)[0];
				if (video) {
					video.currentTime = 0;
				}
			}
			/* /202012
			else {
				if (id === 'ID10381') { //if (id === 'ID10307') {
					$('#floating_button_area').addClass('hidden');
					playPass();
					if (card === 'ID10381-1') {//if (card === 'ID10307-1') {
						location.href='https://youtu.be/TGF-QgSAZ_I';
					} else if (card === 'ID10381-2') {//} else if (card === 'ID10307-2') {
						location.href='https://youtu.be/gD7Yx439QNY';
					} else if (card === 'ID10381-3') {//} else if (card === 'ID10307-3') {
						location.href='https://youtu.be/B5aAK9zEuGc';
					}
					return false;
				}
			}
			//202012 */

		} else {
			// HOMEボタン押下時
			var video = $('#vd'+lastAnalyzedCard)[0];
			if (video) {
				video.currentTime = 0;
			}
			ssObj.clear(); item225Exchanged = []; lastAnalyzedCard = null; lastAnalyzedId = null;
			if (changeTimer !== null) { clearInterval(changeTimer); changeTimer = null; }
			if (toggleChangeTimer !== null) { clearInterval(toggleChangeTimer); toggleChangeTimer = null; }
			selectedWeaponNo = 1;
			equipIdNo = 1;
		}
		return true;
	},


	/* 鴨川SW
	 * 動作メモ
	 *
	 */
	'ID10317': function(){
		$('#ID10317').css('display', 'none');
		$('#ID10317-1').css('display', 'block');
		$('#ID10317-2').css('display', 'none');
		$('#ID10317-3').css('display', 'none');
		this['ID10317-1']();
	},

	// 鴨川SW1
	'ID10317-1': function(){
		playPass();
		var video = $('#vdID10317-1')[0];
		if (video) {
			initMediaEvents(video);
			if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
				playMedia2top(video);
			} else {
				if (!videoPlaying) { playMedia(video); }
				else { pauseMedia(video); }
			}
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	// 鴨川SW2
	'ID10317-2': function(){
		playPass();  lastAnalyzedCard = arguments.callee.name;
	},
	// 鴨川SW3
	'ID10317-3': function(){
		playPass();  lastAnalyzedCard = arguments.callee.name;
	},


	/* ギフト
	 * 動作メモ
	 *
	 */
	'ID10482': function(){
		$('#ID10482').css('display', 'none');
		$('#ID10482-1').css('display', 'block');
		$('#ID10482-2').css('display', 'none');
		$('#ID10482-3').css('display', 'none');
		this['ID10482-1']();
	},
	// ギフト1
	'ID10482-1': function(){
		var key = 'pin225', key2 = 'balance225', val = ssObj.get(key);
		if (!val) {
			playPass();
			var checkPinCode = function() {
				cancelDialog();
				var pin = $('#input_pin .pincode').val();
				if (pin === '29111288') {
					playOk();
					ssObj.set(key, pin);  ssObj.set(key2, 30000);
					if (toastr) { toastr.success('認証に成功しました。', null, {'timeOut':1000, 'positionClass':'toast-top-center'}); } else { alert('認証に成功しました。'); }
				} else if (0 < pin.length) {
					playNg();
					if (toastr) { toastr.error('認証に失敗しました。<br>正しいPINCODEを登録してださい。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('認証に失敗しました。\n正しいPINCODEを登録してださい。'); }
				}
			};
			var content = '<div id="input_pin" class="dialog_body">PINCODEを入力してください。<br /><br /><div class="pin_area">PIN:<input type="number" class="pincode" value="" style="width: 70%;" onkeydown="chekEnterKey();"></div></div>';
			showDialog('登録', content, [{'text':'OK', 'click':checkPinCode}]);
			setTimeout(function() { $('.ui-dialog-buttonset input').focus(); }, 300);
		} else {
			playPass();
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	// ギフト2
	'ID10482-2': function(){
		var key = 'pin225', key2 = 'balance225', val = ssObj.get(key);
		if (!val) {
			playWarn();
			if (toastr) { toastr.warning('はじめにPINCODEの登録を行ってください。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('はじめにPINCODEの登録を行ってください。'); }
		} else {
			playPass();
			val = ssObj.get(key2);  show225question(val);
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	// ギフト3
	'ID10482-3': function(){
		var key = 'pin225', key2 = 'balance225', val = ssObj.get(key);
		if (!val) {
			playWarn();
			if (toastr) { toastr.warning('はじめにPINCODEの登録を行ってください。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('はじめにPINCODEの登録を行ってください。'); }
		} else {
			playPass();
			val = ssObj.get(key2);  show225Balance(val);
		}
		lastAnalyzedCard = arguments.callee.name;
	},


	/* ゲーム
	 * 動作メモ
	 * グラフィック
	 */
	'ID10490': function(){
		$('#ID10490').css('display', 'none');
		$('#ID10490-1').css('display', 'block');
		$('#ID10490-2').css('display', 'none');
		$('#ID10490-3').css('display', 'none');
		this['ID10490-1']();
	},
	// ゲーム1
	'ID10490-1': function(){
		playPass();
		stopToggleImages();
		if (toggleChangeTimer !== null) {
			selectedWeaponNo = equipIdNo;
			if (toastr) { toastr.success('装備が完了しました。', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); } else { alert('装備が完了しました。'); }
			clearInterval(toggleChangeTimer);
			toggleChangeTimer = null;
		} else {
			$('.equip').css('display', 'none');
			$('#equip1').css('display', 'inline');
			equipIdNo = 1;
			var maxElem = $('.equip').length,
			toggle = function() {
				$('#equip_image').animate({opacity: 'hide',}, {duration: 200, easing: 'swing',
					complete: function() {
						$('#equip' + equipIdNo).css('display', 'none');
						equipIdNo++;
						if (maxElem < equipIdNo) { equipIdNo = 1; }
						$('#equip' + equipIdNo).css('display', 'inline');
						$('#equip_image').animate({opacity: 'show',}, {duration: 200, easing: 'swing',});
					}
				});
			};
			toggleChangeTimer = setInterval(toggle, 3000);
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	// ゲーム2
	'ID10490-2': function(){
		playPass();
		showSelectedWeapon();
		lastAnalyzedCard = arguments.callee.name;
	},
	// ゲーム3
	'ID10490-3': function(){
		playPass();
		if (changeTimer != null) { clearInterval(changeTimer); changeTimer = null; }
		lastAnalyzedCard = arguments.callee.name;
	},


	/* 学習
	 * 動作メモ
	 *
	 */
	'ID10492': function(){
		$('#ID10492').css('display', 'none');
		$('#ID10492-1').css('display', 'block');
		$('#ID10492-2').css('display', 'none');
		$('#ID10492-3').css('display', 'none');
		this['ID10492-1']();
	},
	// 学習1
	'ID10492-1': function(){
		playPass();
		lastTouchNo = 1;
		if (toastr) { toastr.clear();  toastr.success('Strawberry There are six.', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); }
		lastAnalyzedCard = arguments.callee.name;
	},
	// 学習2
	'ID10492-2': function(){
		playPass();
		lastTouchNo = 2;
		if (toastr) { toastr.clear();  toastr.success('イチゴが6個あります。', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); }
		lastAnalyzedCard = arguments.callee.name;
	},
	// 学習3
	'ID10492-3': function(){
		playPass();
		if (toastr) { toastr.clear(); }
		if (lastTouchNo === 1) { show327questionEn(); } else { show327questionJa(); }
		lastAnalyzedCard = arguments.callee.name;
	},


	/* 音楽
	 * 動作メモ
	 * 動画べつの持ち手でも維持
	 *
	 * キーボードフォーカス遅らせる
	 * キャッシュ強化
	 */
	'ID10367': function(){
		$('#ID10367').css('display', 'none');
		$('#ID10367-1').css('display', 'block');
		$('#ID10367-2').css('display', 'none');
		$('#ID10367-3').css('display', 'none');
		this['ID10367-1']();
	},
	// 音楽1
	'ID10367-1': function(){
		var key = 'pin176', val = ssObj.get(key);
		if (!val) {
			playPass();
			var checkPinCode = function() {
				cancelDialog();
				var pin = $('#input_pin .pincode').val();
				if (pin === '2674') {
					playOk();
					ssObj.set(key,pin);
					if (toastr) { toastr.success('認証に成功しました。', null, {'timeOut':1000, 'positionClass':'toast-top-center'}); } else { alert('認証に成功しました。'); }
				} else if (0 < pin.length) {
					playNg();
					if (toastr) { toastr.error('認証に失敗しました。<br>正しいPINCODEを登録してださい。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('認証に失敗しました。\n正しいPINCODEを登録してださい。'); }
				}
			};
			var content = '<div id="input_pin" class="dialog_body">PINCODEを入力してください。<br /><br /><div class="pin_area">PIN:<input type="number" class="pincode" value="" style="width: 70%;" onkeydown="chekEnterKey();"></div></div>';
			showDialog('登録', content, [{'text':'OK', 'click':checkPinCode}]);
			setTimeout(function() { $('.ui-dialog-buttonset input').focus(); }, 300);

		} else {
			playPass();
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	// 音楽2
	'ID10367-2': function(){
		var key = 'pin176', val = ssObj.get(key);
		if (!val) {
			$('#ID10367-2').css('display', 'none');
			$('#ID10367-3').css('display', 'none');
			$('#ID10367-1').css('display', 'block');
			playWarn();
			if (toastr) { toastr.warning('はじめにPINCODEの登録(<b>Registration</b>)を行ってください。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('はじめにPINCODEの登録を行ってください。'); }
		} else {
			playPass();
			var audio = $('#adID10367-2')[0];
			if (audio) {
				audio.currentTime = 0;
				playAudioData(audio);
			}
		}
		lastAnalyzedCard = arguments.callee.name;
	},
	/* 音楽3
	 * 動作メモ
	 *
	 */
	'ID10367-3': function(){
		var key = 'pin176', val = ssObj.get(key);
		if (!val) {
			$('#ID10367-2').css('display', 'none');
			$('#ID10367-3').css('display', 'none');
			$('#ID10367-1').css('display', 'block');
			playWarn();
			if (toastr) { toastr.warning('はじめにPINCODEの登録(<b>Registration</b>)を行ってください。', null, {'timeOut':3000, 'positionClass':'toast-top-center'}); } else { alert('はじめにPINCODEの登録を行ってください。'); }
		} else {
			playPass();
			var video = $('#vdID10367-3')[0];
			if (video) {
				initMediaEvents(video);
				if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
					playMedia2top(video);
				} else {
					if (!videoPlaying) { playMedia(video); }
					else { pauseMedia(video); }
				}
			}
		}
		lastAnalyzedCard = arguments.callee.name;
	},


	/* 観光
	 * 動作メモ
	 *
	 */
	'ID10381': function(){
		$('#ID10381').css('display', 'none');
		$('#ID10381-1').css('display', 'none');
		$('#ID10381-2').css('display', 'block');
		$('#ID10381-3').css('display', 'none');
		this['ID10381-2']();
	},
	// 観光1
	'ID10381-1': function(){
		playPass();
		var video = $('#vdID10381-1')[0];
		if (video) {
			initMediaEvents(video);
			if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
				playMedia2top(video);
			} else {
				if (!videoPlaying) { playMedia(video); }
				else { pauseMedia(video); }
			}
		}

		lastAnalyzedCard = arguments.callee.name;
	},
	// 観光2
	'ID10381-2': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
	// 観光3
	'ID10381-3': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},


	// 名刺
	'ID10307': function(){
		$('#ID10307').css('display', 'none');
		$('#ID10307-1').css('display', 'block');
		$('#ID10307-2').css('display', 'none');
		$('#ID10307-3').css('display', 'none');
		this['ID10307-1']();
	},
	// 名刺1
	'ID10307-1': function(){
		playPass();
		var video = $('#vdID10307-1')[0];
		if (video) {
			initMediaEvents(video);
			if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
				playMedia2top(video);
			} else {
				if (!videoPlaying) { playMedia(video); }
				else { pauseMedia(video); }
			}
		}

		lastAnalyzedCard = arguments.callee.name;
	},
	// 名刺2
	'ID10307-2': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
	// 名刺3
	'ID10307-3': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},


	// バースデー
	'ID10288': function(){
		$('#ID10288').css('display', 'none');
		$('#ID10288-1').css('display', 'block');
		$('#ID10288-2').css('display', 'none');
		$('#ID10288-3').css('display', 'none');
		this['ID10288-1']();
	},
	// バースデー1
	'ID10288-1': function(){
		playPass();
		var video = $('#vdID10288-1')[0];
		if (video) {
			initMediaEvents(video);
			if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
				playMedia2top(video);
			} else {
				if (!videoPlaying) { playMedia(video); }
				else { pauseMedia(video); }
			}
		}

		lastAnalyzedCard = arguments.callee.name;
	},
	// バースデー2
	'ID10288-2': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
	// バースデー3
	'ID10288-3': function(){
		playPass();
		var video = $('#vdID10288-3')[0];
		if (video) {
			initMediaEvents(video);
			if (lastAnalyzedCard.split('-')[0] !== arguments.callee.name.split('-')[0]) {
				playMedia2top(video);
			} else {
				if (!videoPlaying) { playMedia(video); }
				else { pauseMedia(video); }
			}
		}

		lastAnalyzedCard = arguments.callee.name;
	},


	// 居酒屋
	'ID10123': function(){
		$('#ID10123').css('display', 'none');
		$('#ID10123-1').css('display', 'block');
		$('#ID10123-2').css('display', 'none');
		$('#ID10123-3').css('display', 'none');
		this['ID10123-1']();
	},
	// 居酒屋1
	'ID10123-1': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
	// 居酒屋2
	'ID10123-2': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
	// 居酒屋3
	'ID10123-3': function(){
		playPass();
		lastAnalyzedCard = arguments.callee.name;
	},
};


function playPass() {
	var audio = document.getElementById('beep_pass');
	playAudioData(audio);
}
function playWarn() {
	var audio = document.getElementById('beep_warning');
	playAudioData(audio);
}
function playOk() {
	var audio = document.getElementById('beep_ok');
	playAudioData(audio);
}
function playNg() {
	var audio = document.getElementById('beep_ng');
	playAudioData(audio);
}
function playChime() {
	var audio = document.getElementById('beep_chime');
	playAudioData(audio);
}
function playAudioData(audio) {
	if (audio) {
		try {
			if (!audio.paused) { audio.pause(); }
			var promise = audio.play();
			if (promise !== undefined) {
				promise.then(_ => { console.log('start audio' + audio.id); }).catch(error => { console.log('error audio: ' + audio.id); console.log(error); });
			}
		} catch(e) {
			console.log(e);
		}
	}
}
function playYT2top(video) {
	if (video) {
		try {
			var pw = video.contentWindow;
			pw.postMessage('{"event":"command","func":"seekTo","args":[0, true]};', '*');
			pw.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
		} catch (e) {
			console.log(e);
		}
	}
}
function playYT(video) {
	if (video) {
		try {
			var pw = video.contentWindow;
			pw.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
		} catch (e) {
			console.log(e);
		}
	}
}
function pauseYT(video) {
	if (video) {
		try {
			var pw = video.contentWindow;
			pw.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
		} catch (e) {
			console.log(e);
		}
	}
}

function playMedia2top(media) {
	console.log('playMedia2top');
	if (media) {
		media.currentTime = 0;
		playMedia(media);
	}
}
function playMedia(media) {
	console.log('playMedia');
	if (media) {
		try {
			var promise = media.play();
			if (promise !== undefined) {
				promise.then(_ => { console.log('start media'); }).catch(error => { console.log('error media', error.name, error.message); });
			}
		} catch (e) {
			console.log(e);
		}
	}
}
function pauseMedia(media) {
	if (media && (typeof media.pause === 'function')) {
		media.pause();
	}
}
function stopMedia() {
	try {
		// 動画・音声の一時停止
		$('audio').each(function(index, elem) {
			if (typeof elem.pause === 'function') { elem.pause(); }
		});
		$('video').each(function(index, elem) {
			if (typeof elem.pause === 'function') { elem.pause(); }
		});
		$('.youtube').each(function(index, elem) {
			var pw = elem.contentWindow;
			pw.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
		});
	} catch(e) {
		alert('stopMedia:' + e);
	}
}



/**
 * require jquery ui
 */

function cancelDialog() {
	$('#' + DIALOGELEMENTID).dialog('close');
}

function chekEnterKey() {
	if (window.event.keyCode === 13) {
		$('.ui-dialog-buttonset button').click();
	}
}

function show327questionJa() {
	var html1 = '<span>イチゴは何色ですか?<br /></span><label><input id="answer_item1" class="answer_items1" type="radio" name="answers1" value="1">黄</label><br /><label><input id="answer_item2" class="answer_items1" type="radio" name="answers1" value="2">青</label><br /><label><input id="answer_item3" class="answer_items1" type="radio" name="answers1" value="3">赤</label><br /><label><input id="answer_item4" class="answer_items1" type="radio" name="answers1" value="4">緑</label><br />',
	html2 = '<span>イチゴは何個ありますか?<br /></span><label><input id="answer_item5" class="answer_items2" type="radio" name="answers2" value="1">4</label><br /><label><input id="answer_item6" class="answer_items2" type="radio" name="answers2" value="2">5</label><br /><label><input id="answer_item7" class="answer_items2" type="radio" name="answers2" value="3">6</label><br /><label><input id="answer_item8" class="answer_items2" type="radio" name="answers2" value="4">7</label><br />',
	content1 = $(html1), content2 = $(html2),
	checkQuestion2 = function() {
		cancelDialog();
		var radioVal = parseInt($('input[name="answers2"]:checked').val());
		if (radioVal == 3) {
			playChime();
			if (toastr !== undefined) { toastr.success('正解!!', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); } else { alert('正解!!'); }
		} else {
			playNg();
			if (toastr !== undefined) { toastr.error('不正解', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); } else { alert('不正解'); }
		}
	},
	checkQuestion1 = function() {
		cancelDialog();
		var radioVal = parseInt($('input[name="answers1"]:checked').val());
		if (radioVal == 3) {
			playChime();
			if (toastr !== undefined) { toastr.success('正解!!', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); } else { alert('正解!!'); }
		} else {
			playNg();
			if (toastr !== undefined) { toastr.error('不正解', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); } else { alert('不正解'); }
		}
		showDialog('問題2', content2, [{'text':'決定', 'click':checkQuestion2}, {'text':'キャンセル', 'click':cancelDialog}]);
	};
	showDialog('問題1', content1, [{'text':'決定', 'click':checkQuestion1}, {'text':'キャンセル', 'click':cancelDialog}]);
}



function show327questionEn() {
	var html1 = '<span>Strawberry What is the color<br /></span><label><input id="answer_item1" class="answer_items1" type="radio" name="answers1" value="1">YELLOW</label><br /><label><input id="answer_item2" class="answer_items1" type="radio" name="answers1" value="2">BLUE</label><br /><label><input id="answer_item3" class="answer_items1" type="radio" name="answers1" value="3">RED</label><br /><label><input id="answer_item4" class="answer_items1" type="radio" name="answers1" value="4">GREEN</label><br />',
	html2 = '<span>How many pieces strawberries<br /></span><label><input id="answer_item5" class="answer_items2" type="radio" name="answers2" value="1">Four</label><br /><label><input id="answer_item6" class="answer_items2" type="radio" name="answers2" value="2">Five</label><br /><label><input id="answer_item7" class="answer_items2" type="radio" name="answers2" value="3">Six</label><br /><label><input id="answer_item8" class="answer_items2" type="radio" name="answers2" value="4">Seven</label><br />',
	content1 = $(html1), content2 = $(html2),
	checkQuestion2 = function() {
		cancelDialog();
		var radioVal = parseInt($('input[name="answers2"]:checked').val());
		if (radioVal == 3) {
			playChime();
			if (toastr !== undefined) { toastr.success('Correct!', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); } else { alert('Correct!'); }
		} else {
			playNg();
			if (toastr !== undefined) { toastr.error('Incorrect', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); } else { alert('Incorrect'); }
		}
	},
	checkQuestion1=function() {
		cancelDialog();
		var radioVal = parseInt($('input[name="answers1"]:checked').val());
		if (radioVal == 3) {
			playChime();
			if (toastr !== undefined) { toastr.success('Correct!', null, {'timeOut':2000, 'positionClass':'toast-top-center'}); } else { alert('Correct!'); }
		} else {
			playNg();
			if (toastr !== undefined) { toastr.error('Incorrect', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); } else { alert('Incorrect'); }
		}
		showDialog('Question2', content2, [{'text':'OK', 'click':checkQuestion2}, {'text':'Cancel', 'click':cancelDialog}]);
	};
	showDialog('Question1', content1, [{'text':'OK', 'click':checkQuestion1}, {'text':'Cancel', 'click':cancelDialog}]);
}





function show225question(balance) {
	var html = '<span>商品を選択してください。<br /></span><label><input id="select_item1" class="select_items" type="radio" name="items" value="10000" checked>商品1: 10,000円</label><br />	<label><input id="select_item2" class="select_items" type="radio" name="items" value="20000">商品2: 20,000円</label><br />',
	content = $(html),
	nowBalance = parseInt(balance),
	checkBalance = function() {
		cancelDialog();
		var radioVal = parseInt($('input[name="items"]:checked').val());
		if (radioVal <= nowBalance) {
			playOk();
			nowBalance -= radioVal;
			var item = (radioVal === 10000) ? '商品1' : '商品2';
			item225Exchanged.push(item);
			if (toastr !== undefined) { toastr.success('商品の購入が完了しました。<br />購入商品:' + item, null, {'timeOut':1500, 'positionClass':'toast-top-center'}); }
			var key = 'pin225', key2 = 'balance225';
			if (ssObj !== undefined) {
				ssObj.set(key2, nowBalance);
			}
		} else {
			playWarn();
			var num = nowBalance - radioVal;
			if (toastr !== undefined) { toastr.error('残高が足りません。<br />' + num + '円', null, {'timeOut':1500, 'positionClass':'toast-top-center'}); }
		}
	};
	showDialog('購入', content, [{'text':'決済', 'click':checkBalance}, {'text':'中止', 'click':cancelDialog}]);
}

function show225Balance(balance) {
	var html = '<span>ご利用残高は' + balance + '円になります。<br /></span>';
	if (0 < item225Exchanged.length) {
		html += '<span>購入済み商品<br /></span><ul>';
		for (var i = 0; i < item225Exchanged.length; i++) {
			html += '<li>' + item225Exchanged[i] + '</li>';
		}
		html += '</ul>';
	}
	var content = $(html);
	showDialog('購入履歴', content, [{'text':'閉じる', 'click':cancelDialog}]);
}


function mediaInitAndClose(type) {
	try {
		console.log('mediaInitAndClose');
		if (typeof type !== 'number') {
			type = 7;
		}
		if (0 < (1 & type)) {
			var audios = document.getElementsByTagName('audio');
			if (audios && (0 < audios.length)) {
				console.log('init audios');
				Array.prototype.filter.call(audios, function(elem) {
					try {
						elem.muted = true;  elem.load();  if (!elem.paused) { elem.pause(); }  elem.muted = false;
					} catch (exception) {
						console.log(exception);
					}
				});
			}
		}
		if (0 < (2 & type)) {
			var videos = document.getElementsByTagName('video');
			if (videos && (0 < videos.length)) {
				console.log('init videos');
				Array.prototype.filter.call(videos, function(elem) {
					try {
						elem.muted = true;  elem.load();  if (!elem.paused) { elem.pause(); }  elem.muted = false;
					} catch (exception) {
						console.log(exception);
					}
				});
			}
		}
		if (0 < (4 & type)) {
			var youtube = document.getElementsByClassName('youtube');
			if (youtube && (0 < youtube.length)) {
				console.log('init youtube');
				Array.prototype.filter.call(youtube, function(elem) {
					try {
						var pw = elem.contentWindow;
						pw.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
						pw.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
					} catch (exception) {
						console.log(exception);
					}
				});
			}
		}
	} catch(e) {
		console.log(e);
	}
	cancelDialog();
}


function showDialog(title, content, buttons, elementId) {
	if (elementId === undefined || elementId === null) {
		elementId = DIALOGELEMENTID;
	}
	var elem = document.getElementById(elementId);
	if (!elem) {
		elem =  document.createElement('div');
		elem.setAttribute('id', elementId);
		elem.setAttribute('style', 'display: none;');
		document.body.appendChild(elem);
	}
	$(elem).html(content);
	$(elem).dialog({ modal: true, autoOpen: true, draggable: false, closeOnEscape: false, resizable: false, title: title, buttons: buttons, open: function(event, ui) { $('.ui-dialog-titlebar-close').show(); } });
}
function openDialog(title, content, buttons, showCloseButton) {
	$("#base_dialog").html(content);
	$("#base_dialog").dialog({
		modal: true,
		autoOpen: true,
		draggable: false,
		closeOnEscape: false,
		resizable: false,
		title: title,
		buttons: buttons,
		open: function(event, ui) {
			if (!showCloseButton) {
				$(".ui-dialog-titlebar-close").hide();
			} else {
				$(".ui-dialog-titlebar-close").show();
			}
		}
	});
}



function stopToggleImages() {
	if (toggleChangeTimer != null) { clearInterval(toggleChangeTimer); }
}
function showSelectedWeapon() {
	$('#selected_weapon').css('opacity', '0.0').attr('src', './img/weapon' + selectedWeaponNo + '.png').animate({opacity: '1.0',}, {duration: 200, easing: 'swing',});
}




function showAudioInitDialog() {
	var html = '<span>マルチタッチカードで画面にタッチして下さい</span>', content = $(html);
	showDialog('Let\'s try it!', content, [{'text':'OK', 'click':mediaInitAndClose}]);
	$('.ui-widget-overlay').last().css('z-index', '9999');
	$('.ui-dialog').last().css('z-index', '10000');
}


$(document).ready(function(){
	showAudioInitDialog();
	ssObj.clear();
	$('#floating_button_area').css('z-index', '10001');
	$('#home_button').off('click').on('click', function() {
		cbFunctions['init']();
		//lastAnalyzedCard = null;
		//lastAnalyzedId = null;
		$('.variable_contents').css('display', 'none');
		$('#default_contents').css('display', 'block');
		$('#floating_button_area').addClass('hidden');
	});
});
