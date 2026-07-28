from database import problems_collection

batch5 = [
    {
        "problem_id": "P054",
        "title": "Create Maximum Number",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "3\n3 4 6 5\n2\n9 1 2 5 8 3\n5", "expected_output": "9 8 6 5 3"}]
    },
    {
        "problem_id": "P055",
        "title": "Burst Balloons",
        "concept": "DP",
        "difficulty": "Hard",
        "test_cases": [{"input": "4\n3 1 5 8", "expected_output": "167"}]
    },
    {
        "problem_id": "P056",
        "title": "Maximum Product Subarray",
        "concept": "Arrays",
        "difficulty": "Medium",
        "test_cases": [{"input": "4\n2 3 -2 4", "expected_output": "6"}]
    },
    {
        "problem_id": "P057",
        "title": "Smallest Range Covering Elements from K Lists",
        "concept": "Arrays",
        "difficulty": "Hard",
        "test_cases": [{"input": "3\n3\n4 10 15 24 26\n3\n0 9 12 20\n3\n5 18 22 30", "expected_output": "20 24"}]
    },
    {
        "problem_id": "P058",
        "title": "Longest Increasing Path in a Matrix",
        "concept": "DP",
        "difficulty": "Hard",
        "test_cases": [{"input": "3 3\n9 9 4\n6 6 8\n2 1 1", "expected_output": "4"}]
    },
    {
        "problem_id": "P059",
        "title": "Alien Dictionary",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "3\nwrt wrf er ett rftt", "expected_output": "wertf"}]
    },
    {
        "problem_id": "P060",
        "title": "Word Ladder",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "hit\ncog\n6\nhot dot dog lot log cog", "expected_output": "5"}]
    },
    {
        "problem_id": "P061",
        "title": "Word Search II",
        "concept": "Strings",
        "difficulty": "Hard",
        "test_cases": [{"input": "4 4\noaan\netae\nihkr\niflv\n2\noath pea", "expected_output": "oath"}]
    },
    {
        "problem_id": "P062",
        "title": "Longest Substring with At Least K Repeating Characters",
        "concept": "Strings",
        "difficulty": "Medium",
        "test_cases": [{"input": "aaabb\n3", "expected_output": "3"}]
    }
]

for p in batch5:
    existing = problems_collection.find_one({"problem_id": p["problem_id"]})
    if not existing:
        problems_collection.insert_one(p)
        print(f"Added: {p['problem_id']} - {p['title']}")
    else:
        print(f"Skipped (already exists): {p['problem_id']}")

print("Batch 5 (I/O problems) seeding complete (9 problems).")