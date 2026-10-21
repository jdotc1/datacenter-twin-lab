# Dependency validation

Native scientific dependencies intentionally differ from the pinned Pyodide browser distribution: native NumPy 2.5.4 and SciPy 1.18.1; browser NumPy 2.4.6 and SciPy 1.18.0 in Pyodide 314.0.6. The browser packages remain hash verified. This is a software parity policy, not a claim of scientific calibration. Both versions must satisfy the existing differential checks without changing numerical tolerances under the project and root demo base paths. CI failures block integration.

CI installs API/study extras together with their locks, runs pip check, and verifies installed versions against project metadata and the lock. React and React DOM are updated together, with a prebuild installed-version guard and a grouped Dependabot update including their type packages. React type patch numbers may differ from runtime patch numbers. Vite 8.3.5 includes the launch-editor security fixes reported for the previous 8.2.2 pin.
