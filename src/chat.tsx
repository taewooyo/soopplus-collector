import './chat.css';
import {User} from "@/src/model/User";
import {ToggleData} from "@/src/model/ToggleData"
import {ChatCollectorData} from "@/src/model/ChatCollectorData";
import {
    getChatSetting,
    getChatTwoLine,
    getCollector,
    getDivider,
    getFanBadge,
    getHighlight,
    getSubscribeBadge,
    getSupportBadge,
    getTopfanBadge
} from "./getStorageData";
import {ChatSetting} from "@/src/model/ChatSetting";
import {ChatTwoLine} from "@/src/model/ChatTwoLine";
import {SubscribeBadge} from "@/src/model/SubscribeBadge";
import {TopfanBadge} from "@/src/model/TopfanBadge";
import {FanBadge} from "@/src/model/FanBadge";
import {SupportBadge} from "@/src/model/SupportBadge";
import {Divider} from "@/src/model/Divider";
import {Highlight} from "@/src/model/Highlight";

const config = {childList: true, subtree: true};
let nicks: User[] = [];
let ids: User[] = [];
let toggle: ToggleData;
let chatCollector: ChatCollectorData;
let previousData: number | null
let collectorChangeFlag = false
let chatSetting: ChatSetting;
let chatTwoLine: ChatTwoLine;
let subscribeBadge: SubscribeBadge;
let topFanBadge: TopfanBadge;
let fanBadge: FanBadge;
let supportBadge: SupportBadge;
let divider: Divider;
let highlight: Highlight;

let nicksMap: Map<string, boolean> = new Map();
let idsSet: Set<string> = new Set();
let isUserScrolling = false;

async function updateNickname() {
    chrome.storage.local.get('nicks').then((res: { [p: string]: User[] }) => {
        if (res.nicks) {
            nicks = res.nicks;
            nicksMap = new Map(nicks.map(user => [user.user, user.isNickname]));
        } else {
            nicks = [];
            nicksMap = new Map();
        }
    })
}

async function updateId() {
    chrome.storage.local.get('ids').then((res: { [p: string]: User[] }) => {
        if (res.ids) {
            ids = res.ids;
            idsSet = new Set(ids.filter(user => !user.isNickname).map(user => user.user));
        } else {
            ids = [];
            idsSet = new Set();
        }
    })
}

async function updateToggle() {
    chrome.storage.local.get('toggle').then((res) => {
        if (res.toggle) {
            toggle = res.toggle;
        } else {
            toggle = {
                streamer: false,
                manager: false,
                topfan: false,
                gudok: false,
                fan: false,
                user: false
            }
        }
    })
}

function filter(nickname: string, rawUserId: string, grade: string): boolean {
    const lastIndex = rawUserId.indexOf('(');
    const userId = lastIndex === -1 ? rawUserId : rawUserId.substring(0, lastIndex);

    if (nicksMap.has(nickname) && nicksMap.get(nickname)) return true;
    if (idsSet.has(userId)) return true;
    if (grade === "bj" && toggle.streamer) return true;
    if (grade === "manager" && toggle.manager) return true;
    if (grade === "topfan" && toggle.topfan) return true;
    if (grade === "gudok" && toggle.gudok) return true;
    if (grade === "fan" && toggle.fan) return true;
    if (grade === "user" && toggle.user) return true;
    return false;
}

let chatArea: Element | null

// 성능 최적화: CSS 기반 뱃지 숨기기 클래스 토글
function updateBadgeClasses() {
    const areas = [document.querySelector('.live-area'), document.querySelector('.filter-area')];
    areas.forEach(area => {
        if (!area) return;
        area.classList.toggle('hide-subscribe', !!subscribeBadge?.isUse);
        area.classList.toggle('hide-topfan', !!topFanBadge?.isUse);
        area.classList.toggle('hide-fan', !!fanBadge?.isUse);
        area.classList.toggle('hide-support', !!supportBadge?.isUse);
    });
}

// 성능 최적화: Range API를 사용한 일괄 DOM 삭제
function trimChildren(el: Element, maxCount: number) {
    const overflow = el.children.length - maxCount;
    if (overflow > 0) {
        const range = document.createRange();
        range.setStartBefore(el.children[0]);
        range.setEndAfter(el.children[overflow - 1]);
        range.deleteContents();
    }
}

// 성능 최적화: 배치 처리 + 쓰로틀링
let pendingMutations: MutationRecord[] = [];
let flushScheduled = false;
const FLUSH_INTERVAL = 200; // ms

const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
    // 하이라이트만 즉시 적용 (classList.add는 비용이 거의 없음)
    if (highlight?.isUse) {
        for (const mutation of mutationList) {
            mutation.addedNodes.forEach((node) => {
                if (node.parentNode == null || node.nodeName !== 'DIV') return;
                const container = (node as HTMLElement).querySelector('.message-container');
                if (!container) return;
                const userButton = container.querySelector('.username button');
                if (!userButton) return;
                const rawUserId = userButton.getAttribute('user_id');
                const nickName = userButton.getAttribute('user_nick');
                const grade = userButton.getAttribute('grade');
                if (!rawUserId || !nickName || !grade) return;
                if (filter(nickName, rawUserId, grade)) {
                    (node as HTMLElement).classList.add('tbc-highlight');
                }
            });
        }
    }
    pendingMutations.push(...mutationList);
    if (!flushScheduled) {
        flushScheduled = true;
        setTimeout(flushPendingNodes, FLUSH_INTERVAL);
    }
};

function flushPendingNodes() {
    flushScheduled = false;
    const mutations = pendingMutations;
    pendingMutations = [];

    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node.parentNode == null) return;
                if (node.nodeName === 'DIV') {
                    const container = (node as HTMLElement).querySelector('.message-container');
                    if (container == null) return;
                    const user = container.querySelector('.username');
                    if (user == null) return;
                    const userButton = user.querySelector('button');
                    if (userButton == null) return;
                    const rawUserId = userButton.getAttribute('user_id');
                    const nickName = userButton.getAttribute('user_nick');
                    const grade = userButton.getAttribute('grade');
                    if (rawUserId == null || nickName == null || grade == null) return;

                    // 뱃지 숨기기는 CSS 클래스로 처리 (updateBadgeClasses)
                    // 채팅 분리선
                    const author = (node as HTMLElement).querySelector('.author');
                    if (author != null) {
                        let text = (author as HTMLElement).innerText;
                        if (divider?.isUse) {
                            (author as HTMLElement).innerText = text + " : ";
                        } else {
                            const index = text.indexOf(" : ");
                            if (index !== -1) {
                                (author as HTMLElement).innerText = text.substring(index);
                            }
                        }
                    }

                    if (filter(nickName, rawUserId, grade) && filterArea != null) {
                        const clonedNode = node.cloneNode(true);
                        (clonedNode as HTMLElement).classList.remove('tbc-highlight');
                        fragment.appendChild(clonedNode);
                    }
                }
            });
        }
        if (filterArea) {
            filterArea.appendChild(fragment);
            // 성능 최적화: Range API로 일괄 삭제
            trimChildren(filterArea, 300);
            // 성능 최적화: scrollIntoView로 reflow 최소화
            if (!isUserScrolling && filterArea.lastElementChild) {
                filterArea.lastElementChild.scrollIntoView({ block: 'end', behavior: 'instant' });
            }
        }
    });
}

let filterArea: HTMLDivElement;

async function initLocalChatContainer() {
    //ko_KR ratio169_mode smode thema_dark
    const chatBox = document.getElementById('chatbox');
    const actionbox = document.getElementById('actionbox');
    const areaHeader = document.querySelector('.area_header');
    const chatArea = document.getElementById('chat_area')
    if (chatBox == null || chatArea == null || actionbox == null || areaHeader == null) return;
    filterArea = chatArea.cloneNode() as HTMLDivElement
    const parentChat = chatArea.parentNode as Element
    const v = chatBox?.clientHeight - actionbox?.clientHeight - areaHeader?.clientHeight - 20;
    const container = document.createElement('div');
    container.id = 'afreeca-chat-list-container'
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', v + 'px');
    container.style.setProperty('will-change', 'scroll-position');
    
    filterArea?.addEventListener('scroll', () => {
        isUserScrolling = true; // 사용자 스크롤 시작
    // 스크롤이 맨 아래에 도달했는지 확인
    if (filterArea.scrollHeight - filterArea.scrollTop - filterArea.clientHeight < 100) { // 10은 임계값 (조정 가능)
        isUserScrolling = false; // 맨 아래 도달 시 플래그 초기화
    }
    });

    chatArea.classList.add('live-area');
    filterArea.classList.add('filter-area');
    filterArea.style.display = "none";
    filterArea.style.height = '30%';
    filterArea.style.top = '0px';
    filterArea.style.position = 'relative';

    const handleContainer = document.createElement('div');
    const resizeHandle = document.createElement('div');
    resizeHandle.id = "tbc-resize-handle";
    handleContainer.id = "handle-container";
    handleContainer.appendChild(resizeHandle);
    handleContainer.style.display = "none";

    // 그립 도트 추가
    const gripDots = document.createElement('div');
    gripDots.className = 'grip-dots';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'grip-dot';
        gripDots.appendChild(dot);
    }
    resizeHandle.appendChild(gripDots);

    handleContainer.addEventListener("mousedown", startDrag);
    handleContainer.addEventListener("touchstart", startDrag);
    // 더블클릭 시 기본 비율(30%)로 복원
    handleContainer.addEventListener("dblclick", () => {
        containerRatio = 30;
        position = "up";
        updateContainerRatio(containerRatio, position);
        chrome.storage.local.set({containerRatio, position});
    });

    container.appendChild(filterArea);
    container.appendChild(handleContainer);
    container.appendChild(chatArea);
    parentChat.appendChild(container);
}

function CaptureButton() {
    const chat_item_list = document.querySelector('.chat_item_list');
    const item_box = chat_item_list?.querySelector('ul');
    const start = item_box?.querySelector('li.star') as HTMLElement;
    const cloneNode = start?.cloneNode(false) as HTMLElement;
    const captureButton = document.createElement('a');
    captureButton.addEventListener('click', (e) => {
        e.preventDefault()
        try {
            const video = document.getElementById("livePlayer") as HTMLVideoElement;
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");

            if (!context) return;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataURL = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.href = imageDataURL;
            downloadLink.download = `afreecaTV_plus_${new Date().getTime()}.png`;
            downloadLink.click();
        } catch (err) {
        }
    });
    captureButton.style.setProperty('width', '32px');
    captureButton.style.setProperty('height', '32px');
    captureButton.style.setProperty('display', 'flex');
    captureButton.style.setProperty('align-items', 'center');
    captureButton.style.setProperty('justify-content', 'center');
    captureButton.innerHTML =
        "<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" style=\"enable-background:new 0 0 120 120; width:21px; height:21px;\"> <path d=\"M3,9A1,1,0,0,0,4,8V5A1,1,0,0,1,5,4H8A1,1,0,0,0,8,2H5A3,3,0,0,0,2,5V8A1,1,0,0,0,3,9ZM8,20H5a1,1,0,0,1-1-1V16a1,1,0,0,0-2,0v3a3,3,0,0,0,3,3H8a1,1,0,0,0,0-2ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14ZM19,2H16a1,1,0,0,0,0,2h3a1,1,0,0,1,1,1V8a1,1,0,0,0,2,0V5A3,3,0,0,0,19,2Zm2,13a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H16a1,1,0,0,0,0,2h3a3,3,0,0,0,3-3V16A1,1,0,0,0,21,15Z\" fill=\"#6563ff\"/> </svg>"
    const updatedSvg = captureButton.querySelector('svg')
    if (updatedSvg == null) return;
    // 채팅 하단 영역 z-index 변경
    const chatActionBox = document.getElementById("actionbox");
    if (chatActionBox == null) return;
    chatActionBox.style.setProperty("z-index", "110");

    updatedSvg.style.setProperty('vertical-align', 'middle');
    captureButton.setAttribute('tip', '화면캡쳐');
    cloneNode.appendChild(captureButton);
    if (cloneNode != null) {
        start?.insertAdjacentElement('beforebegin', cloneNode);
        cloneNode.classList.remove("star")
    }
}

function CollectorChange() {
    const chat_item_list = document.querySelector('.chat_item_list');
    const item_box = chat_item_list?.querySelector('ul');
    // filterArea = chatArea.cloneNode() as HTMLDivElement
    const start = item_box?.querySelector('li.star') as HTMLElement;
    const cloneNode = start?.cloneNode(false) as HTMLElement;


    // const li = document.createElement('li')
    // li.classList.add('share');
    // const tooltip = document.createElement('div');
    // tooltip.classList.add('sub_tooltip')
    // tooltip.innerText = "콜렉터 상하변경"
    // tooltip.style.setProperty('transform', 'translate(-80%, 0)');

    const collectorChangeButton = document.createElement('a');
    collectorChangeButton.addEventListener('click', (e) => {
        e.preventDefault()
        try {
            const chatContainer = document.getElementById('afreeca-chat-list-container')
            if (chatContainer == null) return;

            const filterElement = document.querySelector('.filter-area')
            const liveElement = document.querySelector('.live-area')
            const handler = document.getElementById('handle-container')

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
        }
    });
    collectorChangeButton.style.setProperty('width', '32px');
    collectorChangeButton.style.setProperty('height', '32px');
    collectorChangeButton.style.setProperty('display', 'flex');
    collectorChangeButton.style.setProperty('align-items', 'center');
    collectorChangeButton.style.setProperty('justify-content', 'center');
    collectorChangeButton.innerHTML =
        "<svg id=\"Layer_1\" style=\"enable-background:new 0 0 120 120; width:21px; height:21px;\" version=\"1.1\" viewBox=\"0 0 120 120\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><style type=\"text/css\">\n" +
        "\t.st0{fill:none;}\n" +
        "\t.st1{fill:#386BFF;}\n" +
        "\t.st2{fill:#5DE88B;}\n" +
        "</style><line class=\"st0\" x1=\"60\" x2=\"60\" y1=\"-67.7\" y2=\"-73.2\"/><g><path class=\"st1\" d=\"M55.4,46.1L37.3,21.5c-1.2-1.6-3.6-1.6-4.7,0L14.4,46.1c-1.4,1.9,0,4.7,2.4,4.7h8.3v46c0,1.6,1.3,2.9,2.9,2.9   h13.8c1.6,0,2.9-1.3,2.9-2.9v-46H53C55.4,50.8,56.8,48.1,55.4,46.1z\"/><path class=\"st2\" d=\"M105.6,73.9L87.5,98.5c-1.2,1.6-3.6,1.6-4.7,0L64.6,73.9c-1.4-1.9,0-4.7,2.4-4.7h8.2v-46   c0-1.6,1.3-2.9,2.9-2.9H92c1.6,0,2.9,1.3,2.9,2.9v46h8.3C105.6,69.2,107,71.9,105.6,73.9z\"/></g></svg>"
    const updatedSvg = collectorChangeButton.querySelector('svg')
    if (updatedSvg == null) return;
    // 채팅 하단 영역 z-index 변경
    const chatActionBox = document.getElementById("actionbox");
    if (chatActionBox == null) return;
    chatActionBox.style.setProperty("z-index", "110");

    updatedSvg.style.setProperty('vertical-align', 'middle');
    collectorChangeButton.setAttribute('tip', '채팅창 상하 변경');
    cloneNode.appendChild(collectorChangeButton);
    // li.appendChild(collectorChangeButton);
    // li.appendChild(tooltip);
    // playerItemListUL?.appendChild(li);
    if (cloneNode != null) {
        start?.insertAdjacentElement('beforebegin', cloneNode);
        
        // ClassName 제거 - 남아있으면 별풍선 아이콘 생김
        cloneNode.classList.remove("star")
    }
}

const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const currentHeight = entry.contentRect.height;
        const actionbox = document.getElementById('actionbox');
        const areaHeader = document.querySelector('.area_header');
        if (actionbox == null || areaHeader == null) return;
        const h = currentHeight - actionbox.clientHeight - areaHeader.clientHeight - 20;
        if (previousData == null) {
            previousData = h
            divideContainer();
        } else if (previousData != h) {
            previousData = h
            const filterArea = document.querySelector('.filter-area');
            if (filterArea == null) {
                divideContainer();
            } else {
                divideContainer();
            }
        }
    }
});

async function divideContainer() {
    const container = document.getElementById('afreeca-chat-list-container');
    if (container == null) return;
    container.style.setProperty('position', 'absolute');
    (filterArea as HTMLElement).style.removeProperty('display');
    const handler = document.getElementById('handle-container');
    if (handler == null) return;
    handler.style.removeProperty('display');
    const liveArea = document.querySelector('.live-area');
    if (liveArea == null) return;
    (liveArea as HTMLElement).style.setProperty('position', 'relative');
    (liveArea as HTMLElement).style.setProperty('top', "0px");
    const position = await chrome.storage.local.get('position')
    const containerRatio = await chrome.storage.local.get('containerRatio')
    updateContainerRatio(containerRatio.containerRatio, position.position)
}

function restoreContainer() {
    const container = document.getElementById('afreeca-chat-list-container');
    if (container == null) return;
    container.style.removeProperty('position');
    const filterArea = document.querySelector('.filter-area');
    if (filterArea == null) return;
    (filterArea as HTMLElement).style.setProperty('display', 'none');
    const handler = document.getElementById('handle-container');
    if (handler == null) return;
    handler.style.setProperty('display', 'none');
    const liveArea = document.querySelector('.live-area');
    if (liveArea == null) return;
    (liveArea as HTMLElement).style.removeProperty('position');
    (liveArea as HTMLElement).style.removeProperty('height');
    (liveArea as HTMLElement).style.removeProperty('top');
}

window.addEventListener('load', async () => {
    chatArea = document.getElementById('chat_area')
    if (!chatArea) return;
    await initLocalChatContainer();
    await updateNickname();
    await updateId();
    await updateToggle();
    chatCollector = await getCollector();
    chatSetting = await getChatSetting();
    chatTwoLine = await getChatTwoLine();
    subscribeBadge = await getSubscribeBadge();
    topFanBadge = await getTopfanBadge();
    fanBadge = await getFanBadge();
    supportBadge = await getSupportBadge();
    highlight = await getHighlight();
    divider = await getDivider();
    // screenMode = await getScreenMode();
    // if (screenMode.isUse) {
    //     const body = document.querySelector('.ko_KR');
    //     (body as HTMLElement).classList.add('smode');
    //     (body as HTMLElement).classList.add('thema_dark');
    // }
    // else {
    //     const body = document.querySelector('.ko_KR');
    //     (body as HTMLElement).classList.remove('smode');
    //     (body as HTMLElement).classList.remove('thema_dark');
    // }
    const filterArea = document.querySelector('.filter-area');
    const liveArea = document.querySelector('.live-area');
    if (filterArea == null || liveArea == null) return;
    if (chatTwoLine.isUse) {
        (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
        (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
    } else {
        if (chatSetting.isUse) {
            (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
            (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
        } else {
            (liveArea as HTMLElement).removeAttribute('data-mngr');
            (filterArea as HTMLElement).removeAttribute('data-mngr');
        }
    }
    if (chatSetting.isUse) {
        (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
        (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
    } else {
        if (chatTwoLine.isUse) {
            (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
            (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
        } else {
            (liveArea as HTMLElement).removeAttribute('data-mngr');
            (filterArea as HTMLElement).removeAttribute('data-mngr');
        }
    }

    if (chatCollector.isUse) {
        await divideContainer()
    } else restoreContainer()
    // 성능 최적화: CSS 기반 뱃지 숨기기 적용
    updateBadgeClasses();
    CaptureButton();
    CollectorChange();
    const observer = new MutationObserver(callback);
    if (chatArea) {
        observer.observe((chatArea as Node), config)
    } else {

    }
})

chrome.storage.local.onChanged.addListener(async (changes) => {
    await updateNickname();
    await updateId();
    await updateToggle();
    chatCollector = await getCollector();
    chatSetting = await getChatSetting();
    chatTwoLine = await getChatTwoLine();
    subscribeBadge = await getSubscribeBadge();
    topFanBadge = await getTopfanBadge();
    fanBadge = await getFanBadge();
    supportBadge = await getSupportBadge();
    highlight = await getHighlight();
    divider = await getDivider();
    // screenMode = await getScreenMode();
    // if (screenMode.isUse) {
    //     const body = document.querySelector('.ko_KR');
    //     (body as HTMLElement).classList.add('smode');
    //     (body as HTMLElement).classList.add('thema_dark');
    // }
    // else {
    //     const body = document.querySelector('.ko_KR');
    //     (body as HTMLElement).classList.remove('smode');
    //     (body as HTMLElement).classList.remove('thema_dark');
    // }
    const filterArea = document.querySelector('.filter-area');
    const liveArea = document.querySelector('.live-area');
    if (filterArea == null || liveArea == null) return;
    if (chatTwoLine.isUse) {
        (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
        (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
    } else {
        if (chatSetting.isUse) {
            (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
            (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
        } else {
            (liveArea as HTMLElement).removeAttribute('data-mngr');
            (filterArea as HTMLElement).removeAttribute('data-mngr');
        }
    }
    if (chatSetting.isUse) {
        (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
        (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_sort');
    } else {
        if (chatTwoLine.isUse) {
            (liveArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
            (filterArea as HTMLElement).setAttribute('data-mngr', 'chat_two_line');
        } else {
            (liveArea as HTMLElement).removeAttribute('data-mngr');
            (filterArea as HTMLElement).removeAttribute('data-mngr');
        }
    }
    // 성능 최적화: CSS 기반 뱃지 숨기기 적용
    updateBadgeClasses();
    if (chatCollector.isUse) {
        await divideContainer()
    } else restoreContainer()
});

let position: string = "up";
let containerRatio = 0;

const getPosition = (container: HTMLDivElement) => {
    return container.style.order === "1" ? "up" : "down";
};

const startDrag = function (e: MouseEvent | TouchEvent) {
    e.preventDefault();

    if (!filterArea) return;

    // 드래그 중 transition 비활성화
    const fa = document.querySelector('.filter-area') as HTMLElement;
    const la = document.querySelector('.live-area') as HTMLElement;
    if (fa) fa.style.transition = 'none';
    if (la) la.style.transition = 'none';

    // 드래그 시각 피드백
    const handle = document.getElementById('handle-container');
    handle?.classList.add('is-dragging');
    document.body.classList.add('dragging');

    if (!collectorChangeFlag) {
        filterArea.classList.add("freeze");
        position = getPosition(filterArea);
    } else {
        const liveArea = document.querySelector('.live-area') as HTMLDivElement;
        if (liveArea == null) return;
        liveArea.classList.add("freeze");
        position = getPosition(liveArea);
    }

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("touchmove", doDrag);
    window.addEventListener("mouseup", endDrag, true);
    window.addEventListener("touchend", endDrag, true);
}

const doDrag = (e: MouseEvent | TouchEvent) => {
    // mouseup을 놓친 경우 감지 (iframe 위에서 놓았을 때 등)
    if (e instanceof MouseEvent && e.buttons === 0) {
        endDrag();
        return;
    }
    const chatListContainer = document.getElementById("afreeca-chat-list-container")

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    let rectHeight = 0;

    if (chatListContainer) {
        const rect = chatListContainer.getBoundingClientRect()
        rectHeight = rect.height - 77 - 62;

        containerRatio = (1 - (clientY - rect.y - 77) / (rectHeight)) * 100;
        containerRatio = Math.max(0, Math.min(100, Math.round(containerRatio)))
        updateContainerRatio(containerRatio, position)
    }
};

const endDrag = function () {
    if (!collectorChangeFlag) {
        filterArea.classList.remove("freeze");
    } else {
        const liveArea = document.querySelector('.live-area') as HTMLDivElement;
        if (liveArea == null) return;
        liveArea.classList.remove("freeze");
    }

    // 드래그 시각 피드백 제거
    const handle = document.getElementById('handle-container');
    handle?.classList.remove('is-dragging');
    document.body.classList.remove('dragging');

    // transition 복원
    const fa = document.querySelector('.filter-area') as HTMLElement;
    const la = document.querySelector('.live-area') as HTMLElement;
    if (fa) fa.style.transition = '';
    if (la) la.style.transition = '';

    chrome.storage.local.set({containerRatio, position});
    window.removeEventListener("mousemove", doDrag);
    window.removeEventListener("touchmove", doDrag);
    window.removeEventListener("mouseup", endDrag, true);
    window.removeEventListener("touchend", endDrag, true);
};

function updateContainerRatio(
    ratio: number,
    position: string,
) {
    if (ratio != 0) ratio = ratio ? ratio : 30;




    let orig_size = ratio === 0 ? 1 : ratio === 10 ? 0 : 1;
    let clone_size = ratio === 0 ? 0 : ratio === 10 ? 1 : 0;

    if (1 <= ratio && ratio <= 100) {
        clone_size = parseFloat((ratio * 0.01).toFixed(2));
        orig_size = parseFloat((1 - clone_size).toFixed(2));
    }

    if (position === "down") {
        [orig_size, clone_size] = [clone_size, orig_size];
    }

    if (!collectorChangeFlag) {
        const orig = document.querySelector(".live-area");
        const clone = document.querySelector(".filter-area");
        if (!orig || !clone) return;

        (orig as HTMLDivElement).style.height = `${orig_size * 100}%`;
        (clone as HTMLDivElement).style.height = `${clone_size * 100}%`;

        // 스냅 상태 클래스 관리
        clone.classList.toggle('snapped-hidden', clone_size === 0);
        orig.classList.toggle('snapped-hidden', orig_size === 0);
    } else {
        const orig = document.querySelector(".filter-area");
        const clone = document.querySelector(".live-area");
        if (!orig || !clone) return;

        (orig as HTMLDivElement).style.height = `${orig_size * 100}%`;
        (clone as HTMLDivElement).style.height = `${clone_size * 100}%`;

        // 스냅 상태 클래스 관리
        clone.classList.toggle('snapped-hidden', clone_size === 0);
        orig.classList.toggle('snapped-hidden', orig_size === 0);
    }
}

const qwer = new ResizeObserver(entries => {
    for (const entry of entries) {
        const currentHeight = entry.contentRect.height;
        const actionbox = document.getElementById('actionbox');
        const areaHeader = document.querySelector('.area_header');
        if (actionbox == null || areaHeader == null) return;
        const h = currentHeight - actionbox.clientHeight - areaHeader.clientHeight - 20;
        const container = document.getElementById('afreeca-chat-list-container');
        if (container == null) return;
        const filterArea = document.querySelector('.filter-area');
        if (filterArea == null) return;
        const liveArea = document.querySelector('.live-area');
        if (liveArea == null) return;
        container.style.setProperty('height', h + 'px');
        if (chatCollector?.isUse) {
            divideContainer();
            const index = (filterArea as HTMLElement).style.height.indexOf('%');
            const filterAreaHeightNumber = (filterArea as HTMLElement).style.height.substring(0, index);
            const filterAreaHeight = 100 - Number(filterAreaHeightNumber);
            (liveArea as HTMLElement).style.setProperty('height', filterAreaHeight + '%');
        } else {
            restoreContainer();
        }
    }
});

const t = document.getElementById("chatbox");
if (t != null) {
    qwer.observe(t);
}

const qqq = new ResizeObserver(entries => {
    for (const entry of entries) {
        const chatbox = document.getElementById('chatbox');
        const actionbox = document.getElementById('actionbox');
        const areaHeader = document.querySelector('.area_header');
        if (chatbox == null || actionbox == null || areaHeader == null) return;
        const h = chatbox.clientHeight - actionbox.clientHeight - areaHeader.clientHeight - 20;
        const container = document.getElementById('afreeca-chat-list-container');
        if (container == null) return;
        const filterArea = document.querySelector('.filter-area');
        if (filterArea == null) return;
        const liveArea = document.querySelector('.live-area');
        if (liveArea == null) return;
        container.style.setProperty('height', h + 'px');
        if (chatCollector?.isUse) {
            divideContainer();
            const index = (filterArea as HTMLElement).style.height.indexOf('%');
            const filterAreaHeightNumber = (filterArea as HTMLElement).style.height.substring(0, index);
            const filterAreaHeight = 100 - Number(filterAreaHeightNumber);
            (liveArea as HTMLElement).style.setProperty('height', filterAreaHeight + '%');
        } else {
            restoreContainer();
        }
    }
});

const tt = document.getElementById("actionbox");
if (tt != null) {
    qqq.observe(tt);
}