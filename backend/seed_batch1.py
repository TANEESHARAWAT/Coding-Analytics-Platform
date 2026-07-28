from database import problems_collection

batch1 = [
    {
        "problem_id": "P016",
        "title": "Median of Two Sorted Arrays",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "2\n1 2\n2\n3 4", "expected_output": "2.50000"}]
    },
    {
        "problem_id": "P017",
        "title": "First Missing Positive",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "4\n3 4 -1 1", "expected_output": "2"}]
    },
    {
        "problem_id": "P018",
        "title": "Sliding Window Maximum",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "8\n1 3 -1 -3 5 3 6 7\n3", "expected_output": "3 3 5 5 6 7"}]
    },
    {
        "problem_id": "P019",
        "title": "Minimum Window Substring",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "ADOBECODEBANC\nABC", "expected_output": "BANC"}]
    },
    {
        "problem_id": "P020",
        "title": "Substring with Concatenation of All Words",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "barfoothefoobarman\n2\nfoo bar", "expected_output": "0 9"}]
    },
    {
        "problem_id": "P021",
        "title": "Longest Valid Parentheses",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "(()", "expected_output": "2"}]
    },
    {
        "problem_id": "P022",
        "title": "Regular Expression Matching",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "aa\na*", "expected_output": "true"}]
    },
    {
        "problem_id": "P023",
        "title": "Wildcard Matching",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "aa\n*", "expected_output": "true"}]
    },
    {
        "problem_id": "P024",
        "title": "Edit Distance",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "horse\nros", "expected_output": "3"}]
    }
]

for p in batch1:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Batch 1 seeding complete (9 problems, Text Justification excluded).")