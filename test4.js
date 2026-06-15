const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ypvmtzqxvyvompxuayce.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdm10enF4dnl2b21weHVheWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU0NTI0NCwiZXhwIjoyMDk3MTIxMjQ0fQ.PJwnFFW5_-oJYPKqx9nVnsBc2RozEiSwmQ0EZsxDP-Y');

async function test() {
  const cleanName = 'testfile.jpg';
  const folderName = 'aadhaar';
  const path = `${folderName}/${Date.now()}-${cleanName}`;
  console.log('Testing upload to user-docs with path:', path);
  const res = await supabase.storage.from('user-docs').upload(path, Buffer.from('hello', 'utf8'), { contentType: 'image/jpeg' });
  console.log('Result:', res.error ? res.error : 'Success!');
}
test().catch(console.error);
