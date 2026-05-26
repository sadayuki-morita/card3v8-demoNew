/**
 * マルチタッチ制御スクリプト
 * Copyright PKB SOLUTION INC.
 */


/**
 * 外部ファイルの読み込み
 */
var includeCount = 0, 
	requireCount = 0;

if(typeof srcIdFile=== "undefined"){							//ディレクトリ構成見直し 20260526
	srcIdFile="./js/c/cv8.js";
}

(function () {
	var query = (typeof window.location.search === 'string') ? window.location.search : '';
	if (/^\?/.test(query)) { query = query.substring(1); }
	//var require = ['./js/c/cv8.php', './js/cardv8.php'], scripts = {};
	//var require = ['./js/c/cv8-10id.js', './js/cardv8.js'], scripts = {};					//20240701
	var require = [srcIdFile, './js/cardv8.js'], scripts = {};					//20260526
	requireCount = require.length;
	for (var i = 0; i < requireCount; i++) {
		var src = require[i] + '?' + query;		  
		scripts[src] = document.createElement('script');  
		scripts[src].src = src; 
		document.getElementsByTagName('head')[0].appendChild(scripts[src]);
		scripts[src].onload = function() {
			if (typeof CONFV8 !== 'undefined') {
				if (typeof convertConf !== 'undefined') {
					cardConfMap = convertConf(CONFV8);
				}
			 }
			includeCount++;
		};
	}
})();

/**
 * 解析処理群
 * @param callback 解析結果のコールバック
 * @param willStart 解析スタート直前のコールバック
 * @param onError 解析エラー時のコールバック
 * @returns
 */
var Analyze = function (callback, willStart, onError) {
	this.callback = (typeof callback === 'function') ? callback : null;
	this.willStartAnalysis = (typeof willStart === 'function') ? willStart : null;
	this.onErrorAnalysed = (typeof onError === 'function') ? onError : null;

	/**
	 * 有効デバイス判定
	 */
	this.isEnableDevice = function(tablet) {
		if (window.ontouchstart !== undefined) {
			if (tablet === undefined) { 
				tablet = false; 
			}
			var ua = navigator.userAgent.toLowerCase();
			if (/ip(hone|ad|od)/.test(ua)) { 
				this.os = 'ios';  
				if (/safari/.test(ua)) { 
					if (!tablet) { 
						if (/mobile/.test(ua)) { 
							return true; 
						} 
					} else { 
						return true; 
					} 
				} 
			}
			if (/android/.test(ua)) { 
				this.os = 'android';  
				if (/chrome/.test(ua)) { 
					if (!tablet) { 
						if (/mobile/.test(ua)) { 
							return true; 
						}
					} else { 
						return true; 
					} 
				} 
			}
		}
		return false;
	};

	/**
	 * 現在時刻
	 */
	this.getNowTime = function() { 
		var date = new Date(); 
		return date.getTime(); 
	};

	/**
	 * クエリ生成
	 */
	this.buildQuery = function(params) {
		return Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
	};

	/**
	 * クエリ解析
	 */
	this.parseQuery = function(search) {
		if (typeof search !== 'string') { 
			search = window.location.search; 
		}
		if (/^\?/.test(search)) { 
			search = search.substring(1); 
		}
		var params = {}, 
			hash = search.slice(1).split('&'), 
			cnt = hash.length;
		for (var i = 0; i < cnt; i++) { 
			var tmp = hash[i].split('='); 
			params[tmp[0]] = tmp[1]; 
		}
		return params;
	};

	/**
	 * プロパティ更新
	 */
	this.setProperty = function(name, value) {
		if (this[name] !== undefined) {
			if (typeof this[name] === 'function') { 
				if (name !== 'callback') { 
					return; 
				} 
			}
			this[name] = value;
		}
	};

	/**
	 * 参照無しでコピー(JSON経由で復元する為利用できない値有り)
	 */
	this.deepCopy = function(args) {
		var result = null;
		try { 
			result = JSON.parse(JSON.stringify(args)); 
		} catch (exception) { 
			console.log(exception); 
		}
		return result;
	};

	/**
	 * 共通初期化処理
	 */
	this.init = function() {
		if (this.clearTimeOut !== null) { 
			clearTimeout(this.clearTimeOut); 
		}
		this.onTouch = false;  
		this.underAnalysis = false;  
		this.nowtouchPoints = {};  
		this.clearTimeOut = null;  
		this.pause = false;
	};

	/**
	 * 初回のみ実行する初期化処理
	 */
	this.constructor = function() {
		this.os = 'pc';  
		this.targetElement = null;  
		this.groupCodeKey = 'gp';  
		this.passive = false;  
		this.pointNumMax = 5;  
		this.enableZoomAction = false;  
		this.defaultLanguage = 'ja';  
		this.language = 'ja';
		this.errorMap = {
			0: null, 
			1: {'ja':'エラー', 'en':'Error'}, 
			2: {'ja':'通信エラー', 'en':'Network error'}, 
			3: {'ja':'処理エラー', 'en':'Process error'}, 
			4: {'ja':'APIキー認証エラー', 'en':'API Key error'}, 
			5: {'ja':'通信キャンセル', 'en':'Connection cancel'}
		};
		this.enableScrollAction = false;  
		this.touchedClearInterval = 300;
		this.isEnableDevice();  
		this.init();
	};

	this.constructor();
	var self = this;

	try { 
		var options = Object.defineProperty({}, 'passive', { get: function() { self.passive = true; } });  
		window.addEventListener('test', options, options);  
		window.removeEventListener('test', options, options); 
	} catch (exception) { 
		this.passive = false; 
	}

	/**
	 * ブラウザバック等での再表示時には動的更新値を初期化
	 */
	this.reloadFunc = function() { self.init(); };
	window.removeEventListener('pageshow', this.reloadFunc, this.passive ? {passive: true, capture: false} : false);
	window.addEventListener('pageshow', this.reloadFunc, this.passive ? {passive: true, capture: false} : false);

	/**
	 * エラーコードに該当するエラーメッセージを返却
	 * @param Number errorCode タッチイベント
	 */
	this.getErrorMessage = function(errorCode) {
		errorCode = parseInt(errorCode);
		if (self.errorMap[errorCode] === undefined) { errorCode = 1; }
		if (self.errorMap[errorCode][self.language] !== undefined) {
			return self.errorMap[errorCode][self.language];
		} else {
			if (self.errorMap[errorCode][self.defaultLanguage] !== undefined) {
				return self.errorMap[errorCode][self.defaultLanguage];
			}
		}
		return 'unknown error';
	};

	/**
	 * 認証に使用する各種フラグと配列を
	 */
	this.clearPointsCache = function() {
		self.underAnalysis = false;  
		self.nowtouchPoints = {};
	};

	/**
	 * ポーズ解除
	 */
	this.restart = function() {
		self.pause = false;
		self.underAnalysis = false;
		self.onTouch = false;
	};

	/**
	 * 解析処理実行
	 */
	this.analyze = function(points) {
		if (includeCount !== requireCount) {
			console.log('require error: [' + includeCount + '/' + requireCount + ']');  
			return false;
		}
		if (self.underAnalysis) { return false; }
		if (!self.onTouch) { return false; }
		if (self.pause) { return false; }

		if (typeof self.willStartAnalysis === 'function') { 
			self.willStartAnalysis(); 
		}

		var analyzed = null, errorCode = 0;
		if (typeof analyzeCard !== 'undefined') {
			var query = self.parseQuery(window.location.search), gpCode = 1;
			if (0 < Object.keys(query).length) {
				for (var k in query) {
					if ((k === self.groupCodeKey) && (query[k] !== undefined)) { 
						gpCode = parseInt(query[k]); 
					}
				}
			}
			analyzed = analyzeCard(points, gpCode);
		} else {
			analyzed = {'id': '', 'point': null};
			errorCode = 3;
		}
		if (((analyzed.id !== '') && (analyzed.point !== null)) || (0 < errorCode)) {
			self.clearPointsCache();
			if (typeof self.callback === 'function') { 
				self.pause = true; 
				self.callback(analyzed, errorCode); 
			} else { 
				console.log(analyzed); 
			}
		} else {
			errorCode = 1;
			var errorId = null, msg = 'Unknown card';
			if ((analyzed.id !== '') && (analyzed.point === null)) {
				msg = 'Unknown touch position';
				errorId = '' + analyzed.id;
			}
			if (typeof self.onErrorAnalysed === 'function') { 
				self.onErrorAnalysed(errorCode, msg, errorId); 
			}
			/*else { console.log(msg); }*/
		}
	};

	/**
	 * タッチ座標の蓄積処理と条件に合致した場合は認証処理へ
	 */
	this.checkTouchPoints = function(points) {
		try {
			if (!self.underAnalysis) {
				if (points.length === self.pointNumMax) {
					self.analyze(self.deepCopy(points));
				}
			}
		} catch (exception) {
			console.log(exception);
		}
	};

	/**
	 * 現在タッチ開始座標を保持
	 */
	this.addPoints = function (e) {
		try {
			var rect = e.target.getBoundingClientRect(), 
				touches = e.changedTouches, 
				len = touches.length, 
				elem = (self.targetElement !== document) ? self.targetElement : null;
			if (!rect && elem && elem.getBoundingClientRect) { 
				rect = elem.getBoundingClientRect(); 
			}
			for (var i = 0; i < len; i++) {
				var toucheId = touches[i].identifier, 
					x = touches[i].clientX - rect.left, 
					y = touches[i].clientY - rect.top, 
					no = self.countPoints(), 
					p = {
						'inputX': x, 
						'inputY': y, 
						'id': toucheId, 
						'no': no
					};
				self.nowtouchPoints[toucheId] = self.deepCopy(p);
			}
		} catch (exception) {
			console.log(exception);
		}
		return self.getPoints();
	};

	/**
	 * 現在タッチ中の座標を保持
	 */
	this.updatePoints = function(e) {
		try {
			var rect = e.target.getBoundingClientRect(), 
				touches = e.changedTouches, 
				len = touches.length, 
				elem = (self.targetElement !== document) ? self.targetElement : null;
			if (!rect && elem && elem.getBoundingClientRect) { 
				rect = elem.getBoundingClientRect(); 
			}
			for (var i = 0; i < len; i++) {
				var toucheId = touches[i].identifier;
				if (self.nowtouchPoints[toucheId] !== undefined) {
					self.nowtouchPoints[toucheId].inputX = touches[i].clientX - rect.left;
					self.nowtouchPoints[toucheId].inputY = touches[i].clientY - rect.top;
				}
			}
		} catch (exception) {
			console.log(exception);
		}
		return self.getPoints();
	};

	/**
	 * 離れた指の座標を削除
	 */
	this.deletePoints = function(e) {
		try {
			var touches = e.changedTouches;
			for (var i = 0, len = touches.length; i < len; i++) { 
				delete self.nowtouchPoints[touches[i].identifier]; 
			}
		} catch (exception) {
			console.log(exception);
		}
	};

	/**
	 * 現在の同時タッチ数
	 */
	this.countPoints = function() {
		return Object.keys(self.nowtouchPoints).length;
	};

	/**
	 * 保持しているタッチ座標をIDがキーのハッシュから配列に変換して返す
	 */
	this.getPoints = function() {
		var tp = [];
		try {
			Object.keys(self.nowtouchPoints).forEach(function(key) { 
				tp.push(self.deepCopy(self.nowtouchPoints[key])); 
			});
		} catch (exception) {
			console.log(exception);
		}
		return tp;
	};

	/**
	 * タッチ開始
	 */
	this.startListner = function(e) {
		self.onTouch = true;
		var points = self.addPoints(e);
		if (self.clearTimeOut !== null) { 
			clearTimeout(self.clearTimeOut); 
		}
		if (!self.underAnalysis) {
			if (self.enableScrollAction) {
				if (points.length < 2) {
					e.stopPropagation();
					return true;
				}
			}
			e.stopPropagation();
			if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
				e.preventDefault(); 
			}
			self.checkTouchPoints(points);
			return false;
		}
		if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
			e.preventDefault();
		}
	};

	/**
	 * ドラッグ操作
	 */
	this.moveListner = function(e) {
		self.onTouch = true;
		var points = self.updatePoints(e);
		if (self.clearTimeOut !== null) { 
			clearTimeout(self.clearTimeOut); 
		}
		if (!self.underAnalysis) {
			if (self.enableScrollAction) {
				if (points.length < 2) {
					e.stopPropagation();
					return true;
				}
			}
			e.stopPropagation();
			if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
				e.preventDefault(); 
			}
			self.checkTouchPoints(points);
			return false;
		}
		if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
			e.preventDefault(); 
		}
	};

	/**
	 * タッチ終了
	 */
	this.endListner = function(e) {
		if (self.clearTimeOut !== null) { clearTimeout(self.clearTimeOut); }
		self.deletePoints(e);
		var length = self.countPoints();
		self.onTouch = (0 < length);
		if (self.enableScrollAction) {
			if (length < 2) {
				e.stopPropagation();
				self.clearTimeOut = setTimeout(function() {
					self.onTouch = (0 < self.countPoints());
					if (!self.underAnalysis) {
						self.clearPointsCache();
					}
				}, self.touchedClearInterval);
				return true;
			}
		}
		e.stopPropagation();
		if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
			e.preventDefault(); 
		}

		/* タッチイベント終了後一定時間経過したら蓄積している座標を初期化 */
		self.clearTimeOut = setTimeout(function() {
			self.onTouch = (0 < self.countPoints());
			if (!self.underAnalysis) {
				self.clearPointsCache();
			}
		}, self.touchedClearInterval);
		return false;
	};

	/**
	 * タッチキャンセル
	 */
	this.cancelListner = function(e) {
		if ((typeof e.cancelable !== 'boolean') || e.cancelable) { 
			e.preventDefault(); 
		}
		self.clearTimeOut = setTimeout(function() {
			self.onTouch = (0 < self.countPoints());
			if (!self.underAnalysis) {
				self.clearPointsCache();
			}
		}, 
		self.touchedClearInterval);
	};

	/**
	 * ズームキャンセル(iOS用、androidはHTMLタグ側で制御)
	 */
	this.zoomCancel = function(e) {
		if (!self.enableZoomAction) {
			if ((typeof e.cancelable !== 'boolean') || e.cancelable) {
				e.preventDefault();
			}
			return false;
		}
	};

	/**
	 * 押印を受け付ける要素の追加
	 */
	this.addTouchElement = function(elementId) {
		var elem = null;
		try {
			elem = document.createElement('div'); 
			elem.setAttribute('id', elementId);
			elem.setAttribute('style', 'bottom: 0; height: 100%; margin: 0; padding: 0; position: fixed; top: 0; width: 100%; z-index: 1000;');
			document.body.appendChild(elem);
		} catch (exception) {
			console.log(exception);
			elem = null;
		}
		return elem;
	};

	/**
	 * 受付開始
	 */
	this.start = function(element) {
		if ((element === undefined) || !element) { element = document; }
		try {
			if (window.ontouchstart !== undefined) {
				var elem = (typeof element === 'string') ? document.getElementById(element) : element;
				if (elem === null) { 
					elem = self.addTouchElement(element); 
				}
				self.targetElement = elem;
				if (elem) {
					self.init();
					if (elem !== document) {
						elem.style.pointerEvents = 'auto';
					}
					if (self.passive) {
						elem.addEventListener('touchstart', self.startListner, {passive: false, capture: false});  
						elem.addEventListener('touchmove', self.moveListner, {passive: false, capture: false});
						elem.addEventListener('touchend', self.endListner, {passive: false, capture: false});  
						elem.addEventListener('touchcancel', self.cancelListner, {passive: false, capture: false});
						if ('ongesturestart' in window) {
							document.addEventListener('gesturestart', self.zoomCancel, {passive: false, capture: false});  
							document.addEventListener('gesturechange', self.zoomCancel, {passive: false, capture: false});  
							document.addEventListener('gestureend', self.zoomCancel, {passive: false, capture: false});
						}
					} else {
						elem.addEventListener('touchstart', self.startListner, false);  
						elem.addEventListener('touchmove', self.moveListner, false);
						elem.addEventListener('touchend', self.endListner, false);  
						elem.addEventListener('touchcancel', self.cancelListner, false);
						if ('ongesturestart' in window) {
							document.addEventListener('gesturestart', self.zoomCancel, false);  
							document.addEventListener('gesturechange', self.zoomCancel, false);  
							document.addEventListener('gestureend', self.zoomCancel, false);
						}
					}
				}
			}
		} catch (exception) {
			console.log(exception);
			return false;
		}
		return true;
	};

	/**
	 * 受付終了
	 */
	this.stop = function(element) {
		try {
			if ((element === undefined) || !element) { 
				element = self.targetElement; 
			}
			var elem = (typeof element === 'string') ? document.getElementById(element) : element;
			if (elem) {
				if (self.passive) {
					elem.removeEventListener('touchstart', self.startListner, {passive: false, capture: false});  
					elem.removeEventListener('touchmove', self.moveListner, {passive: false, capture: false});
					elem.removeEventListener('touchend', self.endListner, {passive: false, capture: false});  
					elem.removeEventListener('touchcancel', self.cancelListner, {passive: false, capture: false});
					if ('ongesturestart' in window) {
						document.removeEventListener('gesturestart', self.zoomCancel, {passive: false, capture: false});  
						document.removeEventListener('gesturechange', self.zoomCancel, {passive: false, capture: false});  
						document.removeEventListener('gestureend', self.zoomCancel, {passive: false, capture: false});
					}
				} else {
					elem.removeEventListener('touchstart', self.startListner, false);  
					elem.removeEventListener('touchmove', self.moveListner, false);
					elem.removeEventListener('touchend', self.endListner, false);  
					elem.removeEventListener('touchcancel', self.cancelListner, false);
					if ('ongesturestart' in window) {
						document.removeEventListener('gesturestart', self.zoomCancel, false);  
						document.removeEventListener('gesturechange', self.zoomCancel, false);  
						document.removeEventListener('gestureend', self.zoomCancel, false);
					}
				}
				if (elem !== document) {
					elem.style.pointerEvents = 'none';
				}
			}
		} catch (exception) {
			console.log(exception);
		}
	};

	/**
	 * 受付再設定
	 */
	this.reset = function(element) {
		if (element === undefined) { 
			element = self.targetElement; 
		}
		self.stop(element); 
		self.start(element);
	};
};