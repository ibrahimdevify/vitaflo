const fs = require('fs');

// Read schema file
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Check if userName already exists
if (!schema.includes('userName')) {
  // Add userName field after l_name
  schema = schema.replace(
    /l_name\s+String\s+@db\.VarChar\(255\)/,
    'l_name                      String   @db.VarChar(255)\n  userName                    String?  @unique @db.VarChar(100)'
  );
  
  // Write updated schema
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('✅ Schema updated: Added userName field');
} else {
  console.log('ℹ️  userName field already exists in schema');
}
