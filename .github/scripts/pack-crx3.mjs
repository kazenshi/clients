// Packs an extension ZIP into a CRX3 file signed with an RSA private key in PEM format.
// Usage: node pack-crx3.mjs <key.pem> <extension.zip> <output.crx>
// Prints the resulting Chromium extension ID.
import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [keyPath, zipPath, outPath] = process.argv.slice(2);
if (!outPath) {
  console.error("Usage: node pack-crx3.mjs <key.pem> <extension.zip> <output.crx>");
  process.exit(1);
}

const varint = (value) => {
  const bytes = [];
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value);
  return Buffer.from(bytes);
};
// Length-delimited protobuf field.
const field = (number, data) =>
  Buffer.concat([varint((number << 3) | 2), varint(data.length), data]);
const uint32 = (value) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
};

const privateKey = createPrivateKey(readFileSync(keyPath));
const publicKey = createPublicKey(privateKey).export({ type: "spki", format: "der" });
const zip = readFileSync(zipPath);

const crxId = createHash("sha256").update(publicKey).digest().subarray(0, 16);
const signedHeaderData = field(1, crxId);
const signature = sign(
  "sha256",
  Buffer.concat([
    Buffer.from("CRX3 SignedData\0"),
    uint32(signedHeaderData.length),
    signedHeaderData,
    zip,
  ]),
  privateKey,
);
// CrxFileHeader: sha256_with_rsa = 2, signed_header_data = 10000.
const header = Buffer.concat([
  field(2, Buffer.concat([field(1, publicKey), field(2, signature)])),
  field(10000, signedHeaderData),
]);

writeFileSync(
  outPath,
  Buffer.concat([Buffer.from("Cr24"), uint32(3), uint32(header.length), header, zip]),
);

console.log(
  [...crxId.toString("hex")].map((digit) => String.fromCharCode(97 + parseInt(digit, 16))).join(""),
);
