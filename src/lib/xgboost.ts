/**
 * Lightweight XGBoost-style gradient boosted trees (regression, squared error).
 * Implements the core XGBoost ideas: second-order (gradient + hessian) split gain,
 * L2 leaf regularisation (lambda), minimum split gain (gamma), shrinkage (eta),
 * row subsampling, and gain-based feature importance.
 */
type Node =
  | { leaf: true; value: number }
  | { leaf: false; feature: number; threshold: number; left: Node; right: Node };

export interface XGBParams {
  nEstimators?: number;
  maxDepth?: number;
  learningRate?: number;
  lambda?: number;
  gamma?: number;
  minChildWeight?: number;
  subsample?: number;
}

export class XGBRegressor {
  private trees: Node[] = [];
  private base = 0;
  private p: Required<XGBParams>;
  importance: number[] = [];

  constructor(params: XGBParams = {}) {
    this.p = {
      nEstimators: 60, maxDepth: 3, learningRate: 0.15, lambda: 1, gamma: 0,
      minChildWeight: 1, subsample: 0.9, ...params,
    };
  }

  fit(X: number[][], y: number[]) {
    const nF = X[0]?.length ?? 0;
    this.importance = new Array(nF).fill(0);
    this.base = y.reduce((a, b) => a + b, 0) / y.length;
    const pred = y.map(() => this.base);
    let seed = 42;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let t = 0; t < this.p.nEstimators; t++) {
      const g = pred.map((p, i) => p - y[i]); // gradient of 1/2 (p-y)^2
      const h = pred.map(() => 1); // hessian
      const idx = X.map((_, i) => i).filter(() => rand() < this.p.subsample);
      const tree = this.build(X, g, h, idx.length ? idx : X.map((_, i) => i), 0);
      this.trees.push(tree);
      for (let i = 0; i < X.length; i++) pred[i] += this.p.learningRate * this.eval(tree, X[i]);
    }
    return this;
  }

  private leafWeight(G: number, H: number) { return -G / (H + this.p.lambda); }

  private build(X: number[][], g: number[], h: number[], idx: number[], depth: number): Node {
    const G = idx.reduce((s, i) => s + g[i], 0);
    const H = idx.reduce((s, i) => s + h[i], 0);
    if (depth >= this.p.maxDepth || idx.length < 2) return { leaf: true, value: this.leafWeight(G, H) };
    const { lambda, gamma, minChildWeight } = this.p;
    let best = { gain: 0, f: -1, thr: 0 };
    const nF = X[0].length;
    for (let f = 0; f < nF; f++) {
      const sorted = [...idx].sort((a, b) => X[a][f] - X[b][f]);
      let GL = 0, HL = 0;
      for (let k = 0; k < sorted.length - 1; k++) {
        const i = sorted[k];
        GL += g[i]; HL += h[i];
        const v = X[i][f], nv = X[sorted[k + 1]][f];
        if (v === nv) continue;
        const GR = G - GL, HR = H - HL;
        if (HL < minChildWeight || HR < minChildWeight) continue;
        const gain = 0.5 * (GL * GL / (HL + lambda) + GR * GR / (HR + lambda) - G * G / (H + lambda)) - gamma;
        if (gain > best.gain) best = { gain, f, thr: (v + nv) / 2 };
      }
    }
    if (best.f < 0) return { leaf: true, value: this.leafWeight(G, H) };
    this.importance[best.f] += best.gain;
    const L = idx.filter((i) => X[i][best.f] <= best.thr);
    const R = idx.filter((i) => X[i][best.f] > best.thr);
    return {
      leaf: false, feature: best.f, threshold: best.thr,
      left: this.build(X, g, h, L, depth + 1), right: this.build(X, g, h, R, depth + 1),
    };
  }

  private eval(n: Node, x: number[]): number {
    while (n.leaf === false) n = x[n.feature] <= n.threshold ? n.left : n.right;
    return n.value;
  }

  predict(x: number[]) {
    return this.trees.reduce((s, t) => s + this.p.learningRate * this.eval(t, x), this.base);
  }

  normalizedImportance() {
    const total = this.importance.reduce((a, b) => a + b, 0) || 1;
    return this.importance.map((v) => v / total);
  }
}
