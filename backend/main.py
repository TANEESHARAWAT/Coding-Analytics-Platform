from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from database import submissions_collection, problems_collection
from judge import run_cpp, run_python, run_cpp_sequence, run_cpp_median_stream
from ai_analysis import analyze_mistake
from auth import hash_password, verify_password, create_token, get_current_user
from database import users_collection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Submission(BaseModel):
    problem_id: str
    language: str
    code: str


class TestCase(BaseModel):
    input: str
    expected_output: str


class Problem(BaseModel):
    problem_id: str
    title: str
    concept: str
    difficulty: str
    description: Optional[str] = None
    judge_type: str = "io"
    test_cases: list[TestCase] = []
    class_name: Optional[str] = None
    operations: Optional[list[str]] = None
    expected: Optional[list[str]] = None


@app.post("/signup")
def signup(req: SignupRequest):
    email = req.email.lower()
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    users_collection.insert_one({
        "email": email,
        "name": name,
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(),
    })
    token = create_token(email)
    return {"token": token, "email": email, "name": name}


@app.post("/login")
def login(req: LoginRequest):
    email = req.email.lower()
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(email)
    name = user.get("name") or email
    return {"token": token, "email": email, "name": name}


@app.post("/problems")
def add_problem(problem: Problem):
    problems_collection.insert_one(problem.dict())
    return {"message": "Problem added"}


@app.get("/problems")
def get_problems():
    problems = list(problems_collection.find())
    for p in problems:
        p["_id"] = str(p["_id"])
    return problems


@app.post("/submit")
def submit_code(sub: Submission, current_user: str = Depends(get_current_user)):
    problem = problems_collection.find_one({"problem_id": sub.problem_id})

    verdict = "No Test Cases"
    if problem:
        judge_type = problem.get("judge_type", "io")
        if judge_type == "sequence" and sub.language == "cpp":
            verdict, _ = run_cpp_sequence(
                sub.code, problem["operations"], problem["expected"], problem["class_name"]
            )
        elif judge_type == "median_stream" and sub.language == "cpp":
            verdict, _ = run_cpp_median_stream(
                sub.code, problem["operations"], problem["expected"], problem["class_name"]
            )
        elif sub.language == "cpp":
            verdict, _ = run_cpp(sub.code, problem["test_cases"])
        elif sub.language == "python":
            verdict, _ = run_python(sub.code, problem["test_cases"])

    mistake_analysis = None
    if verdict in ["WA", "CE", "RE"] and problem:
        try:
            mistake_analysis = analyze_mistake(
                sub.code, sub.language, verdict, problem["title"]
            )
        except Exception as e:
            print("AI ANALYSIS ERROR:", str(e))
            mistake_analysis = None
    doc = {
        "student_id": current_user,
        "problem_id": sub.problem_id,
        "language": sub.language,
        "code": sub.code,
        "timestamp": datetime.now(),
        "verdict": verdict,
        "mistake_analysis": mistake_analysis
    }
    submissions_collection.insert_one(doc)
    return {"message": "Submission saved", "verdict": verdict, "mistake_analysis": mistake_analysis}


@app.get("/history")
def get_history(current_user: str = Depends(get_current_user)):
    records = list(submissions_collection.find({"student_id": current_user}).sort("timestamp", -1))
    for r in records:
        r["_id"] = str(r["_id"])
        r["timestamp"] = r["timestamp"].strftime("%Y-%m-%d %H:%M")
    return records


@app.get("/stats")
def get_stats(current_user: str = Depends(get_current_user)):
    subs = list(submissions_collection.find({"student_id": current_user}))
    concept_stats = {}

    for sub in subs:
        problem = problems_collection.find_one({"problem_id": sub["problem_id"]})
        if not problem:
            continue
        concept = problem["concept"]
        if concept not in concept_stats:
            concept_stats[concept] = {"total": 0, "correct": 0}
        concept_stats[concept]["total"] += 1
        if sub["verdict"] == "AC":
            concept_stats[concept]["correct"] += 1

    result = []
    for concept, data in concept_stats.items():
        percentage = round((data["correct"] / data["total"]) * 100)
        result.append({
            "concept": concept,
            "total": data["total"],
            "correct": data["correct"],
            "percentage": percentage
        })

    return result


@app.get("/recommend")
def recommend_problems(current_user: str = Depends(get_current_user)):
    all_problems = list(problems_collection.find())
    all_concepts = set(p["concept"] for p in all_problems)

    subs = list(submissions_collection.find({"student_id": current_user}))
    concept_stats = {}
    solved_problem_ids = set()

    for sub in subs:
        problem = problems_collection.find_one({"problem_id": sub["problem_id"]})
        if not problem:
            continue
        concept = problem["concept"]
        if concept not in concept_stats:
            concept_stats[concept] = {"total": 0, "correct": 0}
        concept_stats[concept]["total"] += 1
        if sub["verdict"] == "AC":
            concept_stats[concept]["correct"] += 1
            solved_problem_ids.add(sub["problem_id"])

    untried_concepts = [c for c in all_concepts if c not in concept_stats]

    weakest_concept = None
    lowest_pct = 101
    for concept, data in concept_stats.items():
        pct = (data["correct"] / data["total"]) * 100
        if pct < lowest_pct:
            lowest_pct = pct
            weakest_concept = concept

    target_concept = None
    reason = ""
    if untried_concepts:
        target_concept = untried_concepts[0]
        reason = f"You haven't tried any {target_concept} problems yet."
    elif weakest_concept:
        target_concept = weakest_concept
        reason = f"Your {weakest_concept} accuracy is {round(lowest_pct)}% — needs more practice."

    recommended = []
    if target_concept:
        candidates = [
            p for p in all_problems
            if p["concept"] == target_concept and p["problem_id"] not in solved_problem_ids
        ]
        for p in candidates[:3]:
            recommended.append({
                "problem_id": p["problem_id"],
                "title": p["title"],
                "difficulty": p["difficulty"]
            })

    return {
        "target_concept": target_concept,
        "reason": reason,
        "recommended_problems": recommended
    }