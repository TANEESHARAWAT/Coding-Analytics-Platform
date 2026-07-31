import subprocess
import uuid
import os

def run_cpp(code: str, test_cases: list):
    file_id = str(uuid.uuid4())
    cpp_path = f"temp_{file_id}.cpp"
    exe_path = f"temp_{file_id}.exe"

    with open(cpp_path, "w") as f:
        f.write(code)

    compile_result = subprocess.run(
        ["g++", "-std=c++17", cpp_path, "-o", exe_path],
        capture_output=True, text=True, timeout=25
    )

    if compile_result.returncode != 0:
        os.remove(cpp_path)
        return "CE", compile_result.stderr

    results = []
    for case in test_cases:
        try:
            run_result = subprocess.run(
                [exe_path],
                input=case["input"],
                capture_output=True, text=True, timeout=5
            )
            actual = run_result.stdout.strip()
            expected = case["expected_output"].strip()
            results.append(actual == expected)
        except subprocess.TimeoutExpired:
            results.append(False)

    os.remove(cpp_path)
    if os.path.exists(exe_path):
        os.remove(exe_path)

    verdict = "AC" if all(results) else "WA"
    return verdict, results


def run_python(code: str, test_cases: list):
    file_id = str(uuid.uuid4())
    py_path = f"temp_{file_id}.py"

    with open(py_path, "w") as f:
        f.write(code)

    results = []
    for case in test_cases:
        try:
            run_result = subprocess.run(
                ["python", py_path],
                input=case["input"],
                capture_output=True, text=True, timeout=5
            )
            if run_result.returncode != 0:
                os.remove(py_path)
                return "RE", run_result.stderr
            actual = run_result.stdout.strip()
            expected = case["expected_output"].strip()
            results.append(actual == expected)
        except subprocess.TimeoutExpired:
            results.append(False)

    os.remove(py_path)
    verdict = "AC" if all(results) else "WA"
    return verdict, results


def run_cpp_sequence(code: str, operations: list, expected: list, class_name: str):
    file_id = str(uuid.uuid4())
    cpp_path = f"temp_{file_id}.cpp"
    exe_path = f"temp_{file_id}.exe"

    ops_array = ", ".join(f'"{op}"' for op in operations)

    driver = f"""
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {{
    int n = {len(operations)};
    {class_name}* obj = nullptr;
    string ops[] = {{{ops_array}}};
    for (int i = 0; i < n; i++) {{
        istringstream iss(ops[i]);
        string cmd;
        iss >> cmd;
        if (cmd == "{class_name}") {{
            int cap; iss >> cap;
            obj = new {class_name}(cap);
            cout << "null" << endl;
        }} else if (cmd == "put") {{
            int k, v; iss >> k >> v;
            obj->put(k, v);
            cout << "null" << endl;
        }} else if (cmd == "get") {{
            int k; iss >> k;
            cout << obj->get(k) << endl;
        }}
    }}
    return 0;
}}
"""
    full_code = code + "\n" + driver

    with open(cpp_path, "w") as f:
        f.write(full_code)

    compile_result = subprocess.run(
        ["g++", "-std=c++17", cpp_path, "-o", exe_path],
        capture_output=True, text=True, timeout=10
    )

    if compile_result.returncode != 0:
        os.remove(cpp_path)
        return "CE", compile_result.stderr

    try:
        run_result = subprocess.run(
            [exe_path],
            capture_output=True, text=True, timeout=5
        )
        actual_lines = [x.strip() for x in run_result.stdout.strip().split("\n")]
        expected_lines = [x.strip() for x in expected]
        verdict = "AC" if actual_lines == expected_lines else "WA"
    except subprocess.TimeoutExpired:
        verdict = "WA"

    os.remove(cpp_path)
    if os.path.exists(exe_path):
        os.remove(exe_path)

    return verdict, None

def run_cpp_median_stream(code: str, operations: list, expected: list, class_name: str):
    file_id = str(uuid.uuid4())
    cpp_path = f"temp_{file_id}.cpp"
    exe_path = f"temp_{file_id}.exe"

    ops_array = ", ".join(f'"{op}"' for op in operations)

    driver = f"""
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {{
    int n = {len(operations)};
    {class_name}* obj = nullptr;
    string ops[] = {{{ops_array}}};
    for (int i = 0; i < n; i++) {{
        istringstream iss(ops[i]);
        string cmd;
        iss >> cmd;
        if (cmd == "{class_name}") {{
            obj = new {class_name}();
            cout << "null" << endl;
        }} else if (cmd == "addNum") {{
            int num; iss >> num;
            obj->addNum(num);
            cout << "null" << endl;
        }} else if (cmd == "findMedian") {{
            cout << obj->findMedian() << endl;
        }}
    }}
    return 0;
}}
"""
    full_code = code + "\n" + driver

    with open(cpp_path, "w") as f:
        f.write(full_code)

    compile_result = subprocess.run(
        ["g++", "-std=c++17", cpp_path, "-o", exe_path],
        capture_output=True, text=True, timeout=10
    )

    if compile_result.returncode != 0:
        os.remove(cpp_path)
        return "CE", compile_result.stderr

    try:
        run_result = subprocess.run(
            [exe_path],
            capture_output=True, text=True, timeout=5
        )
        actual_lines = [x.strip() for x in run_result.stdout.strip().split("\n")]
        expected_lines = [x.strip() for x in expected]
        verdict = "AC" if actual_lines == expected_lines else "WA"
    except subprocess.TimeoutExpired:
        verdict = "WA"

    os.remove(cpp_path)
    if os.path.exists(exe_path):
        os.remove(exe_path)

    return verdict, None