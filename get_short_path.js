const { execSync } = require('child_process');
const path = require('path');

const targetPath = process.argv[2] || '.';
const fullPath = path.resolve(targetPath);

try {
    // This command gets the 8.3 short path on Windows
    const result = execSync(`cmd /c "for %I in ("${fullPath}") do @echo %~sI"`).toString().trim();
    console.log(result);
} catch (error) {
    console.error('Failed to get short path:', error.message);
    process.exit(1);
}
