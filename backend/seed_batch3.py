from database import problems_collection

batch3 = [
    {
        "problem_id": "P035",
        "title": "Reverse Pairs",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "4\n1 3 2 3 1", "expected_output": "2"}]
    },
    {
        "problem_id": "P036",
        "title": "Count Range Sum",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "3\n-2 5 -1\n-2 2", "expected_output": "3"}]
    },
    {
        "problem_id": "P037",
        "title": "Maximum Gap",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "4\n3 6 9 1", "expected_output": "3"}]
    },
    {
        "problem_id": "P038",
        "title": "Largest Rectangle in Histogram",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "6\n2 1 5 6 2 3", "expected_output": "10"}]
    },
    {
        "problem_id": "P039",
        "title": "Maximal Rectangle",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0", "expected_output": "6"}]
    },
    {
        "problem_id": "P040",
        "title": "Trapping Rain Water",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "12\n0 1 0 2 1 0 1 3 2 1 2 1", "expected_output": "6"}]
    },
    {
        "problem_id": "P041",
        "title": "Candy",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "3\n1 0 2", "expected_output": "5"}]
    },
    {
        "problem_id": "P042",
        "title": "Jump Game II",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "5\n2 3 1 1 4", "expected_output": "2"}]
    },
    {
        "problem_id": "P043",
        "title": "Split Array Largest Sum",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "5 2\n7 2 5 10 8", "expected_output": "18"}]
    },
    {
        "problem_id": "P044",
        "title": "Shortest Subarray with Sum at Least K",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "3 2\n2 -1 2", "expected_output": "3"}]
    }
]

for p in batch3:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Batch 3 seeding complete (10 problems).")