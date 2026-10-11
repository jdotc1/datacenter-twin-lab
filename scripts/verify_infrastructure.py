"""Independently recompute the Infrastructure Engineering golden cases."""

from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = ROOT / "data" / "infrastructure" / "golden-cases.json"
NODE_RESOLVER = ROOT / "apps" / "web" / "tests-engine" / "resolve-loader.mjs"


def expected(model: str, p: dict[str, object]) -> dict[str, object]:
    if model == "loadLedger":
        it = p["racks"] * p["rackKW"] * p["demandFactor"] * (1 + p["growth"])
        facility = it * p["designRatio"]
        residual = facility - it - p["coolingKW"]
        return {
            "itKW": it,
            "facilityKW": facility,
            "residualKW": residual,
            "apparentKVA": facility / p["pf"],
            "lineA": facility / p["pf"] / math.sqrt(3) / p["voltageKV"],
            "status": "screen-satisfied" if residual >= 0 else "screen-failed",
        }
    if model == "capacityBank":
        unit = p["unitMW"] * p["derating"] * p["loading"]
        available = (p["installed"] - p["unavailable"]) * unit
        margin = available - p["requiredMW"]
        return {
            "usableUnitMW": unit,
            "availableMW": available,
            "marginMW": margin,
            "minimumNPlusOne": math.ceil(p["requiredMW"] / unit) + 1,
            "status": "screen-satisfied" if margin >= 0 else "screen-failed",
        }
    if model == "transformerScreen":
        base = p["voltageV"] ** 2 / (p["mva"] * 1e6)
        transformer = p["zPercent"] / 100 * base
        source = 0 if p["sourceMVA"] is None else p["voltageV"] ** 2 / (p["sourceMVA"] * 1e6)
        return {
            "fullLoadA": p["mva"] * 1e6 / math.sqrt(3) / p["voltageV"],
            "baseOhm": base,
            "transformerOhm": transformer,
            "sourceOhm": source,
            "faultKA": p["voltageV"] / math.sqrt(3) / (transformer + source) / 1000,
        }
    if model == "storageScreen":
        ac = p["acKW"] * p["minutes"] / 60
        delivered = ac / p["efficiency"]
        return {
            "acKWh": ac,
            "deliveredDcKWh": delivered,
            "nominalKWh": delivered / p["dischargeFraction"] / p["retainedAgeFraction"],
            "dcA": p["acKW"] * 1000 / p["efficiency"] / p["minDcV"],
        }
    if model == "inverseTime":
        multiple = p["multiple"]
        trip = None if multiple <= 1 else 0.14 * p["tms"] / math.expm1(0.02 * math.log(multiple))
        return {
            "tripS": trip,
            "status": "outside-trip-domain" if trip is None else "model-evaluated",
        }
    if model == "auxiliaryScreen":
        return {
            "thdPercent": 100 * p["harmonicA"] / p["fundamentalA"],
            "tddPercent": 100 * p["harmonicA"] / p["referenceA"],
            "groundPotentialRiseV": p["groundA"] * p["groundOhm"],
            "dcDropV": 2 * p["dcA"] * p["oneWayM"] * p["ohmPerM"],
        }
    if model == "thermalScreen":
        liquid = p["rackKW"] * p["captureFraction"]
        air = p["rackKW"] - liquid
        net = p["heatMW"] - p["removedMW"]
        return {
            "liquidKW": liquid,
            "residualAirKW": air,
            "waterKgS": liquid * 1000 / p["waterCp"] / p["waterDeltaK"],
            "residualAirM3S": air * 1000 / p["airDensity"] / p["airCp"] / p["airDeltaK"],
            "temperatureRiseKS": net / p["capacitanceMJK"],
            "thermalLimitS": p["capacitanceMJK"] * p["deltaK"] / net if net > 0 else None,
            "status": "finite-lumped-limit" if net > 0 else "no-rise-in-lumped-model",
        }
    if model == "networkScreen":
        loss = (
            p["lengthM"] / 1000 * p["dbPerKm"]
            + p["connectors"] * p["connectorDB"]
            + p["splices"] * p["spliceDB"]
        )
        budget_use = loss + p["engineeringMarginDB"]
        active = (p["uplinks"] - p["lostUplinks"]) * p["uplinkGbps"]
        margin = p["budgetDB"] - budget_use
        return {
            "physicalLossDB": loss,
            "budgetUseDB": budget_use,
            "remainingMarginDB": margin,
            "activeUplinkGbps": active,
            "oversubscription": p["downlinks"] * p["downlinkGbps"] / active if active > 0 else None,
            "connectivity": "connected" if active > 0 else "disconnected",
            "status": "screen-satisfied" if margin >= 0 else "screen-failed",
        }
    if model == "facilityScreen":
        return {
            "averageKPa": p["massKG"] * p["gravityMS2"] / p["areaM2"] / 1000,
            "installedThermalKW": p["coolingUnits"] * p["tonsPerUnit"] * p["kwPerTon"],
        }
    if model == "commissioningScreen":
        restore = sum(p["stageSeconds"])
        annual_it = p["itMW"] * p["hours"]
        return {
            "restoreSeconds": restore,
            "thermalMarginSeconds": p["thermalSeconds"] - restore,
            "electricalMarginSeconds": p["electricalSeconds"] - restore,
            "annualItMWh": annual_it,
            "annualFacilityMWh": annual_it * p["pue"],
            "pueStandardUncertainty": p["pue"]
            * math.hypot(p["facilityRelativeUncertainty"], p["itRelativeUncertainty"]),
        }
    if model == "designReview":
        available = (p["unitsPerSide"] - p["unavailable"]) * p["unitMVA"]
        full_load = p["unitMVA"] * 1000 / math.sqrt(3) / p["voltageKV"]
        capacity_margin = available - p["demandMVA"]
        current_margin = p["incomerA"] - full_load
        return {
            "availableMVA": available,
            "marginMVA": capacity_margin,
            "minimumNPlusOne": math.ceil(p["demandMVA"] / p["unitMVA"]) + 1,
            "fullLoadA": full_load,
            "incomerMarginA": current_margin,
            "capacityStatus": "screen-satisfied" if capacity_margin >= 0 else "screen-failed",
            "currentStatus": "screen-satisfied" if current_margin >= 0 else "screen-failed",
        }
    raise ValueError("No independent equation for model: " + model)


def assert_same(case_id: str, label: str, actual: object, wanted: object) -> None:
    if wanted is None or isinstance(wanted, (str, bool)):
        if actual != wanted:
            raise AssertionError(f"{case_id}: {label}: got {actual!r}, expected {wanted!r}")
        return
    if not isinstance(actual, (int, float)) or not math.isfinite(actual):
        raise AssertionError(f"{case_id}: {label}: got non-finite/non-numeric {actual!r}")
    if not math.isclose(actual, wanted, rel_tol=1e-11, abs_tol=1e-10):
        raise AssertionError(f"{case_id}: {label}: got {actual!r}, expected {wanted!r}")


def actual_typescript_results(cases: list[dict[str, object]]) -> list[dict[str, object]]:
    source = """
import {calculateScreen} from './apps/web/src/infrastructure/screens.ts';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const cases = JSON.parse(input);
console.log(JSON.stringify(cases.map((item) => ({
  id: item.id,
  result: calculateScreen(item.model, item.inputs),
}))));
"""
    command = [
        "node",
        "--experimental-strip-types",
        "--loader",
        "./" + NODE_RESOLVER.relative_to(ROOT).as_posix(),
        "--input-type=module",
        "-e",
        source,
    ]
    process = subprocess.run(
        command,
        cwd=ROOT,
        input=json.dumps(cases, allow_nan=False),
        text=True,
        capture_output=True,
        check=False,
    )
    if process.returncode:
        raise RuntimeError("Typed JavaScript calculation failed:\n" + process.stderr)
    return json.loads(process.stdout)


def main() -> None:
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    if len(cases) != 24 or len({case["id"] for case in cases}) != 24:
        raise AssertionError("Expected exactly 24 unique default/challenge cases")
    actual = actual_typescript_results(cases)
    if len(actual) != len(cases):
        raise AssertionError("Typed JavaScript returned a different number of cases")

    comparisons = 0
    for case, js_result in zip(cases, actual, strict=True):
        if js_result["id"] != case["id"]:
            raise AssertionError("Golden case ordering changed")
        independently_computed = expected(case["model"], case["inputs"])
        for key, golden_value in case["expected"].items():
            assert_same(case["id"], "golden." + key, independently_computed[key], golden_value)
            comparisons += 1
        for key, wanted in independently_computed.items():
            assert_same(case["id"], "typescript." + key, js_result["result"][key], wanted)
            comparisons += 1

    print(
        json.dumps(
            {
                "status": "passed",
                "cases": len(cases),
                "numericAndStateComparisons": comparisons,
                "scope": "Independent Python equations compared with the typed browser module; educational screens only.",
                "python": sys.version.split()[0],
                "node": subprocess.check_output(["node", "--version"], text=True).strip(),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
