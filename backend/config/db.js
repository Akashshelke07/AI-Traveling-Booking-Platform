const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`✅ Host: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`);
        console.log(`✅ Port: ${conn.connection.port}`);
        
    } catch (error) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error(`❌ Error: ${error.message}\n`);
        
        // Detailed troubleshooting
        if (error.message.includes('ENOTFOUND')) {
            console.error('🔍 DNS Error - Possible causes:');
            console.error('   1. Check your internet connection');
            console.error('   2. Verify the cluster URL is correct');
            console.error('   3. Try flushing DNS cache\n');
        } else if (error.message.includes('IP')) {
            console.error('🔍 IP Whitelist Error:');
            console.error('   1. Go to MongoDB Atlas → Network Access');
            console.error('   2. Click "Add IP Address"');
            console.error('   3. Select "Allow Access from Anywhere"');
            console.error('   4. Wait 1-2 minutes and restart server\n');
        } else if (error.message.includes('authentication')) {
            console.error('🔍 Authentication Error:');
            console.error('   1. Verify username: akashshelke594_db_user');
            console.error('   2. Verify password is correct');
            console.error('   3. Check if @ symbol is encoded as %40\n');
        }
        
        // Don't exit in development
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.log('⚠️  Server running without database connection');
            console.log('⚠️  Fix the connection and restart\n');
        }
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;