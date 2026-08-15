import vm from 'vm';
import { spawn } from 'child_process';
import { TestCase, TestResult, ExecutionResponse } from '../types';

export class CodeJudge {
  /**
   * Execute JavaScript or Python code against test cases
   */
  public static async executeCode(
    language: 'javascript' | 'python',
    code: string,
    functionName: string,
    testCases: TestCase[],
    timeoutMs: number = 2000
  ): Promise<ExecutionResponse> {
    const startTime = Date.now();
    if (language === 'javascript') {
      return this.executeJavaScript(code, functionName, testCases, timeoutMs, startTime);
    } else {
      return this.executePython(code, functionName, testCases, timeoutMs, startTime);
    }
  }

  /**
   * Execute JavaScript safely in a Node.js VM context
   */
  private static async executeJavaScript(
    code: string,
    functionName: string,
    testCases: TestCase[],
    timeoutMs: number,
    startTime: number
  ): Promise<ExecutionResponse> {
    const results: TestResult[] = [];
    let passedCount = 0;

    // Build execution script
    try {
      // Basic sandbox context
      const sandbox = {
        console: {
          log: () => {},
          error: () => {},
          warn: () => {}
        },
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
        Date,
        parseInt,
        parseFloat,
        isNaN,
        isFinite
      };

      const context = vm.createContext(sandbox);
      const script = new vm.Script(code);
      script.runInContext(context, { timeout: timeoutMs });

      // @ts-ignore
      const targetFunction = context[functionName];
      if (typeof targetFunction !== 'function') {
        return {
          success: false,
          totalTests: testCases.length,
          passedTests: 0,
          results: [],
          compilerError: `Function '${functionName}' is not defined or is not a function.`,
          allPassed: false,
          executionTimeMs: Date.now() - startTime
        };
      }

      for (const tc of testCases) {
        const tcStart = Date.now();
        try {
          const args = JSON.parse(tc.input);
          const expected = JSON.parse(tc.expectedOutput);

          // Run target function with args array
          const rawActual = targetFunction(...args);
          const actualJson = JSON.stringify(rawActual);
          const expectedJson = JSON.stringify(expected);

          // Deep equality via normalized JSON comparison
          const passed = this.compareOutputs(rawActual, expected);

          if (passed) passedCount++;

          results.push({
            testCaseId: tc.id,
            passed,
            input: tc.isHidden ? '[Hidden]' : tc.input,
            expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
            actualOutput: tc.isHidden ? (passed ? '[Passed]' : '[Failed]') : (actualJson ?? 'undefined'),
            executionTimeMs: Date.now() - tcStart,
            isHidden: tc.isHidden
          });
        } catch (err: any) {
          results.push({
            testCaseId: tc.id,
            passed: false,
            input: tc.isHidden ? '[Hidden]' : tc.input,
            expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
            actualOutput: 'Runtime Exception',
            error: err.message || 'Runtime Error',
            executionTimeMs: Date.now() - tcStart,
            isHidden: tc.isHidden
          });
        }
      }

      return {
        success: true,
        totalTests: testCases.length,
        passedTests: passedCount,
        results,
        allPassed: passedCount === testCases.length,
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        totalTests: testCases.length,
        passedTests: 0,
        results: [],
        compilerError: err.message || 'Syntax / Execution Error',
        allPassed: false,
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Execute Python code in a child process
   */
  private static async executePython(
    code: string,
    functionName: string,
    testCases: TestCase[],
    timeoutMs: number,
    startTime: number
  ): Promise<ExecutionResponse> {
    return new Promise((resolve) => {
      const runnerScript = `
import sys
import json
import traceback

${code}

def __run_tests():
    test_cases = ${JSON.stringify(testCases)}
    results = []
    passed_count = 0
    
    if '${functionName}' not in globals():
        print(json.dumps({
            "error": "Function '${functionName}' is not defined."
        }))
        sys.exit(0)

    fn = globals()['${functionName}']

    for tc in test_cases:
        tc_id = tc['id']
        is_hidden = tc.get('isHidden', False)
        input_str = tc['input']
        expected_str = tc['expectedOutput']

        try:
            args = json.loads(input_str)
            expected = json.loads(expected_str)
            
            actual = fn(*args)
            
            passed = (actual == expected)
            if passed:
                passed_count += 1

            results.append({
                "testCaseId": tc_id,
                "passed": passed,
                "input": "[Hidden]" if is_hidden else input_str,
                "expectedOutput": "[Hidden]" if is_hidden else expected_str,
                "actualOutput": ("[Passed]" if passed else "[Failed]") if is_hidden else json.dumps(actual),
                "executionTimeMs": 10,
                "isHidden": is_hidden
            })
        except Exception as e:
            results.append({
                "testCaseId": tc_id,
                "passed": False,
                "input": "[Hidden]" if is_hidden else input_str,
                "expectedOutput": "[Hidden]" if is_hidden else expected_str,
                "actualOutput": "Runtime Exception",
                "error": str(e),
                "executionTimeMs": 10,
                "isHidden": is_hidden
            })

    print(json.dumps({
        "results": results,
        "passedTests": passed_count,
        "totalTests": len(test_cases),
        "allPassed": passed_count == len(test_cases)
    }))

__run_tests()
`;

      const pyProcess = spawn('python', ['-c', runnerScript]);
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        pyProcess.kill();
        resolve({
          success: false,
          totalTests: testCases.length,
          passedTests: 0,
          results: [],
          compilerError: 'Execution Timed Out (Time Limit Exceeded)',
          allPassed: false,
          executionTimeMs: Date.now() - startTime
        });
      }, timeoutMs);

      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pyProcess.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 && stderr) {
          resolve({
            success: false,
            totalTests: testCases.length,
            passedTests: 0,
            results: [],
            compilerError: stderr,
            allPassed: false,
            executionTimeMs: Date.now() - startTime
          });
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) {
            resolve({
              success: false,
              totalTests: testCases.length,
              passedTests: 0,
              results: [],
              compilerError: parsed.error,
              allPassed: false,
              executionTimeMs: Date.now() - startTime
            });
            return;
          }

          resolve({
            success: true,
            totalTests: parsed.totalTests,
            passedTests: parsed.passedTests,
            results: parsed.results,
            allPassed: parsed.allPassed,
            executionTimeMs: Date.now() - startTime
          });
        } catch (e: any) {
          resolve({
            success: false,
            totalTests: testCases.length,
            passedTests: 0,
            results: [],
            compilerError: stderr || stdout || 'Failed to parse execution result.',
            allPassed: false,
            executionTimeMs: Date.now() - startTime
          });
        }
      });

      pyProcess.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          success: false,
          totalTests: testCases.length,
          passedTests: 0,
          results: [],
          compilerError: `Python execution error: ${err.message}`,
          allPassed: false,
          executionTimeMs: Date.now() - startTime
        });
      });
    });
  }

  private static compareOutputs(actual: any, expected: any): boolean {
    if (actual === expected) return true;
    if (typeof actual !== typeof expected) return false;

    // Handle arrays / objects
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, idx) => this.compareOutputs(val, expected[idx]));
    }

    if (typeof actual === 'object' && actual !== null && expected !== null) {
      const keysA = Object.keys(actual).sort();
      const keysB = Object.keys(expected).sort();
      if (keysA.length !== keysB.length) return false;
      return keysA.every((k, idx) => k === keysB[idx] && this.compareOutputs(actual[k], expected[k]));
    }

    return false;
  }
}
