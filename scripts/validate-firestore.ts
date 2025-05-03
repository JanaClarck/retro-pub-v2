import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Types for document validation
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface CollectionValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  skipped: number;
  invalidDocs: Array<{
    id: string;
    errors: string[];
  }>;
}

interface ValidationReport {
  collections: {
    [key: string]: CollectionValidationSummary;
  };
  sections: {
    [key: string]: ValidationResult;
  };
  timestamp: string;
  totalDocuments: number;
  totalValid: number;
  totalInvalid: number;
  totalSkipped: number;
}

// Validation schemas
interface SchemaTypes {
  [key: string]: string | string[];
}

interface Schema {
  required: string[];
  types: SchemaTypes;
}

const schemas: Record<string, Schema> = {
  events: {
    required: ['title', 'description', 'date', 'time', 'imageUrl', 'isActive'],
    types: {
      title: 'string',
      description: 'string',
      date: ['string', 'timestamp'],
      time: ['string', 'timestamp'],
      imageUrl: 'string',
      isActive: 'boolean',
      price: 'number',
      capacity: 'number'
    }
  },
  menuItems: {
    required: ['name', 'price', 'category'],
    types: {
      name: 'string',
      price: 'number',
      category: 'string',
      description: 'string'
    }
  },
  gallery: {
    required: ['imageUrl', 'categoryId'],
    types: {
      imageUrl: 'string',
      categoryId: 'string'
    }
  },
  bookings: {
    required: ['date', 'time', 'status'],
    types: {
      date: ['string', 'timestamp'],
      time: ['string', 'timestamp'],
      status: 'string',
      name: 'string',
      email: 'string',
      phone: 'string'
    }
  },
  users: {
    required: ['email', 'role'],
    types: {
      email: 'string',
      role: 'string'
    }
  },
  sections: {
    required: ['content'],
    types: {
      content: 'string',
      imageUrl: 'string'
    }
  }
};

// Helper functions
function isValidTimestamp(value: any): boolean {
  if (!value) return false;
  
  if (value instanceof admin.firestore.Timestamp) {
    return true;
  }
  
  if (value instanceof Date) {
    return true;
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  if (typeof value === 'number') {
    return value > 0;
  }
  
  return false;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    // Check if it's a Firebase Storage path
    return value.startsWith('gs://') || value.startsWith('https://firebasestorage.googleapis.com/');
  }
}

function validateFieldType(value: any, expectedType: string | string[]): boolean {
  if (Array.isArray(expectedType)) {
    return expectedType.some(type => validateFieldType(value, type));
  }

  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'timestamp':
      return isValidTimestamp(value);
    default:
      return true;
  }
}

// Validate a single document
function validateDocument(
  data: Record<string, any>,
  schema: Schema,
  docId: string
): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  for (const field of schema.required) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, value] of Object.entries(data)) {
    const expectedType = schema.types[field];
    if (expectedType && !validateFieldType(value, expectedType)) {
      errors.push(`Invalid type for field ${field}: expected ${expectedType}, got ${typeof value}`);
    }

    // Additional URL validation for image fields
    if (field.includes('imageUrl') && value && typeof value === 'string' && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate a collection
async function validateCollection(
  collectionName: string,
  schema: Schema
): Promise<CollectionValidationSummary> {
  console.log(`\n🔍 Validating collection: ${collectionName}`);
  
  const summary: CollectionValidationSummary = {
    total: 0,
    valid: 0,
    invalid: 0,
    skipped: 0,
    invalidDocs: []
  };

  try {
    const snapshot = await db.collection(collectionName).get();
    summary.total = snapshot.size;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const validation = validateDocument(data, schema, doc.id);

      if (validation.isValid) {
        summary.valid++;
      } else {
        summary.invalid++;
        summary.invalidDocs.push({
          id: doc.id,
          errors: validation.errors
        });
      }
    }
  } catch (error: any) {
    console.error(`❌ Error validating ${collectionName}:`, error?.message || 'Unknown error');
    summary.skipped = summary.total;
  }

  return summary;
}

// Validate a single section document
async function validateSection(
  docPath: string,
  schema: Schema
): Promise<ValidationResult> {
  try {
    const doc = await db.doc(docPath).get();
    if (!doc.exists) {
      return { isValid: false, errors: ['Document does not exist'] };
    }

    const data = doc.data();
    if (!data) {
      return { isValid: false, errors: ['Document exists but has no data'] };
    }

    return validateDocument(data as Record<string, any>, schema, doc.id);
  } catch (error: any) {
    return {
      isValid: false,
      errors: [`Error fetching document: ${error?.message || 'Unknown error'}`]
    };
  }
}

// Main validation function
async function validateFirestore(): Promise<ValidationReport> {
  console.log('🚀 Starting Firestore validation...');

  const report: ValidationReport = {
    collections: {},
    sections: {},
    timestamp: new Date().toISOString(),
    totalDocuments: 0,
    totalValid: 0,
    totalInvalid: 0,
    totalSkipped: 0
  };

  // Validate collections
  const collections = ['events', 'menuItems', 'gallery', 'users', 'bookings'];
  for (const collection of collections) {
    report.collections[collection] = await validateCollection(
      collection,
      schemas[collection as keyof typeof schemas]
    );
  }

  // Validate section documents
  const sectionDocs = [
    'sections/hero',
    'sections/about',
    'sections/interior',
    'sections/menu.description',
    'sections/gallery.description'
  ];

  for (const docPath of sectionDocs) {
    report.sections[docPath] = await validateSection(docPath, schemas.sections);
  }

  // Validate gallery categories
  try {
    const categoriesSnapshot = await db.doc('sections/gallery')
      .collection('categories')
      .get();
    
    report.sections['sections/gallery/categories'] = {
      isValid: true,
      errors: []
    };

    if (categoriesSnapshot.empty) {
      report.sections['sections/gallery/categories'].errors.push('No gallery categories found');
    }
  } catch (error: any) {
    report.sections['sections/gallery/categories'] = {
      isValid: false,
      errors: [`Error fetching gallery categories: ${error?.message || 'Unknown error'}`]
    };
  }

  // Calculate totals
  for (const summary of Object.values(report.collections)) {
    report.totalDocuments += summary.total;
    report.totalValid += summary.valid;
    report.totalInvalid += summary.invalid;
    report.totalSkipped += summary.skipped;
  }

  // Print summary
  console.log('\n📊 Validation Summary:');
  
  // Collections summary
  for (const [collection, summary] of Object.entries(report.collections)) {
    console.log(`\n${collection}:`);
    console.log(`- Total: ${summary.total}`);
    console.log(`- Valid: ${summary.valid}`);
    console.log(`- Invalid: ${summary.invalid}`);
    console.log(`- Skipped: ${summary.skipped}`);

    if (summary.invalidDocs.length > 0) {
      console.log('\nInvalid documents:');
      summary.invalidDocs.forEach(doc => {
        console.log(`\n  ${doc.id}:`);
        doc.errors.forEach(error => console.log(`  - ${error}`));
      });
    }
  }

  // Sections summary
  console.log('\nSections:');
  for (const [path, result] of Object.entries(report.sections)) {
    console.log(`\n${path}:`);
    console.log(`- Valid: ${result.isValid}`);
    if (result.errors.length > 0) {
      console.log('- Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  }

  // Write report to file
  try {
    await fs.writeFile(
      'validation-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('\n✅ Validation report written to validation-report.json');
  } catch (error: any) {
    console.error('\n❌ Error writing report:', error?.message || 'Unknown error');
  }

  return report;
}

// Run validation
validateFirestore()
  .then(() => {
    console.log('\n✅ Validation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }); 