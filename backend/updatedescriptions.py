"""
One-off script to backfill the `description` field for problems that were
seeded before the description field existed.

Covers all 50 problems currently in your database: P001, P002, and P016-P063.
(P003-P015 appear to not exist in your seeded data based on your /problems output.)

Run this ONCE from your backend folder (same place as main.py / database.py),
with your .env file present so it can connect to the same Atlas cluster:

    python update_descriptions.py

It uses update_one (not insert_one), so it will NOT create duplicates —
it only fills in the description for problems that already exist by problem_id.

Note: examples (input/output) are NOT part of this script because they
already exist in each problem's `test_cases` field. Your frontend Submit
tab is already wired to display test_cases[0] as the example automatically
once a description exists — no separate example data is needed.
"""

from database import problems_collection

descriptions = {
    "P001": "Given an array of integers and a target sum, find the two numbers in the array that add up to the target and return them.",
    "P002": "Given the head of a singly linked list, reverse the list and return the new head.",
    "P016": "You are given two sorted arrays. Find the median of the numbers you get when both arrays are merged together, without necessarily merging them into a new array.",
    "P017": "Given an unsorted array of integers, find the smallest positive integer that does not appear in the array.",
    "P018": "You are given an array and a sliding window of a fixed size that moves from left to right across the array. For each position of the window, find the maximum value inside it.",
    "P019": "Given two strings, find the shortest substring of the first string that contains every character of the second string, including duplicates.",
    "P020": "Given a string and a list of words that are all the same length, find every starting position where a concatenation of all the words (in any order, no characters in between) appears in the string.",
    "P021": "Given a string containing only the characters '(' and ')', find the length of the longest substring that forms a valid sequence of parentheses.",
    "P022": "Implement regular expression matching that supports '.' (matches any single character) and '*' (matches zero or more of the preceding character), covering the entire input string.",
    "P023": "Implement wildcard pattern matching that supports '?' (matches any single character) and '*' (matches any sequence of characters, including none), covering the entire input string.",
    "P024": "Given two words, find the minimum number of single-character insertions, deletions, or substitutions needed to change one word into the other.",
    "P025": "Given two strings, count how many distinct ways the second string can be formed by deleting some characters from the first string (without reordering).",
    "P026": "Given three strings, determine whether the third string can be formed by interleaving the characters of the first two strings while preserving each string's original character order.",
    "P027": "Two strings are 'scramble' strings of each other if one can be turned into the other by recursively swapping the two halves of substrings. Determine whether two given strings are scramble strings of each other.",
    "P028": "Given a string and a dictionary of words, return every possible way to split the string into a sentence where each word comes from the dictionary.",
    "P029": "Given a string, find the minimum number of cuts needed so that every resulting substring is a palindrome.",
    "P030": "Given a string, find the shortest palindrome you can make by adding characters only to the front of the original string.",
    "P031": "Given a string, find the longest substring that appears more than once in it.",
    "P032": "All DNA sequences are made up of the letters A, C, G, and T. Given a DNA string, find all 10-letter-long substrings that occur more than once.",
    "P033": "Given a starting gene sequence, a target gene sequence, and a bank of valid intermediate sequences (each differing by one character from the previous), find the minimum number of mutations needed to go from start to target using only sequences in the bank.",
    "P034": "Given an array of integers, for each element count how many elements to its right are smaller than it.",
    "P035": "Given an array, count the number of pairs (i, j) where i < j and the value at i is more than double the value at j.",
    "P036": "Given an array and a lower/upper bound, count how many contiguous subarrays have a sum that falls within that range (inclusive).",
    "P037": "Given an unsorted array, find the maximum difference between two successive elements once the array is sorted. The algorithm should run in linear time and space.",
    "P038": "Given an array representing the heights of bars in a histogram (all bars have equal width of 1), find the area of the largest rectangle that can be formed within the histogram.",
    "P039": "Given a 2D binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area.",
    "P040": "Given an array representing an elevation map where each bar has a width of 1, compute how much rainwater the map can trap after it rains.",
    "P041": "Children standing in a line are each given a rating. Every child must get at least one candy, and any child with a higher rating than a neighbor must get more candies than that neighbor. Find the minimum total candies needed.",
    "P042": "Given an array where each element represents the maximum number of steps you can jump forward from that position, find the minimum number of jumps needed to reach the last index, starting from the first.",
    "P043": "Given an array of integers and an integer k, split the array into k non-empty contiguous subarrays so that the largest sum among these subarrays is as small as possible.",
    "P044": "Given an array of integers and a target sum k, find the length of the shortest contiguous subarray whose sum is at least k. Return -1 if no such subarray exists.",
    "P045": "Given a circular array (the end connects back to the beginning), find the maximum possible sum of a non-empty contiguous subarray.",
    "P046": "Given an array of integers and a target sum k, count the total number of contiguous subarrays whose sum equals k.",
    "P047": "Given an array of non-negative integers and a target k, determine whether the array has a contiguous subarray of size at least 2 whose sum is a multiple of k.",
    "P048": "Given an unsorted array of integers, find the length of the longest run of consecutive integers, without requiring them to be in order in the array. Must run in O(n) time.",
    "P049": "A car needs to travel a given distance and starts with a certain amount of fuel. Along the route there are fuel stations with known positions and fuel amounts. Find the minimum number of refueling stops needed to reach the destination, or determine it isn't possible.",
    "P050": "Given pairs of numbers representing envelope width and height, find the maximum number of envelopes that can be nested inside each other (an envelope can fit inside another only if both its width and height are strictly smaller).",
    "P051": "Given an array of integers, find the length of the longest strictly increasing subsequence (the elements don't need to be contiguous, but must keep their relative order).",
    "P052": "Design a Least Recently Used (LRU) cache that supports get and put operations in O(1) time. When the cache reaches its capacity, it should evict the least recently used item before inserting a new one.",
    "P053": "Design a Least Frequently Used (LFU) cache that supports get and put operations in O(1) time. When the cache is full, it should evict the least frequently used item, breaking ties by least recently used.",
    "P054": "You are given two arrays of digits and a number k. Pick k digits total from both arrays combined (preserving relative order within each array) to form the largest possible number.",
    "P055": "You have a row of balloons, each with a number painted on it. Bursting a balloon gives you coins equal to the product of the numbers on the balloons immediately to its left and right (after previous bursts). Find the maximum coins you can collect by bursting all the balloons in some order.",
    "P056": "Given an array of integers, find the contiguous subarray (containing at least one number) that has the largest product.",
    "P057": "Given k sorted lists of integers, find the smallest range that includes at least one number from each of the k lists.",
    "P058": "Given a 2D grid of integers, find the length of the longest path where each step moves to a strictly greater neighboring cell (up, down, left, or right).",
    "P059": "There is a new alien language that uses the English alphabet, but the order of the letters is unknown. Given a list of words sorted according to this new alien order, determine the actual order of the letters.",
    "P060": "Given a start word, an end word, and a dictionary of valid words, find the length of the shortest sequence of single-letter changes that transforms the start word into the end word, where each intermediate word must exist in the dictionary.",
    "P061": "Given a 2D grid of letters and a list of words, find all the words from the list that can be formed by tracing a path of adjacent cells (up, down, left, or right) in the grid, without reusing a cell in the same word.",
    "P062": "Given a string and an integer k, find the length of the longest substring in which every character appears at least k times.",
    "P063": "Design a data structure that supports adding numbers one at a time and can efficiently return the median of all the numbers added so far.",
}

updated = 0
skipped = 0

for problem_id, description in descriptions.items():
    result = problems_collection.update_one(
        {"problem_id": problem_id},
        {"$set": {"description": description}}
    )
    if result.matched_count > 0:
        print(f"Updated: {problem_id}")
        updated += 1
    else:
        print(f"Not found in DB (skipped): {problem_id}")
        skipped += 1

print(f"\nDone. {updated} problems updated, {skipped} not found.")
print("If any P003-P015 IDs were found, they were skipped since no description was written for them.")
print("Message Claude with their titles if they do exist, and they'll be added.")