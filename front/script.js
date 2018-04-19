/*
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//compatibility for Firefox and chrome
var pc = new RTCPeerConnection({iceServers: []}), noop = function () {
};
pc.createDataChannel('');//create a bogus data channel
pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
pc.onicecandidate = function (ice) {
  console.log(ice.candidate);
  if (ice && ice.candidate && ice.candidate.candidate) {
    const h1 = document.createElement('h1');
    const myIP = ice.candidate.candidate.split(' ')[4];
    h1.innerText = `my IP:  ${myIP}`;
    document.body.appendChild(h1);
  }
};
*/
const DragNDrop = {
  constructor() {
  },
  init(el) {
    el.ondragover = (event) => this.dragover(el, event);
    el.ondragleave = (event) => this.dragleave(el, event);
    el.ondrop = (event) => this.drop(el, event);
  },
  dragover(el, event) {
    event.preventDefault();
    el.classList.add('over');
  },
  dragleave(el, event) {
    el.classList.remove('over');
  },
  drop(el, event) {
    this.dragleave(el, event);
    event.preventDefault();

    const fileList = event.dataTransfer.items || event.dataTransfer.files;

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].kind === 'file') {
        const file = fileList[i].getAsFile();
        this.previewFile(file);
        this.addFileToList(file);
      }
    }

    this.removeDragData(event)
  },
  previewFile(file) {
    const previewFrame = document.querySelector('iframe');
    const unknownFileIcon = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABC1BMVEUAAAD+qAD+pwD+qQD+pwD+qAD+qAD/qAD+qAAwMDD+qAD+qAD+qQD/pgD+qAAwMDAwMDD+qAD/qAD+qAD/pwD/pQD/pwAuLzL/pQD/pgD+pwD+qAD+qAD/qQD+qQD/pwD+qAD+qAD/qAD+qAD+qAD+qAD+qAD+qAD+qAAyMjL/pwD/pAD/qQD+qQD+qAD+qQD+pwD+pwD/qAD+qAD+qQD+qAD+qQD+pwD+qAD+qgD+pwD/mQAqLjJAOS0kKjOjchXhmAhKPy8NGkH/qAAxMTH/rgD/qwD/sgD/sQD/rQAsLjLxoAMnKzM+OS7/swCYbRn/sAD/tQCfcRhPQim5gBBAOzB/Xx6XbRnRjgtAIzWlAAAAQ3RSTlMAWKwJ17f48vvbLP3tJuQs4KWBSR4SBDEaB/bKiGRGP9HGnpqTjmtaOCgiDwvOsntuUsC8czHZT9/bdQri4tjBXzAntnGWiAAAA+BJREFUeNrt2vlz0kAUwPEVDUFzKCBIQRQol1Yo1h7e1+u+7NYaYz3//7/Ezji67gZj6Wwejub7azvkwxLI8gJb0sZFCz1psvN1fdvpXbLQoxev2XmqP4wFt9H7k+d32OrtuQnYib87unwOwVyANcDx4eqCoI02AasL7gPYBKwumNgFrC64YBtwKri6ZoApoAcoAT3AENADDAE9wBDQA0wBPcAU0ANU166uFaAE9AAluEEPMAWkgC8KoASEAHmiAJqACoAfjw6XCcgA8ObDckH+ALUEywVUAMCTw+Pjo1RPb1ABQH79/OFtqk/PXlEBgMvKmyW9JAMA4LIuZAEo+lcAiDyK358Wx4IjApACMIo9v1MajGq10WbV6fkVEUs6AI9c5/G00VQjjdZ0XA15hCQALva3A5auMXG8GHMHoAh3G+w33S5BkjMAZfUuy+jWTGCeAOl2WXZbQ4n5AaR/i/2xcRnzAqCrjp/RBDEfAHr32Zna5vkAkpvsjJV4HgDZ2Tgr4K6POQC826mpanfTcZzBImBmN7l9AC8xvXs1X8RCiDhyR1tML3DtA8wFaO38vPxg7DSYniNtA7DT1J//TgyqeJPp7VoH8G3jVRYarx0YV4WKbUBlarzIqPvGxvnpWgbgwyfaf9Y46IChcUnw0S5A6u+BZh8z/84algHmp2DLNQEPmjmvwCL7HOPVvM+BiT7X90xAjWlNy5YB3vjKLwU1NHzelGl10TIAyu2yql0BPWF+EA25bQDqgVbUaRjXiUtI+dUsnl03HwiBDoBi3mJ6zb6kA/BKrcmMuhLIANF+Pb0hCpEKgEmpxcw2HnAgAqBcsk9tVhMgAiA+Zqm2qglQAfiS53+lL4AKwOfp5d/1BVABMGwxo70HiQQygOwyo4UfAZABsHeRaTWqiQRCgDS3oZ0YgBCA7nX9+DMBtIAd/frbF0AL4CN9JCCAGIBj7QQMkRrg1bVNKgI1oKKNi0YJPUBbgQFf8wps/ocArzN3VCGSA4CLX0JI9e/fsvkbAJic3jTSlp8UgJG7M6yNHFcRSAFYGQbf51U3yxJUVAD0D9iP6v4a3gWV+0xVL5MD+ECfR0higDk53isTAzC8p38f3UdiwGxDB/SpAY8u6oAeMQDagTGXpAbImnl7gBiA4V2maq1hP8D7LbUpVzMZOgAkvfqPyXUnARUZADg4i/qt+mLuqeOTAgBFhABRhKCiAahSU+P/bEtWAApAASgABaAAFIACYB8wAYomvwccAEUHGT/DayPkHbazfhVbFZB3osoyCsK8BSIMWFbTnoij/IrFbI9lt9UdlPJr0L3HivS+ATItFpxy26LGAAAAAElFTkSuQmCC";
    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
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
      [...frameBody.querySelectorAll('*')].forEach(el => el.style.maxWidth = '100%');
      frameBody.style.textAlign = 'center';
    };

    const fileNameMatches = (file.name || '').toLowerCase().match(/.webm|.mp4|.wav|.pdf|.rtf|.txt|.js|.css|.cs|.png|.jpg|.jpeg|.svg|.gif/g);
    previewFrame.src = URL.createObjectURL(fileNameMatches ? file : unknownBlobIcon);
  },
  removeDragData(event) {
    event.dataTransfer.items ? event.dataTransfer.items.clear() : event.dataTransfer.clearData();
  },
  uploadProgress(event, el) {
    let percent = parseInt(event.loaded / event.total * 100);
    el.querySelector('.progress-percent').style.width = percent + '%';
    console.log('Load: ' + percent + '%');
  },
  bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  },
  addFileToList(file) {
    const list = document.querySelector('.fileList');
    const li = document.createElement('li');
    li.innerHTML =
      `<div class="file-icon ${file.type.split('/').join(' ')}"></div>
       <div class="info">
         <div class="name">${file.name}</div>
         <div class="size">${this.bytesToSize(file.size)}</div>
         <div class="progressbar"><span class="progress-percent"></span></div>
       </div>`;
    list.insertBefore(li, list.firstElementChild);
  }
};

const drops = [...document.querySelectorAll('.dropBox')];
drops.forEach(el => DragNDrop.init(el));
