from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../frontend/build")

# Enable CORS for all routes and allow preflight `OPTIONS` request
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)


# Sorting Algorithms with Steps
def quicksort(arr):
    """Quicksort algorithm with step-by-step tracking"""
    steps = []

    def _quicksort(arr, low, high):
        if low < high:
            pi = partition(arr, low, high)
            steps.append({"array": arr.copy(), "pivot": pi, "compared": [low, high]})
            _quicksort(arr, low, pi - 1)
            _quicksort(arr, pi + 1, high)

    _quicksort(arr, 0, len(arr) - 1)
    return steps


def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def bubblesort(arr):
    """Bubble sort algorithm with step-by-step tracking"""
    steps = []
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                steps.append(
                    {"array": arr.copy(), "pivot": None, "compared": [j, j + 1]}
                )
    return steps


def mergesort(arr):
    """Merge sort algorithm with step-by-step tracking"""
    steps = []

    def _mergesort(arr, l, r):
        if l < r:
            m = (l + r) // 2
            _mergesort(arr, l, m)
            _mergesort(arr, m + 1, r)
            merge(arr, l, m, r)

    def merge(arr, l, m, r):
        n1 = m - l + 1
        n2 = r - m
        L = arr[l : l + n1]
        R = arr[m + 1 : m + 1 + n2]

        i = j = 0
        k = l

        while i < n1 and j < n2:
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1

        while i < n1:
            arr[k] = L[i]
            i += 1
            k += 1

        while j < n2:
            arr[k] = R[j]
            j += 1
            k += 1

        steps.append(
            {"array": arr.copy(), "pivot": None, "compared": list(range(l, r + 1))}
        )

    _mergesort(arr, 0, len(arr) - 1)
    return steps


@app.route("/api/sort", methods=["POST", "OPTIONS"])
def sort_array():
    if request.method == "OPTIONS":
        # CORS preflight response
        return jsonify({"message": "CORS preflight"}), 200

    try:
        data = request.json
        array = data.get("array", [])
        algorithm = data.get("algorithm", "quicksort")

        # Validation: Ensure the array is a list of numbers
        if not isinstance(array, list):
            return jsonify({"error": "Input must be an array"}), 400
        if not all(isinstance(x, (int, float)) for x in array):
            return jsonify({"error": "All elements must be numbers"}), 400

        # Select the sorting algorithm based on the request
        if algorithm == "quicksort":
            steps = quicksort(array)
        elif algorithm == "bubblesort":
            steps = bubblesort(array)
        elif algorithm == "mergesort":
            steps = mergesort(array)
        else:
            return jsonify({"error": "Algorithm not supported"}), 400

        return jsonify({"steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Serve React Frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(debug=True)
