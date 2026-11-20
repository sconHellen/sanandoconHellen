import { test } from "node:test";
import assert from "node:assert/strict";
import { presignUrl } from "../../lib/media/sigv4.ts";

// Example from the AWS docs "Authenticating Requests: Using Query Parameters (AWS Signature Version 4)".
test("matches the AWS published presigned-URL example", () => {
  const url = presignUrl({
    method: "GET",
    host: "examplebucket.s3.amazonaws.com",
    path: "/test.txt",
    region: "us-east-1",
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    expiresSeconds: 86400,
    date: new Date("2013-05-24T00:00:00Z"),
  });
  assert.ok(url.endsWith("X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404"), url);
  assert.ok(url.includes("X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request"));
});

test("encodes object keys segment by segment", () => {
  const url = presignUrl({
    method: "GET",
    host: "acc.r2.cloudflarestorage.com",
    path: "/sch-media/respiraciones/fondos/río sereno.mp3",
    region: "auto",
    accessKeyId: "k",
    secretAccessKey: "s",
    expiresSeconds: 300,
    date: new Date("2026-01-01T00:00:00Z"),
  });
  assert.ok(url.startsWith("https://acc.r2.cloudflarestorage.com/sch-media/respiraciones/fondos/r%C3%ADo%20sereno.mp3?"));
  assert.ok(url.includes("X-Amz-Expires=300"));
});
