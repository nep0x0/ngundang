// Simple test script to check database connection
// Run this with: node test-database.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjgdusfhpeqwuuhpxepc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZ2R1c2ZocGVxd3V1aHB4ZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY1NjcsImV4cCI6MjA2NDQ1MjU2N30.wu3wI8qS2OwKiBS9as50SFa2JqVHaKSfKpxC4_QxXVk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Check if we can connect
    console.log('\n1. Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('guests')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Connection successful');
    
    // Test 2: Check tables exist
    console.log('\n2. Checking tables...');
    
    // Check guests table
    const { data: guestsData, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (guestsError) {
      console.log('❌ Guests table error:', guestsError.message);
      if (guestsError.code === '42P01') {
        console.log('💡 Table "guests" does not exist. Please run the SQL setup script.');
      }
    } else {
      console.log('✅ Guests table exists');
      console.log('📊 Guests count:', connectionTest?.count || 0);
    }
    
    // Check rsvps table
    const { data: rsvpsData, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('*')
      .limit(1);
    
    if (rsvpsError) {
      console.log('❌ RSVPs table error:', rsvpsError.message);
      if (rsvpsError.code === '42P01') {
        console.log('💡 Table "rsvps" does not exist. Please run the SQL setup script.');
      }
    } else {
      console.log('✅ RSVPs table exists');
    }
    
    // Test 3: Check from_side column
    console.log('\n3. Checking from_side column...');
    const { data: columnTest, error: columnError } = await supabase
      .from('guests')
      .select('from_side')
      .limit(1);
    
    if (columnError) {
      console.log('❌ from_side column error:', columnError.message);
      if (columnError.code === '42703') {
        console.log('💡 Column "from_side" does not exist. Please run the update script.');
      }
    } else {
      console.log('✅ from_side column exists');
    }
    
    // Test 4: Test insert (if tables exist)
    if (!guestsError && !columnError) {
      console.log('\n4. Testing insert operation...');
      const testGuest = {
        name: 'Test User',
        from_side: 'adel',
        invitation_link: 'https://test.com',
        whatsapp_message: 'Test message'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('guests')
        .insert([testGuest])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Insert failed:', insertError.message);
      } else {
        console.log('✅ Insert successful');
        
        // Clean up test data
        await supabase.from('guests').delete().eq('id', insertData.id);
        console.log('🧹 Test data cleaned up');
      }
    }
    
    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testDatabase();
