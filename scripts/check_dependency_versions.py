"""Verify that a declared extra, its lock and the installed environment agree."""
import importlib.metadata
from pathlib import Path
import re
import sys
import tomllib

root = Path(__file__).resolve().parents[1]
metadata = tomllib.loads((root / 'pyproject.toml').read_text(encoding='utf-8'))
for extra in sys.argv[1:]:
    lock_name = 'requirements-studies.lock' if extra == 'studies' else 'requirements-api.lock'
    lock = (root / lock_name).read_text(encoding='utf-8')
    for requirement in metadata['project']['optional-dependencies'][extra]:
        match = re.fullmatch(r'([A-Za-z0-9_.-]+)==([^;\s]+)', requirement)
        if match is None:
            raise SystemExit(f'Expected an exact extra pin: {requirement}')
        name, expected = match.groups()
        if requirement not in lock.splitlines():
            raise SystemExit(f'{requirement} is missing from {lock_name}')
        actual = importlib.metadata.version(name)
        if actual != expected:
            raise SystemExit(f'{name}: installed {actual}, declared {expected}')
        print(f'{extra}: {name}=={actual}')
