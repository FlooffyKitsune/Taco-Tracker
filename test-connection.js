const { Client } = require('pg');

// Test both connections
const pooledConnection = "postgresql://postgres.pqdhjhssdtvhsyqpkfvl:CtAQPD7Q6wgWlFOM@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const directConnection = "postgresql://postgres:CtAQPD7Q6wgWlFOM@db.pqdhjhssdtvhsyqpkfvl.supabase.co:5432/postgres";

async function testConnection(connectionString, name) {
  const client = new Client({ connectionString });
  try {
    console.log(`\n🔗 Testing ${name} connection...`);
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ ${name} connection successful!`);
    console.log(`   Server time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} connection failed:`);
    console.log(`   Error: ${error.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🧪 Testing Supabase connections...\n');
  
  const pooledOk = await testConnection(pooledConnection, "Pooled");
  const directOk = await testConnection(directConnection, "Direct");
  
  console.log('\n📊 Summary:');
  console.log(`   Pooled connection: ${pooledOk ? '✅' : '❌'}`);
  console.log(`   Direct connection: ${directOk ? '✅' : '❌'}`);
  
  if (pooledOk || directOk) {
    console.log('\n🎉 At least one connection works! We can proceed.');
  } else {
    console.log('\n⚠️  Both connections failed. Check your Supabase project status.');
  }
}

main().catch(console.error);
