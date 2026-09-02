#!/usr/bin/env python3
"""Garde-fou CI pour KLB-09 — vulnérabilités des dépendances.

`npm audit --audit-level=high` échouerait aujourd'hui sur une seule advisory
qu'on ne peut pas corriger sans passer Next.js en majeure. Une CI rouge en
permanence finit par être ignorée, ce qui reviendrait à n'avoir aucun garde-fou.

Ce script échoue donc sur toute advisory haute ou critique **qui n'est pas
explicitement acceptée ci-dessous**. Chaque exception porte sa justification et
sa date de réexamen ; une exception périmée fait échouer la CI à son tour, pour
qu'elle ne s'installe pas silencieusement.
"""

from __future__ import annotations

import datetime as dt
import json
import subprocess
import sys

BLOCKING_SEVERITIES = {"high", "critical"}

# ---------------------------------------------------------------------------
# Exceptions acceptées. Clé = identifiant GHSA.
# ---------------------------------------------------------------------------
ACCEPTED: dict[str, dict[str, str]] = {
    "GHSA-qx2v-qp2m-jg93": {
        "paquet": "postcss (transitif via next)",
        "raison": (
            "Dépendance de build uniquement : postcss traite les CSS du projet "
            "au build, jamais une entrée utilisateur à l'exécution. "
            "Corriger impose next@16 (majeure). Les advisories runtime de "
            "Next.js sont déjà corrigées en 15.5.25."
        ),
        "reexamen": "2026-12-01",
    },
    "GHSA-6g55-p6wh-862q": {"alias": "GHSA-qx2v-qp2m-jg93"},
    "GHSA-fxqj-rqcc-2cmp": {"alias": "GHSA-qx2v-qp2m-jg93"},
    "GHSA-r28c-9q8g-f849": {"alias": "GHSA-qx2v-qp2m-jg93"},
}


def advisory_id(url: str) -> str:
    return url.rstrip("/").rsplit("/", 1)[-1] if url else ""


def main() -> int:
    result = subprocess.run(
        ["npm", "audit", "--json"], capture_output=True, text=True
    )
    if not result.stdout:
        print("::error::npm audit n'a produit aucune sortie")
        print(result.stderr)
        return 1

    report = json.loads(result.stdout)
    today = dt.date.today()

    blocking: list[str] = []
    accepted_seen: set[str] = set()

    for name, vuln in report.get("vulnerabilities", {}).items():
        if vuln.get("severity") not in BLOCKING_SEVERITIES:
            continue

        for via in vuln.get("via", []):
            if not isinstance(via, dict):
                continue
            ghsa = advisory_id(via.get("url", ""))
            entry = ACCEPTED.get(ghsa)

            if entry is None:
                blocking.append(f"{name} — {via.get('title')} ({ghsa})")
                continue

            root = entry.get("alias", ghsa)
            root_entry = ACCEPTED.get(root)

            if root_entry is None:
                # Alias orphelin : la config est cassée, on refuse plutôt que
                # de laisser passer une advisory par accident.
                blocking.append(
                    f"{name} — exception {ghsa} pointe vers {root}, absent de "
                    f"ACCEPTED (configuration à corriger)"
                )
                continue

            accepted_seen.add(root)

            deadline = root_entry.get("reexamen")
            if deadline and dt.date.fromisoformat(deadline) < today:
                blocking.append(
                    f"{name} — exception {root} périmée depuis le {deadline}, "
                    f"à réexaminer"
                )

    if blocking:
        print("::error::Vulnérabilités bloquantes (KLB-09)")
        for item in sorted(set(blocking)):
            print(f"  ✗ {item}")
        print("\nCorriger avec `npm audit fix`, ou documenter une exception "
              "dans scripts/check-dependencies.py.")
        return 1

    meta = report.get("metadata", {}).get("vulnerabilities", {})
    print(
        f"✅ Aucune vulnérabilité haute ou critique non acceptée "
        f"(total: {meta.get('total', 0)} — "
        f"{meta.get('moderate', 0)} modérées, {meta.get('low', 0)} faibles)"
    )
    for ghsa in sorted(accepted_seen):
        entry = ACCEPTED[ghsa]
        print(f"   ℹ️  exception acceptée jusqu'au {entry['reexamen']} : "
              f"{entry['paquet']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
