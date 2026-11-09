import { explodeOffset, formatSize, kindOf, parseStl } from './model';

function stl(tris: number[][]): ArrayBuffer {
  const buf = new ArrayBuffer(84 + tris.length * 50);
  const dv = new DataView(buf);
  dv.setUint32(80, tris.length, true);
  tris.forEach((t, i) => t.forEach((v, j) => dv.setFloat32(84 + i * 50 + 12 + j * 4, v, true)));
  return buf;
}

describe('CAD model helpers', () => {
  it('reads triangle positions from a binary STL and skips the normals', () => {
    const pos = parseStl(stl([[1, 2, 3, 4, 5, 6, 7, 8, 9]]));
    expect(Array.from(pos)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('rejects a file whose size does not match its triangle count', () => {
    const buf = stl([[0, 0, 0, 1, 0, 0, 0, 1, 0]]);
    expect(() => parseStl(buf.slice(0, buf.byteLength - 1))).toThrowError(/size/);
    expect(() => parseStl(new TextEncoder().encode('solid x').buffer)).toThrowError(/short/);
  });

  it('explodes outward from the centre and leaves the centre part in place', () => {
    expect(explodeOffset([10, 0, 0], [0, 0, 0], 100, 1)).toEqual([20, 0, 0]);
    expect(explodeOffset([10, 0, 0], [0, 0, 0], 100, 0)).toEqual([0, 0, 0]);
    expect(explodeOffset([5, 5, 5], [5, 5, 5], 100, 1)).toEqual([0, 0, 0]);
  });

  it('sorts parts into the ink they are drawn with', () => {
    expect(kindOf({ id: 'a', file: 'a.stl', material: 'PLA' })).toBe('printed');
    expect(kindOf({ id: 'b', file: 'b.stl', material: 'TPU 95A' })).toBe('flexible');
    expect(kindOf({ id: 'c', file: 'c.stl', ghost: true })).toBe('bought');
    expect(kindOf({ id: 'd', file: 'd.stl', alt: true, material: 'PLA' })).toBe('alternative');
  });

  it('rounds sizes to whole millimetres', () => {
    expect(formatSize(257.6, 258.2, 40.5)).toBe('258 × 258 × 41 mm');
  });
});
