import { Shape, ShapeSizeCategory } from '../types';

// Vibrant palette with high-contrast vivid colors including the required #00ECE3 cyan
const VIBRANT_COLORS = [
  '#00ECE3', // Primary Cyan
  '#FF2A6D', // Neon Rose
  '#05D9E8', // Bright Aqua
  '#FFD166', // Golden Yellow
  '#06D6A0', // Emerald Green
  '#7928CA', // Deep Violet
  '#FF5E7E', // Coral Pink
  '#3A86FF', // Royal Blue
  '#8338EC', // Purple Glow
  '#FB5607', // Vivid Orange
  '#00F5D4', // Mint Turquoise
  '#B5179E', // Magenta
  '#4CC9F0', // Sky Neon
  '#FFB703', // Amber
  '#10B981', // Jade
  '#EC4899', // Hot Pink
];

// Base shape matrices by category
const SHAPE_DEFINITIONS: Record<ShapeSizeCategory, { name: string; matrix: number[][] }[]> = {
  1: [
    { name: 'مكعب أحادي', matrix: [[1]] },
  ],
  2: [
    { name: 'مكعب ثنائي أفقي', matrix: [[1, 1]] },
    { name: 'مكعب ثنائي رأسي', matrix: [[1], [1]] },
  ],
  3: [
    { name: 'مكعب ثلاثي خطي', matrix: [[1, 1, 1]] },
    { name: 'مكعب ثلاثي عمودي', matrix: [[1], [1], [1]] },
    { name: 'مكعب ثلاثي زاوية L', matrix: [[1, 0], [1, 1]] },
    { name: 'مكعب ثلاثي زاوية مقلوبة', matrix: [[0, 1], [1, 1]] },
    { name: 'مكعب ثلاثي زاوية علوية', matrix: [[1, 1], [1, 0]] },
    { name: 'مكعب ثلاثي زاوية يمين', matrix: [[1, 1], [0, 1]] },
  ],
  4: [
    { name: 'مكعب رباعي O', matrix: [[1, 1], [1, 1]] },
    { name: 'مكعب رباعي I أفقي', matrix: [[1, 1, 1, 1]] },
    { name: 'مكعب رباعي I عمودي', matrix: [[1], [1], [1], [1]] },
    { name: 'مكعب رباعي T', matrix: [[1, 1, 1], [0, 1, 0]] },
    { name: 'مكعب رباعي T مقلوب', matrix: [[0, 1, 0], [1, 1, 1]] },
    { name: 'مكعب رباعي L', matrix: [[1, 0], [1, 0], [1, 1]] },
    { name: 'مكعب رباعي J', matrix: [[0, 1], [0, 1], [1, 1]] },
    { name: 'مكعب رباعي S', matrix: [[0, 1, 1], [1, 1, 0]] },
    { name: 'مكعب رباعي Z', matrix: [[1, 1, 0], [0, 1, 1]] },
  ],
  5: [
    { name: 'مكعب خماسي P', matrix: [[1, 1], [1, 1], [1, 0]] },
    { name: 'مكعب خماسي U', matrix: [[1, 0, 1], [1, 1, 1]] },
    { name: 'مكعب خماسي T خماسي', matrix: [[1, 1, 1], [0, 1, 0], [0, 1, 0]] },
    { name: 'مكعب خماسي X علامة زائد', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] },
    { name: 'مكعب خماسي V زاوية كبيرة', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
    { name: 'مكعب خماسي W متدرج', matrix: [[1, 0, 0], [1, 1, 0], [0, 1, 1]] },
    { name: 'مكعب خماسي L خماسي', matrix: [[1, 0], [1, 0], [1, 0], [1, 1]] },
  ],
  6: [
    { name: 'مكعب سداسي مستطيل 2x3', matrix: [[1, 1, 1], [1, 1, 1]] },
    { name: 'مكعب سداسي سلم', matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { name: 'مكعب سداسي صليب كبير', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0]] },
    { name: 'مكعب سداسي درج مزدوج', matrix: [[1, 1, 0], [1, 1, 1], [0, 0, 1]] },
    { name: 'مكعب سداسي قلعة', matrix: [[1, 0, 1], [1, 1, 1], [0, 1, 0]] },
    { name: 'مكعب سداسي برميل', matrix: [[0, 1, 1, 0], [1, 1, 1, 1]] },
  ],
};

export function getRandomColor(): string {
  return VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
}

export function generateRandomShape(preferredCategory?: ShapeSizeCategory): Shape {
  const category = preferredCategory || ((Math.floor(Math.random() * 6) + 1) as ShapeSizeCategory);
  const definitions = SHAPE_DEFINITIONS[category];
  const definition = definitions[Math.floor(Math.random() * definitions.length)];

  // Count active cubes
  const cubesCount = definition.matrix.reduce(
    (sum, row) => sum + row.reduce((rSum, cell) => rSum + cell, 0),
    0
  );

  return {
    id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: definition.name,
    category,
    matrix: definition.matrix.map((row) => [...row]),
    color: getRandomColor(),
    cubesCount,
  };
}

export function generateRoundShapes(
  count: number = 3,
  difficulty: string = 'medium',
  remainingEmptySquares?: number
): Shape[] {
  const shapes: Shape[] = [];
  const numShapes = Math.max(1, Math.min(3, count));

  for (let i = 0; i < numShapes; i++) {
    let cat: ShapeSizeCategory;

    if (remainingEmptySquares !== undefined && remainingEmptySquares <= 4) {
      if (remainingEmptySquares <= 1) {
        cat = 1 as ShapeSizeCategory;
      } else if (remainingEmptySquares <= 2) {
        cat = (i === 0 ? 1 : Math.random() < 0.6 ? 2 : 1) as ShapeSizeCategory;
      } else if (remainingEmptySquares <= 3) {
        cat = (i === 0 ? 1 : Math.random() < 0.5 ? 2 : 3) as ShapeSizeCategory;
      } else {
        cat = (i === 0 ? 1 : Math.random() < 0.4 ? 2 : Math.random() < 0.7 ? 3 : 4) as ShapeSizeCategory;
      }
    } else if (difficulty === 'easy') {
      // Favor 1, 2, 3 cubes
      const roll = Math.random();
      cat = (roll < 0.4 ? 1 : roll < 0.7 ? 2 : roll < 0.9 ? 3 : 4) as ShapeSizeCategory;
    } else if (difficulty === 'medium') {
      // 1 to 5
      cat = (Math.floor(Math.random() * 5) + 1) as ShapeSizeCategory;
    } else {
      // Hard / Master: 2 to 6
      cat = (Math.floor(Math.random() * 6) + 1) as ShapeSizeCategory;
    }
    shapes.push(generateRandomShape(cat));
  }

  return shapes;
}

// Rotate matrix clockwise 90 degrees
export function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }

  return result;
}

// Merge multiple shapes into a single composite shape
export function mergeShapes(shapesToMerge: Shape[]): Shape | null {
  if (shapesToMerge.length < 2) return null;

  // Let's create a combined bounding matrix
  const totalCubes = shapesToMerge.reduce((acc, s) => acc + s.cubesCount, 0);

  // Determine side-by-side or stacked fusion
  let mergedMatrix: number[][] = [];
  if (shapesToMerge.length === 2) {
    const [s1, s2] = shapesToMerge;
    const maxRows = Math.max(s1.matrix.length, s2.matrix.length);
    const cols1 = s1.matrix[0].length;
    const cols2 = s2.matrix[0].length;

    mergedMatrix = Array.from({ length: maxRows }, (_, r) => {
      const row1 = s1.matrix[r] || Array(cols1).fill(0);
      const row2 = s2.matrix[r] || Array(cols2).fill(0);
      return [...row1, ...row2];
    });
  } else {
    // Stack or combine in a 2x2 block arrangement
    const s1 = shapesToMerge[0];
    const s2 = shapesToMerge[1];
    const s3 = shapesToMerge[2];

    const maxR = Math.max(s1.matrix.length, s2.matrix.length);
    const topRows = Array.from({ length: maxR }, (_, r) => {
      const row1 = s1.matrix[r] || Array(s1.matrix[0].length).fill(0);
      const row2 = s2.matrix[r] || Array(s2.matrix[0].length).fill(0);
      return [...row1, ...row2];
    });

    const bottomWidth = topRows[0].length;
    const s3Padded = s3.matrix.map((row) => {
      const pad = Math.max(0, bottomWidth - row.length);
      return [...row, ...Array(pad).fill(0)];
    });

    mergedMatrix = [...topRows, ...s3Padded];
  }

  // Trim empty outer rows/columns
  mergedMatrix = trimMatrix(mergedMatrix);

  const category = Math.min(6, Math.max(1, totalCubes)) as ShapeSizeCategory;

  return {
    id: `merged_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: `شكل مدمج (${totalCubes} مكعبات)`,
    category,
    matrix: mergedMatrix,
    color: '#00ECE3', // Special merged cyan accent
    accentColor: getRandomColor(),
    cubesCount: totalCubes,
  };
}

function trimMatrix(matrix: number[][]): number[][] {
  let minR = matrix.length;
  let maxR = -1;
  let minC = matrix[0]?.length || 0;
  let maxC = -1;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  if (maxR === -1) return [[1]]; // fallback

  const trimmed: number[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row: number[] = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(matrix[r][c] || 0);
    }
    trimmed.push(row);
  }

  return trimmed;
}
