import * as fs from 'fs/promises';
import * as path from 'path';

interface ComponentAnalysis {
  imports: string[];
  firestorePaths: {
    [key: string]: string | null;
  };
  errorHandling: {
    [key: string]: boolean;
  };
  dataFlow: {
    [key: string]: {
      propsReceived: string[];
      propsPassedDown: string[];
    };
  };
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+{?\s*([^}]*?)\s*}?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const components = match[1].split(',').map(c => c.trim());
    imports.push(...components);
  }

  return imports.filter(Boolean);
}

function extractFirestorePaths(content: string): string[] {
  const paths: string[] = [];
  
  // Match doc() calls
  const docRegex = /doc\(db,\s*['"`](.*?)['"`]/g;
  let match;
  while ((match = docRegex.exec(content)) !== null) {
    paths.push(match[1]);
  }

  // Match collection() calls
  const collectionRegex = /collection\(db,\s*['"`](.*?)['"`]/g;
  while ((match = collectionRegex.exec(content)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

function checkErrorHandling(content: string): boolean {
  const errorPatterns = [
    'Failed to load',
    'Error loading',
    'catch',
    'error instanceof',
    'error?.message',
    'error handling',
    'onError'
  ];

  return errorPatterns.some(pattern => content.toLowerCase().includes(pattern.toLowerCase()));
}

function analyzeDataFlow(content: string): { propsReceived: string[]; propsPassedDown: string[] } {
  const propsReceived: string[] = [];
  const propsPassedDown: string[] = [];

  // Check props received (interface or type definition)
  const propsInterface = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
  if (propsInterface) {
    const props = propsInterface[1].split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => line.split(':')[0].trim());
    propsReceived.push(...props);
  }

  // Check props passed to child components
  const jsxProps = content.match(/<\w+\s+([^>]+)>/g);
  if (jsxProps) {
    jsxProps.forEach(prop => {
      const matches = prop.match(/\w+={/g);
      if (matches) {
        matches.forEach(match => {
          propsPassedDown.push(match.replace('={', ''));
        });
      }
    });
  }

  return {
    propsReceived,
    propsPassedDown
  };
}

async function analyzeComponent(componentPath: string): Promise<ComponentAnalysis | null> {
  const content = await readFileIfExists(componentPath);
  if (!content) {
    console.error(`❌ Could not read file: ${componentPath}`);
    return null;
  }

  return {
    imports: extractImports(content),
    firestorePaths: {
      [path.basename(componentPath)]: extractFirestorePaths(content)[0] || null
    },
    errorHandling: {
      [path.basename(componentPath)]: checkErrorHandling(content)
    },
    dataFlow: {
      [path.basename(componentPath)]: analyzeDataFlow(content)
    }
  };
}

async function debugComponents() {
  console.log('🔍 Starting component debugging...\n');

  // 1. Analyze homepage
  console.log('📄 Analyzing homepage (app/public/page.tsx)...');
  const homepageAnalysis = await analyzeComponent('app/public/page.tsx');
  
  if (!homepageAnalysis) {
    console.error('❌ Could not analyze homepage');
    return;
  }

  console.log('Components imported:', homepageAnalysis.imports.join(', '));

  // 2. Analyze Hero component
  console.log('\n📄 Analyzing Hero component...');
  const heroAnalysis = await analyzeComponent('components/public/Hero.tsx');
  
  if (heroAnalysis) {
    console.log('Firestore path:', heroAnalysis.firestorePaths['Hero.tsx'] || '⚠️ Not found');
    console.log('Has error handling:', heroAnalysis.errorHandling['Hero.tsx'] ? '✅ Yes' : '❌ No');
    console.log('Props structure:', heroAnalysis.dataFlow['Hero.tsx']);
  } else {
    console.log('⚠️ Hero component not found');
  }

  // 3. Analyze EventsPreview component
  console.log('\n📄 Analyzing EventsPreview component...');
  const eventsAnalysis = await analyzeComponent('components/public/EventsPreview.tsx');
  
  if (eventsAnalysis) {
    console.log('Firestore path:', eventsAnalysis.firestorePaths['EventsPreview.tsx'] || '⚠️ Not found');
    console.log('Has error handling:', eventsAnalysis.errorHandling['EventsPreview.tsx'] ? '✅ Yes' : '❌ No');
    console.log('Props structure:', eventsAnalysis.dataFlow['EventsPreview.tsx']);
  } else {
    console.log('⚠️ EventsPreview component not found');
  }

  // 4. Check for common issues
  console.log('\n🔍 Checking for common issues...');
  
  const issues: string[] = [];

  if (!homepageAnalysis.imports.includes('Hero')) {
    issues.push('❌ Hero component not imported in homepage');
  }
  if (!homepageAnalysis.imports.includes('EventsPreview')) {
    issues.push('❌ EventsPreview component not imported in homepage');
  }
  if (heroAnalysis && !heroAnalysis.errorHandling['Hero.tsx']) {
    issues.push('⚠️ Hero component missing error handling');
  }
  if (eventsAnalysis && !eventsAnalysis.errorHandling['EventsPreview.tsx']) {
    issues.push('⚠️ EventsPreview component missing error handling');
  }

  if (issues.length > 0) {
    console.log('\nPotential issues found:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('✅ No common issues found');
  }

  // 5. Suggestions
  console.log('\n💡 Suggestions:');
  console.log('1. Verify Firestore paths match your database structure');
  console.log('2. Add error boundaries or fallback UI for failed data fetching');
  console.log('3. Check if components are properly mounted in the page layout');
  console.log('4. Verify data is being passed down correctly through props');
}

// Run debug analysis
debugComponents()
  .then(() => {
    console.log('\n✨ Component debugging completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Debug analysis failed:', error);
    process.exit(1);
  }); 