import assert from "node:assert/strict";
import { test } from "node:test";

import { isBlockedHost, isSafeHttpsUrl } from "./safe-url";

test("isBlockedHost blocks the special IPv4 ranges", () => {
  for (const host of [
    "100.64.0.1", // 100.64.0.0/10 carrier-grade NAT
    "100.127.255.255",
    "198.18.0.1", // 198.18.0.0/15 benchmarking
    "198.19.255.255",
    "192.0.0.1", // 192.0.0.0/24 IETF protocol use
    "224.0.0.1", // 224.0.0.0/4 multicast
    "239.255.255.250",
    "240.0.0.1", // 240.0.0.0/4 reserved
    "255.255.255.255", // broadcast
    "0xe0000001", // 224.0.0.1 written as one hex number
  ]) {
    assert.equal(isBlockedHost(host), true, `${host} must be blocked`);
  }
});

test("isBlockedHost still blocks the private and local ranges", () => {
  for (const host of [
    "localhost",
    "printer.local",
    "0.0.0.0",
    "10.0.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "::1",
    "fd00::1",
    "fe80::1",
  ]) {
    assert.equal(isBlockedHost(host), true, `${host} must be blocked`);
  }
});

test("isBlockedHost checks the IPv4 address inside mapped and NAT64 IPv6", () => {
  for (const host of [
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "[::ffff:a9fe:a9fe]",
    "::ffff:100.64.0.1",
    "64:ff9b::169.254.169.254",
    "[64:ff9b::a9fe:a9fe]",
    "64:ff9b::7f00:1",
    "64:ff9b::10.0.0.1",
    "64:ff9b::e000:1", // 224.0.0.1
  ]) {
    assert.equal(isBlockedHost(host), true, `${host} must be blocked`);
  }
  for (const host of ["::ffff:8.8.8.8", "64:ff9b::8.8.8.8", "64:ff9b::808:808"]) {
    assert.equal(isBlockedHost(host), false, `${host} must be allowed`);
  }
});

test("isBlockedHost blocks IPv6 multicast", () => {
  for (const host of ["ff02::1", "[ff05::1:3]"]) {
    assert.equal(isBlockedHost(host), true, `${host} must be blocked`);
  }
});

test("isBlockedHost allows public addresses and names", () => {
  for (const host of [
    "8.8.8.8",
    "1.1.1.1",
    "100.63.255.255",
    "100.128.0.1",
    "198.17.255.255",
    "198.20.0.1",
    "192.0.1.1",
    "223.255.255.255",
    "2606:4700:4700::1111",
    "example.com",
  ]) {
    assert.equal(isBlockedHost(host), false, `${host} must be allowed`);
  }
});

test("isSafeHttpsUrl uses the same ranges", () => {
  assert.equal(isSafeHttpsUrl("https://100.64.0.1/hook"), false);
  assert.equal(isSafeHttpsUrl("https://[64:ff9b::169.254.169.254]/"), false);
  assert.equal(isSafeHttpsUrl("https://example.com/hook"), true);
  assert.equal(isSafeHttpsUrl("http://example.com/hook"), false);
});
