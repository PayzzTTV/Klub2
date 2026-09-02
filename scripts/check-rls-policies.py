#!/usr/bin/env python3
"""Garde-fou CI pour KLB-01.

Aucune policy RLS du projet n'était restreinte par `TO authenticated`.
PostgreSQL les attachait donc au rôle `public`, qui inclut `anon` — rendant
toute la base lisible avec la seule clé anon, publique par construction.

Ce script relit les migrations et refuse toute `CREATE POLICY` dépourvue de
clause `TO authenticated`. Une instruction s'étendant sur plusieurs lignes,
on l'accumule jusqu'à son point-virgule terminal avant de l'analyser.
"""

from __future__ import annotations

import glob
import re
import sys

MIGRATIONS_GLOB = "supabase/migrations/*.sql"

# Les policies volontairement ouvertes à d'autres rôles se déclarent ici,
# avec la justification en commentaire.
ALLOWED_WITHOUT_AUTHENTICATED: set[str] = set()


def iter_policies(path: str):
    """Produit (numéro de ligne de départ, texte complet) par CREATE POLICY."""
    with open(path, encoding="utf-8") as fh:
        lines = fh.readlines()

    buffer: list[str] = []
    start = 0

    for number, raw in enumerate(lines, start=1):
        line = raw.split("--")[0]  # ignorer les commentaires de fin de ligne

        if not buffer and re.match(r"^\s*CREATE\s+POLICY", line, re.IGNORECASE):
            buffer = [line]
            start = number
            if ";" in line:
                yield start, " ".join(buffer)
                buffer = []
            continue

        if buffer:
            buffer.append(line)
            if ";" in line:
                yield start, " ".join(buffer)
                buffer = []

    if buffer:  # instruction non terminée : on la signale telle quelle
        yield start, " ".join(buffer)


def main() -> int:
    paths = sorted(glob.glob(MIGRATIONS_GLOB))

    if not paths:
        print(f"::error::Aucune migration trouvée dans {MIGRATIONS_GLOB}")
        return 1

    failures: list[str] = []
    checked = 0

    for path in paths:
        for line_number, statement in iter_policies(path):
            checked += 1
            name_match = re.search(
                r'CREATE\s+POLICY\s+"?([^"\s]+)"?', statement, re.IGNORECASE
            )
            name = name_match.group(1) if name_match else "<anonyme>"

            if name in ALLOWED_WITHOUT_AUTHENTICATED:
                continue

            if not re.search(r"\bTO\s+authenticated\b", statement, re.IGNORECASE):
                failures.append(f"{path}:{line_number} — policy « {name} »")

    if failures:
        print("::error::Des policies RLS ne sont pas restreintes TO authenticated (KLB-01)")
        for failure in failures:
            print(f"  ✗ {failure}")
        return 1

    print(f"✅ {checked} policies vérifiées, toutes restreintes TO authenticated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
