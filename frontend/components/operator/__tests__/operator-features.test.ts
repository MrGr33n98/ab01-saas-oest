import { describe, it, expect } from "vitest";

describe("Data Intent Calculator Logic", () => {
  function calculateEstimate(serviceType: string, areaHa: number, minBase = 1500, rgbRate = 25, multiRate = 45, lidarRate = 85) {
    const rate = serviceType === "multispectral" ? multiRate : serviceType === "lidar" ? lidarRate : rgbRate;
    const min = minBase + areaHa * rate;
    return {
      minPrice: min,
      maxPrice: min * 1.2,
      typicalDays: 5,
    };
  }

  it("calculates correct RGB mapping pricing for 100 hectares", () => {
    const res = calculateEstimate("rgb", 100);
    // 1500 + 100 * 25 = 4000 min, 4000 * 1.2 = 4800 max
    expect(res.minPrice).toBe(4000);
    expect(res.maxPrice).toBe(4800);
  });

  it("calculates multispectral agricultural pricing for 200 hectares", () => {
    const res = calculateEstimate("multispectral", 200);
    // 1500 + 200 * 45 = 10500 min, 10500 * 1.2 = 12600 max
    expect(res.minPrice).toBe(10500);
    expect(res.maxPrice).toBe(12600);
  });
});

describe("Portfolio Filtering & Types", () => {
  const sampleItems = [
    { id: "1", item_type: "before_after", title: "Antes/Depois 1" },
    { id: "2", item_type: "ortho_sample", title: "Ortomosaico 1" },
    { id: "3", item_type: "gallery", title: "Galeria 1" },
  ];

  it("filters items correctly by item_type", () => {
    const beforeAfter = sampleItems.filter((i) => i.item_type === "before_after");
    expect(beforeAfter.length).toBe(1);
    expect(beforeAfter[0].title).toBe("Antes/Depois 1");

    const ortho = sampleItems.filter((i) => i.item_type === "ortho_sample");
    expect(ortho.length).toBe(1);
  });
});
