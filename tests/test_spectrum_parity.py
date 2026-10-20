"""Independent DFT regression for the production one-sided spectrum."""
from __future__ import annotations

import ast
from pathlib import Path
import unittest

try:
    import numpy as np
except ImportError:
    np = None


@unittest.skipIf(np is None, "spectrum regressions require NumPy")
class SpectrumParityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # The production helper is local to run_sdcib. Compile that exact helper
        # so both odd and even lengths can be exercised without changing the
        # study's fixed 801-sample public contract or duplicating its algorithm.
        path = Path(__file__).resolve().parents[1] / "datacenter_twin/research/sdcib.py"
        tree = ast.parse(path.read_text())
        functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name == "spectrum"]
        if len(functions) != 1:
            raise AssertionError("Expected one production spectrum helper")
        scope = {"np": np, "duration": 2.0}
        exec(compile(ast.Module(body=functions, type_ignores=[]), str(path), "exec"), scope)
        cls.spectrum = staticmethod(scope["spectrum"])

    def assert_matches_full_dft(self, n):
        samples = np.arange(n)
        signal = 0.37 * np.cos(2 * np.pi * (n // 2) * samples / n)
        signal += 0.1 * np.sin(2 * np.pi * 10 * samples / n)
        window = np.hanning(n)
        weighted = (signal - signal.mean()) * window
        # Direct full complex DFT, deliberately independent of rfft/fft.
        full = np.exp(-2j * np.pi * np.outer(samples, samples) / n) @ weighted
        expected = np.abs(full[: n // 2 + 1]) / window.sum()
        for k in range(1, len(expected)):
            if n % 2 or k != n // 2:
                expected[k] += abs(full[n - k]) / window.sum()
        frequencies, actual = self.spectrum(signal)
        np.testing.assert_allclose(actual, expected, rtol=1e-10, atol=3e-14)
        np.testing.assert_allclose(frequencies, np.arange(n // 2 + 1) * (n - 1) / (2.0 * n))
        self.assertGreater(expected[-1], 0.1)

    def test_odd_801_doubles_the_last_positive_frequency(self):
        self.assert_matches_full_dft(801)

    def test_even_800_keeps_the_nyquist_amplitude_undoubled(self):
        self.assert_matches_full_dft(800)


if __name__ == "__main__":
    unittest.main()
