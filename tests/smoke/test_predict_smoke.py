#!/usr/bin/env python3
# tests/smoke/test_predict.py
#
# Post-deploy sanity check. Run after every deployment to confirm
# the ML model is loaded and returning valid predictions.
#
# Usage:
#   python tests/smoke/test_predict.py
#   python tests/smoke/test_predict.py --url https://bikes.thegaff.io
#
# Exits 0 on success, 1 on failure (so CI/CD can gate deployments).

import sys
import json
import argparse
import urllib.request
import urllib.error

def run_smoke_test(base_url: str) -> bool:
    url = f"{base_url}/api/stations/predict?number=42"
    print(f"[SMOKE] Calling {url}")

    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"[SMOKE] FAIL — HTTP {e.code}: {e.reason}")
        return False
    except Exception as e:
        print(f"[SMOKE] FAIL — {e}")
        return False

    # Check outer ApiResponse shape
    if body.get("code") != 200:
        print(f"[SMOKE] FAIL — code is {body.get('code')}, expected 200")
        return False

    data = body.get("data", {})

    # predicted_bikes: integer between 0 and 50
    pred = data.get("predicted_bikes")
    if not isinstance(pred, int) or not (0 <= pred <= 50):
        print(f"[SMOKE] FAIL — predicted_bikes={pred!r} (expected int 0–50)")
        return False

    # confidence: float between 0 and 1
    conf = data.get("confidence")
    if not isinstance(conf, float) or not (0.0 <= conf <= 1.0):
        print(f"[SMOKE] FAIL — confidence={conf!r} (expected float 0–1)")
        return False

    # horizon_minutes present
    if data.get("horizon_minutes") != 30:
        print(f"[SMOKE] FAIL — horizon_minutes={data.get('horizon_minutes')!r}, expected 30")
        return False

    print(f"[SMOKE] PASS — predicted_bikes={pred}, confidence={conf:.0%}")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:5000",
                        help="Base URL of the Flask API")
    args = parser.parse_args()

    ok = run_smoke_test(args.url.rstrip("/"))
    sys.exit(0 if ok else 1)
