from database import problems_collection

batch4 = [
    {
        "problem_id": "P045",
        "title": "Maximum Sum Circular Subarray",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "5\n1 -2 3 -2 5", "expected_output": "8"}]
    },
    {
        "problem_id": "P046",
        "title": "Subarray Sum Equals K",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "3\n1 1 1\n2", "expected_output": "2"}]
    },
    {
        "problem_id": "P047",
        "title": "Continuous Subarray Sum",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "4\n23 2 4 6\n6", "expected_output": "true"}]
    },
    {
        "problem_id": "P048",
        "title": "Longest Consecutive Sequence",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "6\n100 4 200 1 3 2", "expected_output": "4"}]
    },
    {
        "problem_id": "P049",
        "title": "Minimum Number of Refueling Stops",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "1 4\n2\n5 25\n3 25", "expected_output": "1"}]
    },
    {
        "problem_id": "P050",
        "title": "Russian Doll Envelopes",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "4\n5 4\n6 4\n6 7\n2 3", "expected_output": "3"}]
    },
    {
        "problem_id": "P051",
        "title": "Longest Increasing Subsequence",
        "concept": "DP",
        "difficulty": "Medium",
        "test_cases": [{"input": "8\n10 9 2 5 3 7 101 18", "expected_output": "4"}]
    }
]

for p in batch4:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Batch 4 seeding complete (7 problems, 3 design problems held back: LRU Cache, LFU Cache, Insert Delete GetRandom O(1)).")