const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

console.log('🔍 Checking if user exists...\n');

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'akashshelke594@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
        console.log('✅ USER EXISTS!');
        console.log('📧 Email:', user.email);
        console.log('👤 Name:', user.name);
        console.log('✉️  Email Verified:', user.isEmailVerified);
        console.log('📅 Created:', user.createdAt);
        console.log('\n✅ You can login with this email!');
    } else {
        console.log('❌ USER NOT FOUND!');
        console.log('📝 You need to REGISTER first before logging in.');
        console.log('   Go to: http://localhost:5173/register');
    }
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    process.exit(0);
})
.catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
});
