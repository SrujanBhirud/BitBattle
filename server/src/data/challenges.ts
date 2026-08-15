import { CodeChallenge } from '../types';

export const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    functionName: 'twoSum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0, 1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    testCases: [
      {
        id: 'tc1',
        input: JSON.stringify([[2, 7, 11, 15], 9]),
        expectedOutput: JSON.stringify([0, 1]),
        description: 'Basic two sum example'
      },
      {
        id: 'tc2',
        input: JSON.stringify([[3, 2, 4], 6]),
        expectedOutput: JSON.stringify([1, 2]),
        description: 'Target from non-consecutive elements'
      },
      {
        id: 'tc3',
        input: JSON.stringify([[3, 3], 6]),
        expectedOutput: JSON.stringify([0, 1]),
        description: 'Duplicate values'
      },
      {
        id: 'tc4',
        input: JSON.stringify([[1, 5, 8, 12, 19], 20]),
        expectedOutput: JSON.stringify([0, 4]),
        isHidden: true,
        description: 'First and last index solution'
      },
      {
        id: 'tc5',
        input: JSON.stringify([[-1, -2, -3, -4, -5], -8]),
        expectedOutput: JSON.stringify([2, 4]),
        isHidden: true,
        description: 'Negative numbers'
      }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'easy',
    category: 'Strings',
    functionName: 'isPalindrome',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters, which is a palindrome.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your code here
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      python: `def isPalindrome(s: str) -> bool:
    # Write your code here
    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
    return cleaned == cleaned[::-1]`
    },
    testCases: [
      {
        id: 'p1',
        input: JSON.stringify(["A man, a plan, a canal: Panama"]),
        expectedOutput: JSON.stringify(true),
        description: 'Mixed case with punctuation'
      },
      {
        id: 'p2',
        input: JSON.stringify(["race a car"]),
        expectedOutput: JSON.stringify(false),
        description: 'Non-palindrome'
      },
      {
        id: 'p3',
        input: JSON.stringify([" "]),
        expectedOutput: JSON.stringify(true),
        description: 'Whitespace only'
      },
      {
        id: 'p4',
        input: JSON.stringify(["0P"]),
        expectedOutput: JSON.stringify(false),
        isHidden: true,
        description: 'Alphanumeric with different chars'
      },
      {
        id: 'p5',
        input: JSON.stringify(["No 'x' in Nixon"]),
        expectedOutput: JSON.stringify(true),
        isHidden: true,
        description: 'Famous phrase palindrome'
      }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'medium',
    category: 'Stack',
    functionName: 'isValid',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    # Write your code here
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`
    },
    testCases: [
      {
        id: 'vp1',
        input: JSON.stringify(["()"]),
        expectedOutput: JSON.stringify(true),
        description: 'Simple parentheses'
      },
      {
        id: 'vp2',
        input: JSON.stringify(["()[]{}"]),
        expectedOutput: JSON.stringify(true),
        description: 'Multiple matching types'
      },
      {
        id: 'vp3',
        input: JSON.stringify(["(]"]),
        expectedOutput: JSON.stringify(false),
        description: 'Mismatched brackets'
      },
      {
        id: 'vp4',
        input: JSON.stringify(["{[]()}"]),
        expectedOutput: JSON.stringify(true),
        isHidden: true,
        description: 'Nested valid brackets'
      },
      {
        id: 'vp5',
        input: JSON.stringify(["([)]"]),
        expectedOutput: JSON.stringify(false),
        isHidden: true,
        description: 'Interleaved invalid sequence'
      }
    ]
  },
  {
    id: 'fizz-buzz-custom',
    title: 'Custom FizzBuzz Array',
    difficulty: 'easy',
    category: 'Math & Strings',
    functionName: 'fizzBuzz',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:\n- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.\n- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.\n- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.\n- \`answer[i] == i\` (as a string) if none of the above conditions are true.`,
    examples: [
      {
        input: 'n = 3',
        output: '["1","2","Fizz"]'
      },
      {
        input: 'n = 5',
        output: '["1","2","Fizz","4","Buzz"]'
      }
    ],
    constraints: ['1 <= n <= 10^4'],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i.toString());
  }
  return result;
}`,
      python: `def fizzBuzz(n: int) -> list[str]:
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res`
    },
    testCases: [
      {
        id: 'fb1',
        input: JSON.stringify([3]),
        expectedOutput: JSON.stringify(["1", "2", "Fizz"]),
        description: 'Up to 3'
      },
      {
        id: 'fb2',
        input: JSON.stringify([5]),
        expectedOutput: JSON.stringify(["1", "2", "Fizz", "4", "Buzz"]),
        description: 'Up to 5'
      },
      {
        id: 'fb3',
        input: JSON.stringify([15]),
        expectedOutput: JSON.stringify(["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]),
        isHidden: true,
        description: 'Includes FizzBuzz at 15'
      }
    ]
  }
];
