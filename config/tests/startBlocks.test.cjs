require("ts-node/register");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const yaml = require("js-yaml");
const { populateStartBlocks } = require("../startBlocks");

const ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const OTHER = "0x234567890abcdef1234567890abcdef123456789";
function resolve(entry, fallback = "100") {
  const config = { blockNumber: fallback, staking: ADDRESS };
  populateStartBlocks(config, [{ Staking: { address: ADDRESS, ...entry } }]);
  return config;
}

test("non-proxied contracts start at their creation block, including deployment logs", () => {
  const config = resolve({ deployment: { blockNumber: 250 } });
  assert.equal(config.startBlocks.staking, 250);
  assert.equal(config.startBlockSources.staking, "deployment.blockNumber");
});

test("proxy sources use proxy creation, never implementation deployment or upgrade blocks", () => {
  const config = resolve({
    proxy: "graph",
    implementation: OTHER,
    proxyDeployment: { blockNumber: 120 },
    implementationDeployment: { blockNumber: 500 },
    deployment: { blockNumber: 499 },
  });
  assert.equal(config.startBlocks.staking, 120);
  assert.equal(config.startBlockSources.staking, "proxyDeployment.blockNumber");
});

test("missing creation metadata preserves the early chain fallback", () => {
  for (const entry of [
    {},
    { proxy: "transparent", implementationDeployment: { blockNumber: 900 } },
    { proxy: true, implementation: { address: OTHER, blockNumber: 900 } },
    { proxy: "graph", proxyDeployment: { verified: "explorer link without creation block" } },
    { pendingImplementation: { deployment: { blockNumber: 900 } } },
    { deployment: { blockNumber: null } },
  ]) {
    const config = resolve(entry);
    assert.equal(config.startBlocks.staking, 100);
    assert.equal(config.startBlockSources.staking, "chainFallback");
  }
});

test("an implementation address alone identifies a proxy even when the proxy flag is absent", () => {
  assert.equal(
    resolve({ implementation: OTHER, deployment: { blockNumber: 999 } }).startBlocks.staking,
    100
  );
  assert.equal(resolve({ proxyDeployment: { blockNumber: 120 } }).startBlocks.staking, 120);
});

test("creation earlier than the chain fallback is not truncated, and block zero is valid", () => {
  assert.equal(resolve({ deployment: { blockNumber: 50 } }).startBlocks.staking, 50);
  assert.equal(resolve({ deployment: { blockNumber: "0" } }).startBlocks.staking, 0);
  assert.equal(resolve({}, "0").startBlocks.staking, 0);
});

test("entries match by emitter address across aliases and case, without losing metadata to a merge", () => {
  const config = { blockNumber: "100", staking: ADDRESS, gns: OTHER };
  populateStartBlocks(config, [
    {
      OldStaking: {
        address: ADDRESS.toUpperCase(),
        proxy: true,
        proxyDeployment: { blockNumber: 120 },
      },
    },
    {
      HorizonStaking: { address: ADDRESS },
      OldStaking: { address: OTHER, deployment: { blockNumber: 170 } },
    },
  ]);
  assert.deepEqual(config.startBlocks, { gns: 170, staking: 120 });
});

test("metadata for another emitting address cannot move a source start block", () => {
  const config = { blockNumber: "100", staking: ADDRESS };
  populateStartBlocks(config, [
    { Staking: { address: OTHER, proxyDeployment: { blockNumber: 900 } } },
  ]);
  assert.equal(config.startBlocks.staking, 100);
});

test("proxy classification applies across books, and the earliest proxy creation wins", () => {
  const config = { blockNumber: "100", staking: ADDRESS };
  populateStartBlocks(config, [
    { Staking: { address: ADDRESS, deployment: { blockNumber: 999 } } },
    { HorizonStaking: { address: ADDRESS, proxy: "graph", proxyDeployment: { blockNumber: 130 } } },
    { LegacyStaking: { address: ADDRESS, proxyDeployment: { blockNumber: 120 } } },
  ]);
  assert.equal(config.startBlocks.staking, 120);
});

test("invalid creation metadata fails preparation instead of silently skipping history", () => {
  for (const invalid of [
    -1,
    1.5,
    NaN,
    Infinity,
    "",
    "123junk",
    "0x100",
    true,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.throws(
      () => resolve({ deployment: { blockNumber: invalid } }),
      /Invalid creation block/
    );
    assert.throws(() => resolve({}, invalid), /Invalid creation block/);
  }
});

test("omitted L2 contracts need no start block, while malformed configured addresses fail", () => {
  const config = { blockNumber: "100", staking: ADDRESS, subgraphService: "" };
  populateStartBlocks(config, []);
  assert.deepEqual(config.startBlocks, { staking: 100 });
  assert.throws(
    () => populateStartBlocks({ blockNumber: "100", staking: "bad-address" }, []),
    /Invalid contract address/
  );
});

const template = fs.readFileSync(path.join(__dirname, "../../subgraph.template.yaml"), "utf8");
for (const isL1 of [true, false]) {
  test(`all ${isL1 ? "L1" : "L2"} manifest sources use their emitter's creation block`, () => {
    const config = { blockNumber: "100", isL1, network: isL1 ? "mainnet" : "arbitrum-one" };
    const book = {},
      expected = new Map();
    const fields = [
      ...new Set([...template.matchAll(/address: ['"]\{\{(\w+)\}\}['"]/g)].map((m) => m[1])),
    ];
    fields.forEach((field, i) => {
      const address = "0x" + (i + 1).toString(16).padStart(40, "0");
      config[field] = address;
      book[field] = { address, proxy: "graph", proxyDeployment: { blockNumber: 1000 + i } };
      expected.set(address, 1000 + i);
    });
    populateStartBlocks(config, [book]);
    const manifest = yaml.load(mustache.render(template, config));
    for (const source of manifest.dataSources) {
      assert.equal(source.source.startBlock, expected.get(source.source.address), source.name);
      assert.equal(Number.isSafeInteger(source.source.startBlock), true, source.name);
    }
    const stakingSources = manifest.dataSources.filter((s) => s.source.address === config.staking);
    assert.ok(stakingSources.length >= 3);
    assert.equal(new Set(stakingSources.map((s) => s.source.startBlock)).size, 1);
  });
}
