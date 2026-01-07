/**
 * Brick Breaker Map Generation Functions
 */

import { BRICK_STATUS } from '../components/brickbreaker/constants';

export function generateMap(bricks: Uint8Array[], cols: number, rows: number, mapType: number, randomMapData: number[][] | null) {
    const generators: Record<number, () => void> = {
        0: () => generateTunnel(bricks, cols, rows),
        1: () => generatePyramid(bricks, cols, rows),
        2: () => generateChambers(bricks, cols, rows),
        3: () => generateMosaic(bricks, cols, rows),
        4: () => generateFortress(bricks, cols, rows),
        5: () => generateGalactic(bricks, cols, rows),
        6: () => generateBastion(bricks, cols),
        7: () => generateColiseum(bricks, cols, rows),
        8: () => generateRoyalMaze(bricks, cols, rows),
        9: () => generateDarkMaze(bricks, cols, rows),
        10: () => generateCrypts(bricks, cols, rows),
        11: () => generateCrystal(bricks, cols, rows),
        12: () => generateMines(bricks, cols, rows),
        13: () => generateTemple(bricks, cols, rows),
        14: () => generateStation(bricks, cols, rows),
        15: () => generateRandom(bricks, cols, rows, randomMapData),
    };

    const generator = generators[mapType];
    if (generator) generator();
    else generateFallback(bricks, cols);
}

function generateTunnel(bricks: Uint8Array[], cols: number, rows: number) {
    const tunnelCenter = Math.floor(cols / 2), barrierRow = rows - 5;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
        if ((r === barrierRow || r === barrierRow - 1) && Math.abs(c - tunnelCenter) > 3) bricks[c][r] = BRICK_STATUS.WALL;
        else if (r < barrierRow - 3 && (r % 2 === 0 || c % 2 === 0)) bricks[c][r] = BRICK_STATUS.NORMAL;
    }
}

function generatePyramid(bricks: Uint8Array[], cols: number, rows: number) {
    const center = Math.floor(cols / 2);
    for (let c = 0; c < cols; c++) {
        const maxR = Math.floor(rows - (Math.abs(c - center) / 1.5));
        for (let r = 0; r < maxR; r++) bricks[c][r] = (r === maxR - 1 || Math.abs(c - center) < 2) && Math.random() < 0.3 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
    }
}

function generateChambers(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
        if (c % 10 === 0) bricks[c][r] = BRICK_STATUS.WALL;
        else if (r % 8 === 0 && c % 10 !== 5) bricks[c][r] = BRICK_STATUS.WALL;
        else if (Math.random() < 0.8) bricks[c][r] = BRICK_STATUS.NORMAL;
    }
}

function generateMosaic(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 2; r < Math.floor(rows * 0.7); r++) bricks[c][r] = (c + r) % 5 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
}

function generateFortress(bricks: Uint8Array[], cols: number, rows: number) {
    const margin = 3;
    for (let c = margin; c < cols - margin; c++) for (let r = 2; r < rows - 6; r++) bricks[c][r] = (c === margin || c === cols - margin - 1 || r === 2) ? BRICK_STATUS.WALL : ((c + r) % 7 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL);
}

function generateGalactic(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 4; r++) if (Math.random() < 0.92) bricks[c][r] = Math.random() < 0.15 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
}

function generateBastion(bricks: Uint8Array[], cols: number) {
    const towers = [Math.floor(cols * 0.2), Math.floor(cols * 0.5), Math.floor(cols * 0.8)];
    for (let c = 0; c < cols; c++) for (let r = 2; r < 8; r++) { if (r % 2 === 0) bricks[c][r] = BRICK_STATUS.NORMAL; for (const tc of towers) if (Math.abs(c - tc) <= 1) bricks[c][r] = BRICK_STATUS.WALL; }
}

function generateColiseum(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 3; r++) {
        if ((c === 5 || c === cols - 6) && (r === 2 || r === 6)) bricks[c][r] = BRICK_STATUS.WALL;
        else if ((c === 0 || c === cols - 1) && r % 4 === 0) bricks[c][r] = BRICK_STATUS.WALL;
        else if (r < rows - 6 && ((c < 4 || c > cols - 5) || r < 3)) bricks[c][r] = BRICK_STATUS.NORMAL;
    }
}

function generateRoyalMaze(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 3; r++) bricks[c][r] = (c % 4 === 0 && r % 3 === 0) ? BRICK_STATUS.WALL : (c % 4 !== 0 && r % 3 !== 0 ? BRICK_STATUS.NORMAL : 0);
}

function generateDarkMaze(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 3; r++) bricks[c][r] = (r % 3 === 0 && c % 8 !== 3 && c % 8 !== 4) ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
}

function generateCrypts(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 5; r++) bricks[c][r] = (c % 5 === 0 && r % 6 !== 0) ? BRICK_STATUS.WALL : ((c + r) % 7 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL);
}

function generateCrystal(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 4; r++) bricks[c][r] = (c + r) % 4 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
}

function generateMines(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 3; r++) if (Math.sin(c * 0.5) * Math.cos(r * 0.5) > 0.2) bricks[c][r] = Math.random() < 0.2 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
}

function generateTemple(bricks: Uint8Array[], cols: number, rows: number) {
    const centerX = Math.floor(cols / 2), centerY = Math.floor(rows / 3);
    for (let c = 0; c < cols; c++) for (let r = 1; r < rows - 3; r++) bricks[c][r] = (c === centerX || r === centerY) ? BRICK_STATUS.WALL : (Math.abs(c - centerX) < 5 && Math.abs(r - centerY) < 5 ? BRICK_STATUS.NORMAL : 0);
}

function generateStation(bricks: Uint8Array[], cols: number, rows: number) {
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows - 4; r++) {
        const isWing = c === 1 || c === cols - 2, isMain = r < 5 && c > 3 && c < cols - 4;
        if (isWing) bricks[c][r] = r % 3 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
        else if (isMain) bricks[c][r] = BRICK_STATUS.NORMAL;
        else if (r === 6 && c % 4 === 0) bricks[c][r] = BRICK_STATUS.WALL;
    }
}

function generateRandom(bricks: Uint8Array[], cols: number, rows: number, randomMapData: number[][] | null) {
    if (randomMapData) {
        for (let y = 0; y < randomMapData.length; y++) for (let x = 0; x < randomMapData[y].length; x++) if (x < cols && y < rows) bricks[x][y] = randomMapData[y][x];
    } else generateFallback(bricks, cols);
}

function generateFallback(bricks: Uint8Array[], cols: number) {
    for (let c = 0; c < cols; c++) for (let r = 1; r < 4; r++) bricks[c][r] = BRICK_STATUS.NORMAL;
}
