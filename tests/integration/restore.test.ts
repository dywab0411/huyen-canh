import { PGlite } from "@electric-sql/pglite";
import { it, expect } from "vitest";
import { writeFileSync } from "node:fs";
it("OPS02 synthetic encrypted Postgres backup restore + deletion tombstone replay", async () => {
  const source = new PGlite();
  let restored: PGlite | undefined;
  try {
    await source.exec(
      `create table customer_test(id integer primary key,body text);create table consent_test(id integer primary key,scope text,granted boolean);create table role_test(id integer primary key,role text);insert into customer_test values(1,'fictional result keep'),(2,'fictional result deleted after backup');insert into consent_test values(1,'website',false);insert into role_test values(1,'editor');`,
    );
    const dump = await source.dumpDataDir("gzip");
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      await dump.arrayBuffer(),
    );
    expect(new TextDecoder().decode(encrypted)).not.toContain(
      "fictional result",
    );
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted,
    );
    restored = new PGlite({ loadDataDir: new Blob([plain]) });
    await restored.waitReady;
    expect(
      (await restored.query("select * from customer_test")).rows,
    ).toHaveLength(2);
    expect((await restored.query("select * from consent_test")).rows).toEqual([
      { id: 1, scope: "website", granted: false },
    ]);
    expect((await restored.query("select * from role_test")).rows).toEqual([
      { id: 1, role: "editor" },
    ]);
    const deletionIds = [2];
    for (const id of deletionIds)
      await restored.query("delete from customer_test where id=$1", [id]);
    expect((await restored.query("select id from customer_test")).rows).toEqual(
      [{ id: 1 }],
    );
    writeFileSync(
      "docs/RESTORE_LOCAL_REPORT.json",
      JSON.stringify(
        {
          date: "2026-10-25",
          environment:
            "PGlite synthetic isolated database, NOT Supabase staging",
          encryption: "AES-256-GCM ephemeral key in memory",
          encryptedBytes: encrypted.byteLength,
          verified: [
            "database dump restored",
            "fictional roles restored",
            "consent withdrawal preserved",
            "deletion tombstone replayed",
          ],
          notVerified: [
            "Supabase Auth identities",
            "Supabase private storage objects",
            "remote restore permissions",
            "production recovery time",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await source.close();
    await restored?.close();
  }
}, 30000);
