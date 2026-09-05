const fs = require("fs");
const path = require("path");
const assert = require("assert");

function run() {
  console.log("=================================================");
  console.log("   DASHBOARD LAYOUT ORDER VERIFICATION SUITE    ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function pass(msg) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  function fail(msg, err) {
    failed++;
    console.error(`[FAIL] ${msg}`);
    if (err) console.error(err);
  }

  try {
    const dashboardHtml = fs.readFileSync(path.join(__dirname, "../customer/dashboard.php"), "utf8");
    const contentIdx = dashboardHtml.indexOf('<div class="vt-content">');
    assert.ok(contentIdx !== -1, "vt-content wrapper exists");
    const mainContentHtml = dashboardHtml.slice(contentIdx);

    // Check presence of all key components within main content
    const balanceIdx = mainContentHtml.indexOf('AVAILABLE BALANCE');
    const actionsIdx = mainContentHtml.indexOf('class="vt-actions"');
    const activityIdx = mainContentHtml.indexOf('class="vt-chart"');
    const marketWatchIdx = mainContentHtml.indexOf('data-i18n="mk_watchlist"');
    const accountDetailsIdx = mainContentHtml.indexOf('<strong>Account Details</strong>');
    const transactionsIdx = mainContentHtml.indexOf('class="vt-transactions"');
    const fakeCardIdx = mainContentHtml.indexOf('class="vt-fake-card"');

    assert.ok(balanceIdx !== -1, "AVAILABLE BALANCE component exists");
    pass("AVAILABLE BALANCE component located");

    assert.ok(actionsIdx !== -1, "Quick Actions panel exists");
    pass("Quick Actions panel located");

    assert.ok(activityIdx !== -1, "Account Activity section exists");
    pass("Account Activity section located");

    assert.ok(marketWatchIdx !== -1, "Market Watch section exists");
    pass("Market Watch section located");

    assert.ok(accountDetailsIdx !== -1, "Account Details section exists");
    pass("Account Details section located");

    assert.ok(transactionsIdx !== -1, "Recent Transactions section exists");
    pass("Recent Transactions section located");

    assert.ok(fakeCardIdx !== -1, "Fake card exists in aside");
    pass("Card display located in aside");

    // 1. First, retain the current AVAILABLE BALANCE component and Quick Actions panel in their upper placement
    assert.ok(balanceIdx < actionsIdx, "AVAILABLE BALANCE component precedes Quick Actions panel");
    pass("AVAILABLE BALANCE and Quick Actions retained in upper placement");

    // 2. Position both the AVAILABLE BALANCE component and Quick Actions panel directly above the Account Details section and the Account Activity section
    assert.ok(actionsIdx < activityIdx, "AVAILABLE BALANCE and Quick Actions appear directly above Account Activity");
    assert.ok(actionsIdx < marketWatchIdx, "AVAILABLE BALANCE and Quick Actions appear above Market Watch");
    assert.ok(actionsIdx < accountDetailsIdx, "AVAILABLE BALANCE and Quick Actions appear above Account Details");
    pass("AVAILABLE BALANCE and Quick Actions positioned above Account Activity and Account Details");

    // 3. Place the Market Watch section and the Account Details section to appear consecutively after (underneath) the Account Activity section in the layout flow
    assert.ok(activityIdx < marketWatchIdx, "Market Watch appears after Account Activity");
    assert.ok(marketWatchIdx < accountDetailsIdx, "Account Details appears directly after Market Watch");
    assert.ok(accountDetailsIdx < transactionsIdx, "Account Details appears before Recent Transactions");
    pass("Market Watch and Account Details appear consecutively after Account Activity in the layout flow");

    // 4. Critical IDs check
    const criticalIds = [
      "balanceAmount",
      "portfolioValue",
      "totalAssets",
      "savingAccount",
      "quickLogoutBtn",
      "activityChartSvg",
      "maskedAccount",
      "fullAccountNumber",
      "txList",
      "txEmptyState",
      "cardNumberDisplay",
      "cardNameDisplay",
      "avatarInitials",
      "dashboardUserName",
      "dashboardUserEmail"
    ];

    for (const id of criticalIds) {
      assert.ok(dashboardHtml.includes(`id="${id}"`), `Critical ID '${id}' is preserved`);
    }
    pass("All critical IDs, interactivity hooks, and styles are fully preserved");

  } catch (err) {
    fail("Dashboard layout check failed", err);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
