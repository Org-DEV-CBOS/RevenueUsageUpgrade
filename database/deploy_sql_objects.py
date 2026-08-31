#!/usr/bin/env python3
"""
Deploy stored procedure and view definitions (previously exported by
export_sql_objects.py) into a SQL Server database.

Reads files named:  ObjectType--Schema.ObjectName.txt
from a folder, and for SQL_STORED_PROCEDURE and VIEW files only,
drops the existing object then CREATE's it (two batches). This works on
SQL Server versions that do not support CREATE OR ALTER, and keeps
CREATE PROCEDURE/VIEW as the first statement in its batch.

Requires: pyodbc  (pip install pyodbc)
Also requires an installed ODBC driver for SQL Server.
"""

import os
import re
import getpass
import sys

try:
    import pyodbc
except ImportError:
    print("The 'pyodbc' package is required. Install it with:")
    print("    pip install pyodbc")
    sys.exit(1)


# Only these object types are deployed. Everything else found in the folder is ignored.
ALLOWED_TYPES = {
    "SQL_STORED_PROCEDURE": "PROCEDURE",
    "VIEW": "VIEW",
}

# Matches: <ObjectType>--<Schema>.<ObjectName>.txt
FILENAME_PATTERN = re.compile(r"^(?P<type>[^-]+)--(?P<schema>[^.]+)\.(?P<name>.+)\.txt$")

DRIVER_CANDIDATES = [
    "ODBC Driver 18 for SQL Server",
    "ODBC Driver 17 for SQL Server",
    "ODBC Driver 13 for SQL Server",
    "SQL Server",
]


def pick_driver():
    available = pyodbc.drivers()
    for candidate in DRIVER_CANDIDATES:
        if candidate in available:
            return candidate
    if available:
        return available[0]
    print("No ODBC drivers found on this machine. Please install one, e.g.:")
    print("  'ODBC Driver 17 for SQL Server' or 'ODBC Driver 18 for SQL Server'")
    sys.exit(1)


def bracket(ident: str) -> str:
    return "[" + ident.replace("]", "]]") + "]"


def to_create_statement(definition: str, keyword: str) -> str:
    """
    Return a CREATE PROCEDURE/VIEW batch: strip BOM and any leading text so
    CREATE is the first statement, and rewrite CREATE OR ALTER / ALTER to CREATE.
    """
    definition = definition.lstrip("\ufeff")
    if keyword == "PROCEDURE":
        obj_kw = r"PROC(?:EDURE)?"
    else:
        obj_kw = r"VIEW"

    pattern = re.compile(
        rf"(CREATE\s+OR\s+ALTER|CREATE|ALTER)(\s+{obj_kw}\b)",
        re.IGNORECASE,
    )

    match = pattern.search(definition)
    if not match:
        raise ValueError(f"Could not find a CREATE/ALTER {keyword} statement in the definition")

    return "CREATE" + match.group(2) + definition[match.end():]


def drop_object_sql(keyword: str, schema: str, name: str) -> str:
    type_code = "P" if keyword == "PROCEDURE" else "V"
    return (
        f"IF OBJECT_ID(N'{schema}.{name}', N'{type_code}') IS NOT NULL "
        f"DROP {keyword} {bracket(schema)}.{bracket(name)};"
    )


def build_dependency_order(candidates, definitions):
    """
    Given candidates [(fname, obj_type, schema, name), ...] and a dict mapping
    fname -> definition text, return the candidates reordered so that objects
    referenced by other objects (in this same batch) are deployed first.

    Uses a simple text scan: for each object, look for mentions of every other
    object's "schema.name" or bare "name" (word-boundary, case-insensitive) in
    its own definition. This is a heuristic, not a full T-SQL parser - it can
    miss dependencies hidden in dynamic SQL, or false-positive on coincidental
    name matches. Cycles (e.g. mutual references) are broken arbitrarily and
    reported, since real circular dependencies can't be strictly ordered.
    """
    # key -> candidate tuple
    key_of = {}
    for cand in candidates:
        fname, obj_type, schema, name = cand
        key_of[(schema.lower(), name.lower())] = cand

    # Build regex-friendly lookup: bare name (case-insensitive, word boundary) -> set of keys
    # A bare name can be ambiguous across schemas, so it may map to multiple keys.
    name_to_keys = {}
    for (schema_l, name_l), cand in key_of.items():
        name_to_keys.setdefault(name_l, set()).add((schema_l, name_l))

    # edges[key] = set of keys that `key` depends on (must be deployed first)
    edges = {key: set() for key in key_of}

    for key, cand in key_of.items():
        fname = cand[0]
        text = definitions[fname]
        text_lower = text.lower()

        for other_name_l, other_keys in name_to_keys.items():
            if not re.search(rf"\b{re.escape(other_name_l)}\b", text_lower):
                continue
            for other_key in other_keys:
                if other_key == key:
                    continue
                # schema.name or just name both count as a hit (bare-name check above
                # already confirms the name appears; that's enough to add the edge)
                edges[key].add(other_key)

    # Kahn's algorithm for topological sort (dependencies first)
    in_degree = {key: 0 for key in key_of}
    dependents = {key: set() for key in key_of}  # reverse edges
    for key, deps in edges.items():
        for dep in deps:
            dependents[dep].add(key)
            in_degree[key] += 1

    # Start with objects that have no unresolved dependencies, in original order for stability
    ordered_keys = []
    remaining = {key: in_degree[key] for key in key_of}
    queue = [cand for cand in candidates if remaining[(cand[2].lower(), cand[3].lower())] == 0]
    queued = set((c[2].lower(), c[3].lower()) for c in queue)

    cycle_broken = False
    while remaining:
        if not queue:
            # Cycle detected: pick any remaining node (original order) to break the tie
            cycle_broken = True
            for cand in candidates:
                k = (cand[2].lower(), cand[3].lower())
                if k in remaining:
                    queue.append(cand)
                    queued.add(k)
                    break

        cand = queue.pop(0)
        key = (cand[2].lower(), cand[3].lower())
        if key not in remaining:
            continue
        ordered_keys.append(cand)
        del remaining[key]

        for dependent_key in dependents[key]:
            if dependent_key in remaining:
                in_degree[dependent_key] -= 1
                if in_degree[dependent_key] <= 0 and dependent_key not in queued:
                    dependent_cand = key_of[dependent_key]
                    queue.append(dependent_cand)
                    queued.add(dependent_key)

    return ordered_keys, cycle_broken


def main():
    print("=== SQL Server Object Deployer (Stored Procedures / Views) ===\n")

    folder = input("Folder containing the exported .txt files: ").strip()
    if not os.path.isdir(folder):
        print(f"Folder not found: {folder}")
        sys.exit(1)

    server = input("Target server name (e.g. myserver.database.windows.net or SERVER\\INSTANCE): ").strip()
    database = input("Target database name: ").strip()
    username = input("SQL username: ").strip()
    password = getpass.getpass("SQL password: ")

    driver = pick_driver()

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"Encrypt=yes;"
        f"TrustServerCertificate=yes;"
    )

    print(f"\nConnecting to '{server}' / '{database}' using driver '{driver}'...")
    try:
        conn = pyodbc.connect(conn_str, timeout=15, autocommit=False)
    except pyodbc.Error as e:
        print("Failed to connect to the database:")
        print(e)
        sys.exit(1)

    # Gather and filter candidate files first
    candidates = []
    skipped_files = []
    for fname in sorted(os.listdir(folder)):
        if not fname.lower().endswith(".txt"):
            continue
        match = FILENAME_PATTERN.match(fname)
        if not match:
            skipped_files.append((fname, "filename doesn't match ObjectType--Schema.Name.txt pattern"))
            continue

        obj_type = match.group("type")
        schema = match.group("schema")
        name = match.group("name")

        if obj_type not in ALLOWED_TYPES:
            skipped_files.append((fname, f"object type '{obj_type}' not in scope (SPs/Views only)"))
            continue

        candidates.append((fname, obj_type, schema, name))

    print(f"\nFound {len(candidates)} SP/View file(s) to deploy, {len(skipped_files)} file(s) skipped.\n")

    if skipped_files:
        print("Skipped files:")
        for fname, reason in skipped_files:
            print(f"  [skip] {fname} - {reason}")
        print()

    if not candidates:
        print("Nothing to deploy.")
        conn.close()
        return

    confirm = input(f"Deploy {len(candidates)} object(s) to '{database}' on '{server}'? [y/N]: ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        conn.close()
        return

    # Read all definitions up front (needed for both dependency analysis and CREATE rewrite)
    definitions = {}
    for fname, obj_type, schema, name in candidates:
        with open(os.path.join(folder, fname), "r", encoding="utf-8-sig") as f:
            definitions[fname] = f.read()

    print("\nAnalyzing dependencies between objects...")
    ordered_candidates, cycle_broken = build_dependency_order(candidates, definitions)
    if cycle_broken:
        print("  Note: a circular reference was detected between some objects; those were")
        print("  ordered arbitrarily. The retry pass below should still resolve them.")

    cursor = conn.cursor()
    succeeded = 0
    failed_items = []  # list of (fname, obj_type, schema, name, error)

    def deploy_one(fname, obj_type, schema, name):
        keyword = ALLOWED_TYPES[obj_type]
        definition = definitions[fname]
        try:
            sql = to_create_statement(definition, keyword)
        except ValueError as e:
            return False, str(e)
        try:
            cursor.execute(drop_object_sql(keyword, schema, name))
            cursor.execute(sql)
            return True, None
        except pyodbc.Error as e:
            return False, str(e)

    print(f"\nDeploying in dependency order (referenced objects first)...\n")
    for fname, obj_type, schema, name in ordered_candidates:
        ok, error = deploy_one(fname, obj_type, schema, name)
        if ok:
            print(f"  [ok] {schema}.{name} ({obj_type})")
            succeeded += 1
        else:
            print(f"  [error] {schema}.{name} ({obj_type}) - {error}")
            failed_items.append((fname, obj_type, schema, name, error))

    # Retry pass: some failures may just be ordering issues our text scan missed
    # (dynamic SQL, aliasing, etc). Retry until no further progress is made.
    retry_round = 1
    while failed_items and retry_round <= 3:
        print(f"\nRetry pass {retry_round} for {len(failed_items)} failed object(s)...")
        still_failed = []
        progress = False
        for fname, obj_type, schema, name, _prev_error in failed_items:
            ok, error = deploy_one(fname, obj_type, schema, name)
            if ok:
                print(f"  [ok] {schema}.{name} ({obj_type}) (resolved on retry)")
                succeeded += 1
                progress = True
            else:
                still_failed.append((fname, obj_type, schema, name, error))
        failed_items = still_failed
        retry_round += 1
        if not progress:
            break

    failed = len(failed_items)
    if failed_items:
        print("\nObjects that could not be deployed:")
        for fname, obj_type, schema, name, error in failed_items:
            print(f"  [error] {schema}.{name} ({obj_type}) - {error}")

    if failed:
        rollback = input(
            f"\n{failed} object(s) failed. Commit the {succeeded} successful change(s) anyway? [y/N]: "
        ).strip().lower()
        if rollback == "y":
            conn.commit()
            print("Committed successful changes. Failed objects were not applied.")
        else:
            conn.rollback()
            print("Rolled back. No changes were applied.")
    else:
        conn.commit()
        print(f"\nAll {succeeded} object(s) deployed and committed successfully.")

    conn.close()


if __name__ == "__main__":
    main()
