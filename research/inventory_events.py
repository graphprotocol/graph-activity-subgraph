#!/usr/bin/env python3
"""Compare event subscriptions in the three sibling subgraph templates.

Uses only the Python standard library. Reads the checked-out templates, including
both Mustache branches; this is not a deployed-chain coverage measurement.
Run from any directory; optionally supply --network and --analytics repo paths.
"""

import argparse
import csv
import re
from collections import Counter
from pathlib import Path


def inventory(root):
    rows = []
    conditions = []
    section = "dataSources"
    source = None
    pending = None
    for number, line in enumerate((root / "subgraph.template.yaml").read_text().splitlines(), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        conditional = re.fullmatch(r"{{([#^/])(\w+)}}", stripped)
        if conditional:
            mode, name = conditional.groups()
            if mode == "/":
                assert conditions and conditions[-1][1] == name
                conditions.pop()
            else:
                conditions.append((mode, name))
            continue
        if line in ("dataSources:", "templates:"):
            section = line[:-1]
        if re.match(r"^  - (kind|name):", line):
            source = {"section": section, "scope": ";".join(
                ("!" if mode == "^" else "") + name for mode, name in conditions
            ) or "all", "address": "dynamic", "start_block": "dynamic"}
            pending = None
        if source is None:
            continue
        match = re.match(r"^(?:  -|   ) name: (.+)$", line)
        if match:
            source["source"] = match[1]
        match = re.match(r"^      (address|startBlock): (.+)$", line)
        if match:
            source["address" if match[1] == "address" else "start_block"] = match[2].strip("\"'")
        match = re.match(r"^      file: (\./src/.+)$", line)
        if match:
            source["mapping"] = match[1]
        match = re.match(r"^        - event: (.+)$", line)
        if match:
            pending = dict(source, event=match[1].strip(), manifest_line=number)
        match = re.match(r"^          handler: (.+)$", line)
        if match and pending:
            pending["handler"] = match[1]
            code = (root / pending["mapping"]).read_text()
            definition = re.search(r"^export function " + re.escape(match[1]) + r"\s*\(", code, re.M)
            assert definition, (root, pending)
            pending["handler_line"] = code[:definition.start()].count("\n") + 1
            rows.append(pending)
            pending = None
    assert not conditions
    # Each subscription is contract/source-qualified, including indexed layout.
    assert len(rows) == len({key(row) for row in rows})
    return rows


def key(row):
    return row["section"], row["source"], row["scope"], row["event"]


def main():
    activity = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--network", type=Path, default=activity.parent / "graph-network-subgraph")
    parser.add_argument("--analytics", type=Path, default=activity.parent / "graph-network-analytics-subgraph-horizon")
    args = parser.parse_args()
    repos = {"activity": inventory(activity), "network": inventory(args.network), "analytics": inventory(args.analytics)}
    lookups = {name: {key(row): row for row in rows} for name, rows in repos.items()}
    keys = list(dict.fromkeys(key(row) for rows in repos.values() for row in rows))
    fields = ["section", "source", "scope", "event"]
    for name in repos:
        fields.extend(name + "_" + field for field in ("subscribed", "address", "start_block", "manifest_line", "handler", "mapping", "handler_line"))
    output = activity / "research/event-inventory.csv"
    with output.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for event_key in keys:
            row = dict(zip(fields[:4], event_key))
            for name, lookup in lookups.items():
                event = lookup.get(event_key)
                row[name + "_subscribed"] = "yes" if event else "no"
                if event:
                    for field in ("address", "start_block", "manifest_line", "handler", "mapping", "handler_line"):
                        row[name + "_" + field] = event[field]
            writer.writerow(row)
    for name, rows in repos.items():
        print(name, len(rows), "subscriptions:", dict(Counter(row["source"] for row in rows)))
    print("Network subscriptions absent from activity:", len(lookups["network"].keys() - lookups["activity"].keys()))
    print("Activity subscriptions absent from network:", len(lookups["activity"].keys() - lookups["network"].keys()))
    print("Network/analytics subscription symmetric difference:", len(lookups["network"].keys() ^ lookups["analytics"].keys()))
    print("Wrote", output)


if __name__ == "__main__":
    main()
