import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should render the landing page with hero and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("landing-page")).toBeVisible();
    await expect(page.getByText("診断ダッシュボード")).toBeVisible();
    await expect(page.getByTestId("cta-dashboard")).toBeVisible();
  });

  test("should display statistics section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("53.4%")).toBeVisible();
    await expect(page.getByText("397件")).toBeVisible();
  });

  test("should display features list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("主な機能")).toBeVisible();
    await expect(page.getByText("総合リスクスコア")).toBeVisible();
    await expect(page.getByText("キーパーソン分析")).toBeVisible();
  });

  test("should navigate to dashboard via CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-dashboard").click();
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Navigation", () => {
  test("should display bottom navigation bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("bottom-nav")).toBeVisible();
  });

  test("should navigate between pages using bottom nav", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("nav-dashboard").click();
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    await page.getByTestId("nav-employees").click();
    await expect(page).toHaveURL("/employees");
    await expect(page.getByTestId("employees-page")).toBeVisible();

    await page.getByTestId("nav-analysis").click();
    await expect(page).toHaveURL("/analysis");
    await expect(page.getByTestId("analysis-page")).toBeVisible();

    await page.getByTestId("nav-actions").click();
    await expect(page).toHaveURL("/actions");
    await expect(page.getByTestId("actions-page")).toBeVisible();

    await page.getByTestId("nav-home").click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("landing-page")).toBeVisible();
  });
});

test.describe("Dashboard Page", () => {
  test("should render dashboard with risk gauge", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByText("リスクダッシュボード")).toBeVisible();
  });

  test("should display overall score section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("overall-score-section")).toBeVisible();
    await expect(page.getByText("総合リスクスコア")).toBeVisible();
  });

  test("should display risk gauge component", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("risk-gauge")).toBeVisible({ timeout: 10000 });
  });

  test("should display dimension scores", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("軸別スコア")).toBeVisible();
    await expect(page.getByText("年齢構成")).toBeVisible();
    await expect(page.getByText("キーパーソン")).toBeVisible();
    await expect(page.getByText("離職率")).toBeVisible();
    await expect(page.getByText("季節変動")).toBeVisible();
    await expect(page.getByText("事業承継")).toBeVisible();
  });

  test("should have a refresh assessment button", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("refresh-assessment")).toBeVisible();
  });
});

test.describe("Employees Page", () => {
  test("should render employees page with employee cards", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByTestId("employees-page")).toBeVisible();
    await expect(page.getByText("従業員管理")).toBeVisible();
  });

  test("should display employee cards from seed data", async ({ page }) => {
    await page.goto("/employees");
    const cards = page.getByTestId("employee-card");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have add employee button", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByTestId("add-employee-btn")).toBeVisible();
  });

  test("should open employee form when clicking add button", async ({ page }) => {
    await page.goto("/employees");
    await page.getByTestId("add-employee-btn").click();
    await expect(page.getByTestId("employee-form")).toBeVisible();
    await expect(page.getByTestId("input-name")).toBeVisible();
    await expect(page.getByTestId("input-department")).toBeVisible();
  });

  test("should add a new employee", async ({ page }) => {
    await page.goto("/employees");
    const initialCount = await page.getByTestId("employee-card").count();

    await page.getByTestId("add-employee-btn").click();
    await page.getByTestId("input-name").fill("テスト 太郎");
    await page.getByTestId("input-department").fill("テスト部");
    await page.getByTestId("submit-employee").click();

    await expect(page.getByTestId("employee-form")).not.toBeVisible();
    const newCount = await page.getByTestId("employee-card").count();
    expect(newCount).toBe(initialCount + 1);
  });

  test("should cancel employee form", async ({ page }) => {
    await page.goto("/employees");
    await page.getByTestId("add-employee-btn").click();
    await expect(page.getByTestId("employee-form")).toBeVisible();
    await page.getByTestId("cancel-employee").click();
    await expect(page.getByTestId("employee-form")).not.toBeVisible();
  });
});

test.describe("Analysis Page", () => {
  test("should render analysis page with tabs", async ({ page }) => {
    await page.goto("/analysis");
    await expect(page.getByTestId("analysis-page")).toBeVisible();
  });

  test("should show keyperson analysis by default", async ({ page }) => {
    await page.goto("/analysis");
    await expect(page.getByTestId("keyperson-content")).toBeVisible();
    await expect(page.getByText("キーパーソン依存度サマリー")).toBeVisible();
  });

  test("should switch to forecast tab", async ({ page }) => {
    await page.goto("/analysis");
    await page.getByTestId("tab-forecast").click();
    await expect(page.getByTestId("forecast-content")).toBeVisible();
    await expect(page.getByText("12ヶ月人員予測")).toBeVisible();
  });

  test("should switch to benchmark tab", async ({ page }) => {
    await page.goto("/analysis");
    await page.getByTestId("tab-benchmark").click();
    await expect(page.getByTestId("benchmark-content")).toBeVisible();
    await expect(page.getByText("業界別ベンチマーク")).toBeVisible();
  });
});

test.describe("Actions Page", () => {
  test("should render actions page with action cards", async ({ page }) => {
    await page.goto("/actions");
    await expect(page.getByTestId("actions-page")).toBeVisible();
    await expect(page.getByText("アクションプラン")).toBeVisible();
  });

  test("should display action cards", async ({ page }) => {
    await page.goto("/actions");
    const cards = page.getByTestId("action-card");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have category filter buttons", async ({ page }) => {
    await page.goto("/actions");
    await expect(page.getByText("すべて")).toBeVisible();
    await expect(page.getByTestId("filter-hiring")).toBeVisible();
    await expect(page.getByTestId("filter-dx")).toBeVisible();
    await expect(page.getByTestId("filter-training")).toBeVisible();
  });

  test("should update action status", async ({ page }) => {
    await page.goto("/actions");
    const firstCard = page.getByTestId("action-card").first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    const inProgressBtn = firstCard.getByTestId("status-in_progress");
    await inProgressBtn.click();
    await expect(inProgressBtn).toHaveClass(/bg-blue-600/);
  });
});
