/*
 * WebStorages
 * var key = 'hoge', val = 'fuga';
 * var obj = new LS();//var obj = new SS();
 * obj.set(key, val);
 * val = obj.get(key);
 */

/**
 * WebStorage(値永続化、別Windowまで参照可能)
 */
function LS(){
	if(window.localStorage){
		this.enableStorage=true;
		this.storage=window.localStorage;
	}else{
		this.enableStorage=false;
		this.storage={
			setItem: function(key, value){console.log('set ws:'+key); console.log(value);},
			getItem: function(key){console.log('get ws:'+key); return null;},
			removeItem: function(key){console.log('remove ws:'+key);},
			clear: function(){console.log('clear ws:'+key);}
		};
	}
}
LS.prototype.set=function(key, val){this.storage.setItem(key, JSON.stringify(val));};
LS.prototype.get=function(key){var tmp=this.storage.getItem(key); return (tmp != null) ? JSON.parse(tmp) : null;};
LS.prototype.del=function(key){this.storage.removeItem(key);};
LS.prototype.clear=function(){this.storage.clear();};

/**
 * SessionStorage(Window又はTABが閉じるまで有効、現在のWindowが参照可能な範囲)
 */
function SS(){
	if(window.sessionStorage){
		this.enableStorage=true;
		this.storage=window.sessionStorage;
	}else{
		this.enableStorage=false;
		this.storage={
			setItem: function(key, value){console.log('set ss:'+key); console.log(value);},
			getItem: function(key){console.log('get ss:'+key); return null;},
			removeItem: function(key){console.log('remove ss:'+key);},
			clear: function(){console.log('clear ss:'+key);}
		};
	}
}
SS.prototype.set=function(key, val){this.storage.setItem(key, JSON.stringify(val));};
SS.prototype.get=function(key){var tmp=this.storage.getItem(key); return (tmp != null) ? JSON.parse(tmp) : null;};
SS.prototype.del=function(key){this.storage.removeItem(key);};
SS.prototype.clear=function(){this.storage.clear();};


/*
 * indexedDB
 * var dbName=location.host, tableName='hoge', keyName='key', ver=1, isOpen=false;
 * var obj=new IDB(dbName, tableName, keyName, ver);
 * var tHandler=obj.getTransactionHandler();
 * var oHabdler=obj.getOpenHandler();
 * oHabdler.onupgradeneeded(db, event){
 * 	// CreateIndex
 * 	//var valueName='value';
 * 	//var transaction=db.transaction([tableName], IDBTransaction.READ_WRITE);
 * 	//var store=transaction.objectStore(tableName);
 * 	//store.createIndex('findIndex', valueName);
 * 	isOpen=true;
 *
 * };
 * oHabdler.onsuccess(db, event){
 * 	// Opened
 * 	isOpen=true;
 * };
 * obj.open(oHabdler, ver);
 *
 * function getReq() {
 * 	//AjaxDone
 * 	setObject(result);
 * }
 */
function IDB(dbName, tableName, keyName, ver){
	this.dbObj=null;
	this.dbName=dbName;
	this.tableName=tableName;
	this.keyName=keyName;
	this.dbVersion=((typeof ver === 'undefinde') || (ver === null)) ? 1 : ver;
	window.indexedDB=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction=window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: 'readwrite', READ_ONLY: 'readonly', VERSION_CHANGE: 'versionchange'};
	window.IDBKeyRange=window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
	this.transaction=window.IDBTransaction;
	this.transaction.READ_WRITE='readwrite';
	this.transaction.READ_ONLY='readonly';
	this.transaction.VERSION_CHANGE='versionchange';
	this.keyRange=window.IDBKeyRange;
	if(window.indexedDB){
		this.enableDb=true;
		this.idb=window.indexedDB;
	}else{
		this.enableDb=false;
		this.idb={
			open:function(name, version){
				return this.getOpenHandler();
			},
			deleteDatabase:function(name){},
		};
	}
}
IDB.prototype.createDbName=function(prefix){
	if((typeof prefix === 'undefinde') && (prefix === null)){prefix='';}
	var dbName=(typeof window.location !== 'undefined') ? window.location.host : 'localhost';
	return prefix+dbName;
};
IDB.prototype.getOpenHandler=function(){
	return {
		onsuccess:function(db, event){console.log('onsuccess:'+this.dbName+'['+this.dbVersion+']');},
		onupgradeneeded:function(db, event){console.log('onupgradeneeded:'+this.dbName+'['+this.dbVersion+']');},
		onerror:function(db, event){console.log('onerror:'+this.dbName+'['+this.dbVersion+']');},
	};
};
IDB.prototype.getTransactionHandler=function(){
	return {
		oncomplete:function(event){console.log('oncomplete:'+this.dbName+'['+this.dbVersion+']');},/*transaction*/
		onabort:function(event){console.log('onabort:'+this.dbName+'['+this.dbVersion+']');},
		ontimeout:function(event){console.log('ontimeout:'+this.dbName+'['+this.dbVersion+']');},
		onsuccess:function(event){console.log('onsuccess:'+this.dbName+'['+this.dbVersion+']');},/*request*/
		onerror:function(event){console.log('onerror:'+this.dbName+'['+this.dbVersion+']');},
	};
};
/**
 * indexedDB Open
 * @param handler
 * @param ver
 * @param dbName
 */
IDB.prototype.open=function(handler, ver, dbName){
	var self=this;
	if((typeof ver !== 'undefinde') && (ver !== null)){self.dbVersion=ver;}
	if((typeof dbName !== 'undefinde') && (dbName !== null)){self.dbName=dbName;}
	else if(self.dbName === null){self.dbName=self.createDbName();}
	/*console.log('dbName: '+self.dbName);*/
	var req=self.idb.open(self.dbName, self.dbVersion);
	req.onupgradeneeded=function(event){
		self.dbObj=(event.result) ? event.result : event.target.result;
		if(handler && handler.onupgradeneeded){
			handler.onupgradeneeded(self.dbObj, event);
			return;
		}
		if((self.tableName !== null) && (self.keyName !== null)){
			var store=self.dbObj.createObjectStore(self.tableName, {keyPath: self.keyName});
			var transactionObj=store.transaction;
			transactionObj.oncomplete=function(event){
				if(self.oncomplete){self.oncomplete(self.dbObj, event);}
			};
			transactionObj.onabort=function(event){
				if(self.onerror){self.onerror(self.dbObj, event);}
			};
		}
	};
	req.onsuccess=function(event){
		self.dbObj=(event.result) ? event.result : event.target.result;
		if(handler && handler.onsuccess){handler.onsuccess(self.dbObj, event);}
		else if(self.onsuccess){self.onsuccess(self.dbObj, event);}
	};
	req.onerror=function(event){
		self.dbObj=null;
		if(handler && handler.onerror){handler.onerror(self.dbObj, event);}
		else if(self.onerror){self.onerror(self.dbObj, event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB Close
 * @param table
 */
IDB.prototype.close=function(table){
	if(this.dbObj !== null){this.dbObj.close();}
};
/**
 * indexedDB Delete Object Store
 * @param tableName
 */
IDB.prototype.dropTable=function(tableName){
	if(this.dbObj !== null){
		this.tableName=tableName;
		this.dbObj.deleteObjectStore(tableName);
	}
};
/**
 * indexedDB Delete Database
 * @param dbName
 */
IDB.prototype.dropDb=function(dbName){
	if(this.dbObj !== null){
		this.dbName=dbName;
		this.dbObj.deleteDatabase(dbName);
		this.idb.deleteDatabase(dbName);
	}
};
/**
 * indexedDB set object
 * @param values
 * @param table
 * @param handler
 */
IDB.prototype.set=function(values, table, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction(table, this.transaction.READ_WRITE);
	transactionObj.oncomplete=function(event){
		if(handler && handler.oncomplete){handler.oncomplete(event);}
		else{console.log('oncomplete');}
	};
	transactionObj.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{console.log('onerror');}
	};
	var store=transactionObj.objectStore(table),
	req=store.put(values);/*values={keyName: key, valueName: value,...};*/
	req.onsuccess=function(event){
		if(handler && handler.onsuccess){handler.onsuccess(event);}
		else{console.log('onsuccess');}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB get object
 * @param key
 * @param table
 * @param handler
 */
IDB.prototype.get=function(key, table, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction(table, this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var req=store.get(key);
	req.onsuccess=function(event){
		var result=(event.result) ? event.result : event.target.result;
		if(handler && handler.onsuccess){handler.onsuccess(result);}
		else{console.log(result);}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB delete object
 * @param key
 * @param table
 * @param handler
 */
IDB.prototype.del=function(key, table, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction([table], this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var req=store['delete'](key);
	req.onsuccess=function(event){
		var result=(event.result) ? event.result : event.target.result;
		if(handler && handler.onsuccess){handler.onsuccess(result);}
		else{console.log(result);}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB delete object from range
 * @param table
 * @param column
 * @param range
 * @param handler
 */
IDB.prototype.delRange=function(table, column, range, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction(table, this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var idx=store.index(column);
	var results=0, req=idx.openCursor(range);
	req.onsuccess=function(event){
		var cursor=(event.result) ? event.result : event.target.result;
		if(cursor){
			/*var tmp=cursor.value[column];*/
			var copy=Object.assign({}, cursor.value), request = cursor['delete']();
			request.onsuccess=function(){
				/*console.log('Delete '+column+'='+tmp);*/
				if(handler && handler.onsuccess){handler.onsuccess(copy);}
				results++;
			};
			request.onerror=function(event){
				if(handler && handler.onerror){handler.onerror(event);}
				else{
					if(event.errorCode){console.log('onerror: '+event.errorCode);}
					else{console.log('onerror: '+event.target.errorCode);}
				}
			};
			cursor['continue']();
		}else{
			if(handler && handler.oncomplete){handler.oncomplete(results);}
			else{console.log(results);}
		}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB clear object
 * @param table
 * @param handler
 */
IDB.prototype.clear=function(table, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction([table], this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var req=store.clear();
	req.onsuccess=function(event){
		var result=(event.result) ? event.result : event.target.result;
		if(handler && handler.onsuccess){handler.onsuccess(result);}
		else{console.log(result);}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB find all objects
 * @param table
 * @param handler
 */
IDB.prototype.findAll=function(table, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction([table], this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var results=[], req=store.openCursor();
	req.onsuccess=function(event){
		var cursor=(event.result) ? event.result : event.target.result;
		if(cursor){
			results.push(cursor.value);
			if(handler && handler.onsuccess){handler.onsuccess(cursor.value);}
			cursor['continue']();
		}else{
			if(handler && handler.oncomplete){handler.oncomplete(results);}
			else{console.log(results);}
		}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};
/**
 * indexedDB find objects
 * @param table
 * @param column
 * @param range
 * @param handler
 */
IDB.prototype.find=function(table, column, range, handler){
	if(table === null){table=this.tableName;}
	var transactionObj=this.dbObj.transaction([table], this.transaction.READ_WRITE);
	var store=transactionObj.objectStore(table);
	var index=store.index(column);
	var results=[], req=index.openCursor(range);
	req.onsuccess=function(event){
		var cursor=(event.result) ? event.result : event.target.result;
		if(cursor){
			results.push(cursor.value);
			if(handler && handler.onsuccess){handler.onsuccess(cursor.value);}
			cursor['continue']();
		}else{
			if(handler && handler.oncomplete){handler.oncomplete(results);}
			else{console.log(results);}
		}
	};
	req.onerror=function(event){
		if(handler && handler.onerror){handler.onerror(event);}
		else{
			if(event.errorCode){console.log('onerror: '+event.errorCode);}
			else{console.log('onerror: '+event.target.errorCode);}
		}
	};
};

/**
 * 合致する
 * @param only
 * @returns
 */
IDB.prototype.onlyBoundRange=function(only){
	return IDBKeyRange.only(only);
};
/**
 * 下限を設定した範囲指定
 * @param bound
 * @param open
 * @returns
 */
IDB.prototype.lowerBoundRange=function(bound, open){
	if(open === null){open=false;}// true:boundを含む, false:boundを含まない
	return IDBKeyRange.lowerBound(bound, open);
};
/**
 * 上限を設定した範囲指定
 * @param bound
 * @param open
 * @returns
 */
IDB.prototype.upperBoundRange=function(bound, open){
	if(open === null){open=false;}// true:boundを含む, false:boundを含まない
	return IDBKeyRange.upperBound(bound, open);
};
/**
 * 範囲指定
 * @param lower
 * @param upper
 * @param lowerOpen
 * @param upperOpen
 * @returns
 */
IDB.prototype.boundRange=function(lower, upper, lowerOpen, upperOpen){
	if(lowerOpen === null){lowerOpen=false;}// true:下限を含む, false:下限を含まない
	if(upperOpen === null){upperOpen=false;}// true:上限を含む, false:上限を含まない
	return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
};
