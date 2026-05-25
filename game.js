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
const GRID_ROWS = 12;
const CELL_SIZE = 40;
const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;  // 440
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 480

// Path coordinates (Grid points winding down 4 floors)
const pathGrid = [
    {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, // Floor 4 (Reception)
    {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, // Staircase 1 (Down)
    {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, // Floor 3 Corridor
    {x: 7, y: 5}, {x: 7, y: 6}, {x: 7, y: 7}, // Staircase 2 (Down)
    {x: 6, y: 7}, {x: 5, y: 7}, {x: 4, y: 7}, {x: 3, y: 7}, {x: 2, y: 7}, // Floor 2 Corridor
    {x: 2, y: 8}, {x: 2, y: 9}, {x: 2, y: 10}, // Staircase 3 (Down)
    {x: 3, y: 10}, {x: 4, y: 10}, {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10} // Floor 1 Server Room
];

function scaleColor(color, intensity) {
    if (color.startsWith('#')) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        r = Math.min(255, Math.max(0, Math.floor(r * intensity)));
        g = Math.min(255, Math.max(0, Math.floor(g * intensity)));
        b = Math.min(255, Math.max(0, Math.floor(b * intensity)));
        return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
}

function drawLowPolyFacet(ctx, points, normal, baseColor) {
    const LX = -0.3637, LY = -0.5819, LZ = 0.7274;
    const dot = normal.x * LX + normal.y * LY + normal.z * LZ;
    const intensity = 0.35 + 0.65 * Math.max(0, dot);
    ctx.fillStyle = scaleColor(baseColor, intensity);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function project3D(x, y, z, rx, ry, rz, cx, cy) {
    // Y-axis rotation
    let x1 = x * Math.cos(ry) - z * Math.sin(ry);
    let z1 = x * Math.sin(ry) + z * Math.cos(ry);
    
    // X-axis rotation
    let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
    let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
    
    const dist = 120;
    const scale = 1.0 / (1.0 + z2 / dist);
    return { x: cx + x1 * scale, y: cy + y2 * scale };
}

function drawProjectedShadow(ctx, points, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    const p0 = { x: points[0].x + height * 0.5, y: points[0].y + height * 0.8 };
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + height * 0.5, points[i].y + height * 0.8);
    }
    ctx.closePath();
    ctx.fill();
}

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
    const isVerticalPath = (col === 3 && row >= 1 && row <= 4) || 
                           (col === 7 && row >= 4 && row <= 7) || 
                           (col === 2 && row >= 7 && row <= 10);

    if (isVerticalPath) {
        // Crystalline low-poly wooden stairs
        for (let i = 0; i < 4; i++) {
            const sy = py + i * 10;
            // Top face of the step
            drawLowPolyFacet(ctx, [
                {x: px, y: sy},
                {x: px + CELL_SIZE, y: sy},
                {x: px + CELL_SIZE, y: sy + 7},
                {x: px, y: sy + 7}
            ], {x: 0, y: -0.3, z: 0.95}, '#dfc3a7');

            // Riser face of the step (shadowed riser)
            drawLowPolyFacet(ctx, [
                {x: px, y: sy + 7},
                {x: px + CELL_SIZE, y: sy + 7},
                {x: px + CELL_SIZE, y: sy + 10},
                {x: px, y: sy + 10}
            ], {x: 0, y: 0.8, z: 0.6}, '#b58f70');
        }

        // Side handrails (beveled)
        drawLowPolyFacet(ctx, [
            {x: px + 1, y: py},
            {x: px + 3, y: py},
            {x: px + 3, y: py + CELL_SIZE},
            {x: px + 1, y: py + CELL_SIZE}
        ], {x: -0.5, y: 0, z: 0.86}, '#8c5225');

        drawLowPolyFacet(ctx, [
            {x: px + CELL_SIZE - 3, y: py},
            {x: px + CELL_SIZE - 1, y: py},
            {x: px + CELL_SIZE - 1, y: py + CELL_SIZE},
            {x: px + CELL_SIZE - 3, y: py + CELL_SIZE}
        ], {x: 0.5, y: 0, z: 0.86}, '#8c5225');
    } else {
        // Cozy Office Carpet Runner Path (Beige/Cream)
        const v0 = {x: px, y: py};
        const v1 = {x: px + CELL_SIZE, y: py};
        const v2 = {x: px + CELL_SIZE, y: py + CELL_SIZE};
        const v3 = {x: px, y: py + CELL_SIZE};
        const vc = {x: px + CELL_SIZE / 2, y: py + CELL_SIZE / 2};

        drawLowPolyFacet(ctx, [v0, v1, vc], {x: 0, y: -0.3, z: 0.954}, '#eed8c9');
        drawLowPolyFacet(ctx, [v1, v2, vc], {x: 0.3, y: 0, z: 0.954}, '#eed8c9');
        drawLowPolyFacet(ctx, [v2, v3, vc], {x: 0, y: 0.3, z: 0.954}, '#eed8c9');
        drawLowPolyFacet(ctx, [v3, v0, vc], {x: -0.3, y: 0, z: 0.954}, '#eed8c9');
    }
}

// Draw raised concrete floor platforms and high-density server cabinets
function drawOfficeFloorTile(ctx, px, py, col, row) {
    // If it's the vertical wall transition rows (Row 2, 5, 8) and unoccupied, do nothing!
    if (row === 2 || row === 5 || row === 8) {
        const isOccupied = (window.game && game.towers && game.towers.some(t => t.gx === col && t.gy === row)) || 
                           (window.game && game.obstacles && game.obstacles.some(ob => ob.x === col && ob.y === row));
        if (!isOccupied) return;
    }

    const isWallRow = row === 0 || row === 3 || row === 6 || row === 9;

    if (isWallRow) {
        let baseColor = '#9fc0a6';
        if (row === 0) {
            baseColor = '#9fc0a6'; // Sage green (Pantry & Breakroom wall)
        } else if (row === 3) {
            baseColor = '#2c3e50'; // Dark Blue-Grey (QA & Meetings wall)
        } else if (row === 6) {
            baseColor = '#cbd5e0'; // Clean White/Cream (Dev Team Workspace wall)
        } else if (row === 9) {
            baseColor = '#1e272e'; // Dim Midnight Blue (Server Room wall)
        }

        // Draw low-poly wall block (split-bevel)
        // Top bevel face
        drawLowPolyFacet(ctx, [
            {x: px, y: py},
            {x: px + CELL_SIZE, y: py},
            {x: px + CELL_SIZE, y: py + 8},
            {x: px, y: py + 8}
        ], {x: 0, y: -0.5, z: 0.86}, baseColor);

        // Front wall face
        drawLowPolyFacet(ctx, [
            {x: px, y: py + 8},
            {x: px + CELL_SIZE, y: py + 8},
            {x: px + CELL_SIZE, y: py + CELL_SIZE},
            {x: px, y: py + CELL_SIZE}
        ], {x: 0, y: 0.8, z: 0.6}, baseColor);

        // Wall decorations
        if (row === 0 && col === 5) {
            // Octagon Wall Clock
            const cx = px + 20, cy = py + 18;
            const r1 = 7, r2 = 5;
            const pointsOuter = [];
            const pointsInner = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                pointsOuter.push({ x: cx + Math.cos(angle) * r1, y: cy + Math.sin(angle) * r1 });
                pointsInner.push({ x: cx + Math.cos(angle) * r2, y: cy + Math.sin(angle) * r2 });
            }
            drawLowPolyFacet(ctx, pointsOuter, {x: 0, y: 0.8, z: 0.6}, '#85583f');
            drawLowPolyFacet(ctx, pointsInner, {x: 0, y: 0.8, z: 0.6}, '#ffffff');
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 3);
            ctx.moveTo(cx, cy); ctx.lineTo(cx + 3, cy);
            ctx.stroke();
        }
        else if (row === 3) {
            // Blinking LEDs
            const blink = Math.floor(Date.now() / 400) % 2 === 0;
            const drawLed = (cx, cy, color) => {
                const pts = [
                    {x: cx, y: cy - 3},
                    {x: cx + 2, y: cy},
                    {x: cx, y: cy + 3},
                    {x: cx - 2, y: cy}
                ];
                drawLowPolyFacet(ctx, pts, {x: 0, y: 0.8, z: 0.6}, color);
            };
            drawLed(px + 13, py + 16, blink ? '#2ecc71' : '#27ae60');
            drawLed(px + 23, py + 16, !blink ? '#e74c3c' : '#c0392b');
        }
        else if (row === 6 && col === 4) {
            // Project WBS Chart Frame
            ctx.fillStyle = '#85583f';
            ctx.fillRect(px + 6, py + 6, 28, 20);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 8, py + 8, 24, 16);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(px + 10, py + 11, 8, 3);
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(px + 14, py + 15, 12, 3);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 19, py + 19, 6, 3);
        }
        else if (row === 9 && col === 8) {
            // Blinking terminal cursor
            const showCursor = Math.floor(Date.now() / 500) % 2 === 0;
            ctx.font = '8px "Press Start 2P"';
            ctx.fillStyle = '#00ff66';
            ctx.fillText('>', px + 10, py + 20);
            if (showCursor) {
                drawLowPolyFacet(ctx, [
                    {x: px + 22, y: py + 12},
                    {x: px + 28, y: py + 12},
                    {x: px + 28, y: py + 20},
                    {x: px + 22, y: py + 20}
                ], {x: 0, y: 0.8, z: 0.6}, '#00ff66');
            }
        }
    } else {
        // Floor types based on partition zones
        let baseColor = '#ced6e0';
        if (row < 3) {
            baseColor = '#f2ddc6'; // Floor 4: Pantry & Breakroom (Wood light)
        } else if (row < 6) {
            baseColor = '#57606f'; // Floor 3: QA & Meetings (Metal plates)
        } else if (row < 9) {
            baseColor = '#b77c57'; // Floor 2: Dev Workspace (Mahogany)
        } else {
            baseColor = '#353b48'; // Floor 1: Server Room (Dim grey)
        }

        // Triangulate each floor cell into 4 triangles
        const v0 = {x: px, y: py};
        const v1 = {x: px + CELL_SIZE, y: py};
        const v2 = {x: px + CELL_SIZE, y: py + CELL_SIZE};
        const v3 = {x: px, y: py + CELL_SIZE};
        const vc = {x: px + CELL_SIZE / 2, y: py + CELL_SIZE / 2};

        drawLowPolyFacet(ctx, [v0, v1, vc], {x: 0, y: -0.35, z: 0.936}, baseColor);
        drawLowPolyFacet(ctx, [v1, v2, vc], {x: 0.35, y: 0, z: 0.936}, baseColor);
        drawLowPolyFacet(ctx, [v2, v3, vc], {x: 0, y: 0.35, z: 0.936}, baseColor);
        drawLowPolyFacet(ctx, [v3, v0, vc], {x: -0.35, y: 0, z: 0.936}, baseColor);
    }

    // Platform bottom edge lip (3D depth)
    if (row === 2 || row === 5 || row === 8 || row === 11) {
        drawLowPolyFacet(ctx, [
            {x: px, y: py + CELL_SIZE - 6},
            {x: px + CELL_SIZE, y: py + CELL_SIZE - 6},
            {x: px + CELL_SIZE, y: py + CELL_SIZE},
            {x: px, y: py + CELL_SIZE}
        ], {x: 0, y: 0.9, z: 0.43}, '#3c2517');
    }

    // Draw Glass Wall & Partitions
    ctx.save();
    if (row >= 3 && row < 6) {
        // Floor 3 Meeting Room boundary (Glass wall at col 8 left edge)
        if (col === 8) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.fillRect(px - 1, py, 3, CELL_SIZE);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py); ctx.lineTo(px, py + CELL_SIZE);
            ctx.stroke();
        }
    } else if (row >= 6 && row < 9) {
        // Floor 2 Dev Team boundary partitions
        if (col === 1) {
            // vertical partition on right edge
            drawLowPolyFacet(ctx, [
                {x: px + CELL_SIZE - 2, y: py},
                {x: px + CELL_SIZE + 2, y: py},
                {x: px + CELL_SIZE + 2, y: py + CELL_SIZE},
                {x: px + CELL_SIZE - 2, y: py + CELL_SIZE}
            ], {x: -1, y: 0, z: 0.2}, '#52665d');
        } else if (col === 8) {
            // vertical partition on left edge
            drawLowPolyFacet(ctx, [
                {x: px - 2, y: py},
                {x: px + 2, y: py},
                {x: px + 2, y: py + CELL_SIZE},
                {x: px - 2, y: py + CELL_SIZE}
            ], {x: 1, y: 0, z: 0.2}, '#52665d');
        }
    }
    ctx.restore();

    // Draw Props on unoccupied non-wall cells
    const isOccupied = (col === 1 && row === 1) || (col === 9 && row === 10) || isWallRow ||
                       (window.game && game.towers && game.towers.some(t => t.gx === col && t.gy === row)) || 
                       (window.game && game.obstacles && game.obstacles.some(ob => ob.x === col && ob.y === row));

    if (!isOccupied) {
        ctx.save();
        
        if (row < 3) {
            // Floor 4: Pantry (Left) & Breakroom (Right)
            if (col <= 2) {
                // Pantry
                if (row === 1 && col === 0) {
                    // Coffee Machine
                    drawLowPolyFacet(ctx, [
                        {x: px + 6, y: py + 20},
                        {x: px + 34, y: py + 20},
                        {x: px + 34, y: py + 38},
                        {x: px + 6, y: py + 38}
                    ], {x: 0, y: 0.8, z: 0.6}, '#7f8c8d');
                    drawLowPolyFacet(ctx, [
                        {x: px + 8, y: py + 8},
                        {x: px + 32, y: py + 8},
                        {x: px + 32, y: py + 20},
                        {x: px + 8, y: py + 20}
                    ], {x: 0, y: 0.8, z: 0.6}, '#2c3e50');
                    ctx.fillStyle = '#ffffff'; // mug
                    ctx.fillRect(px + 18, py + 16, 4, 4);
                    ctx.fillStyle = '#5c3d2e'; // coffee outlet stream
                    ctx.fillRect(px + 19, py + 11, 2, 5);
                } else if (row === 1 && col === 1) {
                    // Water Purifier (정수기)
                    drawLowPolyFacet(ctx, [
                        {x: px + 10, y: py + 22},
                        {x: px + 30, y: py + 22},
                        {x: px + 30, y: py + 38},
                        {x: px + 10, y: py + 38}
                    ], {x: 0, y: 0.8, z: 0.6}, '#dcdde1');
                    drawLowPolyFacet(ctx, [
                        {x: px + 10, y: py + 8},
                        {x: px + 30, y: py + 8},
                        {x: px + 30, y: py + 22},
                        {x: px + 10, y: py + 22}
                    ], {x: 0, y: 0.8, z: 0.6}, '#f5f6fa');
                    drawLowPolyFacet(ctx, [
                        {x: px + 12, y: py + 2},
                        {x: px + 28, y: py + 2},
                        {x: px + 28, y: py + 8},
                        {x: px + 12, y: py + 8}
                    ], {x: 0, y: -0.5, z: 0.86}, '#74b9ff'); // Water bottle
                    ctx.fillStyle = '#0084ff';
                    ctx.fillRect(px + 16, py + 16, 2, 2);
                    ctx.fillStyle = '#ff3838';
                    ctx.fillRect(px + 22, py + 16, 2, 2);
                } else if (row === 1 && col === 2) {
                    // Snack cabinet / shelf
                    drawLowPolyFacet(ctx, [
                        {x: px + 6, y: py + 6},
                        {x: px + 34, y: py + 6},
                        {x: px + 34, y: py + 38},
                        {x: px + 6, y: py + 38}
                    ], {x: 0, y: 0.8, z: 0.6}, '#b58f70');
                    ctx.fillStyle = '#e74c3c'; // red snacks
                    ctx.fillRect(px + 10, py + 12, 6, 6);
                    ctx.fillStyle = '#f1c40f'; // yellow boxes
                    ctx.fillRect(px + 22, py + 10, 7, 8);
                    ctx.fillStyle = '#2ecc71'; // green packet
                    ctx.fillRect(px + 12, py + 24, 6, 6);
                }
            } else if (col >= 4) {
                // Breakroom
                if (row === 1 && col === 5) {
                    // Sofa (Teal color)
                    drawLowPolyFacet(ctx, [
                        {x: px + 2, y: py + 8},
                        {x: px + 38, y: py + 8},
                        {x: px + 38, y: py + 18},
                        {x: px + 2, y: py + 18}
                    ], {x: 0, y: -0.2, z: 0.98}, '#0e8a8a');
                    drawLowPolyFacet(ctx, [
                        {x: px + 2, y: py + 18},
                        {x: px + 38, y: py + 18},
                        {x: px + 38, y: py + 34},
                        {x: px + 2, y: py + 34}
                    ], {x: 0, y: 0.8, z: 0.6}, '#1abc9c');
                    drawLowPolyFacet(ctx, [
                        {x: px, y: py + 12},
                        {x: px + 4, y: py + 12},
                        {x: px + 4, y: py + 34},
                        {x: px, y: py + 34}
                    ], {x: -0.8, y: 0.2, z: 0.6}, '#0e8a8a');
                    drawLowPolyFacet(ctx, [
                        {x: px + 36, y: py + 12},
                        {x: px + 40, y: py + 12},
                        {x: px + 40, y: py + 34},
                        {x: px + 36, y: py + 34}
                    ], {x: 0.8, y: 0.2, z: 0.6}, '#0e8a8a');
                } else if (row === 1 && col === 8) {
                    // Potted Plant
                    drawLowPolyFacet(ctx, [
                        {x: px + 14, y: py + 22},
                        {x: px + 26, y: py + 22},
                        {x: px + 28, y: py + 36},
                        {x: px + 12, y: py + 36}
                    ], {x: 0, y: 0.8, z: 0.6}, '#b58f70');
                    drawLowPolyFacet(ctx, [
                        {x: px + 10, y: py + 18},
                        {x: px + 30, y: py + 18},
                        {x: px + 20, y: py + 4}
                    ], {x: 0, y: -0.3, z: 0.95}, '#27ae60');
                    drawLowPolyFacet(ctx, [
                        {x: px + 14, y: py + 12},
                        {x: px + 26, y: py + 12},
                        {x: px + 20, y: py + 1}
                    ], {x: 0.3, y: -0.3, z: 0.95}, '#2ecc71');
                } else if (row === 1 && col === 6) {
                    // Coffee table
                    drawLowPolyFacet(ctx, [
                        {x: px + 8, y: py + 12},
                        {x: px + 32, y: py + 12},
                        {x: px + 32, y: py + 26},
                        {x: px + 8, y: py + 26}
                    ], {x: 0, y: -0.5, z: 0.86}, '#f5f6fa');
                    ctx.fillStyle = '#ff7675';
                    ctx.fillRect(px + 14, py + 15, 3, 4);
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(px + 22, py + 17, 3, 4);
                }
            }
        }
        else if (row >= 3 && row < 6) {
            // Floor 3: QA Zone (Left) & Meeting Room (Right)
            if (col <= 2) {
                // QA Zone
                if (row === 4 && col === 0) {
                    // QA Desk
                    drawLowPolyFacet(ctx, [
                        {x: px + 4, y: py + 14},
                        {x: px + 36, y: py + 14},
                        {x: px + 36, y: py + 30},
                        {x: px + 4, y: py + 30}
                    ], {x: 0, y: -0.5, z: 0.86}, '#bdc3c7');
                    ctx.fillStyle = '#2c3e50'; // phone base
                    ctx.fillRect(px + 15, py + 18, 5, 8);
                    ctx.fillStyle = '#00ff66'; // test app screen
                    ctx.fillRect(px + 16, py + 19, 3, 6);
                } else if (row === 4 && col === 1) {
                    // QA Bug Board
                    ctx.strokeStyle = '#2f3542';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(px + 10, py + 34); ctx.lineTo(px + 20, py + 14);
                    ctx.moveTo(px + 30, py + 34); ctx.lineTo(px + 20, py + 14);
                    ctx.stroke();
                    drawLowPolyFacet(ctx, [
                        {x: px + 4, y: py + 4},
                        {x: px + 36, y: py + 4},
                        {x: px + 36, y: py + 26},
                        {x: px + 4, y: py + 26}
                    ], {x: 0, y: 0.8, z: 0.6}, '#ffffff');
                    ctx.fillStyle = '#ff7675'; // bug report red chart
                    ctx.fillRect(px + 8, py + 8, 16, 4);
                    ctx.fillStyle = '#2ecc71'; // test green chart
                    ctx.fillRect(px + 8, py + 14, 20, 4);
                }
            } else if (col >= 8) {
                // Meeting Room
                if (row === 4 && col === 9) {
                    // Table and Chairs
                    drawLowPolyFacet(ctx, [
                        {x: px + 2, y: py + 10},
                        {x: px + 38, y: py + 10},
                        {x: px + 38, y: py + 30},
                        {x: px + 2, y: py + 30}
                    ], {x: 0, y: -0.5, z: 0.86}, '#bdc3c7');
                    const drawChair = (cx, cy) => {
                        ctx.fillStyle = '#34495e';
                        ctx.fillRect(cx, cy, 6, 6);
                    };
                    drawChair(px + 8, py + 3);
                    drawChair(px + 26, py + 3);
                    drawChair(px + 8, py + 31);
                    drawChair(px + 26, py + 31);
                } else if (row === 4 && col === 8) {
                    // Whiteboard with Jira tasks
                    drawLowPolyFacet(ctx, [
                        {x: px + 6, y: py + 4},
                        {x: px + 34, y: py + 4},
                        {x: px + 34, y: py + 28},
                        {x: px + 6, y: py + 28}
                    ], {x: 0, y: 0.8, z: 0.6}, '#ffffff');
                    ctx.strokeStyle = '#bdc3c7';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px + 15, py + 6); ctx.lineTo(px + 15, py + 26);
                    ctx.moveTo(px + 25, py + 6); ctx.lineTo(px + 25, py + 26);
                    ctx.stroke();
                    ctx.fillStyle = '#fffa5c'; // sticky notes
                    ctx.fillRect(px + 9, py + 8, 4, 3);
                    ctx.fillStyle = '#5cff88';
                    ctx.fillRect(px + 27, py + 10, 4, 3);
                    ctx.fillStyle = '#5c8dff';
                    ctx.fillRect(px + 18, py + 14, 4, 3);
                }
            }
        }
        else if (row >= 6 && row < 9) {
            // Floor 2: Dev Team Workspace
            if (col <= 1 || col >= 8) {
                // Table
                drawLowPolyFacet(ctx, [
                    {x: px + 2, y: py + 14},
                    {x: px + 38, y: py + 14},
                    {x: px + 38, y: py + 36},
                    {x: px + 2, y: py + 36}
                ], {x: 0, y: -0.5, z: 0.86}, '#3c2517');

                if (col === 0 && row === 7) {
                    // Workstation (Dual Monitors)
                    drawLowPolyFacet(ctx, [
                        {x: px + 4, y: py + 2},
                        {x: px + 18, y: py + 2},
                        {x: px + 18, y: py + 12},
                        {x: px + 4, y: py + 12}
                    ], {x: -0.2, y: 0.8, z: 0.6}, '#2f3542');
                    ctx.fillStyle = '#002b36'; // screen 1
                    ctx.fillRect(px + 6, py + 4, 10, 6);
                    
                    drawLowPolyFacet(ctx, [
                        {x: px + 20, y: py + 2},
                        {x: px + 34, y: py + 2},
                        {x: px + 34, y: py + 12},
                        {x: px + 20, y: py + 12}
                    ], {x: 0.2, y: 0.8, z: 0.6}, '#2f3542');
                    ctx.fillStyle = '#002b36'; // screen 2
                    ctx.fillRect(px + 22, py + 4, 10, 6);
                } else if (col === 1 && row === 7) {
                    // Keyboard & Coffee Cup
                    ctx.fillStyle = '#1c1f26'; // keyboard
                    ctx.fillRect(px + 10, py + 22, 14, 6);
                    ctx.fillStyle = '#00ffcc'; // rgb keys
                    ctx.fillRect(px + 14, py + 24, 6, 2);
                    ctx.fillStyle = '#f5f6fa'; // coffee mug
                    ctx.fillRect(px + 28, py + 20, 4, 5);
                } else if (col === 9 && row === 7) {
                    // Wide monitor
                    drawLowPolyFacet(ctx, [
                        {x: px + 6, y: py + 3},
                        {x: px + 34, y: py + 3},
                        {x: px + 34, y: py + 13},
                        {x: px + 6, y: py + 13}
                    ], {x: 0, y: 0.8, z: 0.6}, '#1e272e');
                    ctx.fillStyle = '#00ff66'; // IDE coding screen glow
                    ctx.fillRect(px + 8, py + 5, 24, 6);
                } else if (col === 10 && row === 7) {
                    // Soda cans / papers
                    ctx.fillStyle = '#ffffff'; // papers
                    ctx.fillRect(px + 10, py + 20, 10, 8);
                    ctx.strokeStyle = '#bdc3c7';
                    ctx.strokeRect(px + 10, py + 20, 10, 8);
                    ctx.fillStyle = '#e74c3c'; // soda
                    ctx.fillRect(px + 26, py + 22, 3, 6);
                }
            }
        }
        else if (row >= 9) {
            // Floor 1: Server Room
            if (col <= 2 || col >= 9 || row === 11) {
                // Server Cabinets (Server Racks)
                drawLowPolyFacet(ctx, [
                    {x: px + 6, y: py + 2},
                    {x: px + 34, y: py + 2},
                    {x: px + 36, y: py + 6},
                    {x: px + 4, y: py + 6}
                ], {x: 0, y: -0.5, z: 0.86}, '#2f3542');

                drawLowPolyFacet(ctx, [
                    {x: px + 4, y: py + 6},
                    {x: px + 36, y: py + 6},
                    {x: px + 36, y: py + 38},
                    {x: px + 4, y: py + 38}
                ], {x: 0, y: 0.8, z: 0.6}, '#1e272e');

                // Sliders and glowing LED status lights
                ctx.fillStyle = '#11141a';
                ctx.fillRect(px + 8, py + 10, 24, 4);
                ctx.fillRect(px + 8, py + 18, 24, 4);
                ctx.fillRect(px + 8, py + 26, 24, 4);

                const blink = Math.floor(Date.now() / 300) % 2 === 0;
                ctx.fillStyle = blink ? '#00f0ff' : '#0055ff'; // Blue
                ctx.fillRect(px + 12, py + 11, 2, 2);
                ctx.fillStyle = '#2ecc71'; // Green status
                ctx.fillRect(px + 20, py + 19, 2, 2);
                ctx.fillStyle = !blink ? '#e74c3c' : '#550000'; // Red alarm
                ctx.fillRect(px + 28, py + 27, 2, 2);
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

class NPC {
    constructor(type, name, gx, gy) {
        this.type = type; // 'dev', 'qa', 'pm', 'infra'
        this.name = name;
        this.gx = gx;
        this.gy = gy;
        this.x = gx * CELL_SIZE + CELL_SIZE / 2;
        this.y = gy * CELL_SIZE + CELL_SIZE / 2;
        
        this.state = 'idle'; // 'idle', 'walking', 'typing', 'sleeping', 'resting'
        this.targetState = 'idle';
        this.speed = 45; // pixels per second
        this.walkCycle = 0;
        this.idleTimer = Math.random() * 5 + 3; // stay idle for 3-8s
        
        this.waypoints = [];
        this.speechBubbleText = '';
        this.speechBubbleTimer = 0;
        this.bubbleInterval = Math.random() * 15 + 10; // speak every 10-25s
        
        // Desk coordinates to return to
        this.homeGx = gx;
        this.homeGy = gy;
    }

    setDestination(destGx, destGy, nextState) {
        this.targetState = nextState;
        this.waypoints = [];
        
        const startFloor = this.getFloor(this.gy);
        const endFloor = this.getFloor(destGy);
        
        if (startFloor !== endFloor) {
            let corrCol = this.getCorridorColForFloor(startFloor);
            this.waypoints.push({x: corrCol * CELL_SIZE + CELL_SIZE/2, y: this.gy * CELL_SIZE + CELL_SIZE/2});
            
            let currentFloor = startFloor;
            while (currentFloor !== endFloor) {
                let nextFloor = currentFloor < endFloor ? currentFloor + 1 : currentFloor - 1;
                let stairs = this.getStairsBetween(currentFloor, nextFloor);
                
                this.waypoints.push({x: stairs.col * CELL_SIZE + CELL_SIZE/2, y: stairs.startRow * CELL_SIZE + CELL_SIZE/2});
                this.waypoints.push({x: stairs.col * CELL_SIZE + CELL_SIZE/2, y: stairs.endRow * CELL_SIZE + CELL_SIZE/2});
                
                currentFloor = nextFloor;
            }
            
            let destCorrCol = this.getCorridorColForFloor(endFloor);
            this.waypoints.push({x: destCorrCol * CELL_SIZE + CELL_SIZE/2, y: destGy * CELL_SIZE + CELL_SIZE/2});
        }
        
        this.waypoints.push({x: destGx * CELL_SIZE + CELL_SIZE/2, y: destGy * CELL_SIZE + CELL_SIZE/2});
        this.state = 'walking';
    }

    getFloor(row) {
        if (row < 3) return 4;
        if (row < 6) return 3;
        if (row < 9) return 2;
        return 1;
    }

    getCorridorColForFloor(floor) {
        if (floor === 4) return 3;
        if (floor === 3) return 5;
        if (floor === 2) return 4;
        return 6;
    }

    getStairsBetween(f1, f2) {
        const lowF = Math.min(f1, f2);
        if (lowF === 3) {
            return { col: 3, startRow: 1, endRow: 4 };
        } else if (lowF === 2) {
            return { col: 7, startRow: 4, endRow: 7 };
        } else {
            return { col: 2, startRow: 7, endRow: 10 };
        }
    }

    update(dt) {
        this.bubbleInterval -= dt;
        if (this.bubbleInterval <= 0) {
            this.speakRandomly();
            this.bubbleInterval = Math.random() * 20 + 15;
        }

        if (this.speechBubbleTimer > 0) {
            this.speechBubbleTimer -= dt;
        }

        if (this.state === 'walking') {
            if (this.waypoints.length === 0) {
                this.state = this.targetState;
                this.idleTimer = Math.random() * 6 + 4;
                return;
            }

            const target = this.waypoints[0];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.hypot(dx, dy);

            this.walkCycle += dt * 8;

            if (dist < 2) {
                this.x = target.x;
                this.y = target.y;
                this.gx = Math.floor(this.x / CELL_SIZE);
                this.gy = Math.floor(this.y / CELL_SIZE);
                this.waypoints.shift();
            } else {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        } else {
            this.idleTimer -= dt;
            if (this.idleTimer <= 0) {
                this.pickNextAction();
            }
        }
    }

    pickNextAction() {
        if (this.type === 'dev') {
            const rand = Math.random();
            if (rand < 0.5) {
                this.state = 'typing';
                this.idleTimer = Math.random() * 8 + 6;
            } else if (rand < 0.75) {
                this.state = 'sleeping';
                this.idleTimer = Math.random() * 5 + 3;
            } else {
                this.setDestination(1, 1, 'resting');
                this.speechBubbleText = "아아 마시러 간다... ☕";
                this.speechBubbleTimer = 2.5;
            }
        } else if (this.type === 'qa') {
            const rand = Math.random();
            if (rand < 0.6) {
                this.state = 'typing';
                this.idleTimer = Math.random() * 10 + 5;
            } else {
                this.setDestination(1, 7, 'resting');
                this.speechBubbleText = "개발팀 자리로 버그 리포트 배달 갑니다~ 🏃";
                this.speechBubbleTimer = 2.5;
            }
        } else if (this.type === 'pm') {
            const rand = Math.random();
            if (rand < 0.6) {
                this.state = 'idle';
                this.idleTimer = Math.random() * 6 + 4;
            } else {
                this.setDestination(9, 7, 'resting');
                this.speechBubbleText = "개발팀 진척률 점검하러 출동! 📋";
                this.speechBubbleTimer = 2.5;
            }
        } else if (this.type === 'infra') {
            const rand = Math.random();
            if (rand < 0.6) {
                this.state = 'idle';
                this.idleTimer = Math.random() * 8 + 4;
            } else {
                const targetCol = Math.random() < 0.5 ? 1 : 9;
                this.setDestination(targetCol, 11, 'idle');
            }
        }

        if (this.state === 'resting' && this.gx !== this.homeGx && this.gy !== this.homeGy) {
            this.setDestination(this.homeGx, this.homeGy, this.type === 'dev' ? 'typing' : 'idle');
        }
    }

    speakRandomly() {
        const phrases = {
            dev: ["아아... 커피 수혈 시급...", "빌드 에러 왜 나지?", "퇴근하고 싶다...", "이걸 왜 이렇게 짰지?", "Works on my machine", "주말에 서버 안 터지겠지?"],
            qa: ["이거 버그인데요?", "재현 경로 스크린샷 보냄", "단위테스트 다 깨져요", "QA 재오픈합니다"],
            pm: ["이거 오늘 중으로 되나요?", "회의 들어오세요", "Jira 티켓 할당했습니다", "일정이 너무 촉박해요"],
            infra: ["서버 온도 정상", "트래픽이 급증합니다!", "DB 락 풀렸나?", "인프라 점검 완료"]
        };
        const list = phrases[this.type];
        this.speechBubbleText = list[Math.floor(Math.random() * list.length)];
        this.speechBubbleTimer = 3.0;
    }

    draw(ctx) {
        ctx.save();

        const bob = Math.sin(Date.now() / 150 + this.x) * 1.2;
        const legSway = this.state === 'walking' ? Math.sin(this.walkCycle) * 3 : 0;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 12 + bob, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        let bodyColor = '#3498db';
        if (this.type === 'dev') bodyColor = '#00ecc6';
        if (this.type === 'qa') bodyColor = '#a55eea';
        if (this.type === 'pm') bodyColor = '#fa8231';
        if (this.type === 'infra') bodyColor = '#7f8c8d';

        drawLowPolyFacet(ctx, [
            { x: this.x - 5, y: this.y + 12 + bob },
            { x: this.x + 5, y: this.y + 12 + bob },
            { x: this.x + 4, y: this.y + bob },
            { x: this.x - 4, y: this.y + bob }
        ], { x: 0, y: 0.8, z: 0.6 }, bodyColor);

        ctx.fillStyle = '#ffdfba';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 4 + bob, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.type === 'pm' ? '#2f3542' : '#8c5225';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y - 5 + bob);
        ctx.lineTo(this.x + 5, this.y - 5 + bob);
        ctx.lineTo(this.x + 3, this.y - 9 + bob);
        ctx.lineTo(this.x - 3, this.y - 9 + bob);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y + 12 + bob);
        ctx.lineTo(this.x - 2 - legSway, this.y + 17 + bob);
        ctx.moveTo(this.x + 2, this.y + 12 + bob);
        ctx.lineTo(this.x + 2 + legSway, this.y + 17 + bob);
        ctx.stroke();

        if (this.state === 'typing') {
            ctx.strokeStyle = '#ffdfba';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(this.x - 4, this.y + 4 + bob);
            ctx.lineTo(this.x - 6 + Math.sin(Date.now()/50)*2, this.y + 2 + bob);
            ctx.moveTo(this.x + 4, this.y + 4 + bob);
            ctx.lineTo(this.x + 6 + Math.cos(Date.now()/50)*2, this.y + 2 + bob);
            ctx.stroke();
        }

        if (this.state === 'sleeping') {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px Arial';
            ctx.fillText('💤', this.x + 8, this.y - 8 + bob);
        }

        if (this.speechBubbleText && this.speechBubbleTimer > 0) {
            ctx.font = '7px Arial';
            const textWidth = ctx.measureText(this.speechBubbleText).width;
            const bw = textWidth + 8;
            const bh = 12;
            const bx = this.x - bw / 2;
            const by = this.y - 16 + bob;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(bx, by - bh, bw, bh, 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#1e272e';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.speechBubbleText, this.x, by - bh / 2);
        }

        ctx.restore();
    }
}

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
        const difficultyScale = 1.0 + (this.waveNum - 1) * 0.90;
        const speedScale = 1.0 + (this.waveNum - 1) * 0.12;
        
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
                this.speed = 1.8 * speedScale * speedMultiplier;
                this.gold = 10;
                this.loc = 50;
                this.color = '#f39c12';
                this.phrase = '기능 하나만 추가해주세용!';
                break;
            case 'doc_bomber': // Hard armored (레거시 코드)
                this.name = '레거시 코드';
                this.maxHp = 180 * difficultyScale * hpMultiplier;
                this.speed = 0.9 * speedScale * speedMultiplier;
                this.gold = 25;
                this.loc = 100;
                this.color = '#95a5a6';
                this.phrase = '이거 지우면 전체 빌드 터짐';
                this.armored = true;
                break;
            case 'urgent': // Very fast (긴급 장애)
                this.name = '긴급 장애';
                this.maxHp = 80 * difficultyScale * hpMultiplier;
                this.speed = 2.5 * speedScale * speedMultiplier;
                this.gold = 15;
                this.loc = 80;
                this.color = '#e74c3c';
                this.phrase = '서버 접속 불가능! (Critical)';
                break;
            case 'qa_bugger': // Debug/disable towers (QA 재오픈)
                this.name = 'QA 재오픈';
                this.maxHp = 220 * difficultyScale * hpMultiplier;
                this.speed = 1.2 * speedScale * speedMultiplier;
                this.gold = 30;
                this.loc = 150;
                this.color = '#3498db';
                this.phrase = '스테이징에서 재현되는데요?';
                break;
            case 'unit_test': // High health, slow (단위테스트 실패)
                this.name = '단위테스트 실패';
                this.maxHp = 130 * difficultyScale * hpMultiplier;
                this.speed = 1.0 * speedScale * speedMultiplier;
                this.gold = 20;
                this.loc = 90;
                this.color = '#ff6b6b';
                this.phrase = ['Assertion Failed!', '코드 커버리지 미달!', '테스트 케이스 깨짐!'][Math.floor(Math.random() * 3)];
                break;
            case 'meeting': // Balanced (끝없는 업무회의)
                this.name = '끝없는 업무회의';
                this.maxHp = 160 * difficultyScale * hpMultiplier;
                this.speed = 1.3 * speedScale * speedMultiplier;
                this.gold = 25;
                this.loc = 110;
                this.color = '#a55eea';
                this.phrase = ['잠깐 회의 좀 하실까요?', '싱크업 미팅 잡겠습니다', '10분만 대화하시죠'][Math.floor(Math.random() * 3)];
                break;
            case 'biz_user': // Fast (현업 요구/독촉)
                this.name = '현업 요구/독촉';
                this.maxHp = 90 * difficultyScale * hpMultiplier;
                this.speed = 2.1 * speedScale * speedMultiplier;
                this.gold = 18;
                this.loc = 85;
                this.color = '#fa8231';
                this.phrase = ['언제 배포되나요?', '이거 급한 건입니다!', '오늘 중으로 부탁해요!'][Math.floor(Math.random() * 3)];
                break;
            case 'ceo_boss': // Big boss (운영 배포 사고)
                this.name = '운영 배포 사고';
                this.maxHp = 3000 * (1.0 + (this.waveNum - 5) * 1.5) * hpMultiplier;
                this.speed = 0.6 * speedScale * speedMultiplier;
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

        // Special behavior: QA Client / Outage Boss spawns bug reports to freeze towers
        if (this.type === 'qa_bugger' || this.type === 'ceo_boss') {
            this.bugCooldown -= dt;
            if (this.bugCooldown <= 0) {
                this.fireBugReport();
                const waveFactor = Math.max(0.4, 1.0 - (this.waveNum - 1) * 0.12);
                this.bugCooldown = ((this.type === 'ceo_boss' ? 1200 : 2500) + Math.random() * 1000) * waveFactor;
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
        
        const size = this.isBoss ? 36 : 18;
        const bob = Math.sin(this.bobOffset) * 1.5;
        
        // Draw drop shadow on the floor (anchored projected low-poly shadow)
        const shadowPts = [
            { x: this.x - size, y: this.y },
            { x: this.x, y: this.y - size * 0.5 },
            { x: this.x + size, y: this.y },
            { x: this.x, y: this.y + size * 0.5 }
        ];
        drawProjectedShadow(ctx, shadowPts, 12);

        // Helper for face normal in 3D (to support backface culling & correct shading)
        const getNormal = (A, B, C) => {
            const ux = B.x - A.x, uy = B.y - A.y, uz = B.z - A.z;
            const vx = C.x - A.x, vy = C.y - A.y, vz = C.z - A.z;
            const nx = uy * vz - uz * vy;
            const ny = uz * vx - ux * vz;
            const nz = ux * vy - uy * vx;
            const len = Math.hypot(nx, ny, nz) || 1;
            return { x: nx / len, y: ny / len, z: nz / len };
        };

        // Procedural Low-Poly IT Company Monster Drawings
        if (this.type === 'spec_adder') {
            // 요구사항 변경: A flying origami paper document flapping in 3D
            const wingSway = Math.sin(Date.now() / 150) * 5;
            
            // Left wing
            drawLowPolyFacet(ctx, [
                { x: this.x - 18, y: this.y - 6 + wingSway + bob },
                { x: this.x, y: this.y - 12 + bob },
                { x: this.x, y: this.y + 6 + bob }
            ], { x: -0.5, y: 0.2, z: 0.84 }, '#f5f6fa');

            // Right wing
            drawLowPolyFacet(ctx, [
                { x: this.x + 18, y: this.y - 6 + wingSway + bob },
                { x: this.x, y: this.y - 12 + bob },
                { x: this.x, y: this.y + 6 + bob }
            ], { x: 0.5, y: 0.2, z: 0.84 }, '#f5f6fa');

            // Spine left
            drawLowPolyFacet(ctx, [
                { x: this.x - 4, y: this.y + 12 + bob },
                { x: this.x, y: this.y - 12 + bob },
                { x: this.x, y: this.y + 6 + bob }
            ], { x: -0.2, y: 0.6, z: 0.77 }, '#dcdde1');

            // Spine right
            drawLowPolyFacet(ctx, [
                { x: this.x + 4, y: this.y + 12 + bob },
                { x: this.x, y: this.y - 12 + bob },
                { x: this.x, y: this.y + 6 + bob }
            ], { x: 0.2, y: 0.6, z: 0.77 }, '#dcdde1');

            // Orange folded corner flaps
            drawLowPolyFacet(ctx, [
                { x: this.x - 8, y: this.y - 2 + bob },
                { x: this.x - 4, y: this.y - 8 + bob },
                { x: this.x, y: this.y - 4 + bob }
            ], { x: -0.3, y: -0.3, z: 0.9 }, '#e67e22');

            drawLowPolyFacet(ctx, [
                { x: this.x + 8, y: this.y - 2 + bob },
                { x: this.x + 4, y: this.y - 8 + bob },
                { x: this.x, y: this.y - 4 + bob }
            ], { x: 0.3, y: -0.3, z: 0.9 }, '#e67e22');
        } 
        else if (this.type === 'doc_bomber') {
            // 레거시 코드: A solid 3D granite stone obelisk (truncated pyramid) with cracks
            const w1 = 14, w2 = 8, h = 26;
            const pts3d = [
                { x: -w1, y: h/2, z: -w1 },  // 0: bottom back left
                { x: w1, y: h/2, z: -w1 },   // 1: bottom back right
                { x: w1, y: h/2, z: w1 },    // 2: bottom front right
                { x: -w1, y: h/2, z: w1 },   // 3: bottom front left
                { x: -w2, y: -h/2, z: -w2 }, // 4: top back left
                { x: w2, y: -h/2, z: -w2 },  // 5: top back right
                { x: w2, y: -h/2, z: w2 },   // 6: top front right
                { x: -w2, y: -h/2, z: w2 }   // 7: top front left
            ];
            
            // Slightly tilted for 3D look
            const rotX = 0.2, rotY = -0.3;
            const proj = pts3d.map(v => project3D(v.x, v.y, v.z, rotX, rotY, 0, this.x, this.y + bob));

            // Visible faces drawing
            drawLowPolyFacet(ctx, [proj[3], proj[2], proj[6], proj[7]], { x: 0, y: 0.2, z: 0.98 }, '#57606f');
            drawLowPolyFacet(ctx, [proj[7], proj[6], proj[5], proj[4]], { x: 0, y: -0.9, z: 0.43 }, '#747d8c');
            drawLowPolyFacet(ctx, [proj[0], proj[3], proj[7], proj[4]], { x: -0.98, y: 0.2, z: 0 }, '#2f3542');
            drawLowPolyFacet(ctx, [proj[2], proj[1], proj[5], proj[6]], { x: 0.98, y: 0.2, z: 0 }, '#2c3e50');

            // Draw glowing red cracks
            ctx.strokeStyle = '#ff7675';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(proj[7].x, proj[7].y);
            ctx.lineTo((proj[7].x + proj[2].x)/2 + 2, (proj[7].y + proj[2].y)/2 - 1);
            ctx.lineTo(proj[2].x - 3, proj[2].y - 2);
            ctx.stroke();

            // 'LEGACY' indicator tag
            ctx.fillStyle = '#ff7675';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LEGACY', this.x, this.y + 4 + bob);
        }
        else if (this.type === 'urgent') {
            // 긴급 장애: Flashing red siren octahedron bulb on grey low-poly metal base
            // Base
            drawLowPolyFacet(ctx, [
                { x: this.x - 14, y: this.y + 6 + bob },
                { x: this.x + 14, y: this.y + 6 + bob },
                { x: this.x + 10, y: this.y + 1 + bob },
                { x: this.x - 10, y: this.y + 1 + bob }
            ], { x: 0, y: -0.5, z: 0.86 }, '#2f3542');

            drawLowPolyFacet(ctx, [
                { x: this.x - 14, y: this.y + 6 + bob },
                { x: this.x + 14, y: this.y + 6 + bob },
                { x: this.x + 16, y: this.y + 12 + bob },
                { x: this.x - 16, y: this.y + 12 + bob }
            ], { x: 0, y: 0.8, z: 0.6 }, '#1e222b');

            // Octahedron vertices
            const R = 13;
            const pts3d = [
                { x: 0, y: -R, z: 0 },
                { x: 0, y: R, z: 0 },
                { x: -R, y: 0, z: -R },
                { x: R, y: 0, z: -R },
                { x: R, y: 0, z: R },
                { x: -R, y: 0, z: R }
            ];

            const rotX = Date.now() / 150;
            const rotY = Date.now() / 100;

            const rotated = pts3d.map(v => {
                let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                return { x: x1, y: y2, z: z2 };
            });

            const proj = rotated.map(r => {
                const dist = 120;
                const scale = 1.0 / (1.0 + r.z / dist);
                return { x: this.x + r.x * scale, y: this.y - 4 + bob + r.y * scale };
            });

            const isBright = Math.floor(Date.now() / 150) % 2 === 0;
            const bulbColor = isBright ? '#ff4757' : '#b31522';

            const faces = [
                [0, 5, 4], [0, 4, 3], [0, 3, 2], [0, 2, 5],
                [1, 4, 5], [1, 3, 4], [1, 2, 3], [1, 5, 2]
            ];

            // Render visible faces
            faces.forEach(f => {
                const norm = getNormal(rotated[f[0]], rotated[f[1]], rotated[f[2]]);
                if (norm.z > 0) {
                    drawLowPolyFacet(ctx, [proj[f[0]], proj[f[1]], proj[f[2]]], norm, bulbColor);
                }
            });

            // Flashing light rays
            if (isBright) {
                ctx.strokeStyle = 'rgba(255, 71, 87, 0.4)';
                ctx.lineWidth = 1.5;
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - 4 + bob);
                    ctx.lineTo(this.x + Math.cos(angle) * 22, this.y - 4 + bob + Math.sin(angle) * 22);
                    ctx.stroke();
                }
            }
        }
        else if (this.type === 'qa_bugger') {
            // QA 재오픈: Purple cyber beetle bug with animated needle legs
            // Octahedron purple body
            const R = 9;
            const pts3d = [
                { x: 0, y: -R, z: 0 },
                { x: 0, y: R, z: 0 },
                { x: -R, y: 0, z: -R },
                { x: R, y: 0, z: -R },
                { x: R, y: 0, z: R },
                { x: -R, y: 0, z: R }
            ];

            const rotX = 0.3;
            const rotY = Date.now() / 250;

            const rotated = pts3d.map(v => {
                let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                return { x: x1, y: y2, z: z2 };
            });

            const proj = rotated.map(r => {
                const dist = 120;
                const scale = 1.0 / (1.0 + r.z / dist);
                return { x: this.x + r.x * scale, y: this.y + bob + r.y * scale };
            });

            const faces = [
                [0, 5, 4], [0, 4, 3], [0, 3, 2], [0, 2, 5],
                [1, 4, 5], [1, 3, 4], [1, 2, 3], [1, 5, 2]
            ];

            faces.forEach(f => {
                const norm = getNormal(rotated[f[0]], rotated[f[1]], rotated[f[2]]);
                if (norm.z > 0) {
                    drawLowPolyFacet(ctx, [proj[f[0]], proj[f[1]], proj[f[2]]], norm, '#8854d0');
                }
            });

            // Head (tetrahedron at front)
            const headPts = [
                { x: 0, y: -4, z: 8 },
                { x: -4, y: 0, z: 4 },
                { x: 4, y: 0, z: 4 },
                { x: 0, y: 3, z: 4 }
            ];
            const headProj = headPts.map(v => {
                const dist = 120;
                const scale = 1.0 / (1.0 + v.z / dist);
                return { x: this.x + v.x * scale, y: this.y - 7 + bob + v.y * scale };
            });
            drawLowPolyFacet(ctx, [headProj[0], headProj[1], headProj[2]], { x: 0, y: -0.3, z: 0.95 }, '#571f9c');
            drawLowPolyFacet(ctx, [headProj[0], headProj[2], headProj[3]], { x: 0.8, y: 0.5, z: 0.3 }, '#3d1273');
            drawLowPolyFacet(ctx, [headProj[0], headProj[3], headProj[1]], { x: -0.8, y: 0.5, z: 0.3 }, '#3d1273');

            // Glowing green eyes (diamonds)
            const drawEye = (cx, cy) => {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.moveTo(cx, cy - 2);
                ctx.lineTo(cx + 2, cy);
                ctx.lineTo(cx, cy + 2);
                ctx.lineTo(cx - 2, cy);
                ctx.closePath();
                ctx.fill();
            };
            drawEye(this.x - 3, this.y - 8 + bob);
            drawEye(this.x + 3, this.y - 8 + bob);

            // Animated walking legs (needle segments)
            const legCycle = Date.now() / 80;
            const drawLegSegment = (x1, y1, x2, y2) => {
                const dx = x2 - x1, dy = y2 - y1;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len * 1.5, ny = dx / len * 1.5;
                drawLowPolyFacet(ctx, [
                    { x: x1 - nx, y: y1 - ny },
                    { x: x1 + nx, y: y1 + ny },
                    { x: x2, y: y2 }
                ], { x: 0, y: 0, z: 1.0 }, '#3d1273');
            };

            for (let i = 0; i < 6; i++) {
                const isLeft = i < 3;
                const legIdx = i % 3;
                const angleOffset = legIdx * Math.PI / 3;
                const kneeX = this.x + (isLeft ? -12 : 12) + Math.cos(legCycle + angleOffset) * 3;
                const kneeY = this.y - 2 + Math.sin(legCycle + angleOffset) * 3 + bob;
                const footX = this.x + (isLeft ? -20 : 20) + Math.cos(legCycle + angleOffset + 0.5) * 4;
                const footY = this.y + 11 + Math.sin(legCycle + angleOffset + 0.5) * 2 + bob;

                drawLegSegment(this.x + (isLeft ? -4 : 4), this.y + bob, kneeX, kneeY);
                drawLegSegment(kneeX, kneeY, footX, footY);
            }
        }
        else if (this.type === 'unit_test') {
            // 단위테스트 실패: 3D rotating warning cube with FAIL text
            const R = 12;
            const pts3d = [
                { x: -R, y: -R, z: -R }, { x: R, y: -R, z: -R }, { x: R, y: -R, z: R }, { x: -R, y: -R, z: R },
                { x: -R, y: R, z: -R }, { x: R, y: R, z: -R }, { x: R, y: R, z: R }, { x: -R, y: R, z: R }
            ];
            const rotX = Date.now() / 350;
            const rotY = Date.now() / 250;
            const rotated = pts3d.map(v => {
                let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                return { x: x1, y: y2, z: z2 };
            });
            const proj = rotated.map(r => {
                const dist = 120;
                const scale = 1.0 / (1.0 + r.z / dist);
                return { x: this.x + r.x * scale, y: this.y + bob + r.y * scale };
            });

            const cubeFaces = [
                { idxs: [3, 2, 6, 7], norm: { x: 0, y: 0, z: 1 } },  // front
                { idxs: [7, 6, 5, 4], norm: { x: 0, y: -1, z: 0 } }, // top
                { idxs: [0, 3, 7, 4], norm: { x: -1, y: 0, z: 0 } }, // left
                { idxs: [2, 1, 5, 6], norm: { x: 1, y: 0, z: 0 } },  // right
                { idxs: [1, 0, 4, 5], norm: { x: 0, y: 0, z: -1 } }, // back
                { idxs: [0, 1, 2, 3], norm: { x: 0, y: 1, z: 0 } }   // bottom
            ];

            cubeFaces.forEach(f => {
                const rotatedFacePts = f.idxs.map(idx => rotated[idx]);
                const norm = getNormal(rotatedFacePts[0], rotatedFacePts[1], rotatedFacePts[2]);
                if (norm.z > 0) {
                    const drawPts = f.idxs.map(idx => proj[idx]);
                    drawLowPolyFacet(ctx, drawPts, norm, '#ff6b6b');
                }
            });

            // "FAIL" warning text in the center
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('FAIL', this.x, this.y + bob);
        }
        else if (this.type === 'meeting') {
            // 끝없는 업무회의: 3D rotating dialog chat bubble mesh
            const R = 13;
            const H_depth = 5;
            const pts3d = [];
            const rotX = 0.2;
            const rotY = Date.now() / 250;

            // Generate a 3D hexagon chat bubble shape
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const rx = Math.cos(angle) * R;
                const ry = Math.sin(angle) * R * 0.7;
                pts3d.push({ x: rx, y: ry, z: -H_depth }); // top layer
                pts3d.push({ x: rx, y: ry, z: H_depth });  // bot layer
            }
            // Add talk tail tip
            pts3d.push({ x: -4, y: 8, z: -H_depth });  // 12
            pts3d.push({ x: -4, y: 8, z: H_depth });   // 13
            pts3d.push({ x: -12, y: 15, z: 0 });       // 14: tip

            const rotated = pts3d.map(v => {
                let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                return { x: x1, y: y2, z: z2 };
            });

            const proj = rotated.map(r => {
                const dist = 120;
                const scale = 1.0 / (1.0 + r.z / dist);
                return { x: this.x + r.x * scale, y: this.y + bob + r.y * scale };
            });

            // Draw front face hexagon
            const frontPts = [0, 2, 4, 6, 8, 10].map(idx => proj[idx]);
            const frontRot = [0, 2, 4, 6, 8, 10].map(idx => rotated[idx]);
            const frontNorm = getNormal(frontRot[0], frontRot[1], frontRot[2]);
            if (frontNorm.z > 0) {
                drawLowPolyFacet(ctx, frontPts, frontNorm, '#a55eea');
            }

            // Draw back face hexagon
            const backPts = [1, 3, 5, 7, 9, 11].map(idx => proj[idx]);
            const backRot = [1, 3, 5, 7, 9, 11].map(idx => rotated[idx]);
            const backNorm = getNormal(backRot[0], backRot[1], backRot[2]);
            if (backNorm.z > 0) {
                drawLowPolyFacet(ctx, backPts, backNorm, '#8844cc');
            }

            // Side panels
            for (let i = 0; i < 6; i++) {
                const currT = i * 2;
                const nextT = ((i + 1) % 6) * 2;
                const norm = getNormal(rotated[currT], rotated[nextT], rotated[nextT + 1]);
                if (norm.z > 0) {
                    drawLowPolyFacet(ctx, [proj[currT], proj[nextT], proj[nextT + 1], proj[currT + 1]], norm, '#703bb0');
                }
            }

            // Tail panels
            const tailNorm = getNormal(rotated[12], rotated[14], rotated[13]);
            if (tailNorm.z > 0) {
                drawLowPolyFacet(ctx, [proj[12], proj[14], proj[13]], tailNorm, '#703bb0');
            }

            // Upright emoji icon in the center
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px Arial';
            ctx.fillText('💬', this.x, this.y + bob + 2);
        }
        else if (this.type === 'biz_user') {
            // 현업 요구/독촉: Ticking folding origami alarm letter envelope
            ctx.save();
            
            const foldAngle = Math.sin(Date.now() / 120) * 0.4 - 0.4;
            const topY = -10 + Math.sin(foldAngle) * 12;
            const topZ = Math.cos(foldAngle) * 12;

            // Envelope base panel
            drawLowPolyFacet(ctx, [
                { x: this.x - 16, y: this.y - 10 + bob },
                { x: this.x + 16, y: this.y - 10 + bob },
                { x: this.x + 16, y: this.y + 10 + bob },
                { x: this.x - 16, y: this.y + 10 + bob }
            ], { x: 0, y: 0.2, z: 0.98 }, '#fa8231');

            // Left flap
            drawLowPolyFacet(ctx, [
                { x: this.x - 16, y: this.y - 10 + bob },
                { x: this.x - 16, y: this.y + 10 + bob },
                { x: this.x, y: this.y + bob }
            ], { x: -0.5, y: 0, z: 0.86 }, '#e17022');

            // Right flap
            drawLowPolyFacet(ctx, [
                { x: this.x + 16, y: this.y - 10 + bob },
                { x: this.x + 16, y: this.y + 10 + bob },
                { x: this.x, y: this.y + bob }
            ], { x: 0.5, y: 0, z: 0.86 }, '#e17022');

            // Bottom flap
            drawLowPolyFacet(ctx, [
                { x: this.x - 16, y: this.y + 10 + bob },
                { x: this.x + 16, y: this.y + 10 + bob },
                { x: this.x, y: this.y + bob }
            ], { x: 0, y: 0.5, z: 0.86 }, '#fa8231');

            // Animated top flap (open/close)
            const topProj = project3D(0, topY, topZ, 0, 0, 0, this.x, this.y + bob);
            drawLowPolyFacet(ctx, [
                { x: this.x - 16, y: this.y - 10 + bob },
                { x: this.x + 16, y: this.y - 10 + bob },
                topProj
            ], { x: 0, y: -0.5, z: 0.86 }, '#ff9f43');

            // Drawing urgent alarm symbol (!)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px "Press Start 2P"';
            ctx.fillText('!', this.x, this.y + bob + 3);

            ctx.restore();
        }
        else if (this.type === 'ceo_boss') {
            // 운영 배포 사고: Giant 3-Column Server Monolith
            const drawBox = (cx, cy, w, h, d, baseColor) => {
                const w2 = w/2, h2 = h/2, d2 = d/2;
                const pts3d = [
                    { x: cx - w2, y: cy + h2, z: -d2 },  // 0: bottom back left
                    { x: cx + w2, y: cy + h2, z: -d2 },  // 1: bottom back right
                    { x: cx + w2, y: cy + h2, z: d2 },   // 2: bottom front right
                    { x: cx - w2, y: cy + h2, z: d2 },   // 3: bottom front left
                    { x: cx - w2, y: cy - h2, z: -d2 },  // 4: top back left
                    { x: cx + w2, y: cy - h2, z: -d2 },  // 5: top back right
                    { x: cx + w2, y: cy - h2, z: d2 },   // 6: top front right
                    { x: cx - w2, y: cy - h2, z: d2 }    // 7: top front left
                ];

                const rotX = 0.15, rotY = -0.15;
                const proj = pts3d.map(v => project3D(v.x, v.y, v.z, rotX, rotY, 0, this.x, this.y + bob));

                // Visible faces
                drawLowPolyFacet(ctx, [proj[3], proj[2], proj[6], proj[7]], { x: 0, y: 0.2, z: 0.98 }, baseColor);
                drawLowPolyFacet(ctx, [proj[7], proj[6], proj[5], proj[4]], { x: 0, y: -0.9, z: 0.43 }, scaleColor(baseColor, 1.25));
                drawLowPolyFacet(ctx, [proj[0], proj[3], proj[7], proj[4]], { x: -0.98, y: 0.2, z: 0 }, scaleColor(baseColor, 0.8));
                drawLowPolyFacet(ctx, [proj[2], proj[1], proj[5], proj[6]], { x: 0.98, y: 0.2, z: 0 }, scaleColor(baseColor, 0.75));
            };

            // Draw three pillars
            drawBox(-16, 6, 12, 44, 10, '#2c3e50'); // Left Column
            drawBox(16, 6, 12, 44, 10, '#2c3e50');  // Right Column
            drawBox(0, -2, 16, 56, 14, '#1e272e');  // Center Column (tallest server)

            // Warning LED core on center server front panel
            const blink = Math.floor(Date.now() / 250) % 2 === 0;
            ctx.fillStyle = blink ? 'rgba(235, 59, 90, 0.85)' : '#4b1420';
            ctx.strokeStyle = '#eb3b5a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(this.x - 6, this.y - 8 + bob, 12, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = blink ? '#ffffff' : '#eb3b5a';
            ctx.font = 'bold 5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('OUTAGE', this.x, this.y - 2 + bob);

            // Flashing mini LED beads on side racks
            for (let i = 0; i < 4; i++) {
                const ly = this.y - 18 + i * 8 + bob;
                ctx.fillStyle = (i % 2 === 0 ? blink : !blink) ? '#eb3b5a' : '#4b1420';
                ctx.fillRect(this.x - 13, ly, 2, 2);
                ctx.fillStyle = (i % 2 !== 0 ? blink : !blink) ? '#f1c40f' : '#7f6a00';
                ctx.fillRect(this.x + 11, ly, 2, 2);
            }

            // Low-poly triangular smoke sparks venting from sides
            if (Math.random() < 0.15) {
                game.particles.push({
                    type: 'smoke',
                    x: this.x + (Math.random() - 0.5) * 32,
                    y: this.y - 22 + bob,
                    vx: (Math.random() - 0.5) * 15,
                    vy: -22 - Math.random() * 20,
                    color: Math.random() < 0.5 ? '#eb3b5a' : '#ff7675',
                    size: 3 + Math.random() * 4,
                    life: 0.8,
                    maxLife: 0.8,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 5
                });
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

    getName() {
        if (this.type === 'keyboard') {
            if (this.level >= 5) return '초와이드 개발 스테이션';
            if (this.level >= 3) return '듀얼 모니터 기계식 키보드';
            return '기계식 키보드';
        }
        if (this.type === 'mouse') {
            if (this.level >= 5) return '인체공학 버티컬 마우스';
            if (this.level >= 3) return 'VPN 감속 마우스';
            return '게이밍 마우스';
        }
        if (this.type === 'laptop') {
            if (this.level >= 5) return 'AI GPU 서버 클러스터';
            if (this.level >= 3) return 'Kubernetes 컨테이너';
            return 'IDE 서버';
        }
        if (this.type === 'iphone') {
            if (this.level >= 5) return 'ELK 로그 추적 시스템';
            if (this.level >= 3) return 'Jenkins 파이프라인';
            return 'Jenkins CI';
        }
        if (this.type === 'headset') {
            if (this.level >= 5) return 'Grafana 대시보드';
            if (this.level >= 3) return 'Prometheus 메트릭';
            return 'AI Assistant';
        }
        if (this.type === 'coffee') {
            if (this.level >= 5) return '분산 데이터베이스';
            if (this.level >= 3) return 'Redis Cache 버퍼';
            return 'PostgreSQL 서버';
        }
        if (this.type === 'snack') {
            if (this.level >= 5) return '무제한 간식 냉장고';
            if (this.level >= 3) return '탕비실 간식바구니';
            return '간식 박스';
        }
        return this.name;
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
            game.log(`[SYSTEM] ${this.getName()} 타워 Level ${this.level}로 업그레이드!`);
            
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

        // Draw drop shadow (projected low-poly shadow)
        const shadowPts = [
            { x: this.x - 20, y: this.y },
            { x: this.x, y: this.y - 10 },
            { x: this.x + 20, y: this.y },
            { x: this.x, y: this.y + 10 }
        ];
        drawProjectedShadow(ctx, shadowPts, 12);

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
            ctx.strokeRect(this.x - 22, this.y - 22, 44, 44);
        }

        // Draw level stars
        ctx.fillStyle = '#ffcc00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        let stars = '';
        for (let i = 0; i < this.level; i++) stars += '★';
        ctx.fillText(stars, this.x, this.y - 22);

        // If frozen / disabled by Shaman's spell
        if (this.buggedTimer > 0) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.45)';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - 18, this.y + 14);
            ctx.lineTo(this.x - 20, this.y - 14);
            ctx.lineTo(this.x, this.y - 22);
            ctx.lineTo(this.x + 20, this.y - 14);
            ctx.lineTo(this.x + 18, this.y + 14);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.font = '10px Arial';
            ctx.fillText('❄️', this.x, this.y + 3);
            ctx.restore();
            return;
        }

        const bob = Math.sin(Date.now() / 200 + this.x) * 1.0;

        const getNormal = (A, B, C) => {
            const ux = B.x - A.x, uy = B.y - A.y, uz = B.z - A.z;
            const vx = C.x - A.x, vy = C.y - A.y, vz = C.z - A.z;
            const nx = uy * vz - uz * vy;
            const ny = uz * vx - ux * vz;
            const len = Math.hypot(nx, ny) || 1;
            return { x: nx / len, y: ny / len, z: nz / len };
        };

        if (this.type === 'keyboard') {
            ctx.save();
            if (this.level >= 5) {
                // 초와이드 개발 스테이션: Ultra-wide curved screen workstation
                drawLowPolyFacet(ctx, [
                    {x: this.x - 20, y: this.y + 6 + bob},
                    {x: this.x + 20, y: this.y + 6 + bob},
                    {x: this.x + 22, y: this.y + 14 + bob},
                    {x: this.x - 22, y: this.y + 14 + bob}
                ], {x: 0, y: 0.8, z: 0.6}, '#b58f70'); // wood table desk
                
                ctx.fillStyle = '#2f3542';
                ctx.fillRect(this.x - 2, this.y + bob, 4, 8); // stand
                
                // Curved low-poly monitor wings
                drawLowPolyFacet(ctx, [
                    {x: this.x - 22, y: this.y - 12 + bob},
                    {x: this.x - 8, y: this.y - 10 + bob},
                    {x: this.x - 8, y: this.y + 2 + bob},
                    {x: this.x - 22, y: this.y + 0 + bob}
                ], {x: -0.5, y: 0.2, z: 0.86}, '#1c1f26');
                drawLowPolyFacet(ctx, [
                    {x: this.x - 8, y: this.y - 10 + bob},
                    {x: this.x + 8, y: this.y - 10 + bob},
                    {x: this.x + 8, y: this.y + 2 + bob},
                    {x: this.x - 8, y: this.y + 2 + bob}
                ], {x: 0, y: 0.2, z: 0.98}, '#2f3542');
                drawLowPolyFacet(ctx, [
                    {x: this.x + 8, y: this.y - 10 + bob},
                    {x: this.x + 22, y: this.y - 12 + bob},
                    {x: this.x + 22, y: this.y + 0 + bob},
                    {x: this.x + 8, y: this.y + 2 + bob}
                ], {x: 0.5, y: 0.2, z: 0.86}, '#1c1f26');
                
                ctx.fillStyle = '#00ffcc'; // Screen code lines glow
                ctx.fillRect(this.x - 6, this.y - 7 + bob, 12, 6);
            } else if (this.level >= 3) {
                // 듀얼 모니터 기계식 키보드: Desk with dual screen monitors
                drawLowPolyFacet(ctx, [
                    {x: this.x - 18, y: this.y + 6 + bob},
                    {x: this.x + 18, y: this.y + 6 + bob},
                    {x: this.x + 20, y: this.y + 12 + bob},
                    {x: this.x - 20, y: this.y + 12 + bob}
                ], {x: 0, y: 0.8, z: 0.6}, '#85583f');
                
                ctx.fillStyle = '#2f3542';
                ctx.fillRect(this.x - 1, this.y + bob, 2, 8); // Stand
                
                drawLowPolyFacet(ctx, [
                    {x: this.x - 16, y: this.y - 10 + bob},
                    {x: this.x - 1, y: this.y - 8 + bob},
                    {x: this.x - 1, y: this.y + 2 + bob},
                    {x: this.x - 16, y: this.y + 0 + bob}
                ], {x: -0.3, y: 0.2, z: 0.95}, '#1c1f26'); // Screen 1
                drawLowPolyFacet(ctx, [
                    {x: this.x + 1, y: this.y - 8 + bob},
                    {x: this.x + 16, y: this.y - 10 + bob},
                    {x: this.x + 16, y: this.y + 0 + bob},
                    {x: this.x + 1, y: this.y + 2 + bob}
                ], {x: 0.3, y: 0.2, z: 0.95}, '#1c1f26'); // Screen 2
            } else {
                // Base mechanical keyboard
                ctx.shadowBlur = 8;
                ctx.shadowColor = ['#ff007f', '#00ecc6', '#39ff14', '#ffff00'][Math.floor(Date.now() / 300) % 4];
                drawLowPolyFacet(ctx, [
                    { x: this.x - 18, y: this.y - 8 + bob },
                    { x: this.x + 18, y: this.y - 8 + bob },
                    { x: this.x + 20, y: this.y + 6 + bob },
                    { x: this.x - 20, y: this.y + 6 + bob }
                ], { x: 0, y: 0.2, z: 0.98 }, '#2f3542');
                ctx.shadowBlur = 0;
                drawLowPolyFacet(ctx, [
                    { x: this.x - 20, y: this.y + 6 + bob },
                    { x: this.x + 20, y: this.y + 6 + bob },
                    { x: this.x + 22, y: this.y + 12 + bob },
                    { x: this.x - 22, y: this.y + 12 + bob }
                ], { x: 0, y: 0.8, z: 0.6 }, '#1c1f26');
                drawLowPolyFacet(ctx, [
                    { x: this.x - 18, y: this.y - 8 + bob },
                    { x: this.x - 20, y: this.y + 6 + bob },
                    { x: this.x - 22, y: this.y + 12 + bob },
                    { x: this.x - 18, y: this.y + 12 + bob }
                ], { x: -0.9, y: 0.3, z: 0.3 }, '#222831');
                drawLowPolyFacet(ctx, [
                    { x: this.x + 18, y: this.y - 8 + bob },
                    { x: this.x + 20, y: this.y + 6 + bob },
                    { x: this.x + 22, y: this.y + 12 + bob },
                    { x: this.x + 18, y: this.y + 12 + bob }
                ], { x: 0.9, y: 0.3, z: 0.3 }, '#222831');
                const keyColors = ['#00f0ff', '#ff8fa3', '#ffffff', '#2ecc71', '#e5c290'];
                for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                    for (let colIdx = 0; colIdx < 5; colIdx++) {
                        const kx = this.x - 14 + colIdx * 7;
                        const ky = this.y - 5 + rowIdx * 5 + bob;
                        const kColor = keyColors[(rowIdx + colIdx) % keyColors.length];
                        ctx.fillStyle = kColor;
                        ctx.fillRect(kx, ky, 5, 3.5);
                        ctx.fillStyle = scaleColor(kColor, 0.7);
                        ctx.fillRect(kx, ky + 3.5, 5, 1.5);
                    }
                }
            }
            ctx.strokeStyle = '#747d8c';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 8 + bob);
            ctx.quadraticCurveTo(this.x + 6, this.y - 14 + bob, this.x - 3, this.y - 19 + bob);
            ctx.stroke();
            ctx.restore();
        } 
        else if (this.type === 'mouse') {
            ctx.save();
            if (this.level >= 5) {
                // 인체공학 버티컬 마우스: Slanted ergonomic high-profile prism
                drawLowPolyFacet(ctx, [
                    {x: this.x - 8, y: this.y - 14 + bob},
                    {x: this.x + 6, y: this.y - 8 + bob},
                    {x: this.x + 10, y: this.y + 12 + bob},
                    {x: this.x - 10, y: this.y + 12 + bob}
                ], {x: 0.4, y: 0.8, z: 0.4}, '#34495e');
                drawLowPolyFacet(ctx, [
                    {x: this.x - 8, y: this.y - 14 + bob},
                    {x: this.x - 10, y: this.y + 12 + bob},
                    {x: this.x - 12, y: this.y + 4 + bob}
                ], {x: -0.9, y: 0.2, z: 0.3}, '#2c3e50');
                ctx.fillStyle = '#ff7675'; // Glowing LED highlight strip
                ctx.fillRect(this.x + 2, this.y - 4 + bob, 3, 8);
            } else {
                // Base Gaming Mouse
                const pts3d = [
                    { x: 0, y: -16, z: 0 }, { x: -12, y: 4, z: 0 }, { x: 12, y: 4, z: 0 }, { x: 0, y: 16, z: 0 },
                    { x: 0, y: -6, z: 7 }, { x: 0, y: 0, z: 11 }, { x: 0, y: 10, z: 7 }
                ];
                const rotX = 0.12, rotY = -0.15;
                const proj = pts3d.map(v => project3D(v.x, v.y, v.z, rotX, rotY, 0, this.x, this.y + bob));
                const faces = [
                    { pts: [0, 1, 4], norm: { x: -0.7, y: -0.5, z: 0.5 } },
                    { pts: [0, 4, 2], norm: { x: 0.7, y: -0.5, z: 0.5 } },
                    { pts: [4, 1, 5], norm: { x: -0.8, y: 0.0, z: 0.6 } },
                    { pts: [4, 5, 2], norm: { x: 0.8, y: 0.0, z: 0.6 } },
                    { pts: [5, 1, 6], norm: { x: -0.6, y: 0.5, z: 0.62 } },
                    { pts: [5, 6, 2], norm: { x: 0.6, y: 0.5, z: 0.62 } },
                    { pts: [6, 1, 3], norm: { x: -0.4, y: 0.8, z: 0.45 } },
                    { pts: [6, 3, 2], norm: { x: 0.4, y: 0.8, z: 0.45 } }
                ];
                faces.forEach(f => {
                    const drawPts = f.pts.map(idx => proj[idx]);
                    drawLowPolyFacet(ctx, drawPts, f.norm, '#1e272e');
                });
                
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#39ff14';
                ctx.strokeStyle = '#39ff14';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(proj[0].x, proj[0].y);
                ctx.lineTo(proj[4].x, proj[4].y);
                ctx.lineTo(proj[5].x, proj[5].y);
                ctx.lineTo(proj[6].x, proj[6].y);
                ctx.lineTo(proj[3].x, proj[3].y);
                ctx.stroke();
                
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(proj[4].x - 1, proj[4].y, 2, 4);
                
                if (this.level >= 3) {
                    // VPN 감속 마우스 overlay shield box
                    ctx.strokeStyle = '#00d2d3';
                    ctx.lineWidth = 1.2;
                    ctx.shadowColor = '#00d2d3';
                    ctx.strokeRect(this.x - 14, this.y - 14 + bob, 28, 28);
                }
            }
            ctx.restore();
        } 
        else if (this.type === 'laptop') {
            ctx.save();
            if (this.level >= 5) {
                // AI GPU 서버 클러스터: Cabinet with dual rotating cooling fan blades
                drawLowPolyFacet(ctx, [
                    { x: this.x - 16, y: this.y - 20 + bob },
                    { x: this.x + 16, y: this.y - 20 + bob },
                    { x: this.x + 18, y: this.y - 16 + bob },
                    { x: this.x - 18, y: this.y - 16 + bob }
                ], { x: 0, y: -0.5, z: 0.86 }, '#2f3542');
                drawLowPolyFacet(ctx, [
                    { x: this.x - 18, y: this.y - 16 + bob },
                    { x: this.x + 18, y: this.y - 16 + bob },
                    { x: this.x + 18, y: this.y + 16 + bob },
                    { x: this.x - 18, y: this.y + 16 + bob }
                ], { x: 0, y: 0.8, z: 0.6 }, '#1e272e');
                
                const fanAngle = Date.now() / 120;
                const drawFan = (cx, cy) => {
                    ctx.strokeStyle = '#00ffcc';
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx - Math.cos(fanAngle)*5, cy - Math.sin(fanAngle)*5);
                    ctx.lineTo(cx + Math.cos(fanAngle)*5, cy + Math.sin(fanAngle)*5);
                    ctx.moveTo(cx - Math.sin(fanAngle)*5, cy + Math.cos(fanAngle)*5);
                    ctx.lineTo(cx + Math.sin(fanAngle)*5, cy - Math.cos(fanAngle)*5);
                    ctx.stroke();
                };
                drawFan(this.x - 8, this.y - 2 + bob);
                drawFan(this.x + 8, this.y - 2 + bob);
                
                ctx.fillStyle = '#ffcc00'; // Gold accent led strip
                ctx.fillRect(this.x - 12, this.y - 12 + bob, 24, 2);
            } else if (this.level >= 3) {
                // Kubernetes 컨테이너: Stack of 3 mini glowing blue container boxes
                const drawPod = (cx, cy, color) => {
                    drawLowPolyFacet(ctx, [
                        {x: cx - 8, y: cy - 4 + bob},
                        {x: cx + 8, y: cy - 4 + bob},
                        {x: cx + 10, y: cy + bob},
                        {x: cx - 10, y: cy + bob}
                    ], {x: 0, y: -0.5, z: 0.86}, color);
                    drawLowPolyFacet(ctx, [
                        {x: cx - 10, y: cy + bob},
                        {x: cx + 10, y: cy + bob},
                        {x: cx + 10, y: cy + 8 + bob},
                        {x: cx - 10, y: cy + 8 + bob}
                    ], {x: 0, y: 0.8, z: 0.6}, scaleColor(color, 0.8));
                };
                drawPod(this.x - 8, this.y + 4, '#3498db');
                drawPod(this.x + 8, this.y + 4, '#3498db');
                drawPod(this.x, this.y - 6, '#00f0ff');
            } else {
                // Base IDE Server
                const drawServerUnit = (cy, w, h, baseColor) => {
                    const w2 = w / 2, h2 = h / 2;
                    drawLowPolyFacet(ctx, [
                        { x: this.x - w2, y: cy - h2 + bob },
                        { x: this.x + w2, y: cy - h2 + bob },
                        { x: this.x + w2 + 2, y: cy - h2 + 4 + bob },
                        { x: this.x - w2 - 2, y: cy - h2 + 4 + bob }
                    ], { x: 0, y: -0.5, z: 0.86 }, baseColor);
                    drawLowPolyFacet(ctx, [
                        { x: this.x - w2 - 2, y: cy - h2 + 4 + bob },
                        { x: this.x + w2 + 2, y: cy - h2 + 4 + bob },
                        { x: this.x + w2 + 2, y: cy + h2 + bob },
                        { x: this.x - w2 - 2, y: cy + h2 + bob }
                    ], { x: 0, y: 0.8, z: 0.6 }, scaleColor(baseColor, 0.8));
                };
                drawServerUnit(6, 36, 12, '#3f4b5b');
                drawServerUnit(-6, 36, 12, '#3f4b5b');
                
                const blink = Math.floor(Date.now() / 300) % 2 === 0;
                ctx.shadowBlur = 6;
                ctx.shadowColor = blink ? '#2ecc71' : '#e74c3c';
                const drawLed = (cx, cy, color) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - 2); ctx.lineTo(cx + 2, cy);
                    ctx.lineTo(cx, cy + 2); ctx.lineTo(cx - 2, cy);
                    ctx.closePath(); ctx.fill();
                };
                drawLed(this.x - 14, this.y - 4 + bob, blink ? '#2ecc71' : '#27ae60');
                drawLed(this.x - 14, this.y + 8 + bob, !blink ? '#e74c3c' : '#c0392b');
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(this.x - 9, this.y - 5 + bob, 5, 3);
                ctx.fillRect(this.x - 9, this.y + 7 + bob, 5, 3);
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(this.x + 2, this.y - 7 + bob, 14, 20);
                ctx.strokeStyle = '#57606f';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x + 2, this.y - 7 + bob, 14, 20);
                ctx.fillStyle = '#00ecc6';
                ctx.fillRect(this.x + 4, this.y - 4 + bob, 10, 1.5);
                ctx.fillRect(this.x + 4, this.y - 1 + bob, 7, 1.5);
                ctx.fillRect(this.x + 4, this.y + 2 + bob, 11, 1.5);
                ctx.fillRect(this.x + 4, this.y + 5 + bob, 8, 1.5);
            }
            ctx.restore();
        } 
        else if (this.type === 'iphone') {
            ctx.save();
            if (this.level >= 5) {
                // ELK 로그 추적 시스템: Orange stacked hexagon prisms with bar graphs
                const drawHexElk = (cy, color) => {
                    const topPts = [], botPts = [];
                    const R_hex = 14;
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        const rx = Math.cos(angle) * R_hex;
                        const rz = Math.sin(angle) * R_hex * 0.4;
                        topPts.push({ x: this.x + rx, y: cy - 3.5 + rz + bob });
                        botPts.push({ x: this.x + rx, y: cy + 3.5 + rz + bob });
                    }
                    drawLowPolyFacet(ctx, topPts, { x: 0, y: -1, z: 0 }, color);
                    for (let i = 0; i < 6; i++) {
                        const next = (i + 1) % 6;
                        drawLowPolyFacet(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], { x: 0, y: 0.8, z: 0.6 }, scaleColor(color, 0.8 - (i%2)*0.1));
                    }
                };
                drawHexElk(this.y + 10, '#fa8231');
                drawHexElk(this.y + 2, '#fa8231');
                drawHexElk(this.y - 6, '#fa8231');
                
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(this.x - 6, this.y - 1 + bob, 3, 4);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(this.x - 1, this.y - 3 + bob, 3, 6);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(this.x + 4, this.y + bob, 3, 3);
            } else if (this.level >= 3) {
                // Jenkins 파이프라인: Conveyor belt connector with stage blocks
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(this.x - 16, this.y + 8 + bob, 32, 4);
                
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(this.x - 12, this.y - 4 + bob, 6, 6);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(this.x, this.y - 6 + bob, 6, 6);
                ctx.fillStyle = '#3498db';
                ctx.fillRect(this.x + 8, this.y - 2 + bob, 6, 6);
                
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x - 9, this.y - 1 + bob);
                ctx.lineTo(this.x + 3, this.y - 3 + bob);
                ctx.lineTo(this.x + 11, this.y + 1 + bob);
                ctx.stroke();
            } else {
                // Base Jenkins CI cabinet
                drawLowPolyFacet(ctx, [
                    { x: this.x - 14, y: this.y - 18 + bob },
                    { x: this.x + 14, y: this.y - 18 + bob },
                    { x: this.x + 16, y: this.y - 14 + bob },
                    { x: this.x - 16, y: this.y - 14 + bob }
                ], { x: 0, y: -0.5, z: 0.86 }, '#4a5768');
                drawLowPolyFacet(ctx, [
                    { x: this.x - 16, y: this.y - 14 + bob },
                    { x: this.x + 16, y: this.y - 14 + bob },
                    { x: this.x + 16, y: this.y + 16 + bob },
                    { x: this.x - 16, y: this.y + 16 + bob }
                ], { x: 0, y: 0.8, z: 0.6 }, '#343f4c');
                drawLowPolyFacet(ctx, [
                    { x: this.x - 14, y: this.y - 18 + bob },
                    { x: this.x - 16, y: this.y - 14 + bob },
                    { x: this.x - 16, y: this.y + 16 + bob },
                    { x: this.x - 14, y: this.y + 12 + bob }
                ], { x: -0.98, y: 0.2, z: 0 }, '#1e242d');
                
                const R = 4.5;
                const pts3d = [
                    { x: 0, y: -R, z: 0 }, { x: 0, y: R, z: 0 }, { x: -R, y: 0, z: -R },
                    { x: R, y: 0, z: -R }, { x: R, y: 0, z: R }, { x: -R, y: 0, z: R }
                ];
                const rotX = 0.2, rotY = Date.now() / 200;
                const faces = [
                    [0, 5, 4], [0, 4, 3], [0, 3, 2], [0, 2, 5],
                    [1, 4, 5], [1, 3, 4], [1, 2, 3], [1, 5, 2]
                ];
                const drawStageBulb = (cy, color) => {
                    const rotated = pts3d.map(v => {
                        let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                        let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                        let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                        let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                        return { x: x1, y: y2, z: z2 };
                    });
                    const proj = rotated.map(r => {
                        const dist = 120;
                        const scale = 1.0 / (1.0 + r.z / dist);
                        return { x: this.x + r.x * scale, y: cy + bob + r.y * scale };
                    });
                    faces.forEach(f => {
                        const norm = getNormal(rotated[f[0]], rotated[f[1]], rotated[f[2]]);
                        if (norm.z > 0) {
                            drawLowPolyFacet(ctx, [proj[f[0]], proj[f[1]], proj[f[2]]], norm, color);
                        }
                    });
                };
                const pulse = Math.abs(Math.sin(Date.now() / 250)) * 0.3 + 0.7;
                drawStageBulb(this.y - 6, `rgba(46, 204, 113, ${pulse})`);
                drawStageBulb(this.y + 2, `rgba(241, 196, 15, ${pulse})`);
                drawStageBulb(this.y + 10, '#ff7675');
            }
            ctx.restore();
        } 
        else if (this.type === 'headset') {
            ctx.save();
            if (this.level >= 5) {
                // Grafana 대시보드: Wireframe cube containing bar graphs
                const edgePts = [
                    {x: -12, y: -12, z: -12}, {x: 12, y: -12, z: -12}, {x: 12, y: -12, z: 12}, {x: -12, y: -12, z: 12},
                    {x: -12, y: 12, z: -12}, {x: 12, y: 12, z: -12}, {x: 12, y: 12, z: 12}, {x: -12, y: 12, z: 12}
                ];
                const rotX = Date.now() / 400, rotY = Date.now() / 300;
                const rotated = edgePts.map(v => {
                    let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                    let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                    let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                    let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                    return { x: x1, y: y2, z: z2 };
                });
                const proj = rotated.map(r => {
                    const dist = 120;
                    const scale = 1.0 / (1.0 + r.z / dist);
                    return { x: this.x + r.x * scale, y: this.y - 2 + bob + r.y * scale };
                });
                // Connect cube frame edges
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = 1.2;
                const drawLine = (i, j) => {
                    ctx.beginPath(); ctx.moveTo(proj[i].x, proj[i].y); ctx.lineTo(proj[j].x, proj[j].y); ctx.stroke();
                };
                drawLine(0,1); drawLine(1,2); drawLine(2,3); drawLine(3,0);
                drawLine(4,5); drawLine(5,6); drawLine(6,7); drawLine(7,4);
                drawLine(0,4); drawLine(1,5); drawLine(2,6); drawLine(3,7);
                
                // Draw a mini graph bar inside cube
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(this.x - 4, this.y - 4 + bob, 3, 8);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(this.x + 1, this.y - 7 + bob, 3, 11);
            } else {
                // AI Assistant floating orb
                drawLowPolyFacet(ctx, [
                    { x: this.x - 14, y: this.y + 10 + bob },
                    { x: this.x + 14, y: this.y + 10 + bob },
                    { x: this.x + 10, y: this.y + 6 + bob },
                    { x: this.x - 10, y: this.y + 6 + bob }
                ], { x: 0, y: -0.5, z: 0.86 }, '#7f8c8d');
                drawLowPolyFacet(ctx, [
                    { x: this.x - 14, y: this.y + 10 + bob },
                    { x: this.x + 14, y: this.y + 10 + bob },
                    { x: this.x + 16, y: this.y + 16 + bob },
                    { x: this.x - 16, y: this.y + 16 + bob }
                ], { x: 0, y: 0.8, z: 0.6 }, '#5a6268');
                
                const R = this.level >= 3 ? 18 : 15;
                const phi = (1 + Math.sqrt(5)) / 2;
                const a = R / Math.sqrt(1 + phi * phi), b = phi * a;
                const vertices = [
                    { x: -a, y: b, z: 0 }, { x: a, y: b, z: 0 }, { x: -a, y: -b, z: 0 }, { x: a, y: -b, z: 0 },
                    { x: 0, y: -a, z: b }, { x: 0, y: a, z: b }, { x: 0, y: -a, z: -b }, { x: 0, y: a, z: -b },
                    { x: b, y: 0, z: -a }, { x: b, y: 0, z: a }, { x: -b, y: 0, z: -a }, { x: -b, y: 0, z: a }
                ];
                const faces = [
                    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
                    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
                    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
                    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
                ];
                const rotX = Date.now() / 450, rotY = Date.now() / 250;
                const rotated = vertices.map(v => {
                    let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                    let z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                    let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                    let z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
                    return { x: x1, y: y2, z: z2 };
                });
                const proj = rotated.map(r => {
                    const dist = 120;
                    const scale = 1.0 / (1.0 + r.z / dist);
                    return { x: this.x + r.x * scale, y: this.y - 6 + bob + r.y * scale };
                });
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.level >= 3 ? '#2ecc71' : '#00f0ff';
                faces.forEach(f => {
                    const norm = getNormal(rotated[f[0]], rotated[f[1]], rotated[f[2]]);
                    if (norm.z > 0) {
                        ctx.fillStyle = this.level >= 3 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(0, 240, 255, 0.15)';
                        ctx.strokeStyle = this.level >= 3 ? '#2ecc71' : '#00f0ff';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(proj[f[0]].x, proj[f[0]].y);
                        ctx.lineTo(proj[f[1]].x, proj[f[1]].y);
                        ctx.lineTo(proj[f[2]].x, proj[f[2]].y);
                        ctx.closePath(); ctx.fill(); ctx.stroke();
                    }
                });
                ctx.fillStyle = '#ffffff';
                proj.forEach(p => {
                    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
                });
            }
            ctx.restore();
        } 
        else if (this.type === 'coffee') {
            ctx.save();
            if (this.level >= 5) {
                // 분산 데이터베이스: 3 mini hexagonal database units in triangle
                const drawMiniHex = (cx, cy) => {
                    const topPts = [], botPts = [];
                    const R = 8;
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        topPts.push({ x: cx + Math.cos(angle)*R, y: cy - 2.5 + Math.sin(angle)*R*0.4 + bob });
                        botPts.push({ x: cx + Math.cos(angle)*R, y: cy + 2.5 + Math.sin(angle)*R*0.4 + bob });
                    }
                    drawLowPolyFacet(ctx, topPts, { x: 0, y: -1, z: 0 }, '#1dd1a1');
                    for (let i = 0; i < 6; i++) {
                        const next = (i + 1) % 6;
                        drawLowPolyFacet(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], { x: 0, y: 0.8, z: 0.6 }, '#10ac84');
                    }
                };
                drawMiniHex(this.x - 10, this.y + 6);
                drawMiniHex(this.x + 10, this.y + 6);
                drawMiniHex(this.x, this.y - 6);
                // laser link lines
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x - 10, this.y + 6 + bob);
                ctx.lineTo(this.x + 10, this.y + 6 + bob);
                ctx.lineTo(this.x, this.y - 6 + bob);
                ctx.closePath(); ctx.stroke();
            } else if (this.level >= 3) {
                // Redis Cache 버퍼: Glowing red/pink hexagonal prism base
                const R_hex = 16;
                const topPts = [], botPts = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    topPts.push({ x: this.x + Math.cos(angle)*R_hex, y: this.y - 3 + Math.sin(angle)*R_hex*0.4 + bob });
                    botPts.push({ x: this.x + Math.cos(angle)*R_hex, y: this.y + 5 + Math.sin(angle)*R_hex*0.4 + bob });
                }
                drawLowPolyFacet(ctx, topPts, { x: 0, y: -1, z: 0 }, '#ff7675');
                for (let i = 0; i < 6; i++) {
                    const next = (i + 1) % 6;
                    drawLowPolyFacet(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], { x: 0, y: 0.8, z: 0.6 }, '#d63031');
                }
                // Pulsing red LED
                const pulse = Math.abs(Math.sin(Date.now() / 150));
                ctx.fillStyle = `rgba(255, 118, 117, ${pulse})`;
                ctx.fillRect(this.x - 3, this.y - 1 + bob, 6, 4);
            } else {
                // Base 3 stacked hexagonal databases
                const dbW = 32, dbH = 7, R_hex = 15;
                const drawHexPrism = (cy, color) => {
                    const topPts = [], botPts = [];
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        topPts.push({ x: this.x + Math.cos(angle) * R_hex, y: cy - dbH / 2 + Math.sin(angle) * R_hex * 0.45 + bob });
                        botPts.push({ x: this.x + Math.cos(angle) * R_hex, y: cy + dbH / 2 + Math.sin(angle) * R_hex * 0.45 + bob });
                    }
                    drawLowPolyFacet(ctx, topPts, { x: 0, y: -1, z: 0 }, color);
                    for (let i = 0; i < 6; i++) {
                        const next = (i + 1) % 6;
                        drawLowPolyFacet(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], { x: 0, y: 0.8, z: 0.6 }, scaleColor(color, 0.8 - (i % 3) * 0.1));
                    }
                };
                drawHexPrism(this.y + 10, '#0a9396');
                drawHexPrism(this.y + 2, '#0a9396');
                drawHexPrism(this.y - 6, '#0a9396');
                const pulse = Math.floor(Date.now() / 250) % 3 === 0;
                ctx.fillStyle = pulse ? '#00f0ff' : '#005f73';
                ctx.fillRect(this.x - 2, this.y - 4 + bob, 3, 3);
                ctx.fillStyle = !pulse ? '#00f0ff' : '#005f73';
                ctx.fillRect(this.x - 2, this.y + 4 + bob, 3, 3);
            }
            ctx.restore();
        } 
        else if (this.type === 'snack') {
            ctx.save();
            if (this.level >= 5) {
                // 무제한 간식 냉장고: Small transparent box cabinet fridge with green energy drinks
                drawLowPolyFacet(ctx, [
                    {x: this.x - 12, y: this.y - 16 + bob},
                    {x: this.x + 12, y: this.y - 16 + bob},
                    {x: this.x + 14, y: this.y - 12 + bob},
                    {x: this.x - 14, y: this.y - 12 + bob}
                ], {x: 0, y: -0.5, z: 0.86}, '#34495e'); // fridge top
                
                drawLowPolyFacet(ctx, [
                    {x: this.x - 14, y: this.y - 12 + bob},
                    {x: this.x + 14, y: this.y - 12 + bob},
                    {x: this.x + 14, y: this.y + 16 + bob},
                    {x: this.x - 14, y: this.y + 16 + bob}
                ], {x: 0, y: 0.8, z: 0.6}, 'rgba(52, 152, 219, 0.4)'); // glass door
                
                // Draw 2 tiny green energy drink cans inside
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(this.x - 6, this.y - 4 + bob, 3, 6);
                ctx.fillRect(this.x + 3, this.y + 2 + bob, 3, 6);
            } else if (this.level >= 3) {
                // 탕비실 간식바구니: Beveled orange basket with detailed snacks
                drawLowPolyFacet(ctx, [
                    {x: this.x - 14, y: this.y + 4 + bob},
                    {x: this.x + 14, y: this.y + 4 + bob},
                    {x: this.x + 16, y: this.y + 14 + bob},
                    {x: this.x - 16, y: this.y + 14 + bob}
                ], {x: 0, y: 0.8, z: 0.6}, '#e67e22'); // orange basket base
                
                ctx.fillStyle = '#ffeaa7'; // yellow snacks
                ctx.fillRect(this.x - 8, this.y - 2 + bob, 5, 7);
                ctx.fillStyle = '#ff7675'; // red snacks
                ctx.fillRect(this.x + 2, this.y - 4 + bob, 5, 8);
            } else {
                // Base folded chip bag
                const drawSodaCan = (cx, cy) => {
                    const R = 5;
                    const topPts = [], botPts = [];
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * Math.PI * 2) / 5;
                        topPts.push({ x: cx + Math.cos(angle)*R, y: cy - 6 + Math.sin(angle)*R*0.5 });
                        botPts.push({ x: cx + Math.cos(angle)*R, y: cy + 6 + Math.sin(angle)*R*0.5 });
                    }
                    drawLowPolyFacet(ctx, topPts, { x: 0, y: -1, z: 0 }, '#bdc3c7');
                    for (let i = 0; i < 5; i++) {
                        const next = (i + 1) % 5;
                        drawLowPolyFacet(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], { x: 0, y: 0.8, z: 0.6 }, '#e74c3c');
                    }
                };
                drawSodaCan(this.x - 12, this.y + 2);
                drawLowPolyFacet(ctx, [
                    { x: this.x + 2, y: this.y + 12 }, { x: this.x + 16, y: this.y + 10 },
                    { x: this.x + 14, y: this.y - 7 }, { x: this.x + 2, y: this.y - 10 }
                ], { x: 0, y: 0.2, z: 0.98 }, '#ffeaa7');
                drawLowPolyFacet(ctx, [
                    { x: this.x + 2, y: this.y + 12 }, { x: this.x + 16, y: this.y + 10 },
                    { x: this.x + 12, y: this.y + 16 }, { x: this.x + 0, y: this.y + 18 }
                ], { x: 0, y: 0.8, z: 0.6 }, '#ffe066');
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 5px Arial';
                ctx.fillText('CHIPS', this.x + 5, this.y + 2);
            }
            ctx.restore();
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

            if (Math.random() < 0.25) {
                game.particles.push({
                    type: 'binary_trail',
                    x: this.x,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20,
                    color: this.type === 'bug_report' ? '#ff7675' : '#00ecc6',
                    size: 2,
                    char: Math.random() < 0.5 ? '0' : '1',
                    life: 0.4,
                    maxLife: 0.4
                });
            }
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
            // Retro Typewriter Keycap Prism: 30% larger beveled low-poly block
            ctx.translate(this.x, this.y);

            // Keycap outer bottom/riser (dark border)
            drawLowPolyFacet(ctx, [
                { x: -14, y: 7 },
                { x: 14, y: 7 },
                { x: 16, y: 12 },
                { x: -16, y: 12 }
            ], { x: 0, y: 0.8, z: 0.6 }, '#1c1f26');

            // Keycap top face
            drawLowPolyFacet(ctx, [
                { x: -14, y: -10 },
                { x: 14, y: -10 },
                { x: 12, y: 7 },
                { x: -12, y: 7 }
            ], { x: 0, y: 0.2, z: 0.98 }, '#2f3542');

            // Keycap face insert
            ctx.fillStyle = '#57606f';
            ctx.beginPath();
            ctx.roundRect(-10, -8, 20, 12, 1.5);
            ctx.fill();

            // Key text (C, V, Ctrl, ;, etc.) - glow cyan
            ctx.fillStyle = '#00ecc6';
            ctx.font = 'bold 9px "Press Start 2P", Courier, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const keyText = this.text || ';';
            if (keyText.length > 2) {
                ctx.font = 'bold 7px Arial, Helvetica, sans-serif';
            }
            ctx.fillText(keyText, 0, -1);
        } 
        else if (this.type === 'compile_bomb') {
            // Compilation Crash Bomb: Rotating 3D wireframe icosahedron
            const rotX = (Date.now() / 200) % (Math.PI * 2);
            const rotY = (Date.now() / 150) % (Math.PI * 2);

            const R = 14;
            const phi = (1 + Math.sqrt(5)) / 2;
            const a = R / Math.sqrt(1 + phi * phi);
            const b = phi * a;

            const vertices = [
                { x: -a, y: b, z: 0 }, { x: a, y: b, z: 0 }, { x: -a, y: -b, z: 0 }, { x: a, y: -b, z: 0 },
                { x: 0, y: -a, z: b }, { x: 0, y: a, z: b }, { x: 0, y: -a, z: -b }, { x: 0, y: a, z: -b },
                { x: b, y: 0, z: -a }, { x: b, y: 0, z: a }, { x: -b, y: 0, z: -a }, { x: -b, y: 0, z: a }
            ];

            const faces = [
                [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
                [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
                [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
                [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
            ];

            // Project 3D vertices relative to center
            const proj = vertices.map(v => project3D(v.x, v.y, v.z, rotX, rotY, 0, this.x, this.y));

            // Helper for 3D face normal
            const getNormal = (A, B, C) => {
                const ux = B.x - A.x, uy = B.y - A.y, uz = B.z - A.z;
                const vx = C.x - A.x, vy = C.y - A.y, vz = C.z - A.z;
                const nx = uy * vz - uz * vy;
                const ny = uz * vx - ux * vz;
                const len = Math.hypot(nx, ny) || 1;
                return { x: nx / len, y: ny / len, z: nz / len };
            };

            // Draw crystal faces
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff7675';
            faces.forEach(f => {
                ctx.fillStyle = 'rgba(235, 59, 90, 0.08)';
                ctx.strokeStyle = '#ff7675';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(proj[f[0]].x, proj[f[0]].y);
                ctx.lineTo(proj[f[1]].x, proj[f[1]].y);
                ctx.lineTo(proj[f[2]].x, proj[f[2]].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
            ctx.shadowBlur = 0;

            // Draw yellow exclamation warning symbol (!) upright in center
            ctx.fillStyle = '#ffd32a';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', this.x, this.y);
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
        "요구사항 변경 & 단위테스트 오류 공세 (Wave 1)",
        "레거시 코드 개편 & 갑작스러운 회의 지옥 (Wave 2)",
        "보안 감사 & 현업 요구 독촉 폭탄 (Wave 3)",
        "일정 압박 & 대규모 QA 재오픈 공습 (Wave 4)",
        "서비스 실배포 & 실서버 장애 대응 (Wave 5)"
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

        this.showDialog("어익후! 부장님이 오늘 기어이 실배포 하라고 WBS 스프린트 일정을 앞당기셨습니데이! 쏟아지는 요구사항 변경이랑 긴급 버그 티켓들을 아군 장비랑 서버들을 동원해서 방어해 보입시다! [▶ START SPRINT] 눌러서 긴급 핫픽스 롤아웃 시작하입시더!", "excited");
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
        const dialogAvatar = document.getElementById('dialog-avatar');
        if (dialogAvatar) {
            dialogAvatar.src = `chorong_${emotion}.png`;
        }
        
        if (this.dialogInterval) clearInterval(this.dialogInterval);
        if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
        
        let index = 0;
        this.dialogInterval = setInterval(() => {
            if (index < text.length) {
                dialogText.innerText += text[index];
                index++;
            } else {
                clearInterval(this.dialogInterval);
                this.dialogTimeout = setTimeout(() => {
                    dialogBox.classList.add('hidden');
                }, 5000);
            }
        }, 25);
    },

    resetGame() {
        if (this.dialogInterval) clearInterval(this.dialogInterval);
        if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
        const dialogBox = document.getElementById('jrpg-dialog-box');
        if (dialogBox) dialogBox.classList.add('hidden');

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
        this.npcs = [
            new NPC('dev', '초롱이', 0, 7),
            new NPC('dev', '민우', 1, 7),
            new NPC('qa', '수진', 0, 4),
            new NPC('pm', '김팀장', 9, 4),
            new NPC('infra', '박엔지니어', 1, 11)
        ];

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
            if (gy === 2 || gy === 5 || gy === 8) continue;
            
            // Check path conflict
            if (isPathCell(gx, gy)) continue;
            
            // Check start/end desks
            if (gx === 1 && gy === 1) continue;
            // Check duplicate
            if (this.obstacles.some(ob => ob.x === gx && ob.y === gy)) continue;
            
            // Check NPC workstations conflict
            if ((gx === 0 && gy === 7) || (gx === 1 && gy === 7) || (gx === 0 && gy === 4) || (gx === 9 && gy === 4) || (gx === 1 && gy === 11)) continue;
            
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
            const startScreen = document.getElementById('start-screen');
            const bootScreen = document.getElementById('boot-terminal-screen');
            const gameScreen = document.getElementById('game-screen');
            const bootText = document.getElementById('boot-terminal-text');

            startScreen.classList.remove('active');
            bootScreen.style.display = 'flex';
            bootScreen.classList.add('active');

            try {
                Sound.playBuild();
            } catch (err) {}

            const logs = [
                "> $ npm run deploy:overtime-hell",
                "[SYSTEM] Booting IT Defense Environment v1.0.9...",
                "[SYSTEM] Caching global dependencies: node_modules... OK",
                "[SYSTEM] Connecting database postgresql://localhost:5432... OK",
                "[SYSTEM] Starting local microservices: keycap-router... OK",
                "[WARNING] 42 compilation bugs detected in Legacy Code!",
                "[WARNING] Scheduled out-of-bounds PM Ticket: Requirements Change",
                "[JIRA] Assigned Sprint 1 Ticket: Hotfix Rollout",
                "[SYSTEM] STARTING SPRINT DEPLOYMENT PROMPT...",
                "--------------------------------------------------",
                "PM: \"초롱 씨, 오늘 내로 핫픽스 실배포 못 하면 우리 다 퇴근 없어욧!!!\"",
                "--------------------------------------------------"
            ];

            bootText.innerText = '';
            let lineIdx = 0;
            const printLine = () => {
                if (lineIdx < logs.length) {
                    bootText.innerText += logs[lineIdx] + '\n';
                    lineIdx++;
                    setTimeout(printLine, 180);
                } else {
                    setTimeout(() => {
                        bootScreen.classList.remove('active');
                        bootScreen.style.display = 'none';
                        gameScreen.classList.add('active');
                    }, 500);
                }
            };
            printLine();
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

        document.getElementById('selected-tower-name').innerText = `${tower.getName()} (Level ${tower.level})`;
        
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
        const isStart = gx === 1 && gy === 1;
        const isEnd = gx === 9 && gy === 10;
        const isWallRow = gy === 2 || gy === 5 || gy === 8;
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

    triggerSprintBannerAnimation(waveNum) {
        const overlay = document.getElementById('sprint-banner-overlay');
        const title = document.getElementById('sprint-banner-title');
        const sub = document.getElementById('sprint-banner-sub');
        const desc = document.getElementById('sprint-banner-desc');
        
        if (!overlay || !title || !sub || !desc) return;
        
        const sprintTitles = [
            "SPRINT 1",
            "SPRINT 2",
            "SPRINT 3",
            "SPRINT 4",
            "SPRINT 5"
        ];
        
        const sprintSubs = [
            "HOTFIX ROLLOUT",
            "LEGACY REFACTORING",
            "SECURITY AUDIT COMPLIANCE",
            "SCHEDULE COMPRESSION",
            "PRODUCTION DEPLOY RELEASE"
        ];
        
        const sprintDescs = [
            "부서진 긴급 핫픽스들을 배포하여 시스템을 안정화하세요!",
            "오래된 스파게티 레거시 코드를 리팩토링하고 장애를 막으세요!",
            "감사원들이 들이닥칩니다! (적들의 체력 및 방어력 +30% 버프)",
            "일정 마감이 임박했습니다! (적들의 이동속도가 +25% 빨라집니다)",
            "최종 릴리즈! 거대 Outage 서버 장애 보스를 파괴하고 탈출하세요!"
        ];
        
        title.innerText = sprintTitles[waveNum - 1] || "SPRINT " + waveNum;
        sub.innerText = sprintSubs[waveNum - 1] || "INCOMING TASKS";
        desc.innerText = sprintDescs[waveNum - 1] || "방어막 가동!";
        
        overlay.classList.remove('hidden');
        overlay.classList.add('active');
        
        this.screenShake = 15;
        
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
        }, 2200);
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
        
        this.triggerSprintBannerAnimation(this.currentWave);
        
        this.log(`[WBS START] ${this.currentWave}단계: ${this.wbsStages[this.currentWave - 1]} 시작!`);
        Sound.playWaveStart();

        this.waveSpawnList = this.getWaveConfig(this.currentWave);
        
        const nxtBtn = document.getElementById('btn-next-wave');
        nxtBtn.classList.add('disabled');
        nxtBtn.disabled = true;

        this.updateHUD();

        if (this.currentWave === 1) {
            this.showDialog("📢 [Jira Alert] Sprint 1 시작! 요구사항 변경과 단위테스트 실패(FAIL) 티켓들이 무더기로 쏟아집니다. 키보드(Keyboard)를 조속히 배치하여 빌드를 지키세요!", "normal");
        } else if (this.currentWave === 2) {
            this.showDialog("💬 [Slack Alert] 팀장: Sprint 2 돌입! 무시무시한 레거시 코드와 끝없는 업무회의 공습이 시작됩니다. 회의 중에도 IDE 서버(IDE Server)로 개발을 밀어붙여야 합니다!", "normal");
        } else if (this.currentWave === 3) {
            this.showDialog("🚨 [Slack Alert] CTO: Sprint 3 보안 감사 대응 시작! (보안 통제로 적 체력 +30%!) 긴급 장애와 현업 부서의 실시간 요구/독촉 폭탄이 날아옵니다. 마우스(Mouse)로 발목을 잡으세요!", "normal");
        } else if (this.currentWave === 4) {
            this.showDialog("⏱️ [Jira Alert] Sprint 4 일정 단축 긴급 명령! (이동속도 +25%!) QA 재오픈 공세에 단위테스트 오류와 회의 지옥이 겹쳤습니다. DB 버프와 AI 어시스턴트로 해결하세요!", "tired");
        } else if (this.currentWave === 5) {
            this.showDialog("🔥 [CRITICAL ALERT] Sprint 5 서비스 실배포! Blocker 등급의 운영 배포 사고가 서버실을 덮쳤습니다! 현업의 독촉과 전방위 장애를 막아내야 오늘 퇴근할 수 있습니다!!!", "tired");
        }
    },

    getWaveConfig(waveNum) {
        const list = [];
        if (waveNum === 1) {
            // Wave 1: 20 spec_adder (요구사항) + 12 unit_test (단위테스트 실패)
            for (let i = 0; i < 20; i++) list.push({ type: 'spec_adder', delay: 600 + i * 250 });
            for (let i = 0; i < 12; i++) list.push({ type: 'unit_test', delay: 1200 + i * 350 });
        } 
        else if (waveNum === 2) {
            // Wave 2: 16 spec_adder + 12 doc_bomber + 8 meeting (업무회의)
            for (let i = 0; i < 16; i++) list.push({ type: 'spec_adder', delay: 500 + i * 250 });
            for (let i = 0; i < 12; i++) list.push({ type: 'doc_bomber', delay: 1000 + i * 400 });
            for (let i = 0; i < 8; i++) list.push({ type: 'meeting', delay: 1500 + i * 500 });
        } 
        else if (waveNum === 3) {
            // Wave 3: 15 spec_adder + 15 urgent + 10 qa_bugger + 10 biz_user (현업 요구/독촉)
            for (let i = 0; i < 15; i++) list.push({ type: 'spec_adder', delay: 400 + i * 200 });
            for (let i = 0; i < 15; i++) list.push({ type: 'urgent', delay: 800 + i * 250 });
            for (let i = 0; i < 10; i++) list.push({ type: 'qa_bugger', delay: 1000 + i * 300 });
            for (let i = 0; i < 10; i++) list.push({ type: 'biz_user', delay: 1200 + i * 300 });
        } 
        else if (waveNum === 4) {
            // Wave 4: 12 doc_bomber + 14 qa_bugger + 12 meeting + 12 unit_test
            for (let i = 0; i < 12; i++) list.push({ type: 'doc_bomber', delay: 600 + i * 350 });
            for (let i = 0; i < 14; i++) list.push({ type: 'qa_bugger', delay: 800 + i * 300 });
            for (let i = 0; i < 12; i++) list.push({ type: 'meeting', delay: 1000 + i * 400 });
            for (let i = 0; i < 12; i++) list.push({ type: 'unit_test', delay: 1200 + i * 350 });
        } 
        else if (waveNum === 5) {
            // Wave 5: 16 doc_bomber + 16 qa_bugger + 14 urgent + 10 meeting + 10 unit_test + 10 biz_user + 3 Outage Bosses!
            for (let i = 0; i < 16; i++) list.push({ type: 'doc_bomber', delay: 500 + i * 300 });
            for (let i = 0; i < 16; i++) list.push({ type: 'qa_bugger', delay: 600 + i * 250 });
            for (let i = 0; i < 14; i++) list.push({ type: 'urgent', delay: 800 + i * 200 });
            for (let i = 0; i < 10; i++) list.push({ type: 'meeting', delay: 1000 + i * 300 });
            for (let i = 0; i < 10; i++) list.push({ type: 'unit_test', delay: 1200 + i * 300 });
            for (let i = 0; i < 10; i++) list.push({ type: 'biz_user', delay: 1400 + i * 300 });
            list.push({ type: 'ceo_boss', delay: 5000 });
            list.push({ type: 'ceo_boss', delay: 10000 });
            list.push({ type: 'ceo_boss', delay: 15000 });
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

        if (this.npcs) {
            this.npcs.forEach(n => n.update(dt));
        }
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
                    const isStart = col === 1 && row === 1;
                    const isEnd = col === 9 && row === 10;
                    const isWallRow = row === 2 || row === 5 || row === 8;
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

        // 3.5 Draw NPCs
        if (this.npcs) {
            this.npcs.forEach(npc => npc.draw(this.ctx));
        }

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
            else if (p.type === 'binary_trail') {
                this.ctx.fillStyle = p.color;
                this.ctx.font = '8px monospace';
                this.ctx.globalAlpha = p.life / p.maxLife;
                this.ctx.fillText(p.char, p.x, p.y);
                this.ctx.globalAlpha = 1.0;
            }
            else {
                // Spinning flat-shaded low-poly triangles
                const size = Math.max(1.5, p.size * (p.life / p.maxLife));
                const rot = (p.rot || 0) + (p.rotSpeed || 5) * (1 - p.life / p.maxLife);
                
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(rot);
                
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -size);
                this.ctx.lineTo(size * 0.86, size * 0.5);
                this.ctx.lineTo(-size * 0.86, size * 0.5);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();

                this.ctx.restore();
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

        const isStart = gx === 1 && gy === 1;
        const isEnd = gx === 9 && gy === 10;
        const isWallRow = gy === 2 || gy === 5 || gy === 8;
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
                size: (2 + Math.random() * 3) * 1.4, // scaled up by 40%
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 10
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

        const caffeineWarning = document.getElementById('caffeine-warning');
        if (caffeineWarning) {
            if (this.caffeineLevel > 3.0) {
                caffeineWarning.classList.remove('hidden');
            } else {
                caffeineWarning.classList.add('hidden');
            }
        }

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
