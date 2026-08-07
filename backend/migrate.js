// backend/migrate.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI ;

console.log('📊 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database:', mongoose.connection.name);
        
        // Define a flexible schema for migration
        const artworkSchema = new mongoose.Schema({}, { strict: false, collection: 'artworks' });
        const Artwork = mongoose.model('Artwork', artworkSchema);
        
        // Check total count
        const totalCount = await Artwork.countDocuments();
        console.log(`\n📝 Total artworks in database: ${totalCount}`);
        
        // Find all artworks with 'year' field
        const artworksWithYear = await Artwork.find({ year: { $exists: true } });
        console.log(`📝 Found ${artworksWithYear.length} artworks with 'year' field`);
        
        if (artworksWithYear.length === 0) {
            console.log('✅ No migration needed! Your database is ready.');
            console.log('\n💡 Your schema is now using "creationDate" instead of "year"');
            console.log('   You can start adding artworks with the new field!');
            process.exit(0);
        }
        
        // Show what will be migrated
        console.log('\n📋 Artworks to migrate:');
        artworksWithYear.forEach(a => {
            console.log(`  • "${a.title}" (year: ${a.year})`);
        });
        
        // Migrate each artwork
        let updatedCount = 0;
        for (let artwork of artworksWithYear) {
            // Create date from year (January 1st)
            const date = new Date(artwork.year, 0, 1);
            
            // Update the document
            await Artwork.updateOne(
                { _id: artwork._id },
                { 
                    $set: { creationDate: date },
                    $unset: { year: "" }
                }
            );
            updatedCount++;
            console.log(`  ✅ Migrated: "${artwork.title}" (${artwork.year} → ${date.toISOString().split('T')[0]})`);
        }
        
        console.log(`\n✅ Successfully migrated ${updatedCount} artworks!`);
        
        // Verify
        const sample = await Artwork.findOne({ creationDate: { $exists: true } });
        if (sample) {
            console.log('\n📊 Sample migrated artwork:');
            console.log(`  Title: ${sample.title}`);
            console.log(`  Creation Date: ${sample.creationDate}`);
            console.log(`  Year field exists? ${sample.year !== undefined}`);
        }
        
        console.log('\n🎉 Migration complete! Your database is ready for the new schema.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure MongoDB is running!');
            console.log('   Terminal 1: "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe" --dbpath C:\\data\\db');
        }
        process.exit(1);
    });