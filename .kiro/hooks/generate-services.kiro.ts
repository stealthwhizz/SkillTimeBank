#!/usr/bin/env node

/**
 * Kiro Hook: Generate Service Scaffolds
 * 
 * Reads requirements specs and generates TypeScript service scaffolds
 * with method signatures, error handling, and state management patterns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPECS_DIR = path.join(__dirname, '../specs');
const SERVICES_DIR = path.join(__dirname, '../../src/services');

interface ServiceMethod {
  name: string;
  description: string;
  params: string[];
  returns: string;
}

function parseRequirementsFile(filePath: string): ServiceMethod[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const methods: ServiceMethod[] = [];
  
  // Simple parser - extract user stories and convert to methods
  const storyRegex = /\*\*User Story:\*\* As a (.+?), I want to (.+?), so that (.+?)\./g;
  let match;
  
  while ((match = storyRegex.exec(content)) !== null) {
    const action = match[2];
    // Convert user story to method name
    const methodName = action
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 50);
    
    methods.push({
      name: methodName,
      description: `${action}`,
      params: ['state: TimebankState', 'context: any'],
      returns: '{ success: boolean; newState?: TimebankState; error?: string }'
    });
  }
  
  return methods;
}

function generateServiceScaffold(serviceName: string, methods: ServiceMethod[]): string {
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + 'Service';
  
  let code = `import { TimebankState } from '../state/timebank.js';\n\n`;
  code += `export class ${className} {\n\n`;
  
  methods.forEach((method, index) => {
    code += `  /**\n`;
    code += `   * ${method.description}\n`;
    code += `   */\n`;
    code += `  static ${method.name}(\n`;
    code += `    ${method.params.join(',\n    ')}\n`;
    code += `  ): ${method.returns} {\n`;
    code += `    try {\n`;
    code += `      // TODO: Implement ${method.name}\n`;
    code += `      return { success: false, error: 'Not implemented' };\n`;
    code += `    } catch (error) {\n`;
    code += `      return { success: false, error: 'Failed to ${method.description}' };\n`;
    code += `    }\n`;
    code += `  }\n`;
    
    if (index < methods.length - 1) code += `\n`;
  });
  
  code += `}\n`;
  return code;
}

function main() {
  console.log('🔧 Kiro: Generating service scaffolds from specs...\n');
  
  const specsPath = SPECS_DIR;
  if (!fs.existsSync(specsPath)) {
    console.error(`❌ Specs directory not found: ${specsPath}`);
    process.exit(1);
  }
  
  const specDirs = fs.readdirSync(specsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  let totalGenerated = 0;
  
  specDirs.forEach(dirName => {
    const requirementsPath = path.join(specsPath, dirName, 'requirements.md');
    
    if (fs.existsSync(requirementsPath)) {
      console.log(`📄 Processing: ${dirName}/requirements.md`);
      
      const methods = parseRequirementsFile(requirementsPath);
      console.log(`   Found ${methods.length} user stories`);
      
      if (methods.length > 0) {
        const serviceName = dirName.replace(/-/g, '_');
        const serviceCode = generateServiceScaffold(serviceName, methods);
        const outputPath = path.join(SERVICES_DIR, `${serviceName}Service.ts`);
        
        // Only write if file doesn't exist (don't overwrite existing services)
        if (!fs.existsSync(outputPath)) {
          fs.writeFileSync(outputPath, serviceCode);
          console.log(`   ✅ Generated: ${serviceName}Service.ts`);
          totalGenerated++;
        } else {
          console.log(`   ⏭️  Skipped: ${serviceName}Service.ts (already exists)`);
        }
      }
    }
  });
  
  console.log(`\n✨ Done! Generated ${totalGenerated} new service scaffolds.`);
  console.log(`📝 Note: Existing services were preserved.`);
}

main();
