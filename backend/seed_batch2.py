from database import problems_collection

batch2 = [
    {
        "problem_id": "P025",
        "title": "Distinct Subsequences",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "babgbag\nbag", "expected_output": "5"}]
    },
    {
        "problem_id": "P026",
        "title": "Interleaving String",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "aabcc\ndbbca\naadbbcbcac", "expected_output": "true"}]
    },
    {
        "problem_id": "P027",
        "title": "Scramble String",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "great\nrgeat", "expected_output": "true"}]
    },
    {
        "problem_id": "P028",
        "title": "Word Break II",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "catsanddog\n4\ncat cats and sand", "expected_output": "cats and dog"}]
    },
    {
        "problem_id": "P029",
        "title": "Palindrome Partitioning II",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "aab", "expected_output": "1"}]
    },
    {
        "problem_id": "P030",
        "title": "Shortest Palindrome",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "aacecaaa", "expected_output": "aaacecaaa"}]
    },
    {
        "problem_id": "P031",
        "title": "Longest Duplicate Substring",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "banana", "expected_output": "ana"}]
    },
    {
        "problem_id": "P032",
        "title": "Repeated DNA Sequences",
        "concept": "Strings",
        "difficulty": "Medium",
        "test_cases": [{"input": "AAAAAAAAAAA", "expected_output": "AAAAAAAAAA"}]
    },
    {
        "problem_id": "P033",
        "title": "Minimum Genetic Mutation",
        "concept": "Strings",
        "difficulty": "Medium",
        "test_cases": [{"input": "AACCGGTT\nAACCGGTA\n4\nAACCGGTA AACCGCTA AAACGGTA AACCGGTT", "expected_output": "1"}]
    },
    {
        "problem_id": "P034",
        "title": "Count of Smaller Numbers After Self",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "4\n5 2 6 1", "expected_output": "2 1 1 0"}]
    }
]

for p in batch2:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Batch 2 seeding complete (10 problems).")