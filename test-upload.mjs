import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://fdstilebfnfpqtcykttn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_KEY_HERE";

async function testUpload() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const buffer = Buffer.from("hello world", "utf-8");
  const path = `test/123-test.txt`;
  
  console.log("Uploading to user-docs...");
  const res1 = await supabase.storage.from("user-docs").upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: "text/plain",
  });
  console.log("user-docs result:", res1);
  
  console.log("Uploading to rental-documents...");
  const res2 = await supabase.storage.from("rental-documents").upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: "text/plain",
  });
  console.log("rental-documents result:", res2);
}

testUpload().catch(console.error);
