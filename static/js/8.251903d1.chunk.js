(this.webpackJsonp=this.webpackJsonp||[]).push([[8],{1914:function(t,e,i){"use strict";i.r(e),i.d(e,"FilesystemWeb",(function(){return o}));var r=i(262);function s(t){const e=t.split("/").filter(t=>"."!==t),i=[];return e.forEach(t=>{".."===t&&i.length>0&&".."!==i[i.length-1]?i.pop():i.push(t)}),i.join("/")}class o extends r.b{constructor(){super(...arguments),this.DB_VERSION=1,this.DB_NAME="Disc",this._writeCmds=["add","put","delete"]}async initDb(){if(void 0!==this._db)return this._db;if(!("indexedDB"in window))throw this.unavailable("This browser doesn't support IndexedDB");return new Promise((t,e)=>{const i=indexedDB.open(this.DB_NAME,this.DB_VERSION);i.onupgradeneeded=o.doUpgrade,i.onsuccess=()=>{this._db=i.result,t(i.result)},i.onerror=()=>e(i.error),i.onblocked=()=>{console.warn("db blocked")}})}static doUpgrade(t){const e=t.target.result;switch(t.oldVersion){case 0:case 1:default:e.objectStoreNames.contains("FileStorage")&&e.deleteObjectStore("FileStorage");e.createObjectStore("FileStorage",{keyPath:"path"}).createIndex("by_folder","folder")}}async dbRequest(t,e){const i=-1!==this._writeCmds.indexOf(t)?"readwrite":"readonly";return this.initDb().then(r=>new Promise((s,o)=>{const a=r.transaction(["FileStorage"],i).objectStore("FileStorage")[t](...e);a.onsuccess=()=>s(a.result),a.onerror=()=>o(a.error)}))}async dbIndexRequest(t,e,i){const r=-1!==this._writeCmds.indexOf(e)?"readwrite":"readonly";return this.initDb().then(s=>new Promise((o,a)=>{const n=s.transaction(["FileStorage"],r).objectStore("FileStorage").index(t)[e](...i);n.onsuccess=()=>o(n.result),n.onerror=()=>a(n.error)}))}getPath(t,e){const i=void 0!==e?e.replace(/^[/]+|[/]+$/g,""):"";let r="";return void 0!==t&&(r+="/"+t),""!==e&&(r+="/"+i),r}async clear(){(await this.initDb()).transaction(["FileStorage"],"readwrite").objectStore("FileStorage").clear()}async readFile(t){const e=this.getPath(t.directory,t.path),i=await this.dbRequest("get",[e]);if(void 0===i)throw Error("File does not exist.");return{data:i.content?i.content:""}}async writeFile(t){const e=this.getPath(t.directory,t.path);let i=t.data;const r=t.encoding,s=t.recursive,o=await this.dbRequest("get",[e]);if(o&&"directory"===o.type)throw Error("The supplied path is a directory.");const a=e.substr(0,e.lastIndexOf("/"));if(void 0===await this.dbRequest("get",[a])){const e=a.indexOf("/",1);if(-1!==e){const i=a.substr(e);await this.mkdir({path:i,directory:t.directory,recursive:s})}}if(!r&&(i=i.indexOf(",")>=0?i.split(",")[1]:i,!this.isBase64String(i)))throw Error("The supplied data is not valid base64 content.");const n=Date.now(),d={path:e,folder:a,type:"file",size:i.length,ctime:n,mtime:n,content:i};return await this.dbRequest("put",[d]),{uri:d.path}}async appendFile(t){const e=this.getPath(t.directory,t.path);let i=t.data;const r=t.encoding,s=e.substr(0,e.lastIndexOf("/")),o=Date.now();let a=o;const n=await this.dbRequest("get",[e]);if(n&&"directory"===n.type)throw Error("The supplied path is a directory.");if(void 0===await this.dbRequest("get",[s])){const e=s.indexOf("/",1);if(-1!==e){const i=s.substr(e);await this.mkdir({path:i,directory:t.directory,recursive:!0})}}if(!r&&!this.isBase64String(i))throw Error("The supplied data is not valid base64 content.");void 0!==n&&(i=void 0===n.content||r?n.content+i:btoa(atob(n.content)+atob(i)),a=n.ctime);const d={path:e,folder:s,type:"file",size:i.length,ctime:a,mtime:o,content:i};await this.dbRequest("put",[d])}async deleteFile(t){const e=this.getPath(t.directory,t.path);if(void 0===await this.dbRequest("get",[e]))throw Error("File does not exist.");if(0!==(await this.dbIndexRequest("by_folder","getAllKeys",[IDBKeyRange.only(e)])).length)throw Error("Folder is not empty.");await this.dbRequest("delete",[e])}async mkdir(t){const e=this.getPath(t.directory,t.path),i=t.recursive,r=e.substr(0,e.lastIndexOf("/")),s=(e.match(/\//g)||[]).length,o=await this.dbRequest("get",[r]),a=await this.dbRequest("get",[e]);if(1===s)throw Error("Cannot create Root directory");if(void 0!==a)throw Error("Current directory does already exist.");if(!i&&2!==s&&void 0===o)throw Error("Parent directory must exist");if(i&&2!==s&&void 0===o){const e=r.substr(r.indexOf("/",1));await this.mkdir({path:e,directory:t.directory,recursive:i})}const n=Date.now(),d={path:e,folder:r,type:"directory",size:0,ctime:n,mtime:n};await this.dbRequest("put",[d])}async rmdir(t){const{path:e,directory:i,recursive:r}=t,s=this.getPath(i,e),o=await this.dbRequest("get",[s]);if(void 0===o)throw Error("Folder does not exist.");if("directory"!==o.type)throw Error("Requested path is not a directory");const a=await this.readdir({path:e,directory:i});if(0!==a.files.length&&!r)throw Error("Folder is not empty");for(const n of a.files){const t=`${e}/${n.name}`;"file"===(await this.stat({path:t,directory:i})).type?await this.deleteFile({path:t,directory:i}):await this.rmdir({path:t,directory:i,recursive:r})}await this.dbRequest("delete",[s])}async readdir(t){const e=this.getPath(t.directory,t.path),i=await this.dbRequest("get",[e]);if(""!==t.path&&void 0===i)throw Error("Folder does not exist.");const r=await this.dbIndexRequest("by_folder","getAllKeys",[IDBKeyRange.only(e)]);return{files:await Promise.all(r.map(async t=>{let i=await this.dbRequest("get",[t]);return void 0===i&&(i=await this.dbRequest("get",[t+"/"])),{name:t.substring(e.length+1),type:i.type,size:i.size,ctime:i.ctime,mtime:i.mtime,uri:i.path}}))}}async getUri(t){const e=this.getPath(t.directory,t.path);let i=await this.dbRequest("get",[e]);return void 0===i&&(i=await this.dbRequest("get",[e+"/"])),{uri:(null===i||void 0===i?void 0:i.path)||e}}async stat(t){const e=this.getPath(t.directory,t.path);let i=await this.dbRequest("get",[e]);if(void 0===i&&(i=await this.dbRequest("get",[e+"/"])),void 0===i)throw Error("Entry does not exist.");return{type:i.type,size:i.size,ctime:i.ctime,mtime:i.mtime,uri:i.path}}async rename(t){await this._copy(t,!0)}async copy(t){return this._copy(t,!1)}async requestPermissions(){return{publicStorage:"granted"}}async checkPermissions(){return{publicStorage:"granted"}}async _copy(t,e=!1){let{toDirectory:i}=t;const{to:r,from:o,directory:a}=t;if(!r||!o)throw Error("Both to and from must be provided");i||(i=a);const n=this.getPath(a,o),d=this.getPath(i,r);if(n===d)return{uri:d};if(function(t,e){t=s(t),e=s(e);const i=t.split("/"),r=e.split("/");return t!==e&&i.every((t,e)=>t===r[e])}(n,d))throw Error("To path cannot contain the from path");let c;try{c=await this.stat({path:r,directory:i})}catch(y){const t=r.split("/");t.pop();const e=t.join("/");if(t.length>0){if("directory"!==(await this.stat({path:e,directory:i})).type)throw new Error("Parent directory of the to path is a file")}}if(c&&"directory"===c.type)throw new Error("Cannot overwrite a directory with a file");const h=await this.stat({path:o,directory:a}),l=async(t,e,r)=>{const s=this.getPath(i,t),o=await this.dbRequest("get",[s]);o.ctime=e,o.mtime=r,await this.dbRequest("put",[o])},u=h.ctime?h.ctime:Date.now();switch(h.type){case"file":{const t=await this.readFile({path:o,directory:a});e&&await this.deleteFile({path:o,directory:a});const s=await this.writeFile({path:r,directory:i,data:t.data});return e&&await l(r,u,h.mtime),s}case"directory":{if(c)throw Error("Cannot move a directory over an existing object");try{await this.mkdir({path:r,directory:i,recursive:!1}),e&&await l(r,u,h.mtime)}catch(y){}const t=(await this.readdir({path:o,directory:a})).files;for(const s of t)await this._copy({from:`${o}/${s}`,to:`${r}/${s}`,directory:a,toDirectory:i},e);e&&await this.rmdir({path:o,directory:a})}}return{uri:d}}isBase64String(t){return/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(t)}}o._debug=!0}}]);