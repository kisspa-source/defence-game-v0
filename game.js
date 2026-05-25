/**
 * JRPG Cute Fantasy - game.js
 * Vertical Overhaul Core Engine (11x17 Grid Target Concept)
 */

// JRPG Sprite Sheet & Tileset elements
const jrpgSprites = new Image();
const jrpgTiles = new Image();
let spritesLoaded = false;
let tilesLoaded = false;

jrpgSprites.onload = () => {
    spritesLoaded = true;
    if (window.game) game.drawShopIcons();
};
jrpgTiles.onload = () => {
    tilesLoaded = true;
};
jrpgSprites.src = 'cat_office_sprites.png';
jrpgTiles.src = 'cat_office_tiles.png';

// Grid configuration
const GRID_COLS = 11;
const GRID_ROWS = 17;
const CELL_SIZE = 40;
const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;  // 440
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 680

// Path coordinates (Grid points winding down 4 floors)
const pathGrid = [
    {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, // Floor 4 (Reception)
    {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5}, {x: 3, y: 6}, // Staircase 1 (Down)
    {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, // Floor 3 Corridor
    {x: 7, y: 7}, {x: 7, y: 8}, {x: 7, y: 9}, {x: 7, y: 10}, // Staircase 2 (Down)
    {x: 6, y: 10}, {x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}, {x: 2, y: 10}, // Floor 2 Corridor
    {x: 2, y: 11}, {x: 2, y: 12}, {x: 2, y: 13}, {x: 2, y: 14}, // Staircase 3 (Down)
    {x: 3, y: 14}, {x: 4, y: 14}, {x: 5, y: 14}, {x: 6, y: 14}, {x: 7, y: 14}, {x: 8, y: 14}, {x: 9, y: 14} // Floor 1 Server Room
];

// Helper to check if a grid cell is part of the path
function isPathCell(x, y) {
    return pathGrid.some(p => p.x === x && p.y === y);
}

// Convert grid path to pixel coordinates (center of cells)
const pixelPath = pathGrid.map(p => ({
    x: p.x * CELL_SIZE + CELL_SIZE / 2,
    y: p.y * CELL_SIZE + CELL_SIZE / 2
}));

// Draw a beautiful metal JRPG staircase step (vertical) or corridor hallway carpet (horizontal)
function drawCarpetPathTile(ctx, px, py, col, row) {
    const isVerticalPath = (col === 3 && row >= 3 && row <= 6) || 
                           (col === 7 && row >= 6 && row <= 10) || 
                           (col === 2 && row >= 10 && row <= 14);

    if (tilesLoaded) {
        const tw = jrpgTiles.width / 4;
        const th = jrpgTiles.height / 4;
        const sx = isVerticalPath ? 2 * tw : 1 * tw; // Col 2 for stairs, Col 1 for path
        ctx.drawImage(jrpgTiles, sx, 0, tw, th, px, py, CELL_SIZE, CELL_SIZE);
        return;
    }

    if (isVerticalPath) {
        // Cozy Wooden Stairs connecting floors
        ctx.fillStyle = '#dfc3a7'; 
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        ctx.strokeStyle = '#a88567';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const sy = py + i * 10;
            ctx.beginPath();
            ctx.moveTo(px, sy);
            ctx.lineTo(px + CELL_SIZE, sy);
            ctx.stroke();

            // shade
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(px, sy + 7, CELL_SIZE, 3);
        }

        // Side handrails
        ctx.strokeStyle = '#8c5225';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px + 2, py);
        ctx.lineTo(px + 2, py + CELL_SIZE);
        ctx.moveTo(px + CELL_SIZE - 2, py);
        ctx.lineTo(px + CELL_SIZE - 2, py + CELL_SIZE);
        ctx.stroke();
    } else {
        // Cozy Office Carpet Runner Path (Beige/Cream)
        ctx.fillStyle = '#eed8c9';
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        // Brown carpet borders
        ctx.strokeStyle = '#bd9a7a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

        // Carpet texture dots
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(px + 6, py + 8, 2, 2);
        ctx.fillRect(px + 20, py + 22, 2, 2);
        ctx.fillRect(px + 30, py + 12, 2, 2);
    }
}

// Draw raised concrete floor platforms and high-density server cabinets
function drawOfficeFloorTile(ctx, px, py, col, row) {
    // If it's the vertical wall transition rows (Row 4, 8, 12) and unoccupied, do nothing!
    if (row === 4 || row === 8 || row === 12) {
        const isOccupied = (window.game && game.towers && game.towers.some(t => t.gx === col && t.gy === row)) || 
                           (window.game && game.obstacles && game.obstacles.some(ob => ob.x === col && ob.y === row));
        if (!isOccupied) return;
    }

    const isWallRow = row === 0 || row === 5 || row === 9 || row === 13;

    if (isWallRow) {
        if (row === 0) {
            // Floor 4: IT Office Wall (Sage Green)
            ctx.fillStyle = '#9fc0a6'; 
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py + CELL_SIZE - 4, CELL_SIZE, 4);

            // Wall clock
            if (col === 5) {
                ctx.fillStyle = '#85583f'; // wood rim
                ctx.beginPath();
                ctx.arc(px + 20, py + 16, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff'; // face
                ctx.beginPath();
                ctx.arc(px + 20, py + 16, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + 20, py + 16); ctx.lineTo(px + 20, py + 13);
                ctx.moveTo(px + 20, py + 16); ctx.lineTo(px + 23, py + 16);
                ctx.stroke();
            }
        } 
        else if (row === 5) {
            // Floor 3: Server Room Wall (Dark Blue-Grey with LEDs)
            ctx.fillStyle = '#2c3e50'; 
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px, py + CELL_SIZE - 4, CELL_SIZE, 4);

            // Blinking LEDs
            const blink = Math.floor(Date.now() / 400) % 2 === 0;
            ctx.fillStyle = blink ? '#2ecc71' : '#27ae60'; // green LED
            ctx.fillRect(px + 12, py + 14, 2, 2);
            ctx.fillStyle = !blink ? '#e74c3c' : '#c0392b'; // red LED
            ctx.fillRect(px + 22, py + 14, 2, 2);
        }
        else if (row === 9) {
            // Floor 2: Meeting Room Wall (Clean White/Cream)
            ctx.fillStyle = '#f5f6fa'; 
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#52665d'; // wood board base
            ctx.fillRect(px, py + CELL_SIZE - 4, CELL_SIZE, 4);

            // Project WBS Chart Frame
            if (col === 4) {
                ctx.fillStyle = '#85583f'; // brown frame
                ctx.fillRect(px + 6, py + 4, 28, 22);
                ctx.fillStyle = '#ffffff'; // canvas
                ctx.fillRect(px + 8, py + 6, 24, 18);
                // chart lines (WBS scheduling bars)
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(px + 10, py + 10, 8, 3);
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(px + 15, py + 15, 12, 3);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(px + 20, py + 20, 5, 3);
            }
        }
        else if (row === 13) {
            // Floor 1: Overtime Dev Team Wall (Dim Midnight Blue)
            ctx.fillStyle = '#1e272e'; 
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(px, py + CELL_SIZE - 4, CELL_SIZE, 4);

            // Blinking terminal cursor decoration
            if (col === 8) {
                ctx.font = '8px "Press Start 2P"';
                ctx.fillStyle = '#00ff66'; // terminal green
                const showCursor = Math.floor(Date.now() / 500) % 2 === 0;
                ctx.fillText('>', px + 10, py + 18);
                if (showCursor) ctx.fillRect(px + 22, py + 12, 6, 8);
            }
        }
    } else {
        // Floor plank textures
        if (row < 4) {
            // Floor 4: IT Office Light Wood
            ctx.fillStyle = '#f2ddc6';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#dfc3a7';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px, py); ctx.lineTo(px + CELL_SIZE, py);
            ctx.moveTo(px, py + 16); ctx.lineTo(px + CELL_SIZE, py + 16);
            ctx.moveTo(px, py + 32); ctx.lineTo(px + CELL_SIZE, py + 32);
            ctx.stroke();
        }
        else if (row < 8) {
            // Floor 3: Server Room Cold Metal Plates
            ctx.fillStyle = '#57606f';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
            
            // Rivets on corners
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(px + 2, py + 2, 1.5, 1.5);
            ctx.fillRect(px + CELL_SIZE - 3.5, py + 2, 1.5, 1.5);
            ctx.fillRect(px + 2, py + CELL_SIZE - 3.5, 1.5, 1.5);
            ctx.fillRect(px + CELL_SIZE - 3.5, py + CELL_SIZE - 3.5, 1.5, 1.5);
        }
        else if (row < 12) {
            // Floor 2: Meeting Room Warm Mahogany Planks
            ctx.fillStyle = '#b77c57';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#85583f';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px, py); ctx.lineTo(px + CELL_SIZE, py);
            ctx.moveTo(px, py + 20); ctx.lineTo(px + CELL_SIZE, py + 20);
            ctx.stroke();
        }
        else {
            // Floor 1: Overtime Dev Team Dim Grey Tiles
            ctx.fillStyle = '#353b48';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

            // Cable traces on floor (matrix lines/wires)
            if ((col + row) % 4 === 0) {
                ctx.strokeStyle = '#1e272e';
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(px + 10, py);
                ctx.lineTo(px + 20, py + CELL_SIZE);
                ctx.stroke();
            }
        }
    }

    // Platform bottom edge lip (3D depth)
    if (row === 3 || row === 7 || row === 11 || row === 16) {
        ctx.fillStyle = '#3c2517'; // Warm dark wood shadow edge
        ctx.fillRect(px, py + CELL_SIZE - 6, CELL_SIZE, 6);
    }

    // Draw Props on unoccupied non-wall cells
    const isOccupied = (col === 1 && row === 2) || (col === 9 && row === 14) || isWallRow ||
                       (window.game && game.towers && game.towers.some(t => t.gx === col && t.gy === row)) || 
                       (window.game && game.obstacles && game.obstacles.some(ob => ob.x === col && ob.y === row));

    if (!isOccupied) {
        ctx.save();
        
        if (row < 4) {
            // Floor 4: IT Office Props (Stool, table, plant)
            if ((col + row) % 3 === 0) {
                // Round Pink Stool
                ctx.fillStyle = '#ff8fa3';
                ctx.beginPath();
                ctx.ellipse(px + 20, py + 24, 10, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#d63031';
                ctx.lineWidth = 1.2;
                ctx.stroke();
                // Stool legs
                ctx.strokeStyle = '#bdc3c7';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(px + 15, py + 24); ctx.lineTo(px + 15, py + 36);
                ctx.moveTo(px + 25, py + 24); ctx.lineTo(px + 25, py + 36);
                ctx.stroke();
            } else if ((col + row) % 3 === 1) {
                // Potted plant
                ctx.fillStyle = '#a0522d'; // clay pot
                ctx.fillRect(px + 14, py + 22, 12, 8);
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(px + 16, py + 16, 4, 0, Math.PI * 2);
                ctx.arc(px + 24, py + 16, 4, 0, Math.PI * 2);
                ctx.arc(px + 20, py + 12, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        else if (row >= 5 && row < 8) {
            // Floor 3: Server Room Props (Server Cabinets / Racks)
            if ((col + row) % 3 === 0) {
                // High density server cabinet
                ctx.fillStyle = '#2f3542'; // steel case
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(px + 6, py + 4, CELL_SIZE - 12, CELL_SIZE - 8, 2);
                ctx.fill();
                ctx.stroke();
                // vertical slot details
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(px + 10, py + 8, CELL_SIZE - 20, CELL_SIZE - 16);
                // blinking led dot
                const serverBlink = Math.floor(Date.now() / 250) % 2 === 0;
                ctx.fillStyle = serverBlink ? '#00f0ff' : '#0984e3'; // blinking blue lights
                ctx.fillRect(px + 14, py + 12, 2, 2);
                ctx.fillRect(px + 14, py + 20, 2, 2);
                ctx.fillStyle = '#2ecc71'; // status green
                ctx.fillRect(px + 22, py + 12, 2, 2);
            }
        }
        else if (row >= 9 && row < 12) {
            // Floor 2: Meeting Room Props (Chairs, Tables, Notes)
            if ((col + row) % 3 === 1) {
                // Long whiteboard table plank
                ctx.fillStyle = '#85583f'; // table brown wood
                ctx.strokeStyle = '#5c3a21';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(px + 4, py + 14, CELL_SIZE - 8, 12, 1);
                ctx.fill();
                ctx.stroke();
                
                // Mug on table
                ctx.fillStyle = '#ff8fa3';
                ctx.fillRect(px + 18, py + 10, 4, 5);
            }
        }
        else if (row >= 13) {
            // Floor 1: Night Overtime Dev Team Props (Pizza boxes, soda cans, coffee mugs, glowing monitor setups)
            if ((col + row) % 3 === 0) {
                // Glowing Monitor Workstation
                ctx.fillStyle = '#2f3542'; // bezel
                ctx.fillRect(px + 6, py + 10, 28, 18);
                // screen glow
                ctx.fillStyle = '#002b36'; // dark background
                ctx.fillRect(px + 8, py + 12, 24, 14);
                // terminal code graphics
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(px + 10, py + 15, 6, 2);
                ctx.fillRect(px + 10, py + 18, 12, 2);
                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(px + 10, py + 21, 8, 2);
                // stand
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(px + 18, py + 28, 4, 4);
                ctx.fillRect(px + 12, py + 32, 16, 2);
            } else if ((col + row) % 3 === 1) {
                // Pizza Box (flattened cardboard square)
                ctx.fillStyle = '#bdc3c7'; // white box
                ctx.strokeStyle = '#c0392b'; // red pizza logo line
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(px + 10, py + 18, 20, 16, 1);
                ctx.fill();
                ctx.stroke();
                // details
                ctx.fillStyle = '#d35400'; // tiny slice representation
                ctx.fillRect(px + 18, py + 22, 4, 4);
            } else {
                // Empty Coffee cups and soda cans
                ctx.fillStyle = '#e74c3c'; // soda can red
                ctx.fillRect(px + 12, py + 24, 5, 8);
                ctx.fillStyle = '#ffffff'; // coffee cup
                ctx.fillRect(px + 24, py + 20, 6, 7);
                // coffee steam (small wiggles)
                const steamWiggle = Math.floor(Date.now() / 300) % 2;
                ctx.fillStyle = 'rgba(255,255,255,0.45)';
                ctx.fillRect(px + 26, py + 15 - steamWiggle, 1.5, 2.5);
            }
        }
        ctx.restore();
    }
}

// Technical Stack Cards Pool (Roguelike upgrades)
const TECH_POOL = [
    {
        id: 'react',
        name: 'React 19 도입',
        icon: '⚛️',
        desc: '기계식 키보드(Keyboard)의 공격 속도가 25% 상승하고 코드(LOC) 획득이 증가합니다.',
        apply() {
            game.buffs.keyboardSpeed *= 0.75;
            game.buffs.locMultiplier += 0.2;
            game.showDialog("📢 [Jira Alert] React 19 도입 완료! 키보드 공격속도 +25%, LOC 획득 +20% 시너지가 활성화되었습니다.", "excited");
        }
    },
    {
        id: 'docker',
        name: 'Docker 컨테이너화',
        icon: '🐳',
        desc: '기계식 키보드(Keyboard)가 컨테이너로 분할되어 한번에 2개의 코드를 입력(발사)합니다.',
        apply() {
            game.buffs.keyboardDoubleShot = true;
            game.showDialog("💬 [Slack Alert] Docker 도입 완료: 기계식 키보드가 분할 빌드(더블 샷)로 동작합니다!", "excited");
        }
    },
    {
        id: 'springboot',
        name: 'Spring Boot 빌드 최적화',
        icon: '🍃',
        desc: 'IDE 서버(IDE Server)의 대규모 컴파일 공격력(Splash damage)이 35% 증가합니다.',
        apply() {
            game.buffs.laptopDamage *= 1.35;
            game.showDialog("📢 [Jira Alert] 빌드 최적화 완료! IDE 서버 컴파일 대미지가 35% 상승했습니다.", "excited");
        }
    },
    {
        id: 'redis',
        name: 'Redis 캐시 서버 구축',
        icon: '🟥',
        desc: '게이밍 마우스(Mouse)의 슬로우 추적 감도가 15% 추가 강화됩니다.',
        apply() {
            game.buffs.mouseSlowStrength += 0.15;
            game.showDialog("💬 [Slack Alert] Redis 캐시 메모리 연동! 게이밍 마우스의 슬로우 효율이 15% 강화되었습니다.", "excited");
        }
    },
    {
        id: 'jira',
        name: 'Jira 협업 툴 도입',
        icon: '📊',
        desc: '모든 개발 장비의 설치 및 튜닝(업그레이드) 비용이 15% 감면됩니다.',
        apply() {
            game.buffs.costDiscount += 0.15;
            game.showDialog("📢 [Jira Alert] Jira 티켓 협업 도입: 모든 서버와 장비의 설치/강화 비용이 15% 할인됩니다.", "excited");
        }
    },
    {
        id: 'git',
        name: 'Git Branch 분기 전략',
        icon: '🌿',
        desc: 'IDE 서버(IDE Server) 컴파일 탄환 폭발 시, 주변으로 3개의 파편 버그 추적 코드가 비산되어 피해를 줍니다.',
        apply() {
            game.buffs.laptopShrapnel = true;
            game.showDialog("💬 [Slack Alert] Git Branch 전략 수립: IDE 서버 공격 시 주변으로 파편 버그 코드가 비산됩니다.", "excited");
        }
    },
    {
        id: 'coffee',
        name: '에스프레소 머신 설치',
        icon: '☕',
        desc: '사무실 카페인 상시 보급! 모든 장비의 커버리지(사거리)가 15% 증가합니다.',
        apply() {
            game.buffs.globalRange *= 1.15;
            game.showDialog("☕ [System Alert] 고급 에스프레소 머신 도입! 카페인 버프로 모든 장비 사거리가 15% 넓어집니다.", "excited");
        }
    },
    {
        id: 'typescript',
        name: 'TypeScript 도입',
        icon: '🔷',
        desc: '장비들이 QA 버그 디버프에 걸리는 마비 시간을 50% 단축하고, 보스 딜량이 20% 상승합니다.',
        apply() {
            game.buffs.bugDurationMultiplier *= 0.5;
            game.buffs.bossDamageMultiplier += 0.2;
            game.showDialog("📢 [Jira Alert] TypeScript 강력한 타입 체킹 도입: QA 재오픈 마비 시간 50% 단축, 보스 추가 대미지 20%!", "excited");
        }
    }
];

// Classes definition
class Enemy {
    constructor(type, waveNum) {
        this.type = type;
        this.waveNum = waveNum;
        
        // Base values
        this.x = pixelPath[0].x;
        this.y = pixelPath[0].y;
        this.targetWaypoint = 1;
        this.active = true;
        this.size = 15;
        this.slowTimer = 0;
        this.slowFactor = 1.0;
        this.stunTimer = 0;
        
        // Custom visual offsets
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.12;
        
        // Bug status
        this.bugCooldown = 2500 + Math.random() * 2000;
        this.lastBugTime = 0;

        // Apply type-specific stats
        this.initStats();
    }

    initStats() {
        const difficultyScale = 1.0 + (this.waveNum - 1) * 0.40;
        
        let hpMultiplier = 1.0;
        let speedMultiplier = 1.0;
        
        // Sprint-specific rules
        if (this.waveNum === 3) {
            hpMultiplier = 1.30; // Security Compliance Audit -> higher task resistance
        } else if (this.waveNum === 4) {
            speedMultiplier = 1.25; // Schedule Compression Sprint -> fast tasks
        }
        
        switch (this.type) {
            case 'spec_adder': // Fast & weak (요구사항 변경)
                this.name = '요구사항 변경';
                this.maxHp = 50 * difficultyScale * hpMultiplier;
                this.speed = 1.8 * speedMultiplier;
                this.gold = 10;
                this.loc = 50;
                this.color = '#f39c12';
                this.phrase = '기능 하나만 추가해주세용!';
                break;
            case 'doc_bomber': // Hard armored (레거시 코드)
                this.name = '레거시 코드';
                this.maxHp = 180 * difficultyScale * hpMultiplier;
                this.speed = 0.9 * speedMultiplier;
                this.gold = 25;
                this.loc = 100;
                this.color = '#95a5a6';
                this.phrase = '이거 지우면 전체 빌드 터짐';
                this.armored = true;
                break;
            case 'urgent': // Very fast (긴급 장애)
                this.name = '긴급 장애';
                this.maxHp = 80 * difficultyScale * hpMultiplier;
                this.speed = 2.5 * speedMultiplier;
                this.gold = 15;
                this.loc = 80;
                this.color = '#e74c3c';
                this.phrase = '서버 접속 불가능! (Critical)';
                break;
            case 'qa_bugger': // Debug/disable towers (QA 재오픈)
                this.name = 'QA 재오픈';
                this.maxHp = 220 * difficultyScale * hpMultiplier;
                this.speed = 1.2 * speedMultiplier;
                this.gold = 30;
                this.loc = 150;
                this.color = '#3498db';
                this.phrase = '스테이징에서 재현되는데요?';
                break;
            case 'ceo_boss': // Big boss (운영 배포 사고)
                this.name = '운영 배포 사고';
                this.maxHp = 2000 * (1.0 + (this.waveNum - 5) * 0.8) * hpMultiplier;
                this.speed = 0.6 * speedMultiplier;
                this.gold = 300;
                this.loc = 500;
                this.color = '#eb3b5a';
                this.phrase = '실서버 DB 접속 장애 발생!!!';
                this.isBoss = true;
                break;
        }
        this.hp = this.maxHp;
    }

    update(dt) {
        if (!this.active) return;

        // Timers update
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) {
                this.slowFactor = 1.0;
            }
        }
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return; // Can't move while stunned
        }

        // Special behavior: QA Client spawns bug reports to freeze towers
        if (this.type === 'qa_bugger') {
            this.bugCooldown -= dt;
            if (this.bugCooldown <= 0) {
                this.fireBugReport();
                this.bugCooldown = 4000 + Math.random() * 2000;
            }
        }

        // Movement
        const target = pixelPath[this.targetWaypoint];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Slow modifier
        const currentSpeed = this.speed * this.slowFactor;

        if (dist <= currentSpeed) {
            this.x = target.x;
            this.y = target.y;
            this.targetWaypoint++;
            
            if (this.targetWaypoint >= pixelPath.length) {
                // Reached Chorong's desk (base)
                this.active = false;
                game.damageBase(this.isBoss ? 40 : 10);
            }
        } else {
            this.x += (dx / dist) * currentSpeed;
            this.y += (dy / dist) * currentSpeed;
        }

        this.bobOffset += this.bobSpeed;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Draw drop shadow on the floor (anchored, no bobbing)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 11, this.isBoss ? 24 : 11, this.isBoss ? 8 : 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bobbing floating effect
        const bob = Math.sin(this.bobOffset) * 1.5;
        const size = this.isBoss ? 28 : 14;

        if (false && spritesLoaded) {
            const cols = 8;
            const rows = 12;
            const cellW = jrpgSprites.width / cols;
            const cellH = jrpgSprites.height / rows;

            let rowIdx = 7; // Green slime row
            if (this.type === 'doc_bomber') rowIdx = 8;     // Skeleton row
            else if (this.type === 'urgent') rowIdx = 9;    // Wolf row
            else if (this.type === 'qa_bugger') rowIdx = 10; // Shaman row
            else if (this.type === 'ceo_boss') rowIdx = 11;  // Dragon row

            const frame = Math.floor(Date.now() / 150) % 4; // 4-frame animation
            ctx.drawImage(
                jrpgSprites, 
                frame * cellW, rowIdx * cellH, cellW, cellH, 
                this.x - size, this.y - size + bob, size * 2, size * 2
            );
        } else {
            // Procedural IT Company Monster Drawings
            if (this.type === 'spec_adder') {
                // 요구사항 변경: A flying document sheet with folded corner and question marks
                ctx.save();
                ctx.fillStyle = '#ffffff'; // white paper
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1.5;
                
                // Draw a small slanted rectangular page
                ctx.beginPath();
                ctx.moveTo(this.x - 10, this.y - 12 + bob);
                ctx.lineTo(this.x + 6, this.y - 12 + bob);
                ctx.lineTo(this.x + 10, this.y - 8 + bob); // Folded corner start
                ctx.lineTo(this.x + 10, this.y + 12 + bob);
                ctx.lineTo(this.x - 10, this.y + 12 + bob);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Folded corner flap
                ctx.fillStyle = '#dfe4ea';
                ctx.beginPath();
                ctx.moveTo(this.x + 6, this.y - 12 + bob);
                ctx.lineTo(this.x + 6, this.y - 8 + bob);
                ctx.lineTo(this.x + 10, this.y - 8 + bob);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw lines of 'code' on the document
                ctx.strokeStyle = '#f39c12'; // orange text lines
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(this.x - 6, this.y - 4 + bob); ctx.lineTo(this.x + 6, this.y - 4 + bob);
                ctx.moveTo(this.x - 6, this.y + bob);     ctx.lineTo(this.x + 4, this.y + bob);
                ctx.moveTo(this.x - 6, this.y + 4 + bob); ctx.lineTo(this.x + 6, this.y + 4 + bob);
                ctx.stroke();

                // Warning / Addition symbol (+ symbol inside circle)
                ctx.fillStyle = '#e67e22';
                ctx.beginPath();
                ctx.arc(this.x + 6, this.y + 6 + bob, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x + 4, this.y + 6 + bob); ctx.lineTo(this.x + 8, this.y + 6 + bob);
                ctx.moveTo(this.x + 6, this.y + 4 + bob); ctx.lineTo(this.x + 6, this.y + 8 + bob);
                ctx.stroke();
                ctx.restore();
            } 
            else if (this.type === 'doc_bomber') {
                // 레거시 코드: A dusty brown heavy stone block with cobwebs and red 'LEGACY' text
                ctx.save();
                ctx.fillStyle = '#57606f'; // Dark charcoal stone
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(this.x - 13, this.y - 12 + bob, 26, 24, 2);
                ctx.fill();
                ctx.stroke();

                // Stone texture cracks
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(this.x - 10, this.y - 10 + bob); ctx.lineTo(this.x - 4, this.y - 4 + bob);
                ctx.moveTo(this.x + 6, this.y + 8 + bob);  ctx.lineTo(this.x + 10, this.y + 2 + bob);
                ctx.stroke();

                // Red 'LEGACY' text
                ctx.fillStyle = '#ff7675';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('LEGACY', this.x, this.y + 4 + bob);
                ctx.restore();
            }
            else if (this.type === 'urgent') {
                // 긴급 장애: A flashing red siren light box
                ctx.save();
                // Siren base (dark grey metal)
                ctx.fillStyle = '#2f3542';
                ctx.strokeStyle = '#1e272e';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(this.x - 11, this.y + 2 + bob, 22, 10, 1);
                ctx.fill();
                ctx.stroke();

                // Siren red light bulb
                const isBright = Math.floor(Date.now() / 150) % 2 === 0;
                ctx.fillStyle = isBright ? '#ff7675' : '#d63031';
                ctx.shadowBlur = isBright ? 12 : 0;
                ctx.shadowColor = '#ff7675';
                ctx.beginPath();
                ctx.arc(this.x, this.y + 2 + bob, 8, Math.PI, 0);
                ctx.fill();
                ctx.stroke();

                // Light ray effect
                if (isBright) {
                    ctx.strokeStyle = 'rgba(255, 118, 117, 0.45)';
                    ctx.lineWidth = 1.5;
                    for (let angle = -Math.PI * 0.8; angle < -Math.PI * 0.2; angle += Math.PI / 4) {
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y + 2 + bob);
                        ctx.lineTo(this.x + Math.cos(angle) * 16, this.y + 2 + Math.sin(angle) * 16 + bob);
                        ctx.stroke();
                    }
                }
                ctx.restore();
            }
            else if (this.type === 'qa_bugger') {
                // QA 재오픈: A crawling purple/blue beetle bug with cute feelers and green glow eyes
                ctx.save();
                ctx.fillStyle = '#8854d0'; // Purple body
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1.5;

                // Legs
                const legMove = Math.sin(Date.now() / 100) * 3;
                ctx.beginPath();
                // Left legs
                ctx.moveTo(this.x - 5, this.y + bob); ctx.lineTo(this.x - 12, this.y - 2 - legMove + bob);
                ctx.moveTo(this.x - 5, this.y + bob); ctx.lineTo(this.x - 13, this.y + bob);
                ctx.moveTo(this.x - 5, this.y + bob); ctx.lineTo(this.x - 12, this.y + 2 + legMove + bob);
                // Right legs
                ctx.moveTo(this.x + 5, this.y + bob); ctx.lineTo(this.x + 12, this.y - 2 + legMove + bob);
                ctx.moveTo(this.x + 5, this.y + bob); ctx.lineTo(this.x + 13, this.y + bob);
                ctx.moveTo(this.x + 5, this.y + bob); ctx.lineTo(this.x + 12, this.y + 2 - legMove + bob);
                ctx.stroke();

                // Main body shape (oval)
                ctx.beginPath();
                ctx.ellipse(this.x, this.y + bob, 9, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Bug head (small circle on top)
                ctx.beginPath();
                ctx.arc(this.x, this.y - 7 + bob, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Antenna
                ctx.beginPath();
                ctx.moveTo(this.x - 2, this.y - 11 + bob);
                ctx.quadraticCurveTo(this.x - 5, this.y - 15 + bob, this.x - 8, this.y - 13 + bob);
                ctx.moveTo(this.x + 2, this.y - 11 + bob);
                ctx.quadraticCurveTo(this.x + 5, this.y - 15 + bob, this.x + 8, this.y - 13 + bob);
                ctx.stroke();

                // Glowing green eyes
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(this.x - 1.5, this.y - 7.5 + bob, 1.2, 0, Math.PI * 2);
                ctx.arc(this.x + 1.5, this.y - 7.5 + bob, 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            else if (this.type === 'ceo_boss') {
                // 운영 배포 사고: A huge black server rack block with warning lights, fire flames, and smoke
                ctx.save();
                
                // Server rack frame
                ctx.fillStyle = '#1e272e';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(this.x - 20, this.y - 28 + bob, 40, 48, 3);
                ctx.fill();
                ctx.stroke();

                // Shelves / Grills with blinking red/yellow LED indicators
                ctx.fillStyle = '#2f3542';
                for (let i = 0; i < 5; i++) {
                    const sy = this.y - 22 + i * 8 + bob;
                    ctx.fillRect(this.x - 16, sy, 32, 5);
                    
                    // blink LEDs
                    const blink = Math.floor(Date.now() / 250 + i) % 2 === 0;
                    ctx.fillStyle = blink ? '#eb3b5a' : '#4b1420'; // red/dark red
                    ctx.fillRect(this.x - 12, sy + 1.5, 2, 2);
                    ctx.fillStyle = !blink ? '#f1c40f' : '#7f6a00'; // yellow/dark yellow
                    ctx.fillRect(this.x - 8, sy + 1.5, 2, 2);
                    ctx.fillStyle = '#2f3542'; // reset for next shelf background
                }

                // Center screen warning message 'CRITICAL OUTAGE'
                ctx.fillStyle = 'rgba(235, 59, 90, 0.15)';
                ctx.fillRect(this.x - 14, this.y - 3 + bob, 28, 9);
                ctx.strokeStyle = '#eb3b5a';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x - 14, this.y - 3 + bob, 28, 9);
                
                ctx.fillStyle = '#ff7675';
                ctx.font = 'bold 5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('OUTAGE', this.x, this.y + 3 + bob);

                // Orange sparks / flame shapes on the sides
                ctx.fillStyle = '#e67e22';
                const flameSway = Math.sin(Date.now() / 100) * 4;
                ctx.beginPath();
                // Left flame
                ctx.moveTo(this.x - 20, this.y + 16 + bob);
                ctx.lineTo(this.x - 26 + flameSway, this.y - 4 + bob);
                ctx.lineTo(this.x - 22, this.y + 2 + bob);
                ctx.closePath();
                // Right flame
                ctx.moveTo(this.x + 20, this.y + 16 + bob);
                ctx.lineTo(this.x + 26 - flameSway, this.y - 4 + bob);
                ctx.lineTo(this.x + 22, this.y + 2 + bob);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        }

        // Draw speech bubble indicator
        if (Math.floor(this.bobOffset) % 15 === 0) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#4b3d30';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.font = '10px "Press Start 2P"';
            
            ctx.strokeText(this.phrase, this.x + size + 2, this.y - 12 + bob);
            ctx.fillText(this.phrase, this.x + size + 2, this.y - 12 + bob);
        }

        // Draw HP bar
        const barWidth = this.isBoss ? 50 : 25;
        const barHeight = 4;
        const bx = this.x - barWidth / 2;
        const by = this.y - 22 - (this.isBoss ? 12 : 0) + bob;
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#eddcd2';
        ctx.fillRect(bx, by, barWidth, barHeight);
        
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = hpPercent > 0.5 ? '#74b9ff' : hpPercent > 0.2 ? '#ffeaa7' : '#ff7675';
        ctx.fillRect(bx, by, barWidth * hpPercent, barHeight);
        ctx.strokeStyle = '#dcd1be';
        ctx.strokeRect(bx, by, barWidth, barHeight);

        // Status effects icons
        let iconX = bx;
        if (this.slowTimer > 0) {
            ctx.font = '10px Arial';
            ctx.fillText('❄️', iconX, by - 6);
            iconX += 10;
        }
        if (this.stunTimer > 0) {
            ctx.font = '10px Arial';
            ctx.fillText('💫', iconX, by - 6);
        }

        ctx.restore();
    }

    takeDamage(amount, source) {
        if (!this.active) return;
        
        // Armor check
        if (this.armored && source === 'keyboard') {
            amount *= 0.65;
        }

        if (this.isBoss) {
            amount *= game.buffs.bossDamageMultiplier;
        }

        this.hp -= amount;
        
        // Particle effect on hit
        game.createParticles(this.x, this.y, this.color, 4);
        
        // Developer-themed floaty error tags!
        const codingErrors = ['NullPointer', 'SyntaxError', 'MergeConflict', '404', 'TypeError', 'MemoryLeak', 'Timeout', 'Spaghetti', 'Bug', 'Deprecation', 'CallbackHell'];
        const randomError = codingErrors[Math.floor(Math.random() * codingErrors.length)];
        game.createFloatingText(`${randomError} (-${Math.round(amount)})`, this.x + (Math.random() - 0.5) * 15, this.y - 12, this.color);
        
        Sound.playHit();

        if (this.hp <= 0) {
            this.active = false;
            game.earnBudget(this.gold);
            game.earnLOC(this.loc);
            game.log(`[JOB DONE] ${this.name} 퇴치! +${this.gold}G`);
        }
    }

    fireBugReport() {
        // Target a random nearby tower within range
        const range = 160;
        const targets = game.towers.filter(t => {
            const dist = Math.hypot(t.x - this.x, t.y - this.y);
            return dist <= range && t.type !== 'snack'; // Snack is consumable trap
        });

        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            
            // Spawn a bug projectile
            game.projectiles.push(new Projectile('bug_report', this.x, this.y, target, 0, {
                speed: 250,
                color: '#ff7675'
            }));
            
            game.createFloatingText('FREEZE BLAST!', this.x, this.y - 15, '#74b9ff');
        }
    }
}

class Tower {
    constructor(type, gx, gy) {
        this.type = type;
        this.gx = gx;
        this.gy = gy;
        this.x = gx * CELL_SIZE + CELL_SIZE / 2;
        this.y = gy * CELL_SIZE + CELL_SIZE / 2;
        
        this.level = 1;
        this.lastShotTime = 0;
        this.buggedTimer = 0; // disabled by bugs
        this.coffeeBuffTimer = 0; // attack speed buff from coffee

        // Snack/Roadblock specific
        this.currentCharges = 1;

        this.initStats();
    }

    initStats() {
        switch (this.type) {
            case 'keyboard':
                this.name = 'Keyboard';
                this.baseCost = 50;
                this.damage = 15;
                this.fireRate = 350; // ms per shot
                this.range = 110;
                break;
            case 'mouse':
                this.name = 'Mouse';
                this.baseCost = 40;
                this.damage = 4; // ticking laser beam
                this.fireRate = 180;
                this.range = 120;
                this.slowFactor = 0.35;
                this.slowDuration = 1500;
                break;
            case 'laptop':
                this.name = 'IDE Server';
                this.baseCost = 100;
                this.damage = 80;
                this.fireRate = 1600;
                this.range = 150;
                this.splashRadius = 70;
                break;
            case 'iphone':
                this.name = 'Jenkins CI';
                this.baseCost = 80;
                this.damage = 25;
                this.fireRate = 800;
                this.range = 130;
                break;
            case 'headset':
                this.name = 'AI Assistant';
                this.baseCost = 60;
                this.damage = 30;
                this.fireRate = 1200;
                this.range = 80; // circular area pulse
                break;
            case 'coffee':
                this.name = 'Postgres DB';
                this.baseCost = 30;
                this.range = 90; // support buff range
                break;
            case 'snack':
                this.name = 'Snack Block';
                this.baseCost = 25;
                this.range = 15; // roadblock trigger range
                break;
        }
    }

    getUpgradeCost() {
        const discount = 1 - game.buffs.costDiscount;
        return Math.round((this.baseCost * 0.8 * this.level) * discount);
    }

    getSellValue() {
        return Math.round((this.baseCost + (this.level - 1) * this.baseCost * 0.5) * 0.5);
    }

    upgrade() {
        const cost = this.getUpgradeCost();
        if (game.budget >= cost) {
            game.budget -= cost;
            this.level++;
            
            // Adjust stats
            if (this.type === 'keyboard') {
                this.damage += 8;
                this.range += 10;
            } else if (this.type === 'mouse') {
                this.damage += 3;
                this.slowFactor = Math.min(0.65, this.slowFactor + 0.05);
                this.range += 12;
            } else if (this.type === 'laptop') {
                this.damage += 45;
                this.splashRadius += 10;
                this.range += 15;
            } else if (this.type === 'iphone') {
                this.damage += 12;
                this.range += 10;
            } else if (this.type === 'headset') {
                this.damage += 15;
                this.range += 8;
            } else if (this.type === 'coffee') {
                this.range += 15;
            }
            
            game.updateHUD();
            Sound.playUpgrade();
            game.createFloatingText('LEVEL UP!', this.x, this.y - 20, '#ffcc00');
            game.log(`[SYSTEM] ${this.name} 타워 Level ${this.level}로 업그레이드!`);
            
            // Refresh selection panel details
            game.selectPlacedTower(this);
        } else {
            Sound.playError();
            game.log('[WARNING] 예산이 부족합니다!', 'warning');
        }
    }

    update(dt, now) {
        // Bug debuff decrement
        if (this.buggedTimer > 0) {
            this.buggedTimer -= dt;
            return;
        }

        // Special support: Coffee Cup buffs surrounding towers
        if (this.type === 'coffee') {
            game.towers.forEach(t => {
                if (t !== this && t.type !== 'coffee' && t.type !== 'snack') {
                    const dist = Math.hypot(t.x - this.x, t.y - this.y);
                    if (dist <= this.range) {
                        t.coffeeBuffTimer = 800; // Buff lasts for 800ms
                    }
                }
            });
            return;
        }

        // Special: Snack Bag roadblock trap
        if (this.type === 'snack') {
            if (this.currentCharges > 0) {
                game.enemies.forEach(e => {
                    if (e.active && e.stunTimer <= 0 && !e.isBoss) {
                        const dist = Math.hypot(e.x - this.x, e.y - this.y);
                        if (dist <= this.range) {
                            e.stunTimer = 4000; // stun for 4s
                            this.currentCharges--;
                            game.createFloatingText('STUNNED BY CHIPS!', e.x, e.y - 12, '#feca57');
                            Sound.playHit();
                            
                            if (this.currentCharges <= 0) {
                                // remove roadblock
                                setTimeout(() => {
                                    const idx = game.towers.indexOf(this);
                                    if (idx > -1) game.towers.splice(idx, 1);
                                }, 50);
                            }
                        }
                    }
                });
            }
            return;
        }

        // Find best target (enemy furthest along the path)
        const target = this.findTarget();
        
        // Headset sonic area pulse does not need specific single target to update cooldown
        if (this.type === 'headset') {
            const overdoseFactor = game.caffeineLevel > 3.0 ? 1.43 : 1.0;
            const adjustedFireRate = this.fireRate * (this.coffeeBuffTimer > 0 ? 0.75 : 1.0) * overdoseFactor;
            if (now - this.lastShotTime >= adjustedFireRate) {
                // Trigger sonic shockwave if any enemy is within circular range
                const enemyInRange = game.enemies.some(e => e.active && e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) <= this.range);
                if (enemyInRange) {
                    this.fire(null);
                    this.lastShotTime = now;
                }
            }
            return;
        }

        if (!target) return;

        // Fire logic
        let speedBuff = 1.0;
        if (this.coffeeBuffTimer > 0) {
            this.coffeeBuffTimer -= dt;
            speedBuff = 0.75; // 25% faster shoot rate
        }
        const overdoseFactor = game.caffeineLevel > 3.0 ? 1.43 : 1.0;
        const adjustedFireRate = (this.type === 'keyboard' ? this.fireRate * game.buffs.keyboardSpeed : this.fireRate) * speedBuff * overdoseFactor;
        if (now - this.lastShotTime >= adjustedFireRate) {
            this.fire(target);
            this.lastShotTime = now;
        }
    }

    findTarget() {
        let bestTarget = null;
        let maxWaypoint = -1;
        let minDistToEnd = Infinity;
        
        const adjustedRange = this.range * game.buffs.globalRange;

        game.enemies.forEach(e => {
            if (e.active && e.hp > 0) {
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist <= adjustedRange) {
                    if (e.targetWaypoint > maxWaypoint) {
                        maxWaypoint = e.targetWaypoint;
                        bestTarget = e;
                        
                        const targetPixel = pixelPath[e.targetWaypoint];
                        minDistToEnd = Math.hypot(targetPixel.x - e.x, targetPixel.y - e.y);
                    } else if (e.targetWaypoint === maxWaypoint) {
                        const targetPixel = pixelPath[e.targetWaypoint];
                        const distToEnd = Math.hypot(targetPixel.x - e.x, targetPixel.y - e.y);
                        if (distToEnd < minDistToEnd) {
                            minDistToEnd = distToEnd;
                            bestTarget = e;
                        }
                    }
                }
            }
        });

        return bestTarget;
    }

    fire(target) {
        const adjDamage = this.type === 'laptop' ? this.damage * game.buffs.laptopDamage : this.damage;
        
        if (this.type === 'keyboard') {
            Sound.playShoot();
            
            if (game.buffs.keyboardDoubleShot) {
                game.projectiles.push(new Projectile('code_key', this.x - 8, this.y, target, adjDamage, {
                    speed: 400,
                    color: '#6ab04c'
                }));
                game.projectiles.push(new Projectile('code_key', this.x + 8, this.y, target, adjDamage, {
                    speed: 400,
                    color: '#6ab04c'
                }));
            } else {
                game.projectiles.push(new Projectile('code_key', this.x, this.y, target, adjDamage, {
                    speed: 400,
                    color: '#6ab04c'
                }));
            }
        } 
        else if (this.type === 'mouse') {
            // Mouse fires slowing red laser pointer line
            Sound.playHit();
            const finalSlow = this.slowFactor + game.buffs.mouseSlowStrength;
            target.slowFactor = Math.max(0.2, 1.0 - finalSlow);
            target.slowTimer = this.slowDuration;
            target.takeDamage(adjDamage, 'mouse');
            
            game.particles.push({
                type: 'mouse_beam',
                sx: this.x,
                sy: this.y,
                tx: target.x,
                ty: target.y,
                life: 0.1,
                maxLife: 0.1
            });
        } 
        else if (this.type === 'laptop') {
            Sound.playLaserAoE();
            game.projectiles.push(new Projectile('compile_bomb', this.x, this.y, target, adjDamage, {
                speed: 250,
                color: '#ff7675',
                splash: this.splashRadius
            }));
        }
        else if (this.type === 'iphone') {
            // Chain bounce wifi arc
            Sound.playShoot();
            const targets = [target];
            
            // Find up to 2 other enemies close to target
            for (let i = 0; i < 2; i++) {
                const last = targets[targets.length - 1];
                const next = game.enemies.find(e => e.active && e.hp > 0 && !targets.includes(e) && Math.hypot(e.x - last.x, e.y - last.y) <= 100);
                if (next) targets.push(next);
                else break;
            }

            targets.forEach((t, idx) => {
                t.takeDamage(adjDamage, 'iphone');
                
                const sx = idx === 0 ? this.x : targets[idx - 1].x;
                const sy = idx === 0 ? this.y : targets[idx - 1].y;
                game.particles.push({
                    type: 'wifi_arc',
                    sx: sx,
                    sy: sy,
                    tx: t.x,
                    ty: t.y,
                    life: 0.15,
                    maxLife: 0.15
                });
            });
        }
        else if (this.type === 'headset') {
            // Acoustic pulse
            Sound.playLaserAoE();
            game.particles.push({
                type: 'sonic_ring',
                x: this.x,
                y: this.y,
                life: 0.25,
                maxLife: 0.25,
                radius: this.range
            });

            game.enemies.forEach(e => {
                if (e.active && e.hp > 0) {
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist <= this.range) {
                        e.takeDamage(adjDamage, 'headset');
                    }
                }
            });
        }
    }

    draw(ctx) {
        ctx.save();

        // Draw drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 12, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw range circle if selected
        if (game.selectedPlacedTower === this) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range * game.buffs.globalRange, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(this.x - 20, this.y - 20, 40, 40);
        }

        // Draw level stars
        ctx.fillStyle = '#ffcc00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        let stars = '';
        for (let i = 0; i < this.level; i++) stars += '★';
        ctx.fillText(stars, this.x, this.y - 20);

        // If frozen / disabled by Shaman's spell
        if (this.buggedTimer > 0) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.45)'; // Ice blue
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - 14, this.y + 12);
            ctx.lineTo(this.x - 16, this.y - 12);
            ctx.lineTo(this.x, this.y - 18);
            ctx.lineTo(this.x + 16, this.y - 12);
            ctx.lineTo(this.x + 14, this.y + 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.font = '10px Arial';
            ctx.fillText('❄️', this.x, this.y + 3);
            ctx.restore();
            return;
        }

        // Bobbing breathing animation
        const bob = Math.sin(Date.now() / 200 + this.x) * 1.0;

        if (false && spritesLoaded) {
            const cols = 8;
            const rows = 12;
            const cellW = jrpgSprites.width / cols;
            const cellH = jrpgSprites.height / rows;

            let rowIdx = 0; // Archer row
            if (this.type === 'mouse') rowIdx = 1;     // Ice Mage row
            else if (this.type === 'laptop') rowIdx = 2; // Catapult row
            else if (this.type === 'iphone') rowIdx = 3; // Druid row
            else if (this.type === 'headset') rowIdx = 4;// Bard row
            else if (this.type === 'coffee') rowIdx = 5; // Fairy row
            else if (this.type === 'snack') rowIdx = 6;  // Fence row

            const frame = Math.floor(Date.now() / 200) % 4; // 4 idle frames
            ctx.drawImage(
                jrpgSprites, 
                frame * cellW, rowIdx * cellH, cellW, cellH, 
                this.x - 16, this.y - 18 + bob, 32, 32
            );
        } else {
            if (this.type === 'keyboard') {
                // Mechanical Keyboard: rounded dark grey chassis with glowing keycaps
                ctx.save();
                ctx.fillStyle = '#2f3542'; // keyboard body
                ctx.strokeStyle = '#57606f';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.roundRect(this.x - 16, this.y - 8 + bob, 32, 18, 2.5);
                ctx.fill();
                ctx.stroke();

                // Draw miniature keycaps (grid of dots or small blocks)
                const keyColors = ['#00f0ff', '#ff7675', '#ffffff', '#2ecc71', '#ffa502'];
                ctx.lineWidth = 0.8;
                for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                    for (let colIdx = 0; colIdx < 5; colIdx++) {
                        const kx = this.x - 12 + colIdx * 5.5;
                        const ky = this.y - 5 + rowIdx * 4.5 + bob;
                        
                        // Select color based on layout
                        ctx.fillStyle = keyColors[(rowIdx + colIdx) % keyColors.length];
                        ctx.fillRect(kx, ky, 3.5, 3);
                    }
                }
                
                // USB cord winding out
                ctx.strokeStyle = '#747d8c';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 8 + bob);
                ctx.quadraticCurveTo(this.x + 4, this.y - 13 + bob, this.x - 2, this.y - 17 + bob);
                ctx.stroke();
                ctx.restore();
            } 
            else if (this.type === 'mouse') {
                // Computer Mouse: ergonomic gaming mouse with laser underglow & scroll wheel
                ctx.save();
                // Faint red laser underglow shadow
                ctx.fillStyle = 'rgba(255, 118, 117, 0.22)';
                ctx.beginPath();
                ctx.ellipse(this.x, this.y + 4 + bob, 11, 14, 0, 0, Math.PI * 2);
                ctx.fill();

                // Mouse shell
                ctx.fillStyle = '#1e272e'; // dark chassis
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.ellipse(this.x, this.y - 1 + bob, 8, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Split click lines
                ctx.strokeStyle = '#57606f';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 13 + bob);
                ctx.lineTo(this.x, this.y - 3 + bob);
                ctx.moveTo(this.x - 8, this.y - 3 + bob);
                ctx.lineTo(this.x + 8, this.y - 3 + bob);
                ctx.stroke();

                // Scroll wheel (glowing red scroll line)
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(this.x - 1, this.y - 10 + bob, 2, 4);

                // USB cable
                ctx.strokeStyle = '#747d8c';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 13 + bob);
                ctx.quadraticCurveTo(this.x - 3, this.y - 18 + bob, this.x + 2, this.y - 21 + bob);
                ctx.stroke();
                ctx.restore();
            } 
            else if (this.type === 'laptop') {
                // IDE Server: a stack of rackmount server boxes with glowing LEDs and micro-screen
                ctx.save();
                // Chassis block
                ctx.fillStyle = '#3f4b5b'; // steel grey case
                ctx.strokeStyle = '#1c242f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(this.x - 15, this.y - 12 + bob, 30, 24, 2);
                ctx.fill();
                ctx.stroke();

                // Separator line (double servers)
                ctx.strokeStyle = '#1c242f';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(this.x - 15, this.y + bob);
                ctx.lineTo(this.x + 15, this.y + bob);
                ctx.stroke();

                // Flashing status lights (LEDs)
                const blink = Math.floor(Date.now() / 300) % 2 === 0;
                ctx.fillStyle = blink ? '#2ecc71' : '#27ae60'; // green LED
                ctx.fillRect(this.x - 11, this.y - 8 + bob, 2.5, 2.5);
                ctx.fillStyle = !blink ? '#e74c3c' : '#c0392b'; // red LED
                ctx.fillRect(this.x - 11, this.y + 4 + bob, 2.5, 2.5);

                // Hard drive slot slots
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(this.x - 6, this.y - 8 + bob, 4, 3);
                ctx.fillRect(this.x - 6, this.y + 4 + bob, 4, 3);

                // Mini glowing console screen showing code lines
                ctx.fillStyle = '#1e272e'; // screen frame
                ctx.fillRect(this.x + 1, this.y - 8 + bob, 11, 18);
                ctx.strokeStyle = '#57606f';
                ctx.strokeRect(this.x + 1, this.y - 8 + bob, 11, 18);

                // Matrix green code mock lines
                ctx.fillStyle = '#00ecc6';
                ctx.fillRect(this.x + 3, this.y - 5 + bob, 7, 1);
                ctx.fillRect(this.x + 3, this.y - 2 + bob, 5, 1);
                ctx.fillRect(this.x + 3, this.y + 1 + bob, 8, 1);
                ctx.fillRect(this.x + 3, this.y + 4 + bob, 6, 1);

                ctx.restore();
            }
            else if (this.type === 'iphone') {
                // Jenkins CI status rack with flashing stages
                ctx.save();
                ctx.fillStyle = '#4a5768'; // dark blue steel
                ctx.strokeStyle = '#1e272e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(this.x - 12, this.y - 15 + bob, 24, 30, 2);
                ctx.fill();
                ctx.stroke();

                // Top label text 'CI'
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('JENKINS', this.x, this.y - 8 + bob);

                // Blinking build stage circles (Red, Orange, Green)
                const pulse = Math.abs(Math.sin(Date.now() / 250)) * 0.4 + 0.6;
                
                // Top circle: Blue/Green (success)
                ctx.fillStyle = `rgba(46, 204, 113, ${pulse})`;
                ctx.beginPath();
                ctx.arc(this.x - 6, this.y + 2 + bob, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#2f3542';
                ctx.stroke();

                // Middle circle: Orange (building)
                const orangePulse = Math.floor(Date.now() / 200) % 2 === 0 ? 1.0 : 0.4;
                ctx.fillStyle = `rgba(241, 196, 15, ${orangePulse})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y + 2 + bob, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Bottom circle: Red (failed build)
                ctx.fillStyle = '#ff7675';
                ctx.beginPath();
                ctx.arc(this.x + 6, this.y + 2 + bob, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Pipeline link lines
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x - 12, this.y + 9 + bob);
                ctx.lineTo(this.x + 12, this.y + 9 + bob);
                ctx.stroke();

                // build progress bar
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(this.x - 8, this.y + 11 + bob, 16, 2);
                ctx.fillStyle = '#2ecc71'; // progress percent
                ctx.fillRect(this.x - 8, this.y + 11 + bob, 6 + Math.abs(Math.sin(Date.now() / 600)) * 10, 2);

                ctx.restore();
            }
            else if (this.type === 'headset') {
                // AI Assistant: futuristic holographic AI sound wave terminal
                ctx.save();
                // Base structure
                ctx.fillStyle = '#7f8c8d'; // Silver metal pedestal
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(this.x - 10, this.y + 4 + bob, 20, 8, 1);
                ctx.fill();
                ctx.stroke();

                // Floating hologram orb aura
                const pulse = Math.abs(Math.sin(Date.now() / 300)) * 8 + 10;
                const auraGrad = ctx.createRadialGradient(this.x, this.y - 6 + bob, 1, this.x, this.y - 6 + bob, pulse);
                auraGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
                auraGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
                auraGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = auraGrad;
                ctx.beginPath();
                ctx.arc(this.x, this.y - 6 + bob, pulse, 0, Math.PI * 2);
                ctx.fill();

                // Center holographic orb core
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#00ecc6';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(this.x, this.y - 6 + bob, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Sinusoidal AI voice indicator line
                ctx.strokeStyle = '#00ecc6';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x - 8, this.y - 6 + bob);
                for (let i = -8; i <= 8; i += 2) {
                    const waveY = Math.sin(Date.now() / 80 + i) * 3;
                    ctx.lineTo(this.x + i, this.y - 6 + waveY + bob);
                }
                ctx.stroke();

                ctx.restore();
            }
            else if (this.type === 'coffee') {
                // Postgres DB: cylinder disk platters database unit with cyan LED channels
                ctx.save();
                const dbW = 20;
                const dbH = 6;
                
                // Draw 3 stacked database cylinders
                ctx.strokeStyle = '#1b3a4b';
                ctx.lineWidth = 1.5;

                for (let i = 0; i < 3; i++) {
                    const cyy = this.y - 10 + i * 8 + bob;
                    
                    // Cylinder shadow/underglow
                    ctx.fillStyle = '#0a9396'; // PostgreSQL blue
                    ctx.beginPath();
                    ctx.roundRect(this.x - dbW / 2, cyy, dbW, dbH, 2);
                    ctx.fill();
                    ctx.stroke();

                    // Cylinder metallic highlight plate
                    ctx.fillStyle = '#94d2bd';
                    ctx.fillRect(this.x - dbW / 2 + 3, cyy + 1, dbW - 6, 1.5);
                    
                    // Small glowing query LEDs (flashing green/cyan)
                    const pulse = Math.floor(Date.now() / 200 + i) % 3 === 0;
                    ctx.fillStyle = pulse ? '#00f0ff' : '#005f73';
                    ctx.fillRect(this.x + 3, cyy + 3, 2, 2);
                }

                // Styled blue database query connector cables on side
                ctx.strokeStyle = '#94d2bd';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x - dbW / 2 - 2, this.y - 10 + bob);
                ctx.lineTo(this.x - dbW / 2 - 2, this.y + 8 + bob);
                ctx.stroke();

                ctx.restore();
            }
            else if (this.type === 'snack') {
                // Snack roadblock trap: Crumpled bag of chips and empty coke cans barricade
                ctx.save();
                
                // Red Soda Can
                ctx.fillStyle = '#ff7675'; // Can red
                ctx.strokeStyle = '#2f3542';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(this.x - 12, this.y + 2, 8, 12, 1);
                ctx.fill();
                ctx.stroke();
                // Soda top tab
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x - 10, this.y, 4, 2);

                // Crumpled Potato Chips Bag (Yellow/Orange)
                ctx.fillStyle = '#ffeaa7'; // chip bag yellow
                ctx.strokeStyle = '#d89b00';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(this.x + 2, this.y - 10);
                ctx.lineTo(this.x + 14, this.y - 7);
                ctx.lineTo(this.x + 16, this.y + 10);
                ctx.lineTo(this.x, this.y + 12);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Bag flavor text
                ctx.fillStyle = '#e67e22';
                ctx.font = '5px Arial';
                ctx.fillText('CHIPS', this.x + 3, this.y + 3);

                ctx.restore();
            }
        }

        ctx.restore();
    }
}

class Projectile {
    constructor(type, x, y, target, damage, config) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = config.speed;
        this.color = config.color;
        this.splash = config.splash || 0;
        this.active = true;

        if (this.type === 'code_key') {
            const keys = ['C', 'V', 'Ctrl', 'Alt', 'Shift', 'F5', 'JS', 'CSS', 'HTML', ';', '{}', '<>', '++'];
            this.text = keys[Math.floor(Math.random() * keys.length)];
        }
    }

    update(dt) {
        if (!this.active) return;

        if (!this.target.active || this.target.hp <= 0) {
            const newTarget = game.findNearestEnemy(this.x, this.y);
            if (newTarget) {
                this.target = newTarget;
            } else {
                this.active = false;
                return;
            }
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        const moveStep = this.speed * dt;
        if (dist <= moveStep) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.hit();
        } else {
            this.x += (dx / dist) * moveStep;
            this.y += (dy / dist) * moveStep;
        }
    }

    hit() {
        this.active = false;
        
        if (this.type === 'bug_report') {
            if (this.target instanceof Tower) {
                const bugDuration = 3000 * game.buffs.bugDurationMultiplier;
                this.target.buggedTimer = bugDuration;
                game.createParticles(this.target.x, this.target.y, '#ff7675', 12);
                Sound.playHit();
                game.log(`[BUG REPORT ALERT] ${this.target.name} 장비가 버그로 인해 마비되었습니다!`, 'danger');
            }
        }
        else if (this.splash > 0) {
            // Splash compiled binary bomb explosion
            game.createParticles(this.x, this.y, this.color, 16);
            
            game.enemies.forEach(e => {
                if (e.active && e.hp > 0) {
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist <= this.splash) {
                        e.takeDamage(this.damage, 'laptop');
                    }
                }
            });
        }
        else {
            // Normal projectile damage (e.g. code_key arrows)
            if (this.target && this.target.active && this.target.hp > 0) {
                this.target.takeDamage(this.damage, this.type);
            }
        }
    }

    draw(ctx) {
        ctx.save();

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const angle = Math.atan2(dy, dx);

        if (this.type === 'bug_report') {
            // QA Re-open's bug report coffee cup (throws a coffee cup at dev)
            ctx.translate(this.x, this.y);
            ctx.rotate(angle + Math.PI/2); // point upright-ish

            // Draw a cute paper coffee cup
            ctx.fillStyle = '#f5f6fa'; // white paper cup body
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-5, -6);
            ctx.lineTo(5, -6);
            ctx.lineTo(3.5, 8);
            ctx.lineTo(-3.5, 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cardboard sleeve
            ctx.fillStyle = '#cd84f1'; // purple/brown QA sleeve
            ctx.fillRect(-4.5, -2, 9, 5);

            // Lid
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(-6, -8, 12, 2.5, 0.5);
            ctx.fill();
            ctx.stroke();

            // Steam particles rising from the lid
            const steamOffset = (Math.floor(Date.now() / 250) % 2) * 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -9 - steamOffset);
            ctx.quadraticCurveTo(-1.5, -11 - steamOffset, 0, -13 - steamOffset);
            ctx.stroke();
        }
        else if (this.type === 'code_key') {
            // Typewriter keycap containing the key characters (Ctrl, C, ;, etc.)
            ctx.translate(this.x, this.y);
            // We don't rotate keycaps to keep the letters upright and legible!
            
            // Keycap outer body (retro keyboard keycap)
            ctx.fillStyle = '#2f3542'; // dark carbon keycap base
            ctx.strokeStyle = '#1c1f26';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-12, -10, 24, 18, 2);
            ctx.fill();
            ctx.stroke();

            // Keycap face insert
            ctx.fillStyle = '#57606f'; // lighter face
            ctx.beginPath();
            ctx.roundRect(-10, -9, 20, 14, 1.5);
            ctx.fill();

            // Key text (C, V, Ctrl, ;, etc.)
            ctx.fillStyle = '#00ecc6'; // neon code cyan text
            ctx.font = 'bold 8px "Press Start 2P", Courier, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw slightly smaller font for long keys like 'Ctrl', 'Shift'
            const keyText = this.text || ';';
            if (keyText.length > 2) {
                ctx.font = 'bold 6px Arial, Helvetica, sans-serif';
            }
            ctx.fillText(keyText, 0, -1);
        } 
        else if (this.type === 'compile_bomb') {
            // Compilation Crash Bubble: Spinning red warning orb with 'ERR' or '!'
            const spinAngle = (game.time / 100) % (Math.PI * 2);
            ctx.translate(this.x, this.y);
            ctx.rotate(spinAngle);
            
            // Outer warning ring
            ctx.strokeStyle = '#ff7675';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.stroke();

            // Glowing red inner bubble
            ctx.fillStyle = 'rgba(235, 59, 90, 0.85)';
            ctx.strokeStyle = '#ff7675';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw a yellow exclamation mark (!) in the center
            ctx.save();
            ctx.rotate(-spinAngle); // counteract spin so ! stays upright
            ctx.fillStyle = '#ffd32a'; // yellow exclamation
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', 0, 0);
            ctx.restore();
            
            // Flashing data sparks
            ctx.fillStyle = '#ffeaa7';
            ctx.fillRect(Math.sin(spinAngle) * 12 - 1, Math.cos(spinAngle) * 12 - 1, 2, 2);
            ctx.fillRect(-Math.sin(spinAngle) * 12 - 1, -Math.cos(spinAngle) * 12 - 1, 2, 2);
        }

        ctx.restore();
    }
}

// Core Game Controller
const game = {
    budget: 150, // Starting gold balanced for portrait shops
    loc: 0,
    hp: 100,
    maxHp: 100,
    currentWave: 0,
    maxWaves: 5,
    wbsStages: [
        "후드 고양이들의 습격 (Wave 1)",
        "방패 고양이들의 돌격 (Wave 2)",
        "ASAP 고양이들의 야간 기습 (Wave 3)",
        "샤먼 고양이들의 커피 식히기 (Wave 4)",
        "드래곤 고양이의 마지막 떼쓰기 (Wave 5)"
    ],
    
    buffs: {
        keyboardSpeed: 1.0,
        keyboardDoubleShot: false,
        laptopDamage: 1.0,
        laptopShrapnel: false,
        mouseSlowStrength: 0,
        costDiscount: 0,
        globalRange: 1.0,
        bugDurationMultiplier: 1.0,
        bossDamageMultiplier: 1.0,
        locMultiplier: 1.0
    },

    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    floatingTexts: [],
    activeStacks: [],
    obstacles: [],

    hoverCell: {x: -1, y: -1},
    selectedShopTower: null,
    selectedPlacedTower: null,

    isRunning: false,
    gameOverState: false,
    gameClearState: false,
    gameSpeed: 1,
    lastTime: 0,
    time: 0,
    screenShake: 0,

    waveActive: false,
    waveSpawnList: [],
    spawnInterval: 0,
    lastSpawnTime: 0,
    
    canvas: null,
    ctx: null,
    dialogInterval: null,
    clockInterval: null,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.setupEventHandlers();
        this.resetGame();
        
        this.isRunning = true;
        requestAnimationFrame((t) => this.gameLoop(t));
        
        // Draw the horizontal JRPG shop icons
        this.drawShopIcons();

        // Set up the working analog clock
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);

        this.showDialog("하이하이! 초롱이의 코지 캣 오피스 디펜스에 온 걸 환영한데이! 커피 수혈을 방해하는 귀여운 고양이 빌런들을 아군 냥이 영웅들과 함께 조져뿌자! [▶ START WAVE] 눌러주레이!", "excited");
    },

    drawShopIcons() {
        const rowsMapping = {
            keyboard: 0,
            mouse: 1,
            laptop: 2,
            iphone: 3,
            headset: 4,
            coffee: 5,
            snack: 6
        };

        const icons = {
            keyboard: (ctx) => {
                // Mechanical Keyboard icon
                ctx.fillStyle = '#2f3542';
                ctx.strokeStyle = '#747d8c';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(4, 10, 28, 16, 2);
                ctx.fill();
                ctx.stroke();

                // Draw tiny keys
                ctx.fillStyle = '#00ecc6';
                ctx.fillRect(8, 14, 3, 3);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(13, 14, 3, 3);
                ctx.fillRect(18, 14, 3, 3);
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(23, 14, 5, 3);
            },
            mouse: (ctx) => {
                // Mouse icon
                ctx.fillStyle = '#1e272e';
                ctx.strokeStyle = '#57606f';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(18, 18, 8, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Scroll wheel
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(17, 10, 2, 4);
            },
            laptop: (ctx) => {
                // IDE Server icon
                ctx.fillStyle = '#3f4b5b';
                ctx.strokeStyle = '#1c242f';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(6, 8, 24, 20, 1.5);
                ctx.fill();
                ctx.stroke();

                // LEDs
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(10, 12, 2, 2);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(10, 20, 2, 2);

                // Code screen mock
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(15, 12, 12, 12);
                ctx.fillStyle = '#00ecc6';
                ctx.fillRect(17, 14, 8, 1);
                ctx.fillRect(17, 17, 6, 1);
                ctx.fillRect(17, 20, 8, 1);
            },
            iphone: (ctx) => {
                // Jenkins CI status rack icon
                ctx.fillStyle = '#4a5768';
                ctx.strokeStyle = '#1e272e';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(8, 6, 20, 24, 2);
                ctx.fill();
                ctx.stroke();

                // Blinking stages
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(14, 14, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(14, 21, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff7675';
                ctx.beginPath();
                ctx.arc(22, 18, 2.5, 0, Math.PI * 2);
                ctx.fill();
            },
            headset: (ctx) => {
                // AI Assistant hologram pedestal icon
                ctx.fillStyle = '#7f8c8d';
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(8, 22, 20, 8, 1);
                ctx.fill();
                ctx.stroke();

                // Hologram core
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#00ecc6';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(18, 12, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Wave
                ctx.strokeStyle = '#00ecc6';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(11, 12);
                ctx.quadraticCurveTo(14, 9, 18, 12);
                ctx.quadraticCurveTo(21, 15, 25, 12);
                ctx.stroke();
            },
            coffee: (ctx) => {
                // Postgres DB cylinders icon
                ctx.strokeStyle = '#1b3a4b';
                ctx.lineWidth = 1.2;
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = '#0a9396';
                    ctx.beginPath();
                    ctx.roundRect(10, 8 + i * 7, 16, 5, 1.5);
                    ctx.fill();
                    ctx.stroke();
                }
            },
            snack: (ctx) => {
                // Snack block icon
                ctx.fillStyle = '#ff7675'; // Can red
                ctx.fillRect(8, 16, 8, 12);
                
                ctx.fillStyle = '#ffeaa7'; // Chip bag yellow
                ctx.beginPath();
                ctx.moveTo(16, 8);
                ctx.lineTo(26, 10);
                ctx.lineTo(28, 24);
                ctx.lineTo(18, 26);
                ctx.closePath();
                ctx.fill();
            }
        };

        Object.keys(icons).forEach(id => {
            const canvas = document.getElementById(`icon-${id}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 36, 36);
                
                if (false && spritesLoaded) {
                    const cols = 8;
                    const rows = 12;
                    const cellW = jrpgSprites.width / cols;
                    const cellH = jrpgSprites.height / rows;
                    const rowIdx = rowsMapping[id];
                    ctx.drawImage(jrpgSprites, 0, rowIdx * cellH, cellW, cellH, 2, 2, 32, 32);
                } else {
                    icons[id](ctx);
                }
            }
        });
    },

    updateClock() {
        const canvas = document.getElementById('clock-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 22, 22);

        // draw clock face
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(11, 11, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(11, 11, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const now = new Date();
        const hr = now.getHours();
        const min = now.getMinutes();

        // hour hand
        const hrAngle = ((hr % 12) * 30 + min * 0.5) * Math.PI / 180;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(11, 11);
        ctx.lineTo(11 + Math.sin(hrAngle) * 5, 11 - Math.cos(hrAngle) * 5);
        ctx.stroke();

        // minute hand
        const minAngle = (min * 6) * Math.PI / 180;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(11, 11);
        ctx.lineTo(11 + Math.sin(minAngle) * 7, 11 - Math.cos(minAngle) * 7);
        ctx.stroke();
    },

    showDialog(text, emotion = 'normal') {
        const dialogBox = document.getElementById('jrpg-dialog-box');
        const dialogText = document.getElementById('dialog-text');
        if (!dialogBox || !dialogText) return;
        
        dialogBox.classList.remove('hidden');
        dialogText.innerText = '';

        const camImg = document.querySelector('.cam-img');
        if (camImg) {
            camImg.src = `chorong_${emotion}.png`;
        }
        
        if (this.dialogInterval) clearInterval(this.dialogInterval);
        
        let index = 0;
        this.dialogInterval = setInterval(() => {
            if (index < text.length) {
                dialogText.innerText += text[index];
                index++;
            } else {
                clearInterval(this.dialogInterval);
            }
        }, 25);
    },

    resetGame() {
        this.budget = 150;
        this.loc = 0;
        this.hp = 100;
        this.caffeineLevel = 0;
        this.currentWave = 0;
        this.time = 0;
        this.screenShake = 0;
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.activeStacks = [];
        this.obstacles = [];

        this.selectedShopTower = null;
        this.selectedPlacedTower = null;
        this.waveActive = false;
        this.waveSpawnList = [];
        this.gameOverState = false;
        this.gameClearState = false;

        this.buffs = {
            keyboardSpeed: 1.0,
            keyboardDoubleShot: false,
            laptopDamage: 1.0,
            laptopShrapnel: false,
            mouseSlowStrength: 0,
            costDiscount: 0,
            globalRange: 1.0,
            bugDurationMultiplier: 1.0,
            bossDamageMultiplier: 1.0,
            locMultiplier: 1.0
        };

        this.initObstacles();

        this.updateHUD();
        
        document.getElementById('tech-modal').classList.add('hidden');
        document.getElementById('gameover-modal').classList.add('hidden');
        document.getElementById('gameclear-modal').classList.add('hidden');
        
        document.querySelectorAll('.shop-item').forEach(el => el.classList.remove('active'));

        if (this.dialogInterval) clearInterval(this.dialogInterval);
        document.getElementById('jrpg-dialog-box').classList.add('hidden');
        
        this.showDialog("새 프로젝트 스프린트 시작합니데이! 가보자꼬! [▶ START SPRINT] 눌러주레이!", "normal");
    },

    initObstacles() {
        this.obstacles = [];
        const obstacleTypes = ['🌿', '🖨️', '💧', '🗄️'];
        const count = 10;
        
        let attempts = 0;
        while (this.obstacles.length < count && attempts < 200) {
            attempts++;
            const gx = Math.floor(Math.random() * GRID_COLS);
            const gy = Math.floor(Math.random() * GRID_ROWS);
            
            // Check wall rows
            if (gy === 4 || gy === 8 || gy === 12) continue;
            
            // Check path conflict
            if (isPathCell(gx, gy)) continue;
            
            // Check start/end desks
            if (gx === 1 && gy === 2) continue;
            if (gx === 9 && gy === 14) continue;
            
            // Check duplicate
            if (this.obstacles.some(ob => ob.x === gx && ob.y === gy)) continue;
            
            this.obstacles.push({
                x: gx,
                y: gy,
                char: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
            });
        }
    },

    setupEventHandlers() {
        document.querySelectorAll('.shop-item').forEach(el => {
            el.addEventListener('click', () => {
                const towerType = el.getAttribute('data-tower');
                if (towerType) {
                    this.selectShopTower(towerType, el);
                }
            });
        });

        document.getElementById('btn-upgrade-tower').addEventListener('click', () => {
            if (this.selectedPlacedTower) {
                this.selectedPlacedTower.upgrade();
            }
        });

        document.getElementById('btn-sell-tower').addEventListener('click', () => {
            if (this.selectedPlacedTower) {
                this.sellTower(this.selectedPlacedTower);
            }
        });

        document.getElementById('btn-next-wave').addEventListener('click', () => {
            this.startNextWave();
        });

        document.getElementById('btn-coffee').addEventListener('click', () => {
            this.drinkCoffee();
        });

        document.getElementById('btn-audio-toggle').addEventListener('click', (e) => {
            const enabled = Sound.toggle();
            e.target.innerText = enabled ? '🔊' : '🔇';
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            if (confirm('게임을 재시작하시겠습니까?')) {
                this.resetGame();
            }
        });
        document.getElementById('btn-retry').addEventListener('click', () => this.resetGame());
        document.getElementById('btn-clear-restart').addEventListener('click', () => this.resetGame());

        document.getElementById('btn-start').addEventListener('click', () => {
            try {
                Sound.init();
            } catch (err) {
                console.warn("Sound initialization deferred: ", err);
            }
            document.getElementById('start-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            try {
                Sound.playBuild();
            } catch (err) {}
        });

        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverCell = {x: -1, y: -1};
        });
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    },

    selectShopTower(type, element) {
        const dummy = new Tower(type, 0, 0);
        const discount = 1 - this.buffs.costDiscount;
        const actualCost = Math.round(dummy.baseCost * discount);

        if (this.budget < actualCost) {
            Sound.playError();
            this.log('[WARNING] 예산이 부족합니다!', 'warning');
            return;
        }

        document.querySelectorAll('.shop-item').forEach(el => el.classList.remove('active'));
        
        if (this.selectedShopTower === type) {
            this.selectedShopTower = null;
        } else {
            this.selectedShopTower = type;
            element.classList.add('active');
            this.selectedPlacedTower = null;
            document.getElementById('tower-info-panel').classList.add('hidden');
        }
    },

    selectPlacedTower(tower) {
        this.selectedPlacedTower = tower;
        this.selectedShopTower = null;
        document.querySelectorAll('.shop-item').forEach(el => el.classList.remove('active'));

        const panel = document.getElementById('tower-info-panel');
        panel.classList.remove('hidden');

        document.getElementById('selected-tower-name').innerText = `${tower.name} (Level ${tower.level})`;
        
        if (tower.type === 'snack') {
            document.getElementById('stat-damage').innerText = '스턴 4초';
            document.getElementById('stat-speed').innerText = '-';
            document.getElementById('stat-range').innerText = '통로 지뢰';
        } else if (tower.type === 'coffee') {
            document.getElementById('stat-damage').innerText = '공속 버프';
            document.getElementById('stat-speed').innerText = '주변 +25%';
            document.getElementById('stat-range').innerText = `${Math.round(tower.range * this.buffs.globalRange)}px`;
        } else {
            document.getElementById('stat-damage').innerText = Math.round(tower.damage);
            const adjSpeed = tower.fireRate * (tower.coffeeBuffTimer > 0 ? 0.75 : 1.0);
            document.getElementById('stat-speed').innerText = `${(adjSpeed / 1000).toFixed(2)}초`;
            document.getElementById('stat-range').innerText = `${Math.round(tower.range * this.buffs.globalRange)}px`;
        }

        const upgradeCost = tower.getUpgradeCost();
        document.getElementById('btn-upgrade-tower').innerText = `UPGRADE (${upgradeCost}G)`;
        document.getElementById('btn-sell-tower').innerText = `SELL (${tower.getSellValue()}G)`;
    },

    sellTower(tower) {
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            const refund = tower.getSellValue();
            this.towers.splice(index, 1);
            this.earnBudget(refund);
            
            this.selectedPlacedTower = null;
            document.getElementById('tower-info-panel').classList.add('hidden');
            
            Sound.playSell();
            this.createFloatingText(`+${refund}G`, tower.x, tower.y - 15, '#ffcc00');
        }
    },

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        this.hoverCell = {
            x: Math.floor(mx / CELL_SIZE),
            y: Math.floor(my / CELL_SIZE)
        };
    },

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        const gx = Math.floor(mx / CELL_SIZE);
        const gy = Math.floor(my / CELL_SIZE);

        if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

        const clickedTower = this.towers.find(t => t.gx === gx && t.gy === gy);
        if (clickedTower) {
            this.selectPlacedTower(clickedTower);
            Sound.playBuild();
            return;
        }

        if (this.selectedShopTower) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                if (this.hoverCell.x === gx && this.hoverCell.y === gy) {
                    this.tryBuildTower(this.selectedShopTower, gx, gy);
                    this.hoverCell = {x: -1, y: -1};
                } else {
                    this.hoverCell = {x: gx, y: gy};
                    Sound.playCoin();
                }
            } else {
                this.tryBuildTower(this.selectedShopTower, gx, gy);
            }
        } else {
            this.selectedPlacedTower = null;
            document.getElementById('tower-info-panel').classList.add('hidden');
        }
    },

    tryBuildTower(type, gx, gy) {
        const isStart = gx === 1 && gy === 2;
        const isEnd = gx === 9 && gy === 14;
        const isWallRow = gy === 4 || gy === 8 || gy === 12;
        const hasObstacle = this.obstacles.some(ob => ob.x === gx && ob.y === gy);

        if (isStart || isEnd || hasObstacle) {
            Sound.playError();
            this.log('[WARNING] 해당 칸에는 설치할 수 없습니다.', 'warning');
            return;
        }

        const onPath = isPathCell(gx, gy);

        if (type === 'snack') {
            // roadblock trap ONLY on path
            if (!onPath) {
                Sound.playError();
                this.log('[WARNING] 과자 팩은 통로 위에만 설치할 수 있데이!', 'warning');
                return;
            }
        } else {
            // regular towers NOT on path, and NOT on transition wall rows
            if (onPath || isWallRow) {
                Sound.playError();
                this.log('[WARNING] 통로(계단) 및 빈 벽면에는 장비를 설치할 수 없습니데이!', 'warning');
                return;
            }
        }

        const conflict = this.towers.some(t => t.gx === gx && t.gy === gy);
        if (conflict) {
            Sound.playError();
            return;
        }

        const dummy = new Tower(type, gx, gy);
        const discount = 1 - this.buffs.costDiscount;
        const cost = Math.round(dummy.baseCost * discount);

        if (this.budget >= cost) {
            this.budget -= cost;
            const newTower = new Tower(type, gx, gy);
            this.towers.push(newTower);
            
            this.selectedShopTower = null;
            document.querySelectorAll('.shop-item').forEach(el => el.classList.remove('active'));
            
            this.updateHUD();
            Sound.playBuild();
            this.createFloatingText('BUILT!', newTower.x, newTower.y - 15, '#00ff66');
            this.log(`[INFO] ${newTower.name} 설치 완료. -${cost}G`);
        } else {
            Sound.playError();
            this.log('[WARNING] 예산이 부족합니다!', 'warning');
        }
    },

    damageBase(amount) {
        this.hp -= amount;
        this.screenShake = Math.min(20, this.screenShake + amount * 0.8);
        this.updateHUD();
        this.createParticles(CANVAS_WIDTH - 20, pixelPath[pixelPath.length - 1].y, '#ff7675', 15);
        this.createFloatingText(`STRESS +${amount}!`, CANVAS_WIDTH - 50, pixelPath[pixelPath.length - 1].y - 20, '#ff7675');
        
        Sound.playError();

        if (this.hp <= 0) {
            this.triggerGameOver();
        } else if (this.hp < 35) {
            this.showDialog("아아악! 멘탈 터지기 직전이데이!! 커피 수혈!!! 퍼뜩 멘탈 HP 쪼매 채워야긋다!!!", "tired");
        } else if (this.hp < 60) {
            this.showDialog("아... 억장 와르르 맨션이데이... 몬스터 쟈들이 와 저래 떼거지로 몰려오노? ㅠㅠ WBS 일정이 빌 빌 빌 꼬인당... 아고 두야...", "tired");
        }
    },

    earnBudget(amount) {
        this.budget += amount;
        this.updateHUD();
        Sound.playCoin();
    },

    earnLOC(amount) {
        const finalLOC = Math.round(amount * this.buffs.locMultiplier);
        this.loc += finalLOC;
        this.updateHUD();
    },

    drinkCoffee() {
        const cost = 30;
        if (this.budget >= cost) {
            this.budget -= cost;
            // Restore HP (mental/stress) up to 100
            this.hp = Math.min(100, this.hp + 20);
            
            if (this.caffeineLevel === undefined) this.caffeineLevel = 0;
            this.caffeineLevel += 1.0;
            
            this.updateHUD();
            Sound.playCoin(); // Play generic chime
            
            // Create nice coffee steam particles at Chorong's desk
            const chorongDeskX = pixelPath[pixelPath.length - 1].x;
            const chorongDeskY = pixelPath[pixelPath.length - 1].y;
            this.createParticles(chorongDeskX, chorongDeskY, '#a87c5d', 10);
            this.createFloatingText(`MENTAL +20`, chorongDeskX - 10, chorongDeskY - 30, '#9fc0a6');
            
            if (this.caffeineLevel > 3.0) {
                this.screenShake = 15;
                this.showDialog("🚨 [Slack Alert] 초롱 님이 카페인 과다 복용으로 카페인 지터(손 떨림)가 왔습니다! 8초 동안 모든 장비 효율이 30% 저하됩니다!!", "tired");
            } else {
                this.showDialog("크으으~ 역시 피에 흐르는 아메리카노가 최고인기라! 개발 멘탈 회복 완료! 힘내자꼬!", "excited");
            }
        } else {
            Sound.playError();
            this.createFloatingText("NEED BUDGET!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ff7675');
            this.showDialog("⚠️ [Jira Alert] 예산 부족! 커피 한 잔 사 마실 돈(30G)도 없다니 실화가...ㅠㅠ", "tired");
        }
    },

    startNextWave() {
        if (this.waveActive) return;

        this.currentWave++;
        if (this.currentWave > this.maxWaves) {
            this.triggerGameClear();
            return;
        }

        this.waveActive = true;
        this.enemies = [];
        this.projectiles = [];
        
        this.log(`[WBS START] ${this.currentWave}단계: ${this.wbsStages[this.currentWave - 1]} 시작!`);
        Sound.playWaveStart();

        this.waveSpawnList = this.getWaveConfig(this.currentWave);
        
        const nxtBtn = document.getElementById('btn-next-wave');
        nxtBtn.classList.add('disabled');
        nxtBtn.disabled = true;

        this.updateHUD();

        if (this.currentWave === 1) {
            this.showDialog("📢 [Jira Alert] Sprint 1 (핫픽스 롤아웃) 시작! 요구사항 변경(Warning) 티켓들이 대량으로 할당되었습니다. 키보드 타워(Keyboard)를 조속히 배치하여 대응하세요!", "normal");
        } else if (this.currentWave === 2) {
            this.showDialog("💬 [Slack Alert] 팀장: Sprint 2 돌입! 고대의 봉인된 레거시 코드(Legacy) 장애가 올라왔답니다. 단단해서 맷집이 어마어마하니 IDE 서버(IDE Server)로 대규모 처리합시다!", "normal");
        } else if (this.currentWave === 3) {
            this.showDialog("🚨 [Slack Alert] CTO: Sprint 3 보안 감사 대응 시작! (보안 조치로 적들의 체력/방어력이 +30% 증가합니다!) 긴급 장애(Critical Incident)들이 초속으로 뛰어옵니다. 마우스(Mouse)의 레이저 슬로우로 발목을 잡으세요!", "normal");
        } else if (this.currentWave === 4) {
            this.showDialog("⏱️ [Jira Alert] Sprint 4 일정 단축 긴급 명령! (일정 압박으로 적들의 이동속도가 +25% 빨라집니다!) QA 재오픈(Bug) 티켓들이 아군 서버를 마비시킵니다. PostgreSQL DB 버프와 AI 어시스턴트로 극복하세요!", "tired");
        } else if (this.currentWave === 5) {
            this.showDialog("🔥 [CRITICAL ALERT] Sprint 5 서비스 실배포! Blocker 레벨의 운영 배포 사고(Production Outage)가 서버실 전체를 강타했습니다! 모든 자원(IDE 서버, AI, 키보드)을 끌어모아 방어해야 퇴근할 수 있습니다!!!", "tired");
        }
    },

    getWaveConfig(waveNum) {
        const list = [];
        if (waveNum === 1) {
            // Wave 1: 18 hoodie cats (dense and fast)
            for (let i = 0; i < 18; i++) list.push({ type: 'spec_adder', delay: 1000 + i * 700 });
        } 
        else if (waveNum === 2) {
            // Wave 2: 12 hoodie cats + 12 shield cats
            for (let i = 0; i < 12; i++) list.push({ type: 'spec_adder', delay: 1000 + i * 600 });
            for (let i = 0; i < 12; i++) list.push({ type: 'doc_bomber', delay: 3000 + i * 900 });
        } 
        else if (waveNum === 3) {
            // Wave 3: 16 hoodie cats + 16 ASAP runners
            for (let i = 0; i < 16; i++) list.push({ type: 'spec_adder', delay: 500 + i * 500 });
            for (let i = 0; i < 16; i++) list.push({ type: 'urgent', delay: 2000 + i * 600 });
        } 
        else if (waveNum === 4) {
            // Wave 4: 12 shield cats + 15 shamans + 12 ASAP runners
            for (let i = 0; i < 12; i++) list.push({ type: 'doc_bomber', delay: 1000 + i * 800 });
            for (let i = 0; i < 15; i++) list.push({ type: 'qa_bugger', delay: 1500 + i * 1000 });
            for (let i = 0; i < 12; i++) list.push({ type: 'urgent', delay: 2000 + i * 700 });
        } 
        else if (waveNum === 5) {
            // Wave 5: 12 shield cats + 12 shamans + 12 ASAP runners + 2 boss dragon cats!
            for (let i = 0; i < 12; i++) list.push({ type: 'doc_bomber', delay: 1000 + i * 700 });
            for (let i = 0; i < 12; i++) list.push({ type: 'qa_bugger', delay: 1500 + i * 800 });
            for (let i = 0; i < 12; i++) list.push({ type: 'urgent', delay: 2000 + i * 600 });
            list.push({ type: 'ceo_boss', delay: 8000 });
            list.push({ type: 'ceo_boss', delay: 14000 });
        }
        return list;
    },

    checkWaveStatus() {
        if (!this.waveActive) return;

        const allSpawned = this.waveSpawnList.length === 0;
        const allCleared = this.enemies.filter(e => e.active).length === 0;

        if (allSpawned && allCleared) {
            this.endCurrentWave();
        }
    },

    endCurrentWave() {
        this.waveActive = false;
        
        const nxtBtn = document.getElementById('btn-next-wave');
        nxtBtn.classList.remove('disabled');
        nxtBtn.disabled = false;
        
        this.log(`[WBS MILESTONE] ${this.currentWave}단계 방어 성공! 기술 연구실 오픈.`, 'success');
        Sound.playWaveClear();

        if (this.currentWave < this.maxWaves) {
            this.showDialog("휴우~ 한 고비 넘겼데이! 기술 연구실 열렸다 아이가! 새로운 기술 스택 뭐 배울지 언능 골라보장!", "excited");
            this.openTechModal();
        } else {
            this.triggerGameClear();
        }
    },

    openTechModal() {
        const modal = document.getElementById('tech-modal');
        modal.classList.remove('hidden');

        const grid = document.getElementById('tech-cards');
        grid.innerHTML = '';

        const shuffled = [...TECH_POOL].sort(() => 0.5 - Math.random());
        const selections = shuffled.slice(0, 3);

        selections.forEach(tech => {
            const card = document.createElement('div');
            card.className = 'tech-card';
            card.innerHTML = `
                <div class="tech-card-icon">${tech.icon}</div>
                <div class="tech-card-info">
                    <div class="tech-card-name">${tech.name}</div>
                    <div class="tech-card-desc">${tech.desc}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                tech.apply();
                this.activeStacks.push(tech);
                modal.classList.add('hidden');
                Sound.playCoin();
            });
            grid.appendChild(card);
        });
    },

    triggerGameOver() {
        this.isRunning = false;
        this.gameOverState = true;
        Sound.playGameOver();
        
        document.getElementById('gameover-modal').classList.remove('hidden');
        this.showDialog("아... 프로젝트 드랍 실화가...ㅠㅠ 내 멘탈 바사삭 돼서 오늘 방종한데이. 담 복귀 방송 때 보재이...", "tired");
    },

    triggerGameClear() {
        this.isRunning = false;
        this.gameClearState = true;
        Sound.playGameWin();

        document.getElementById('gameclear-modal').classList.remove('hidden');
        this.showDialog("와아아아!! 드디어 실배포 성공했다 아이가!! 칼퇴근 보너스 가즈아아아! 시청해 줘서 억수로 고맙데이! 🎉", "excited");
    },

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        if (!this.lastTime) this.lastTime = timestamp;
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (dt > 0.1) dt = 0.1;

        const scaledDt = dt * this.gameSpeed;
        this.time += scaledDt * 1000;

        if (this.screenShake > 0) {
            this.screenShake -= dt * 30;
            if (this.screenShake < 0) this.screenShake = 0;
        }

        this.updateSpawner(scaledDt, this.time);
        this.updateObjects(scaledDt, this.time);
        this.drawWorld();
        this.checkWaveStatus();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    updateSpawner(dt, now) {
        if (!this.waveActive || this.waveSpawnList.length === 0) return;

        if (!this.spawnTimer) this.spawnTimer = 0;
        this.spawnTimer += dt * 1000;

        const nextEnemyConfig = this.waveSpawnList[0];
        if (this.spawnTimer >= nextEnemyConfig.delay) {
            const nextEnemy = new Enemy(nextEnemyConfig.type, this.currentWave);
            this.enemies.push(nextEnemy);
            this.waveSpawnList.shift();
            this.spawnTimer = 0;
        }
    },

    updateObjects(dt, now) {
        // Caffeine Level Decay & Overdose Debuff Trigger
        if (this.caffeineLevel === undefined) this.caffeineLevel = 0;
        if (this.caffeineLevel > 0) {
            this.caffeineLevel = Math.max(0, this.caffeineLevel - dt * 0.08);
        }

        if (this.caffeineLevel > 3.0) {
            // Caffeine overdose hand tremors - constant minor screen shake
            this.screenShake = Math.max(this.screenShake, 3);
            
            // Trigger Slack warning message once in a while
            if (!this.lastJitterWarningTime) this.lastJitterWarningTime = 0;
            if (now - this.lastJitterWarningTime > 8000) { // every 8 seconds
                this.showDialog("⚠️ [Slack Alert] 초롱 님이 카페인 과다 복용으로 손을 떨기 시작합니다! 모든 장비의 쿨타임(공격 주기)이 30% 증가합니다!!", "tired");
                this.lastJitterWarningTime = now;
            }
        }

        this.enemies.forEach(e => e.update(dt));
        this.towers.forEach(t => t.update(dt, now));
        
        this.projectiles.forEach(p => p.update(dt));
        this.projectiles = this.projectiles.filter(p => p.active);

        this.floatingTexts.forEach(ft => {
            ft.y -= 25 * dt;
            ft.life -= dt;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

        this.particles.forEach(p => {
            if (p.type === 'mouse_beam' || p.type === 'wifi_arc' || p.type === 'sonic_ring') {
                p.life -= dt;
            } else {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
            }
        });
        this.particles = this.particles.filter(p => p.life > 0);
    },

    drawWorld() {
        // Enforce chunky retro pixel rendering (disable browser anti-aliasing)
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.save();
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }

        // Draw lush village grass field background wall first
        this.drawBackgroundWall(this.ctx);

        // 1. Draw Grid Tiles (Floor platforms and staircase trails)
        for (let col = 0; col < GRID_COLS; col++) {
            for (let row = 0; row < GRID_ROWS; row++) {
                const px = col * CELL_SIZE;
                const py = row * CELL_SIZE;
                
                if (isPathCell(col, row)) {
                    drawCarpetPathTile(this.ctx, px, py, col, row);
                } else {
                    drawOfficeFloorTile(this.ctx, px, py, col, row);
                }
            }
        }

        // 1.5 Draw Buildable Spot Highlights if a shop tower is selected
        if (this.selectedShopTower) {
            this.ctx.save();
            const pulse = Math.abs(Math.sin(Date.now() / 400)) * 0.15 + 0.10;
            this.ctx.fillStyle = `rgba(46, 204, 113, ${pulse})`; // soft green overlay
            this.ctx.strokeStyle = 'rgba(46, 204, 113, 0.4)';
            this.ctx.lineWidth = 1.5;

            for (let col = 0; col < GRID_COLS; col++) {
                for (let row = 0; row < GRID_ROWS; row++) {
                    const isStart = col === 1 && row === 2;
                    const isEnd = col === 9 && row === 14;
                    const isWallRow = row === 4 || row === 8 || row === 12;
                    const hasObstacle = this.obstacles.some(ob => ob.x === col && ob.y === row);
                    const hasTower = this.towers.some(t => t.gx === col && t.gy === row);
                    const onPath = isPathCell(col, row);

                    let valid = false;
                    if (!isStart && !isEnd && !hasObstacle && !hasTower) {
                        if (this.selectedShopTower === 'snack') {
                            valid = onPath;
                        } else {
                            valid = !onPath && !isWallRow;
                        }
                    }

                    if (valid) {
                        const px = col * CELL_SIZE;
                        const py = row * CELL_SIZE;
                        this.ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                        this.ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    }
                }
            }
            this.ctx.restore();
        }

        // 2. Draw Start (Lobby sliding doors) & End (Chorong's Desk)
        this.drawSpecialPoints();

        // 3. Draw Obstacles
        this.obstacles.forEach(ob => {
            this.drawObstacle(this.ctx, ob.x * CELL_SIZE, ob.y * CELL_SIZE, ob.char);
        });

        // 4. Draw Towers
        this.towers.forEach(t => t.draw(this.ctx));

        // 5. Draw Enemies
        this.enemies.forEach(e => e.draw(this.ctx));

        // 6. Draw Projectiles & Particles
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.drawParticles();

        // 7. Hover cell guide (for placing towers)
        if (this.hoverCell.x >= 0 && this.hoverCell.y >= 0) {
            this.drawHoverGuide();
        }

        // 8. Floating damage/stat texts
        this.drawFloatingTexts();

        // 9. Draw cinematic lighting effects (sunbeams & vignette)
        this.drawLightingEffects();

        // 10. Draw foreground frame
        this.drawFoliageFrame();
        
        this.ctx.restore();
    },

    drawBackgroundWall(ctx) {
        // Base light wood flooring background (warm pastel wood)
        ctx.fillStyle = '#f2ddc6';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw horizontal wood floor planks
        ctx.strokeStyle = '#dfc3a7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let y = 0; y < CANVAS_HEIGHT; y += 16) {
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
        }
        ctx.stroke();

        // Draw occasional vertical plank joint slits for realistic texture
        ctx.fillStyle = '#dfc3a7';
        for (let rowIdx = 0; rowIdx < CANVAS_HEIGHT / 16; rowIdx++) {
            const y = rowIdx * 16;
            const shift = (rowIdx % 2) * 40;
            for (let x = shift; x < CANVAS_WIDTH; x += 80) {
                ctx.fillRect(x, y, 1.2, 16);
            }
        }
    },

    drawSpecialPoints() {
        const ctx = this.ctx;
        const start = pixelPath[0];
        const end = pixelPath[pixelPath.length - 1];

        // Draw Start Point: Cozy Office Elevator (where cat wave invaders arrive)
        this.ctx.save();
        const tx = start.x - 4;
        const ty = start.y;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        this.ctx.beginPath();
        this.ctx.ellipse(tx, ty + 12, 18, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Elevator metal casing
        this.ctx.fillStyle = '#95a5a6'; // stainless steel
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(tx - 16, ty - 22, 32, 34, 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Sliding glass doors (light ice blue)
        this.ctx.fillStyle = '#d1f2fb';
        this.ctx.fillRect(tx - 10, ty - 16, 20, 28);
        
        // Door center split line
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(tx, ty - 16);
        this.ctx.lineTo(tx, ty + 12);
        this.ctx.stroke();

        // Elevator indicator display panel above door
        this.ctx.fillStyle = '#2f3542';
        this.ctx.fillRect(tx - 6, ty - 20, 12, 3);
        
        // Up arrow glowing green
        const blinkSec = Math.floor(Date.now() / 400) % 2 === 0;
        this.ctx.fillStyle = blinkSec ? '#2ecc71' : '#27ae60';
        this.ctx.beginPath();
        this.ctx.moveTo(tx, ty - 20);
        this.ctx.lineTo(tx - 3, ty - 18);
        this.ctx.lineTo(tx + 3, ty - 18);
        this.ctx.closePath();
        this.ctx.fill();

        // Elevator sign label
        this.ctx.fillStyle = '#52665d';
        this.ctx.strokeStyle = '#1c2421';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(tx - 18, ty - 32, 36, 8, 1);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.font = '5px "Press Start 2P"';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ELEVATOR', tx, ty - 26);
        this.ctx.restore();

        // Draw End Point: Developer Chorong's Overtime Workstation
        this.ctx.save();
        const cx = end.x;
        const cy = end.y;
        
        // Desk mat (slate grey)
        this.ctx.fillStyle = '#2f3542';
        this.ctx.fillRect(cx - 16, cy - 14, 32, 28);
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(cx - 16, cy - 14, 32, 28);

        // Desk wood supports
        this.ctx.fillStyle = '#7e522a';
        this.ctx.fillRect(cx - 18, cy + 10, 4, 4);
        this.ctx.fillRect(cx + 14, cy + 10, 4, 4);

        const bob = Math.sin(Date.now() / 200) * 1.2;

        // Draw Ergonomic Programmer Chair (black & matrix green accent)
        this.ctx.fillStyle = '#1e272e'; // chair base
        this.ctx.strokeStyle = '#2ecc71'; // neon green stitching
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.roundRect(cx - 10, cy - 10 + bob, 20, 20, 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Dual computer screens (glowing cyan monitors on the side)
        this.ctx.fillStyle = '#00f0ff'; // cyan screen glow
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#00f0ff';
        // screen 1 (left)
        this.ctx.fillRect(cx - 15, cy - 16 + bob, 8, 5);
        // screen 2 (right)
        this.ctx.fillRect(cx + 7, cy - 16 + bob, 8, 5);
        this.ctx.shadowBlur = 0; // reset shadow

        // Screen black bezels
        this.ctx.strokeStyle = '#1e272e';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(cx - 15, cy - 16 + bob, 8, 5);
        this.ctx.strokeRect(cx + 7, cy - 16 + bob, 8, 5);

        // Draw Chorong (Programmer Girl)
        this.ctx.fillStyle = '#ffd3b6'; // face skin
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 4 + bob, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#2f3542';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Brown ponytail hair
        this.ctx.fillStyle = '#8c5225';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 5 + bob, 6, Math.PI, 0); // hair top
        this.ctx.fill();
        // ponytail on side
        ctx.fillRect(cx - 8, cy - 4 + bob, 3, 7);

        // Big round glasses
        this.ctx.strokeStyle = '#1e272e';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.arc(cx - 2.5, cy - 4 + bob, 2.5, 0, Math.PI * 2);
        this.ctx.arc(cx + 2.5, cy - 4 + bob, 2.5, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 0.5, cy - 4 + bob); this.ctx.lineTo(cx + 0.5, cy - 4 + bob);
        this.ctx.stroke();

        // Programmer headset
        this.ctx.strokeStyle = '#2ecc71'; // green headset band
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 5 + bob, 6.5, Math.PI, 0);
        this.ctx.stroke();
        // ear cups
        this.ctx.fillStyle = '#2f3542';
        this.ctx.fillRect(cx - 7.5, cy - 6 + bob, 2, 4);
        this.ctx.fillRect(cx + 5.5, cy - 6 + bob, 2, 4);

        // Smiling mouth
        this.ctx.strokeStyle = '#2f3542';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 2.5 + bob, 1.2, 0, Math.PI);
        this.ctx.stroke();

        // Developer body (grey hoodie)
        this.ctx.fillStyle = '#7f8c8d'; 
        this.ctx.strokeStyle = '#2f3542';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 5, cy + 2 + bob);
        this.ctx.lineTo(cx - 8, cy + 9 + bob);
        this.ctx.lineTo(cx + 8, cy + 9 + bob);
        this.ctx.lineTo(cx + 5, cy + 2 + bob);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Small coffee cup on desk next to her
        ctx.fillStyle = '#e74c3c'; // red cup
        ctx.fillRect(cx + 10, cy + 3, 4, 6);
        ctx.fillStyle = '#ffffff'; // lid
        ctx.fillRect(cx + 9.5, cy + 1, 5, 2);

        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillStyle = '#f4f7f5';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('개발자 초롱', cx, cy - 22);

        ctxHUDIndicator(this.ctx, 'LOC', cx, cy + 24);
        this.ctx.restore();
    },

    drawObstacle(ctx, x, y, char) {
        ctx.save();
        const cx = x + CELL_SIZE / 2;
        const cy = y + CELL_SIZE / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (char === '🌿') {
            // Large Potted Breakroom Plant
            ctx.fillStyle = '#8c6239'; // pot brown
            ctx.strokeStyle = '#5c3a21';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - 8, cy + 4, 16, 10, 1);
            ctx.fill();
            ctx.stroke();

            // Rich green leaves growing up
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
            ctx.arc(cx - 6, cy - 2, 7, 0, Math.PI * 2);
            ctx.arc(cx + 6, cy - 2, 7, 0, Math.PI * 2);
            ctx.arc(cx, cy - 12, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Leaf veins
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy - 14);
            ctx.stroke();
        } 
        else if (char === '🖨️') {
            // Cute Red Vending Machine (from image)
            ctx.fillStyle = '#ff7675'; // vibrant red body
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(cx - 12, cy - 14, 24, 28, 2);
            ctx.fill();
            ctx.stroke();

            // Display window (glass)
            ctx.fillStyle = '#d1f2fb'; // light ice blue
            ctx.fillRect(cx - 8, cy - 10, 16, 12);
            ctx.strokeRect(cx - 8, cy - 10, 16, 12);

            // Colored items inside vending machine
            ctx.fillStyle = '#ffa502'; // orange soda
            ctx.fillRect(cx - 5, cy - 8, 3, 4);
            ctx.fillStyle = '#2ecc71'; // green soda
            ctx.fillRect(cx - 1, cy - 8, 3, 4);
            ctx.fillStyle = '#00f0ff'; // water bottle
            ctx.fillRect(cx + 3, cy - 8, 3, 4);

            // Retrieval slot at bottom
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(cx - 7, cy + 6, 14, 5);
        } 
        else if (char === '💧') {
            // Blue Water Cooler Dispenser (from image)
            // Dispenser base
            ctx.fillStyle = '#ffffff'; // white stand
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - 8, cy, 16, 14, 1);
            ctx.fill();
            ctx.stroke();

            // Dispenser faucets (hot/cold)
            ctx.fillStyle = '#ff7675'; // hot faucet (red)
            ctx.fillRect(cx - 4, cy + 4, 2, 3);
            ctx.fillStyle = '#74b9ff'; // cold faucet (blue)
            ctx.fillRect(cx + 2, cy + 4, 2, 3);

            // Water bottle sitting on top
            ctx.fillStyle = '#74b9ff'; // transparent blue water
            ctx.strokeStyle = '#0984e3';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - 6, cy - 12, 12, 12, 4);
            ctx.fill();
            ctx.stroke();
            
            // Water bottle cap
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(cx - 2, cy - 14, 4, 2);
        } 
        else {
            // Breakroom Espresso Coffee Cabinet
            ctx.fillStyle = '#85583f'; // brown oak wood
            ctx.strokeStyle = '#5c3a21';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - 11, cy - 6, 22, 18, 1);
            ctx.fill();
            ctx.stroke();

            // Black Coffee Machine
            ctx.fillStyle = '#2f3542';
            ctx.fillRect(cx - 6, cy - 12, 12, 8);
            ctx.strokeRect(cx - 6, cy - 12, 12, 8);
            
            // Tiny white mug
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 2, cy - 4, 4, 4);
        }
        ctx.restore();
    },

    drawParticles() {
        this.ctx.save();
        this.particles.forEach(p => {
            if (p.type === 'mouse_beam') {
                this.ctx.strokeStyle = '#ff3344'; // Red laser matching image!
                this.ctx.lineWidth = 2.5;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#ff3344';
                
                this.ctx.beginPath();
                this.ctx.moveTo(p.sx, p.sy);
                this.ctx.lineTo(p.tx, p.ty);
                this.ctx.stroke();

                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(p.tx, p.ty, 4.5, 0, Math.PI * 2);
                this.ctx.fill();
            } 
            else if (p.type === 'wifi_arc') {
                // CI/CD electric chain bounce lightning bubbles
                this.ctx.strokeStyle = '#00f0ff';
                this.ctx.lineWidth = 2;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#00f0ff';
                
                // Draw start node bubble
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();

                // Draw end node bubble
                this.ctx.beginPath();
                this.ctx.arc(p.tx, p.ty, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();

                // Zig-zag electricity line
                this.ctx.beginPath();
                const midX = (p.sx + p.tx) / 2 + (Math.random() - 0.5) * 16;
                const midY = (p.sy + p.ty) / 2 + (Math.random() - 0.5) * 16;
                this.ctx.moveTo(p.sx, p.sy);
                this.ctx.lineTo(midX, midY);
                this.ctx.lineTo(p.tx, p.ty);
                this.ctx.stroke();
                
                this.ctx.shadowBlur = 0; // reset glow
            }
            else if (p.type === 'sonic_ring') {
                // expanding headset wave ring
                this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                const ratio = 1 - (p.life / p.maxLife);
                this.ctx.arc(p.x, p.y, p.radius * ratio, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            else {
                this.ctx.fillStyle = p.color;
                const size = Math.max(1, p.size * (p.life / p.maxLife));
                this.ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
            }
        });
        this.ctx.restore();
    },

    drawFloatingTexts() {
        this.ctx.save();
        this.floatingTexts.forEach(ft => {
            this.ctx.font = '10px "Press Start 2P"';
            this.ctx.fillStyle = ft.color;
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 3;
            this.ctx.fillText(ft.text, ft.x, ft.y);
        });
        this.ctx.restore();
    },

    drawHoverGuide() {
        const gx = this.hoverCell.x;
        const gy = this.hoverCell.y;
        const px = gx * CELL_SIZE;
        const py = gy * CELL_SIZE;

        const isStart = gx === 1 && gy === 2;
        const isEnd = gx === 9 && gy === 14;
        const isWallRow = gy === 4 || gy === 8 || gy === 12;
        const onPath = isPathCell(gx, gy);
        const hasObstacle = this.obstacles.some(ob => ob.x === gx && ob.y === gy);

        this.ctx.save();
        
        if (this.selectedShopTower) {
            let valid = true;
            if (isStart || isEnd || hasObstacle) {
                valid = false;
            } else if (this.selectedShopTower === 'snack') {
                valid = onPath;
            } else {
                valid = !onPath && !isWallRow;
            }

            const duplicate = this.towers.some(t => t.gx === gx && t.gy === gy);
            if (duplicate) valid = false;

            this.ctx.fillStyle = valid ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 51, 68, 0.25)';
            this.ctx.strokeStyle = valid ? '#00f0ff' : '#ff3344';
            this.ctx.lineWidth = 1.5;
            
            this.ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            this.ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

            if (valid) {
                const dummy = new Tower(this.selectedShopTower, gx, gy);
                this.ctx.beginPath();
                this.ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, dummy.range * this.buffs.globalRange, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                this.ctx.fill();
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.stroke();
            }
        } else {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
        }

        this.ctx.restore();
    },

    drawLightingEffects() {
        this.ctx.save();

        const grad = this.ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        grad.addColorStop(0, 'rgba(220, 240, 255, 0.10)');
        grad.addColorStop(0.3, 'rgba(220, 240, 255, 0.04)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.fillStyle = 'rgba(230, 245, 255, 0.02)';
        const beamTime = Date.now() / 4000;
        for (let i = 0; i < 3; i++) {
            const width = 80;
            const startX = -100 + Math.sin(beamTime + i * 2) * 50;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, 0);
            this.ctx.lineTo(startX + width, 0);
            this.ctx.lineTo(startX + width + 400, CANVAS_HEIGHT);
            this.ctx.lineTo(startX + 400, CANVAS_HEIGHT);
            this.ctx.closePath();
            this.ctx.fill();
        }

        const vignette = this.ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.4,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(10, 15, 24, 0.28)');
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.restore();
    },

    drawFoliageFrame() {
        // Disabled foliage frame to look like a modern IT venture office rather than a fantasy village/forest.
    },

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 25 + Math.random() * 70;
            this.particles.push({
                type: 'pixel',
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                size: 2 + Math.random() * 3,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7
            });
        }
    },

    createFloatingText(text, x, y, color) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            life: 1.0
        });
    },

    findNearestEnemy(x, y) {
        let nearest = null;
        let minDist = Infinity;
        this.enemies.forEach(e => {
            if (e.active && e.hp > 0) {
                const d = Math.hypot(e.x - x, e.y - y);
                if (d < minDist) {
                    minDist = d;
                    nearest = e;
                }
            }
        });
        return nearest;
    },

    updateHUD() {
        document.getElementById('hud-budget').innerText = this.budget.toLocaleString();
        
        // diamond metrics represent the LOC formatted to look like diamond counts
        document.getElementById('hud-loc').innerText = String(Math.floor(this.loc / 1000)).padStart(2, '0');
        document.getElementById('hud-wave-num').innerText = `Sprint ${this.currentWave}/${this.maxWaves}`;
        
        const hpPercent = Math.max(0, this.hp);
        document.getElementById('hud-hp-bar').style.width = `${hpPercent}%`;

        const discount = 1 - this.buffs.costDiscount;
        document.querySelectorAll('.shop-item').forEach(el => {
            const towerType = el.getAttribute('data-tower');
            const dummy = new Tower(towerType, 0, 0);
            const actualCost = Math.round(dummy.baseCost * discount);
            el.querySelector('.item-cost').innerText = `${actualCost}G`;

            if (this.budget < actualCost) {
                el.classList.add('disabled');
            } else {
                el.classList.remove('disabled');
            }
        });
    },

    log(message, type = 'info') {
        // Logs disabled on portrait HUD to match clean layouts in image
    }
};

window.game = game;

function ctxHUDIndicator(ctx, text, x, y) {
    ctx.save();
    ctx.font = '8px "Press Start 2P"';
    ctx.fillStyle = '#566a7f';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.restore();
}

window.addEventListener('load', () => {
    game.init();
});
