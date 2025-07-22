#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 NotesApp Setup Helper\n');

// Check if .env already exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists!');
  console.log('📄 Current configuration:');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
        console.log(`   ${key}=${maskedValue}`);
      }
    });
  } catch (error) {
    console.log('   Unable to read current .env file');
  }
  
  console.log('\n🔧 To update your configuration:');
  console.log('   1. Edit the .env file manually');
  console.log('   2. Or delete it and run this script again');
  console.log('\n📖 For detailed setup instructions, see SUPABASE_SETUP.md');
  process.exit(0);
}

// Create .env file with template
const envTemplate = `# Supabase Configuration
# Get these values from your Supabase dashboard (Settings > API)

REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Instructions:
# 1. Go to https://supabase.com and create a new project
# 2. Go to Settings > API in your Supabase dashboard  
# 3. Replace the values above with your actual Project URL and anon/public key
# 4. Run the SQL setup from SUPABASE_SETUP.md in your Supabase SQL editor
# 5. Restart your development server (npm start)
`;

try {
  fs.writeFileSync(envPath, envTemplate, 'utf8');
  console.log('✅ Created .env file successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. 🌐 Go to https://supabase.com and create a new project');
  console.log('   2. 🔑 Get your credentials from Settings > API');
  console.log('   3. ✏️  Edit the .env file with your actual Supabase credentials');
  console.log('   4. 🗄️  Run the SQL setup from SUPABASE_SETUP.md');
  console.log('   5. 🚀 Start the app with: npm start');
  console.log('\n📖 For detailed instructions, see SUPABASE_SETUP.md');
  console.log('\n💡 The app will guide you through the setup if anything is missing!');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n🔧 Manual setup:');
  console.log('   Create a .env file in your project root with:');
  console.log('   REACT_APP_SUPABASE_URL=your-supabase-url');
  console.log('   REACT_APP_SUPABASE_ANON_KEY=your-anon-key');
} 