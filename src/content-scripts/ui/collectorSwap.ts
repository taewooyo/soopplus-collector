/**
 * State for collector change flag
 */
let collectorChangeFlag = false;

export function getCollectorChangeFlag(): boolean {
  return collectorChangeFlag;
}

export function setCollectorChangeFlag(value: boolean): void {
  collectorChangeFlag = value;
}

export function toggleCollectorChangeFlag(): void {
  collectorChangeFlag = !collectorChangeFlag;
}

/**
 * Create and inject the collector swap button for live chat
 */
export function injectLiveCollectorSwapButton(): void {
  const chatItemList = document.querySelector('.chat_item_list');
  const itemBox = chatItemList?.querySelector('ul');
  const starItem = itemBox?.querySelector('li.star') as HTMLElement;

  if (!starItem) return;

  const cloneNode = starItem.cloneNode(false) as HTMLElement;
  const swapButton = document.createElement('a');

  swapButton.addEventListener('click', (e) => {
    e.preventDefault();
    swapCollectorPosition();
  });

  swapButton.style.setProperty('width', '32px');
  swapButton.style.setProperty('height', '32px');
  swapButton.style.setProperty('display', 'flex');
  swapButton.style.setProperty('align-items', 'center');
  swapButton.style.setProperty('justify-content', 'center');
  swapButton.innerHTML = getSwapIconSvg();

  const updatedSvg = swapButton.querySelector('svg');
  if (!updatedSvg) return;

  const chatActionBox = document.getElementById('actionbox');
  if (chatActionBox) {
    chatActionBox.style.setProperty('z-index', '110');
  }

  updatedSvg.style.setProperty('vertical-align', 'middle');
  swapButton.setAttribute('tip', '채팅창 상하 변경');
  cloneNode.appendChild(swapButton);
  starItem.insertAdjacentElement('beforebegin', cloneNode);
  cloneNode.classList.remove('star');
}

/**
 * Create and inject the collector swap button for VOD
 */
export function injectVodCollectorSwapButton(): void {
  const playerItemList = document.querySelector('.player_item_list');
  const playerItemListUL = playerItemList?.querySelector('ul');

  if (!playerItemListUL) return;

  const li = document.createElement('li');
  li.classList.add('share');

  const tooltip = document.createElement('div');
  tooltip.classList.add('sub_tooltip');
  tooltip.innerText = '콜렉터 상하변경';
  tooltip.style.setProperty('transform', 'translate(-80%, 0)');

  const span = document.createElement('span');
  span.innerText = '콜렉터 상하변경';

  const swapButton = document.createElement('button');
  swapButton.addEventListener('click', (e) => {
    e.preventDefault();
    swapCollectorPosition();
  });

  swapButton.style.setProperty('width', '21px');
  swapButton.style.setProperty('height', '21px');
  swapButton.innerHTML = getSwapIconSvg();

  const updatedSvg = swapButton.querySelector('svg');
  if (!updatedSvg) return;

  updatedSvg.style.setProperty('vertical-align', 'middle');
  swapButton.appendChild(span);
  li.appendChild(swapButton);
  li.appendChild(tooltip);
  playerItemListUL.appendChild(li);
}

/**
 * Swap collector and live chat positions
 */
function swapCollectorPosition(): void {
  try {
    const chatContainer = document.getElementById('afreeca-chat-list-container');
    if (!chatContainer) return;

    const filterElement = document.querySelector('.filter-area');
    const liveElement = document.querySelector('.live-area');
    const handler = document.getElementById('handle-container');

    if (filterElement && liveElement) {
      if (!collectorChangeFlag) {
        collectorChangeFlag = true;
        chatContainer.insertBefore(liveElement, handler);
        chatContainer.insertBefore(filterElement, null);
      } else {
        collectorChangeFlag = false;
        chatContainer.insertBefore(filterElement, handler);
        chatContainer.insertBefore(liveElement, null);
      }
    }
  } catch (err) {
    console.error('Failed to swap collector position:', err);
  }
}

/**
 * Get the SVG icon for swap button
 */
function getSwapIconSvg(): string {
  return `<svg id="Layer_1" style="enable-background:new 0 0 120 120; width:21px; height:21px;" version="1.1" viewBox="0 0 120 120" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
    <style type="text/css">
      .st0{fill:none;}
      .st1{fill:#386BFF;}
      .st2{fill:#5DE88B;}
    </style>
    <line class="st0" x1="60" x2="60" y1="-67.7" y2="-73.2"/>
    <g>
      <path class="st1" d="M55.4,46.1L37.3,21.5c-1.2-1.6-3.6-1.6-4.7,0L14.4,46.1c-1.4,1.9,0,4.7,2.4,4.7h8.3v46c0,1.6,1.3,2.9,2.9,2.9h13.8c1.6,0,2.9-1.3,2.9-2.9v-46H53C55.4,50.8,56.8,48.1,55.4,46.1z"/>
      <path class="st2" d="M105.6,73.9L87.5,98.5c-1.2,1.6-3.6,1.6-4.7,0L64.6,73.9c-1.4-1.9,0-4.7,2.4-4.7h8.2v-46c0-1.6,1.3-2.9,2.9-2.9H92c1.6,0,2.9,1.3,2.9,2.9v46h8.3C105.6,69.2,107,71.9,105.6,73.9z"/>
    </g>
  </svg>`;
}
