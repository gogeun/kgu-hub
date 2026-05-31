const INITIAL_DEFAULT_SITES = [
    { id: 1, title: "경기대학교 대표 홈페이지", category: "행정/학사", img: "https://placehold.co/100x100/2c3e50/ffffff?text=KGU", link: "https://www.kyonggi.ac.kr" },
    { id: 2, title: "종합정보서비스 (KUTIS)", category: "행정/학사", img: "https://placehold.co/100x100/e74c3c/ffffff?text=KUTIS", link: "https://kutis.kyonggi.ac.kr/webkutis/view/indexWeb.jsp" },
    { id: 3, title: "수강신청 시스템", category: "행정/학사", img: "https://placehold.co/100x100/27ae60/ffffff?text=Class", link: "http://sugang.kyonggi.ac.kr" },
    { id: 4, title: "경기대학교 LMS", category: "행정/학사", img: "https://placehold.co/100x100/2980b9/ffffff?text=LMS", link: "https://lms.kyonggi.ac.kr" },
    { id: 5, title: "중앙도서관", category: "도서관", img: "https://placehold.co/100x100/8e44ad/ffffff?text=Lib", link: "https://library.kyonggi.ac.kr" }
];

let defaultSites = JSON.parse(localStorage.getItem('myDefaultSites')) || INITIAL_DEFAULT_SITES;
let myFavorites = JSON.parse(localStorage.getItem('myHomeLinks')) || [];
let customSites = JSON.parse(localStorage.getItem('myCustomSites')) || [];
let currentCategory = 'all';

function getAllSites() {
    return [...defaultSites, ...customSites];
}

function renderCards(data) {
    const mainArea = $('#card-area');
    mainArea.empty();

    if (data.length === 0) {
        mainArea.html('<p style="padding: 50px; color: #777; text-align: center;">표시할 사이트가 없습니다.</p>');
        return;
    }

    data.forEach(site => {
        const isActive = myFavorites.includes(site.id) ? 'active' : '';
        const safeLink = site.link.startsWith('http') ? site.link : `https://${site.link}`;

        const deleteBtnHtml = `<button class="del-btn" data-id="${site.id}" title="삭제하기">🗑️</button>`;

        const cardHtml = `
            <a class="link-block" href="${safeLink}" target="_blank">
                <div class="link-img"><img src="${site.img}" alt="${site.title}"></div>
                <div class="link-text">${site.title}</div>
                ${deleteBtnHtml}
                <button class="fav-btn ${isActive}" data-id="${site.id}">★</button>
            </a>
        `;
        mainArea.append(cardHtml);
    });
}

function refreshCurrentView() {
    const allData = getAllSites();
    if (currentCategory === 'favorite') {
        renderCards(allData.filter(s => myFavorites.includes(s.id)));
    } else if (currentCategory === 'admin') {
        renderCards(allData.filter(s => s.category === '행정/학사'));
    } else if (currentCategory === 'lib') {
        renderCards(allData.filter(s => s.category === '도서관'));
    } else {
        renderCards(allData);
    }
}

$(document).ready(function() {
    
    currentCategory = 'all';
    refreshCurrentView();

    // 즐겨찾기 버튼 이벤트
    $('#card-area').on('click', '.fav-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const siteId = $(this).data('id');

        if (myFavorites.includes(siteId)) {
            myFavorites = myFavorites.filter(i => i !== siteId);
        } else {
            myFavorites.push(siteId);
        }
        
        localStorage.setItem('myHomeLinks', JSON.stringify(myFavorites));
        refreshCurrentView();
    });

    $('#card-area').on('click', '.del-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("이 사이트를 정말 삭제하시겠습니까?")) {
            return;
        }

        const siteId = $(this).data('id');

        defaultSites = defaultSites.filter(site => site.id !== siteId);
        localStorage.setItem('myDefaultSites', JSON.stringify(defaultSites));

        customSites = customSites.filter(site => site.id !== siteId);
        localStorage.setItem('myCustomSites', JSON.stringify(customSites));

        if (myFavorites.includes(siteId)) {
            myFavorites = myFavorites.filter(id => id !== siteId);
            localStorage.setItem('myHomeLinks', JSON.stringify(myFavorites));
        }

        refreshCurrentView();
    });

    // 좌측 사이드바 메뉴 클릭 이벤트
    $('.left-sidebar a').click(function(e) {
        e.preventDefault();
        
        $('.left-sidebar a').removeClass('active');
        $(this).addClass('active');

        const menuId = $(this).attr('id');
        if (menuId === 'menu-favorite') currentCategory = 'favorite';
        else if (menuId === 'menu-admin') currentCategory = 'admin';
        else if (menuId === 'menu-lib') currentCategory = 'lib';
        else currentCategory = 'all';

        refreshCurrentView();
    });

    $('#btn-open-modal').click(function() { $('#add-modal').css('display', 'flex'); });
    
    $('#btn-close-modal').click(function() {
        $('#add-modal').hide();
        $('#custom-title').val('');
        $('#custom-url').val('');
        $('#custom-logo').val('');
    });

    $('#btn-save-site').click(function() {
        const title = $('#custom-title').val().trim();
        const url = $('#custom-url').val().trim();
        let logoText = $('#custom-logo').val() ? $('#custom-logo').val().trim() : "N"; // 로고 입력값 (없으면 N)

        if (title === "" || url === "") {
            alert("사이트 이름과 URL을 모두 입력해주세요!");
            return;
        }

        const newSite = {
            id: Date.now(), 
            title: title,
            category: "직접추가",
            img: `https://placehold.co/100x100/9b59b6/ffffff?text=${logoText}`, // 이전 턴에서 적용한 로고 기능 복구
            link: url
        };

        customSites.push(newSite);
        // myFavorites.push(newSite.id); <-- 삭제 시 즐겨찾기도 되던 현상 막기 (이전 수정사항 복구)
        
        localStorage.setItem('myCustomSites', JSON.stringify(customSites));

        $('#btn-close-modal').click();
        
        $('#menu-all').click(); 
        alert("성공적으로 추가되었습니다!");
    });
});