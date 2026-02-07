const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('\n✅ SUCCESS! MongoDB connection works!');
    console.log('✅ Host:', mongoose.connection.host);
    console.log('✅ Database:', mongoose.connection.name);
    process.exit(0);
})
.catch((err) => {
    console.log('\n❌ FAILED! MongoDB connection error:');
    console.error('❌', err.message);
    process.exit(1);
});