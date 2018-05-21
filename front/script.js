let connection,
  lastSelectedFile,
  myIP = '',
  counter = 0,
  allParticipants = 0;

const ipDuplicates = {};
const servers = {
  'iceServers': [{
    'url': 'stun:stun.l.google.com:19302'
  }, {
    'url': 'stun:stun1.l.google.com:19302'
  }, {
    'url': 'stun:stun2.l.google.com:19302'
  }, {
    'url': 'stun:stun3.l.google.com:19302'
  }, {
    'url': 'stun:stun4.l.google.com:19302'
  }]
};
const DragNDrop = {
  constructor() {
  },
  layer() {
    return document.querySelector('.overlay')
  },
  init() {
    document.ondragover = event => this.dragover(event);
    document.ondragleave = event => this.dragleave();
    document.ondrop = event => this.drop(event);
  },
  dragover(event) {
    event.preventDefault();
    if (counter < 1) {
      counter++;
      this.layer().classList.add('over');
    }
  },
  dragleave() {
    counter--;
    if (counter === 0) this.layer().classList.remove('over');
  },
  drop(event) {
    console.log(event, event.dataTransfer.items.length);
    counter = 1;
    this.dragleave();
    event.preventDefault();

    const fileList = event.dataTransfer.items || event.dataTransfer.files;
    fileList.forEach(f => {
      if (f.kind === 'file') {
        const file = f.getAsFile();
        console.log(f.name);
        this.onFileSelected(file);
        FileI.preview(file);
      }
    });

    this.removeDragData(event)
  },
  removeDragData(event) {
    event.dataTransfer.items ? event.dataTransfer.items.clear() : event.dataTransfer.clearData();
  },
  onFileSelected(file) {
    lastSelectedFile = file;
    if (connection) {
      connection.send({
        doYouWannaReceiveThisFile: true,
        fileName: file.size + file.name/* + (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '')*/
      });
      if(connection.userid) {
        connection.extra.lastFile = {
          name: file.name,
          color: 'green'
        };
        connection.updateExtraData();
      }
    }
  }
};
const FileI = {
  add(file) {
    const {url, name, type, size, uuid} = file;
    const list = document.querySelector('.fileList');
    const li = document.createElement('li');
    li.id = uuid;
    li.dataset.received = size + name;
    connection.fileReceived[size + name] = file;

    if (document.getElementById(uuid)) document.getElementById(uuid).remove();


    li.innerHTML =
      `<${url ? 'a href="' + url + '" target="_blank" download="' + name + '" onclick="User.onDownload(\'' + name + '\')"' : 'div'} class="fileItem">
         <div class="file-icon ${type ? type.split('/').join(' ') : ''}"></div>
         <div class="info">
           <div class="name">${name}</div>
           <div class="size">${this.bytesToSize(size)}</div>
           <div class="progressbar"><span class="progress-percent"></span></div>
         </div>
       </${url ? 'a' : 'div'}>
       ${url ? '' : '<div class="plugRight" onclick="FileI.cancel(\'' + uuid + '\')"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 357 357" style="enable-background:new 0 0 357 357;" xml:space="preserve"><g><g id="close"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3     214.2,178.5   " fill="#ff2424"></polygon></g></g></svg></div>'}`;
    list.insertBefore(li, list.firstElementChild);
  },
  remove(id) {
    let li = document.getElementById(id),
    previewId = document.querySelector('iframe#frame-preview').dataset.fileId;
    console.log('remove file', id);
    if (li) {
      if(li.dataset.received)
        delete connection.fileReceived[li.dataset.received];
      document.getElementById(id).remove();
    }
    if(li.dataset.received === previewId) {
      console.log(li.dataset.received, previewId);
      document.querySelector('iframe#frame-preview').setAttribute('src', '')
    }
  },
  preview(file) {
    const previewFrame = document.querySelector('iframe#frame-preview');
    const unknownFileIcon = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABC1BMVEUAAAD+qAD+pwD+qQD+pwD+qAD+qAD/qAD+qAAwMDD+qAD+qAD+qQD/pgD+qAAwMDAwMDD+qAD/qAD+qAD/pwD/pQD/pwAuLzL/pQD/pgD+pwD+qAD+qAD/qQD+qQD/pwD+qAD+qAD/qAD+qAD+qAD+qAD+qAD+qAD+qAAyMjL/pwD/pAD/qQD+qQD+qAD+qQD+pwD+pwD/qAD+qAD+qQD+qAD+qQD+pwD+qAD+qgD+pwD/mQAqLjJAOS0kKjOjchXhmAhKPy8NGkH/qAAxMTH/rgD/qwD/sgD/sQD/rQAsLjLxoAMnKzM+OS7/swCYbRn/sAD/tQCfcRhPQim5gBBAOzB/Xx6XbRnRjgtAIzWlAAAAQ3RSTlMAWKwJ17f48vvbLP3tJuQs4KWBSR4SBDEaB/bKiGRGP9HGnpqTjmtaOCgiDwvOsntuUsC8czHZT9/bdQri4tjBXzAntnGWiAAAA+BJREFUeNrt2vlz0kAUwPEVDUFzKCBIQRQol1Yo1h7e1+u+7NYaYz3//7/Ezji67gZj6Wwejub7azvkwxLI8gJb0sZFCz1psvN1fdvpXbLQoxev2XmqP4wFt9H7k+d32OrtuQnYib87unwOwVyANcDx4eqCoI02AasL7gPYBKwumNgFrC64YBtwKri6ZoApoAcoAT3AENADDAE9wBDQA0wBPcAU0ANU166uFaAE9AAluEEPMAWkgC8KoASEAHmiAJqACoAfjw6XCcgA8ObDckH+ALUEywVUAMCTw+Pjo1RPb1ABQH79/OFtqk/PXlEBgMvKmyW9JAMA4LIuZAEo+lcAiDyK358Wx4IjApACMIo9v1MajGq10WbV6fkVEUs6AI9c5/G00VQjjdZ0XA15hCQALva3A5auMXG8GHMHoAh3G+w33S5BkjMAZfUuy+jWTGCeAOl2WXZbQ4n5AaR/i/2xcRnzAqCrjp/RBDEfAHr32Zna5vkAkpvsjJV4HgDZ2Tgr4K6POQC826mpanfTcZzBImBmN7l9AC8xvXs1X8RCiDhyR1tML3DtA8wFaO38vPxg7DSYniNtA7DT1J//TgyqeJPp7VoH8G3jVRYarx0YV4WKbUBlarzIqPvGxvnpWgbgwyfaf9Y46IChcUnw0S5A6u+BZh8z/84algHmp2DLNQEPmjmvwCL7HOPVvM+BiT7X90xAjWlNy5YB3vjKLwU1NHzelGl10TIAyu2yql0BPWF+EA25bQDqgVbUaRjXiUtI+dUsnl03HwiBDoBi3mJ6zb6kA/BKrcmMuhLIANF+Pb0hCpEKgEmpxcw2HnAgAqBcsk9tVhMgAiA+Zqm2qglQAfiS53+lL4AKwOfp5d/1BVABMGwxo70HiQQygOwyo4UfAZABsHeRaTWqiQRCgDS3oZ0YgBCA7nX9+DMBtIAd/frbF0AL4CN9JCCAGIBj7QQMkRrg1bVNKgI1oKKNi0YJPUBbgQFf8wps/ocArzN3VCGSA4CLX0JI9e/fsvkbAJic3jTSlp8UgJG7M6yNHFcRSAFYGQbf51U3yxJUVAD0D9iP6v4a3gWV+0xVL5MD+ECfR0higDk53isTAzC8p38f3UdiwGxDB/SpAY8u6oAeMQDagTGXpAbImnl7gBiA4V2maq1hP8D7LbUpVzMZOgAkvfqPyXUnARUZADg4i/qt+mLuqeOTAgBFhABRhKCiAahSU+P/bEtWAApAASgABaAAFIACYB8wAYomvwccAEUHGT/DayPkHbazfhVbFZB3osoyCsK8BSIMWFbTnoij/IrFbI9lt9UdlPJr0L3HivS+ATItFpxy26LGAAAAAElFTkSuQmCC";
    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, {type: contentType});
    };
    const unknownBlobIcon = b64toBlob(unknownFileIcon, 'image/png');

    previewFrame.style.display = 'block';
    previewFrame.onload = () => {
      let frameBody = previewFrame.contentWindow.document.body || {};
      if(frameBody.querySelectorAll) {
        [...frameBody.querySelectorAll('*')].forEach(el => el.style.maxWidth = '100%');
        frameBody.style.textAlign = 'center';
      }
    };

    const fileNameMatches = (file.name || '').toLowerCase().match(/.webm|.mp4|.wav|.pdf|.rtf|.txt|.js|.css|.cs|.png|.jpg|.jpeg|.svg|.gif/g);
    previewFrame.src = URL.createObjectURL(fileNameMatches ? file : unknownBlobIcon);
    previewFrame.dataset.fileId = file.size + file.name;
  },
  uploadProgress(id, percent) {
    const li = document.getElementById(id);
    if (li) {
      li.querySelector('.progress-percent').style.width = percent + '%';
      if (percent >= 100) li.querySelector('.fileList .progressbar').style.opacity = 0;
    }
  },
  bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  },
  cancel(id) {
    console.log('cancel', id);
    if(connection.fbr.chunks[id]) connection.fbr.chunks[id] = {};
    connection.socket.emit('cancel-file', id);
  }
};
const User = {
  add(id, username, isMe) {
    console.log('add', id, username);
    if (ipDuplicates[id]) User.remove(id);
    const list = document.querySelector('.users-list');
    const li = document.createElement('li');
    li.id = id;
    if (isMe) li.classList.add('isMe');

    let {browser, lastFile} = connection.peers[id] ? connection.peers[id].extra : {};

    li.innerHTML =
      `<div class="avatar ${browser ? browser : this.getBrowser()}"></div>
        <div class="info">
          <div class="ip" style="opacity: 1;">${username ? username : id} ${id}</div>
          <div class="last-action ${lastFile && lastFile.color ? lastFile.color : ''}">${lastFile && lastFile.name ? lastFile.name : ''}</div>
        </div>
        ${isMe ? '<input style="display: none;z-index: 0;" value="' + (username ? username : id) + '" type="text" id="myNewUsername" onfocusout="User.changeUsername(\''+id+'\')">' +
        '<div class="edit plugRight" onclick="User.changeUsername(\''+id+'\')">' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 495 495" xml:space="preserve"><g><path style="fill:#005ECE;" d="M495,297.5v-110h-68.21c-3.63-11.87-8.42-23.31-14.35-34.23l45.42-45.42l-77.78-77.79l-46.05,46.06   c-11.66-6.08-23.87-10.89-36.53-14.38V0h-50v152c52.66,0,95.5,42.84,95.5,95.5S300.16,343,247.5,343v152h60v-74.82   c10.09-3.4,19.85-7.66,29.23-12.74l50.42,50.42l77.79-77.78l-51.06-51.05c5.27-10.11,9.58-20.64,12.91-31.53H495z"/><path style="fill:#2488FF;" d="M152,247.5c0-52.66,42.84-95.5,95.5-95.5V0h-60v64.82c-12.42,4.18-24.32,9.65-35.61,16.36   l-44.04-44.04l-77.79,77.78l47.74,47.74c-5.28,11.19-9.41,22.83-12.36,34.84H0v110h71.58c3.93,10.63,8.81,20.85,14.6,30.61   l-49.04,49.04l77.78,77.79l52.74-52.75c9.62,4.54,19.59,8.24,29.84,11.06V495h50V343C194.84,343,152,300.16,152,247.5z"/></g></svg>' +
        '</div>' : ''}`;
    list.insertBefore(li, (isMe ? list.firstElementChild : list.children[1]));
    ipDuplicates[id] = true;
  },
  remove(id) {
    console.log('remove', id);
    if (document.getElementById(id)) {
      document.getElementById(id).remove();
      delete ipDuplicates[id];
    }
  },
  getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf("Opera") !== -1) return "opera";
    else if (ua.indexOf("MSIE") !== -1) return "edge";
    else if (ua.indexOf("Chrome") !== -1) return "chrome";
    else if (ua.indexOf("Safari") !== -1) return "safari";
    else if (ua.indexOf("Firefox") !== -1) return "firefox";
  },
  changeUsername(id) {
    const span = document.querySelector('.isMe .ip'),
      input = document.querySelector('.isMe #myNewUsername');
    input.style.display = input.style.display === 'block' ? 'none' : 'block';
    input.style.zIndex = input.style.display === 'block' ? '1000' : '0';
    span.style.opacity = span.style.opacity === '1' ? '0' : '1';
    if (input.style.display === 'block') input.focus();
    else {
      let value = input.value;
      document.querySelector('.isMe .ip').innerText = value;
      window.localStorage.setItem('myUsername', value);
      if(id) {
        connection.extra.username = value;
        connection.updateExtraData();
      }
    }
  },
  onDownload(name) {
    if(connection.userid) {
      connection.extra.lastFile = {
        name: name,
        color: 'blue'
      };
      connection.updateExtraData();
    }
  }
};
let external = '';


window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

const pc = new RTCPeerConnection(servers, {
  optional: [{
    RtpDataChannels: true
  }]
});
const noop = () => {
};

pc.createDataChannel('');//create a bogus data channel
pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
pc.onicecandidate = ice => {
  if (ice && ice.candidate && ice.candidate.candidate) {
    const userIP = ice.candidate.candidate.split(' ')[4];

    /*
    От 10.0.0.0 до 10.255.255.255
    От 172.16.0.0 до 172.31.255.255
    От 192.168.0.0 до 192.168.255.255
  */
    let isLocal = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/.test(userIP);

    if (!isLocal) {
      external = userIP;
      joinARoom(userIP.replace(/\./g, '_'));
    } else myIP = userIP;
  }
};

const drops = [...document.querySelectorAll('.dropBox')];
drops.forEach(el => DragNDrop.init(el));
DragNDrop.init();

function joinARoom(roomId) {
  const chunk_size = 60 * 1000;

  function setupWebRTCConnection() {
    if (connection) return;
    connection = new RTCMultiConnection();

    connection.fileReceived = {};
    connection.socketURL = '/';

    connection.socketMessageEvent = 'file-sharing-demo';

    connection.chunkSize = chunk_size;

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false
    };

    connection.enableFileSharing = true;

    connection.channel = connection.sessionid = roomId;

    connection.session = {
      data: true,
      // oneway: true /// --- to make it one-to-many
    };

    connection.connectedWith = {};

    connection.onmessage = function (event) {
      if (event.data.doYouWannaReceiveThisFile) {
        if (!connection.fileReceived[event.data.fileName]) {
          console.log('onmessage');
          connection.send({
            yesIWannaReceive: true,
            fileName: event.data.fileName
          });
        }
      }

      if (event.data.yesIWannaReceive && !!lastSelectedFile) {
        connection.shareFile(lastSelectedFile, event.userid);
      }
    };

    connection.onopen = e => {
      try {
        chrome.power.requestKeepAwake('display');
      } catch (e) {
      }

      User.add(connection.userid, connection.username, true);
      if (connection.connectedWith[e.userid]) return;
      connection.connectedWith[e.userid] = true;

      if (!lastSelectedFile) return;

      var file = lastSelectedFile;
      setTimeout(function () {
        console.log('Sharing file ' + file.name + '\nSize: ' + FileI.bytesToSize(file.size) + '\nWith ' + connection.getAllParticipants().length + ' users');

        connection.send({
          doYouWannaReceiveThisFile: true,
          fileName: file.size + file.name
        });
      }, 500);
    };

    connection.onclose = function (e) {
      incrementOrDecrementUsers(e.userid);

      if (connection.connectedWith[e.userid]) return;

      console.log('Re-Connecting...');
      connection.join(roomId);
    };

    connection.onerror = function (e) {
      if (connection.connectedWith[e.userid]) return;

      console.log('Data connection failed. between you and <b>' + e.userid + '</b>. Retrying..');
    };

    setFileProgressBarHandlers(connection);

    connection.onUserStatusChanged = function (user) {
      incrementOrDecrementUsers(user.userid);
    };

    connection.onleave = function (user) {
      user.status = 'offline';
      connection.onUserStatusChanged(user);
      incrementOrDecrementUsers(user.userid);
    };

    connection.onfilecancel = FileI.remove;

    connection.openOrJoin(connection.channel, function (isRoomExists, roomid) {
      console.log(connection.channel, isRoomExists, roomid);
      var message = 'Successfully connected to room: ' + roomid;

      console.log(message);

      var socket = connection.getSocket();
      socket.on('disconnect', function () {
        console.log('Seems disconnected.', 'red');
      });
      socket.on('connect', function () {
        console.log('connect!!!!!!');
        location.reload();
      });
      socket.on('error', function () {
        location.reload();
      });

      window.addEventListener('offline', function () {
        console.log('Seems disconnected.', 'red');
      }, false);
    });

    window.connection = connection;
  }

  function setFileProgressBarHandlers(connection) {
    connection.onFileStart = file => {
      // if (!connection.fileReceived[file.size + file.name])
      FileI.add(file);
    };
    connection.onFileProgress = chunk => FileI.uploadProgress(chunk.uuid, parseInt((chunk.currentPosition / chunk.maxChunks) * 100));
    connection.onFileEnd = file => {
      if (/*!connection.fileReceived[file.size + file.name] && */file.remoteUserId === connection.userid) {
        FileI.add(file);
        FileI.uploadProgress(file.uuid, 100);
        FileI.preview(file);
        // connection.fileReceived[file.size + file.name] = file;
      }
    };
  }

  var numberOfUsers = document.getElementById('number-of-users');


  function incrementOrDecrementUsers(userID) {
    const getAll = connection ? connection.getAllParticipants().length : 0;

    if (allParticipants > getAll) User.remove(userID);

    if (allParticipants <= getAll && connection.peers[userID]) {
      User.add(userID, connection.peers[userID].extra.username);
    }

    numberOfUsers.innerHTML = allParticipants = getAll;
    numberOfUsers.innerHTML = [...connection.getAllParticipants()];
  }

  setupWebRTCConnection();
}

window.addEventListener('online', function () {
  location.reload();
}, false);

