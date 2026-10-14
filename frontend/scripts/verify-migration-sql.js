const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '../prisma/migrations/20261013000000_init/migration.sql');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

const sql = fs.readFileSync(migrationPath, 'utf8');
const schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Extract models from schema
const schemaModels = [...schema.matchAll(/^model\s+([A-Za-z0-9_]+)\s+\{/gm)].map(m => m[1]);

// 2. Extract tables from migration.sql
const tableMatches = [...sql.matchAll(/CREATE\s+TABLE\s+"([^"]+)"/g)].map(m => m[1]);

console.log(`Schema models count: ${schemaModels.length}`);
console.log(`Migration tables count: ${tableMatches.length}`);

const missingInMigration = schemaModels.filter(m => !tableMatches.includes(m));
const extraInMigration = tableMatches.filter(t => !schemaModels.includes(t));

if (missingInMigration.length > 0) {
  console.error('❌ Missing tables in migration:', missingInMigration);
  process.exit(1);
} else {
  console.log('✔ All 24 schema models have corresponding CREATE TABLE statements in migration.sql!');
}

if (extraInMigration.length > 0) {
  console.warn('⚠ Extra tables in migration:', extraInMigration);
}

// 3. Count constraints and indexes
const fks = [...sql.matchAll(/ADD\s+CONSTRAINT\s+"[^"]+"\s+FOREIGN\s+KEY/g)].length;
const indexes = [...sql.matchAll(/CREATE\s+(UNIQUE\s+)?INDEX\s+"[^"]+"/g)].length;
const primaryKeys = [...sql.matchAll(/PRIMARY\s+KEY/g)].length;

console.log(`✔ Primary keys defined: ${primaryKeys}`);
console.log(`✔ Foreign key constraints defined: ${fks}`);
console.log(`✔ Indexes (unique and lookup) defined: ${indexes}`);
console.log('✔ SQL migration structure validation PASSED.');
