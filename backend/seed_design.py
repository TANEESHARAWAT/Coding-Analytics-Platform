from database import problems_collection

design_problems = [
    {
        "problem_id": "P052",
        "title": "LRU Cache",
        "concept": "Design",
        "difficulty": "Hard",
        "judge_type": "sequence",
        "test_cases": [],
        "class_name": "LRUCache",
        "operations": ["LRUCache 2", "put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "put 4 4", "get 1", "get 3", "get 4"],
        "expected": ["null", "null", "null", "1", "null", "-1", "null", "-1", "3", "4"]
    },
    {
        "problem_id": "P053",
        "title": "LFU Cache",
        "concept": "Design",
        "difficulty": "Hard",
        "judge_type": "sequence",
        "test_cases": [],
        "class_name": "LFUCache",
        "operations": ["LFUCache 2", "put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "get 3", "put 4 4", "get 1", "get 3", "get 4"],
        "expected": ["null", "null", "null", "1", "null", "-1", "3", "null", "-1", "3", "4"]
    }
]

for p in design_problems:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Design problems seeded. Insert Delete GetRandom O(1) skipped — uses randomness, cannot be exact-matched by any judge.")