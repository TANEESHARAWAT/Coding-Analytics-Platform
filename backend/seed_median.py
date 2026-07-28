from database import problems_collection

problem = {
    "problem_id": "P063",
    "title": "Find Median from Data Stream",
    "concept": "Design",
    "difficulty": "Hard",
    "judge_type": "median_stream",
    "test_cases": [],
    "class_name": "MedianFinder",
    "operations": ["MedianFinder", "addNum 1", "addNum 2", "findMedian", "addNum 3", "findMedian"],
    "expected": ["null", "null", "null", "1.5", "null", "2"]
}

existing = problems_collection.find_one({"problem_id": problem["problem_id"]})
if not existing:
    problems_collection.insert_one(problem)
    print(f"Added: {problem['problem_id']} - {problem['title']}")
else:
    print("Already exists.")