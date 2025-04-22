// 게임 상태 관리
let state = {
    totalStardust: 30,
    remainingStardust: 30,
    charms: {},
    costTable: {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 5,
        5: 7,
        6: 10
    }
};

// 카테고리 데이터
const categories = [
    {
        name: "외모 및 공감 능력",
        charms: ["단정함", "공감 능력", "이해심", "배려심", "밝은 미소", "경청하는 태도", "상냥함", "포옹력"]
    },
    {
        name: "성실성 및 책임감",
        charms: ["성실함", "책임감", "언행일치", "계획성", "세심함"]
    },
    {
        name: "지적 호기심 및 개방성",
        charms: ["호기심", "열린 마음", "지식욕", "창의성", "지성"]
    },
    {
        name: "유머 및 활력",
        charms: ["유머 감각", "위트", "재치", "긍정적 마인드", "활발함"]
    },
    {
        name: "정직함 및 신뢰성",
        charms: ["정직함", "신뢰성", "겸손함", "스타일"]
    },
    {
        name: "유머 감각 및 사교성",
        charms: ["유머 감각", "평화 메이커", "다양한 친분", "타인을 편하게 해주는 능력"]
    },
    {
        name: "정신적 능력",
        charms: ["예술적 감각", "판단력", "집중력", "직관력"]
    }
];

// 페이지 로드 시 초기화
window.onload = function() {
    initializeCharms();
    updateDisplay();
};

// 특성 초기화
function initializeCharms() {
    const charmItems = document.querySelectorAll('.charm-item');
    
    charmItems.forEach((item) => {
        const id = item.getAttribute('data-id');
        const name = item.querySelector('.charm-name').textContent;
        
        state.charms[id] = {
            name: name,
            level: 0
        };
        
        // 레벨 버튼에 이벤트 리스너 추가
        const levelBtns = item.querySelectorAll('.level-btn');
        levelBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const newLevel = parseInt(this.getAttribute('data-level'));
                const cost = parseInt(this.getAttribute('data-cost'));
                setCharmLevel(id, newLevel, cost);
            });
        });
    });
}

// 특성 레벨 설정
function setCharmLevel(charmId, newLevel, cost) {
    const charm = state.charms[charmId];
    const currentLevel = charm.level;
    
    if (currentLevel === newLevel) return; // 같은 레벨 선택 무시
    
    // 별가루 계산
    const currentCost = state.costTable[currentLevel];
    const newCost = cost;
    const costDiff = newCost - currentCost;
    
    // 별가루가 충분한지 확인
    if (state.remainingStardust - costDiff < 0) {
        alert("별가루가 부족합니다!");
        return;
    }
    
    // 레벨과 별가루 업데이트
    charm.level = newLevel;
    state.remainingStardust -= costDiff;
    
    updateDisplay();
}

// 화면 업데이트
function updateDisplay() {
    // 별가루 업데이트
    document.getElementById('remaining-stardust').textContent = state.remainingStardust;
    
    // 각 특성 레벨 업데이트
    for (let id in state.charms) {
        const charmItem = document.querySelector(`.charm-item[data-id="${id}"]`);
        if (charmItem) {
            // 레벨 버튼 활성화/비활성화 및 스타일 적용
            const levelBtns = charmItem.querySelectorAll('.level-btn');
            levelBtns.forEach(btn => {
                const btnLevel = parseInt(btn.getAttribute('data-level'));
                const btnCost = parseInt(btn.getAttribute('data-cost'));
                
                // 선택된 레벨 표시
                if (btnLevel === state.charms[id].level) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
                
                // 선택 가능 여부 표시
                if (btnLevel !== state.charms[id].level && 
                    (btnCost - state.costTable[state.charms[id].level]) > state.remainingStardust) {
                    btn.classList.add('disabled');
                } else {
                    btn.classList.remove('disabled');
                }
            });
        }
    }
}

// 결과 표시
function showResult() {
    const modal = document.getElementById('result-modal');
    const topCharmsDiv = document.getElementById('top-charms');
    const resultsDiv = document.getElementById('charm-results');
    const finalResultDiv = document.getElementById('final-result');
    
    // 결과 내용 초기화
    topCharmsDiv.innerHTML = '';
    resultsDiv.innerHTML = '';
    
    // 선택된 특성만 필터링
    const selectedCharms = Object.values(state.charms).filter(charm => charm.level > 0);
    
    // 특성이 하나도 선택되지 않은 경우
    if (selectedCharms.length === 0) {
        finalResultDiv.innerHTML = "아직 어떤 특성도 선택하지 않았습니다. 별가루를 투자해 보세요!";
        modal.style.display = 'block';
        return;
    }
    
    // 특성 레벨에 따른 정렬
    selectedCharms.sort((a, b) => b.level - a.level);
    
    // 최상위 3개 특성
    const topCharms = selectedCharms.slice(0, 3);
    topCharmsDiv.innerHTML = '<h3>당신의 핵심 매력</h3>';
    
    if (topCharms.length > 0) {
        const topCharmsList = document.createElement('ul');
        topCharms.forEach(charm => {
            const item = document.createElement('li');
            item.innerHTML = `<strong>${charm.name}</strong>: 매력도 ${charm.level} (${getLevelDescription(charm.level)})`;
            topCharmsList.appendChild(item);
        });
        topCharmsDiv.appendChild(topCharmsList);
    }
    
    // 카테고리별로 결과 정리
    const resultByCategory = {};
    
    for (let id in state.charms) {
        const charm = state.charms[id];
        if (charm.level > 0) {
            // 특성이 속한 카테고리 찾기
            let categoryName = "기타";
            for (const category of categories) {
                if (category.charms.includes(charm.name)) {
                    categoryName = category.name;
                    break;
                }
            }
            
            if (!resultByCategory[categoryName]) {
                resultByCategory[categoryName] = [];
            }
            
            resultByCategory[categoryName].push(charm);
        }
    }
    
    // 카테고리별 결과 표시
    for (let category in resultByCategory) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'result-category';
        
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryDiv.appendChild(categoryHeader);
        
        resultByCategory[category].forEach(charm => {
            const resultItem = document.createElement('div');
            resultItem.className = 'charm-result-item';
            
            resultItem.innerHTML = `
                <div class="charm-name">${charm.name}</div>
                <div class="charm-result-level">매력도 ${charm.level} (${getLevelDescription(charm.level)})</div>
            `;
            
            categoryDiv.appendChild(resultItem);
        });
        
        resultsDiv.appendChild(categoryDiv);
    }
    
    // 최종 결과 분석 및 표시
    let totalLevel = 0;
    let topLevelCount = 0; // 매력도 5-6인 특성 수
    
    for (let id in state.charms) {
        if (state.charms[id].level > 0) {
            totalLevel += state.charms[id].level;
            if (state.charms[id].level >= 5) {
                topLevelCount++;
            }
        }
    }
    
    // 최종 결과 메시지
    let message = '';
    
    if (totalLevel < 10) {
        message = "아직 자신의 매력을 충분히 발전시키지 못했습니다. 더 많은 별가루를 투자해보세요!";
    } else if (topLevelCount >= 3) {
        message = "당신은 몇 가지 특별한 매력으로 돋보이는 사람입니다! 당신의 독특한 매력으로 주변 사람들에게 강한 인상을 남깁니다.";
    } else if (Object.keys(resultByCategory).length >= 5) {
        message = "당신은 다양한 분야에서 고르게 발전된 매력을 가지고 있습니다. 어떤 상황에서도 적응할 수 있는 다재다능한 매력이 돋보입니다!";
    } else if (totalLevel >= 25) {
        message = "당신은 자신만의 독특한 매력 조합을 가지고 있습니다. 특별한 매력 포인트가 돋보입니다!";
    } else {
        message = "당신은 자신만의 개성을 가지고 있습니다. 더 발전시켜 나간다면 큰 매력으로 발전할 수 있을 것입니다.";
    }
    
    // 사용한 별가루 정보 추가
    message += `<br><br>사용한 별가루: ${state.totalStardust - state.remainingStardust}/${state.totalStardust} 별가루`;
    
    finalResultDiv.innerHTML = message;
    
    // 모달 표시
    modal.style.display = 'block';
}

// 레벨에 따른 설명 반환
function getLevelDescription(level) {
    switch(level) {
        case 1: return "기초";
        case 2: return "보통";
        case 3: return "좋음";
        case 4: return "우수";
        case 5: return "탁월";
        case 6: return "최상";
        default: return "없음";
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('result-modal').style.display = 'none';
}

// 게임 리셋
function resetGame() {
    if (confirm("정말 모든 선택을 초기화하시겠습니까?")) {
        state.remainingStardust = state.totalStardust;
        
        for (let id in state.charms) {
            state.charms[id].level = 0;
        }
        
        updateDisplay();
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('result-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};