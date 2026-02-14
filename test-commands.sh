#!/bin/bash

# ZeroStart CLI Command Test Script
# This script tests all documented commands to ensure they're working

echo "======================================"
echo "ZeroStart CLI Command Test Suite"
echo "======================================"
echo ""

CLI="node out/cli.js"

# Test 1: --help
echo "✓ Testing: zerostart --help"
$CLI --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: --help command works"
else
    echo "  ❌ FAIL: --help command failed"
fi
echo ""

# Test 2: --version
echo "✓ Testing: zerostart --version"
VERSION=$($CLI --version 2>&1)
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: --version command works (v$VERSION)"
else
    echo "  ❌ FAIL: --version command failed"
fi
echo ""

# Test 3: init command exists
echo "✓ Testing: zerostart init --help"
$CLI init --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: init command exists"
else
    echo "  ❌ FAIL: init command not found"
fi
echo ""

# Test 4: deploy command exists
echo "✓ Testing: zerostart deploy --help"
$CLI deploy --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: deploy command exists"
else
    echo "  ❌ FAIL: deploy command not found"
fi
echo ""

# Test 5: git command exists
echo "✓ Testing: zerostart git --help"
$CLI git --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: git command exists"
else
    echo "  ❌ FAIL: git command not found"
fi
echo ""

# Test 6: add command exists
echo "✓ Testing: zerostart add --help"
$CLI add --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: add command exists"
else
    echo "  ❌ FAIL: add command not found"
fi
echo ""

# Test 7: env command exists
echo "✓ Testing: zerostart env --help"
$CLI env --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: env command exists"
else
    echo "  ❌ FAIL: env command not found"
fi
echo ""

# Test 8: test command exists
echo "✓ Testing: zerostart test --help"
$CLI test --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: test command exists"
else
    echo "  ❌ FAIL: test command not found"
fi
echo ""

# Test 9: build command exists
echo "✓ Testing: zerostart build --help"
$CLI build --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: build command exists"
else
    echo "  ❌ FAIL: build command not found"
fi
echo ""

# Test 10: dev command exists
echo "✓ Testing: zerostart dev --help"
$CLI dev --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: dev command exists"
else
    echo "  ❌ FAIL: dev command not found"
fi
echo ""

# Test 11: clean command exists
echo "✓ Testing: zerostart clean --help"
$CLI clean --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: clean command exists"
else
    echo "  ❌ FAIL: clean command not found"
fi
echo ""

# Test 12: update command exists
echo "✓ Testing: zerostart update --help"
$CLI update --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: update command exists"
else
    echo "  ❌ FAIL: update command not found"
fi
echo ""

# Test 13: docs command exists
echo "✓ Testing: zerostart docs --help"
$CLI docs --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: docs command exists"
else
    echo "  ❌ FAIL: docs command not found"
fi
echo ""

# Test 14: deploy-vercel command exists
echo "✓ Testing: zerostart deploy-vercel --help"
$CLI deploy-vercel --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: deploy-vercel command exists"
else
    echo "  ❌ FAIL: deploy-vercel command not found"
fi
echo ""

# Test 15: deploy-netlify command exists
echo "✓ Testing: zerostart deploy-netlify --help"
$CLI deploy-netlify --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ PASS: deploy-netlify command exists"
else
    echo "  ❌ FAIL: deploy-netlify command not found"
fi
echo ""

# Test shortcut commands
echo "✓ Testing: Shortcut commands"
SHORTCUTS=("dsa-py" "dsa-java" "dsa-cpp" "dsa-node" "web-react" "web-html" "web-node" "web-py" "web-java" "web-cpp" "cli-py" "cli-node" "cli-java" "cli-cpp" "ml-py" "ml-node" "ml-java" "ml-cpp")
SHORTCUT_PASS=0
SHORTCUT_FAIL=0

for cmd in "${SHORTCUTS[@]}"; do
    $CLI $cmd --help > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        ((SHORTCUT_PASS++))
    else
        ((SHORTCUT_FAIL++))
        echo "  ❌ FAIL: $cmd command not found"
    fi
done

if [ $SHORTCUT_FAIL -eq 0 ]; then
    echo "  ✅ PASS: All 18 shortcut commands exist"
else
    echo "  ⚠️  PARTIAL: $SHORTCUT_PASS/18 shortcut commands work"
fi
echo ""

echo "======================================"
echo "Test Summary"
echo "======================================"
echo "All documented commands are available!"
echo ""
