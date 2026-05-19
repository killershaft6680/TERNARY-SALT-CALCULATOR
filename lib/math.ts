export type SystemType = 'system1' | 'system2';
export type PropertyType = 'density' | 'viscosity';

export interface RKCoeffs {
  A0: (T: number) => number;
  A1: (T: number) => number;
  A2: (T: number) => number;
}

export interface SystemData {
  A21: RKCoeffs;
  A31: RKCoeffs;
  A23: RKCoeffs;
  pure1: (T: number) => number;
  pure2: (T: number) => number;
  pure3: (T: number) => number;
}

const R = 8.3144;

export const data: Record<SystemType, Record<PropertyType, SystemData>> = {
  system1: {
    viscosity: {
      A21: {
        A0: (T) => 3.8445 - 0.0056 * T,
        A1: (T) => -19.32 + 0.0259 * T,
        A2: (T) => 44.253 - 0.0544 * T,
      },
      A31: {
        A0: (T) => 8.179 - 0.0103 * T,
        A1: (T) => 11.173 - 0.017 * T,
        A2: (T) => 26.533 - 0.0401 * T,
      },
      A23: {
        A0: (T) => 2.744 - 0.0035 * T,
        A1: (T) => -13.005 + 0.0178 * T,
        A2: (T) => 11.83 - 0.0178 * T,
      },
      pure1: (T) => 0.0836 * Math.exp(18690.24 / (R * T)),
      pure2: (T) => 0.1027 * Math.exp(16313.68 / (R * T)),
      pure3: (T) => 0.07375 * Math.exp(18665.13 / (R * T)),
    },
    density: {
      A21: {
        A0: (T) => 0.1925 - 0.0002 * T,
        A1: (T) => -0.2377 + 0.0005 * T,
        A2: (T) => -2.2332 + 0.0011 * T,
      },
      A31: {
        A0: (T) => 0.0649 - 0.0002 * T,
        A1: (T) => 0.7504 - 0.00003 * T,
        A2: (T) => 0.1493 - 0.0002 * T,
      },
      A23: {
        A0: (T) => -0.0047 + 0.000007 * T,
        A1: (T) => -0.0194 - 0.00003 * T,
        A2: (T) => -0.0238 - 0.00004 * T,
      },
      pure1: (T) => 2.1721 - 0.0007021 * T,
      pure2: (T) => 2.2775 - 0.0006378 * T,
      pure3: (T) => 2.3043 - 0.00071565 * T,
    },
  },
  system2: {
    viscosity: {
      A21: {
        A0: (T) => 11.466 - 0.0157 * T,
        A1: (T) => 21.62 - 0.0315 * T,
        A2: (T) => 10.194 - 0.014 * T,
      },
      A31: {
        A0: (T) => 9.588 - 0.0134 * T,
        A1: (T) => 13.571 - 0.0197 * T,
        A2: (T) => 6.3644 - 0.0089 * T,
      },
      A23: {
        A0: (T) => 2.744 - 0.0035 * T,
        A1: (T) => -13.005 + 0.0178 * T,
        A2: (T) => 11.83 - 0.0178 * T,
      },
      pure1: (T) => 0.05236 * Math.exp(22020.76 / (R * T)),
      pure2: (T) => 0.1027 * Math.exp(16313.68 / (R * T)),
      pure3: (T) => 0.07375 * Math.exp(18665.13 / (R * T)),
    },
    density: {
      A21: {
        A0: (T) => -0.7322 + 0.0006 * T,
        A1: (T) => -0.3034 + 0.0003 * T,
        A2: (T) => 0.6621 - 0.0011 * T,
      },
      A31: {
        A0: (T) => -0.3398 + 0.0002 * T,
        A1: (T) => -0.188 + 0.0002 * T,
        A2: (T) => 0.1112 - 0.0004 * T,
      },
      A23: {
        A0: (T) => -0.0047 + 0.000007 * T,
        A1: (T) => -0.0194 - 0.00003 * T,
        A2: (T) => -0.0238 - 0.00004 * T,
      },
      pure1: (T) => 3.6206 - 0.001166 * T,
      pure2: (T) => 2.2775 - 0.0006378 * T,
      pure3: (T) => 2.3043 - 0.00071565 * T,
    },
  },
};

export function rkPolynomial(xA: number, xB: number, A0: number, A1: number, A2: number): number {
  return xA * xB * (A0 + A1 * (xA - xB) + A2 * Math.pow(xA - xB, 2));
}

export function simpsonsRule(f: (x: number) => number, a: number, b: number, n: number = 1000): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i += 2) {
    sum += 4 * f(a + i * h);
  }
  for (let i = 2; i < n - 1; i += 2) {
    sum += 2 * f(a + i * h);
  }
  return (h / 3) * sum;
}

export interface CalculationResult {
  xi12: number;
  xi23: number;
  xi31: number;
  YE: number;
  Y: number;
  Y1: number;
  Y2: number;
  Y3: number;
}

export function calculateProperties(
  sys: SystemType,
  prop: PropertyType,
  T: number,
  x1: number,
  x2: number,
  x3: number
): CalculationResult {
  const d = data[sys][prop];

  const A21_0 = d.A21.A0(T);
  const A21_1 = d.A21.A1(T);
  const A21_2 = d.A21.A2(T);

  const A31_0 = d.A31.A0(T);
  const A31_1 = d.A31.A1(T);
  const A31_2 = d.A31.A2(T);

  const A23_0 = d.A23.A0(T);
  const A23_1 = d.A23.A1(T);
  const A23_2 = d.A23.A2(T);

  // Y_ij^E(x) functions
  const Y12E = (x: number) => rkPolynomial(1 - x, x, A21_0, A21_1, A21_2);
  const Y13E = (x: number) => rkPolynomial(1 - x, x, A31_0, A31_1, A31_2);
  const Y21E = (x: number) => rkPolynomial(x, 1 - x, A21_0, A21_1, A21_2);
  const Y23E = (x: number) => rkPolynomial(x, 1 - x, A23_0, A23_1, A23_2);
  const Y31E = (x: number) => rkPolynomial(x, 1 - x, A31_0, A31_1, A31_2);
  const Y32E = (x: number) => rkPolynomial(1 - x, x, A23_0, A23_1, A23_2);

  // Integrals
  const n12_13 = simpsonsRule((x) => Math.pow(Y12E(x) - Y13E(x), 2), 0, 1);
  const n21_23 = simpsonsRule((x) => Math.pow(Y21E(x) - Y23E(x), 2), 0, 1);
  const n31_32 = simpsonsRule((x) => Math.pow(Y31E(x) - Y32E(x), 2), 0, 1);

  const eta1 = n12_13;
  const eta2 = n21_23;
  const eta3 = n31_32;

  const xi12 = eta1 / (eta1 + eta2);
  const xi23 = eta2 / (eta2 + eta3);
  const xi31 = eta3 / (eta3 + eta1);

  // Sub-binary mole fractions
  const X1_12 = x1 + x3 * xi12;
  const X2_12 = x2 + x3 * (1 - xi12);
  const W12 = X1_12 > 0 && X2_12 > 0 ? (x1 * x2) / (X1_12 * X2_12) : 0;
  const YE12 = rkPolynomial(X2_12, X1_12, A21_0, A21_1, A21_2);

  const X2_23 = x2 + x1 * xi23;
  const X3_23 = x3 + x1 * (1 - xi23);
  const W23 = X2_23 > 0 && X3_23 > 0 ? (x2 * x3) / (X2_23 * X3_23) : 0;
  const YE23 = rkPolynomial(X2_23, X3_23, A23_0, A23_1, A23_2);

  const X3_31 = x3 + x2 * xi31;
  const X1_31 = x1 + x2 * (1 - xi31);
  const W31 = X3_31 > 0 && X1_31 > 0 ? (x3 * x1) / (X3_31 * X1_31) : 0;
  const YE31 = rkPolynomial(X3_31, X1_31, A31_0, A31_1, A31_2);

  const YE = W12 * YE12 + W23 * YE23 + W31 * YE31;

  const Y1 = d.pure1(T);
  const Y2 = d.pure2(T);
  const Y3 = d.pure3(T);

  const Y = YE + x1 * Y1 + x2 * Y2 + x3 * Y3;

  return {
    xi12,
    xi23,
    xi31,
    YE,
    Y,
    Y1,
    Y2,
    Y3,
  };
}
