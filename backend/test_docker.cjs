const { exec } = require('child_process');
const path = require('path');
const tempDir = path.join(__dirname, 'temp');
const fs = require('fs');

fs.writeFileSync(path.join(tempDir, 'test.cpp'), '#include <iostream>\nint main(){ int n; std::cin >> n; std::cout << n * 2 << std::endl; return 0; }');

const dockerCmd = `docker run -i --rm -v "${tempDir}:/app" -w /app gcc:latest sh -c "g++ test.cpp -o a.out && ./a.out"`;
console.log('Running:', dockerCmd);

const proc = exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
    console.log('Error:', error);
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
});

proc.stdin.write("10\n");
proc.stdin.end();
