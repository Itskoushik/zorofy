const test = require("node:test");
const assert = require("node:assert/strict");

let utils;
test("music player queue helpers", async (t) => {
  utils = await import("../src/services/playerUtils.mjs");

  await t.test("wraps next and previous through the active queue", () => {
    assert.equal(utils.getNextTrackIndex(2, 3), 0);
    assert.equal(utils.getPreviousTrackIndex(0, 3), 2);
    assert.equal(utils.getNextTrackIndex(0, 0), -1);
  });

  await t.test("shuffle chooses another track when possible", () => {
    assert.equal(utils.getNextTrackIndex(1, 4, true, () => 0), 0);
    assert.equal(utils.getPreviousTrackIndex(1, 4, true, () => 0.99), 3);
    assert.equal(utils.getNextTrackIndex(0, 1, true, () => 0.5), 0);
  });

  await t.test("repeat modes determine automatic queue advance", () => {
    assert.equal(utils.shouldAdvanceAfterEnd(0, 1, "off"), false);
    assert.equal(utils.shouldAdvanceAfterEnd(0, 2, "off"), true);
    assert.equal(utils.shouldAdvanceAfterEnd(1, 2, "off"), false);
    assert.equal(utils.shouldAdvanceAfterEnd(1, 2, "all"), true);
    assert.equal(utils.shouldAdvanceAfterEnd(0, 2, "one"), false);
  });
});
