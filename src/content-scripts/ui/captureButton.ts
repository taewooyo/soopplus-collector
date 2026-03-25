/**
 * Create and inject the video capture button for live chat
 */
export function injectLiveCaptureButton(): void {
  const chatItemList = document.querySelector('.chat_item_list');
  const itemBox = chatItemList?.querySelector('ul');
  const starItem = itemBox?.querySelector('li.star') as HTMLElement;

  if (!starItem) return;

  const cloneNode = starItem.cloneNode(false) as HTMLElement;
  const captureButton = document.createElement('a');

  captureButton.addEventListener('click', (e) => {
    e.preventDefault();
    captureVideo('livePlayer', 'afreecaTV_plus');
  });

  captureButton.style.setProperty('width', '32px');
  captureButton.style.setProperty('height', '32px');
  captureButton.style.setProperty('display', 'flex');
  captureButton.style.setProperty('align-items', 'center');
  captureButton.style.setProperty('justify-content', 'center');
  captureButton.innerHTML = getCaptureIconSvg();

  const updatedSvg = captureButton.querySelector('svg');
  if (!updatedSvg) return;

  // Update chatbox z-index
  const chatActionBox = document.getElementById('actionbox');
  if (chatActionBox) {
    chatActionBox.style.setProperty('z-index', '110');
  }

  updatedSvg.style.setProperty('vertical-align', 'middle');
  captureButton.setAttribute('tip', '화면캡쳐');
  cloneNode.appendChild(captureButton);
  starItem.insertAdjacentElement('beforebegin', cloneNode);
  cloneNode.classList.remove('star');
}

/**
 * Create and inject the video capture button for VOD
 */
export function injectVodCaptureButton(): void {
  const playerItemList = document.querySelector('.player_item_list');
  const playerItemListUL = playerItemList?.querySelector('ul');

  if (!playerItemListUL) return;

  const li = document.createElement('li');
  li.classList.add('share');

  const tooltip = document.createElement('div');
  tooltip.classList.add('sub_tooltip');
  tooltip.innerText = '방송 캡처';
  tooltip.style.setProperty('transform', 'translate(-80%, 0)');

  const span = document.createElement('span');
  span.innerText = '방송 캡처';

  const captureButton = document.createElement('button');
  captureButton.addEventListener('click', (e) => {
    e.preventDefault();
    captureVideo('livePlayer', 'afreecaTV_plus');
  });

  captureButton.style.setProperty('width', '21px');
  captureButton.style.setProperty('height', '21px');
  captureButton.innerHTML = getCaptureIconSvg();

  const updatedSvg = captureButton.querySelector('svg');
  if (!updatedSvg) return;

  updatedSvg.style.setProperty('vertical-align', 'middle');
  captureButton.appendChild(span);
  li.appendChild(captureButton);
  li.appendChild(tooltip);
  playerItemListUL.appendChild(li);
}

/**
 * Capture video frame and download as PNG
 */
function captureVideo(videoId: string, filePrefix: string): void {
  try {
    const video = document.getElementById(videoId) as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataURL;
    downloadLink.download = `${filePrefix}_${new Date().getTime()}.png`;
    downloadLink.click();
  } catch (err) {
    console.error('Failed to capture video:', err);
  }
}

/**
 * Get the SVG icon for capture button
 */
function getCaptureIconSvg(): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="enable-background:new 0 0 120 120; width:21px; height:21px;">
    <path d="M3,9A1,1,0,0,0,4,8V5A1,1,0,0,1,5,4H8A1,1,0,0,0,8,2H5A3,3,0,0,0,2,5V8A1,1,0,0,0,3,9ZM8,20H5a1,1,0,0,1-1-1V16a1,1,0,0,0-2,0v3a3,3,0,0,0,3,3H8a1,1,0,0,0,0-2ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14ZM19,2H16a1,1,0,0,0,0,2h3a1,1,0,0,1,1,1V8a1,1,0,0,0,2,0V5A3,3,0,0,0,19,2Zm2,13a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H16a1,1,0,0,0,0,2h3a3,3,0,0,0,3-3V16A1,1,0,0,0,21,15Z" fill="#6563ff"/>
  </svg>`;
}
