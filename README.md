# Binaryray coverage dashboard

Static, buildless GitHub Pages site. `index.html` loads `./coverage.json`; every asset path is relative, so the site works at `/binaryray-site/` or when deployed from another subdirectory. No IDA binary, executable, native test fixture, or GitHub credential is shipped with the site.

## Refresh the data

From the repository root:

```powershell
python reverse_engineering/publishing/site/build_coverage.py
```

The generator reads these pinned reports:

- `reverse_engineering/reconstruction/validation/coverage_by_size_report.json`
- `reverse_engineering/reconstruction/validation/current_native_summary_report.json`
- `reverse_engineering/reconstruction/validation/pe_result_corpus_report.json`
- `reverse_engineering/reconstruction/validation/port_ledger_report.json`
- `reverse_engineering/reconstruction/validation/ports_127_native_summary_report.json` and its 12 `batch_ports_127_*` native reports
- `reverse_engineering/reconstruction/validation/typed8_ports_23_native_report.json` and its two `typed8_23_*` native reports
- The direct original-byte reports named in `build_coverage.py`, including `record_subtract_10b2d0_native_report.json`

It rejects disagreement on the target DLL SHA-256, independent engine build SHA-256 within the engine reports, full-RAX port artifact SHA-256 between its reports, each native suite report hash, structured count, native fixture partition, export inventories, mapped-slice ledger, or corpus audit. The **engine snapshot SHA** identifies the report-pinned `own_decompiler.exe`; the **two port artifact SHAs** identify separate compiled full-RAX and typed-AL DLLs. None is a Git commit. Repin dependent reports before regenerating. The checked-in snapshot may lag active development.

The current retained port snapshot records 9 manual helper slices and 150 native-validated generated exports: 127 full-RAX exports and 23 typed-AL exports. Four RVAs overlap between manual and generated slices, yielding 155 distinct mapped original RVAs from 159 slices. All 150 compiled exports have native fixtures on admitted inputs. Typed-AL comparisons check the defined low 8 return bits and fixture memory; these fixtures do not establish full-function equivalence.

Preview locally from this directory with `python -m http.server 8000` and visit `http://localhost:8000/`. Opening `index.html` directly with a `file:` URL may block the JSON fetch.

For GitHub Pages, publish this directory as the Pages artifact root (or copy its files to the configured Pages source). The private source repository cannot host Pages on the current plan, so the public site repository is `0xLogic/binaryray-site` and the expected URL is `https://0xlogic.github.io/binaryray-site/`. No absolute root paths are used. Publishing is handled outside this directory.

## `coverage.json` schema, version 3

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Integer schema version; currently `3` (separate full-RAX and typed-AL port groups). |
| `snapshot.name`, `target`, `buildArtifact` | Display labels for the pinned measurement. |
| `snapshot.buildSha256`, `targetSha256` | Full 64-character hashes of the independent executable and target DLL recorded by all three reports. |
| `snapshot.referenceHeads` | Function heads in the reference IDA inventory. This is a comparison population, not the discovered denominator. |
| `coverage.discovered` | Independent candidate function starts. |
| `coverage.structured` | Candidate starts yielding admitted C-like output. This does not imply native semantic validation. |
| `coverage.listing` | Discovered starts receiving an instruction listing; equals `discovered - structured`. |
| `coverage.idaHeadsDiscovered` | Intersection between discovered starts and reference IDA function heads. |
| `coverage.directNativeValidated` | Distinct structured functions covered by direct original-byte fixtures. |
| `coverage.controlledNativeValidated` | Distinct structured wrappers covered with substituted callees or effects. |
| `coverage.nativeValidatedDistinct` | Sum of the preceding two disjoint categories. |
| `coverage.structuredWithoutNativeFixture` | `structured - nativeValidatedDistinct`. |
| `validation.directOriginalCases`, `controlledCases` | Executed test cases in each native fixture category. Case counts are not function counts. |
| `validation.ownedLineFunctionsChecked`, `ownedLineBytesChecked`, `ownedLineMismatches` | Interface consistency audit; not semantic parity. |
| `porting.manualHelperImplementations` | Hand-written mapped helper slices in the port ledger. |
| `porting.nativeValidatedGeneratedExports` | Distinct compiled generated exports checked by original-byte fixtures across both return-width groups. |
| `porting.distinctMappedOriginalRvas` | Distinct original RVAs mapped by manual and generated slices. This is not a count of complete reconstructed functions. |
| `porting.manualGeneratedOverlap`, `mappedSlices` | Overlapping RVAs and total slice entries. `mappedSlices = manualHelperImplementations + nativeValidatedGeneratedExports`; `distinctMappedOriginalRvas = mappedSlices - manualGeneratedOverlap`. |
| `porting.compiledGeneratedExports`, `withoutValidatedExportParity` | All compiled generated exports across both DLLs and their remainder outside native export fixtures. Zero means every retained export was tested on admitted inputs, not full-function equivalence. |
| `porting.fullRax`, `porting.typedAl` | Separate objects containing `returnBitsCompared`, `compiledExports`, `nativeValidatedExports`, `nativeCases`, and `artifactSha256`. Full-RAX compares the 64-bit return; typed-AL compares only the defined low 8 return bits. |
| `sizeBands[]` | `label` (reference pseudocode line band), `referenceHeads`, `discovered`, `structured`. The table rate is `structured / referenceHeads` for each band. |
| `sources[]` | Relative destinations for the nine source reports if they are published under `reports/`. The dashboard itself reads only `coverage.json`. |
| `limitations[]` | Plain-language scope notes displayed on the site. |

The generator and browser both validate count relationships. Keep the site copy conservative when adding new metrics: a byte-for-byte text comparison, a C++ compile check, a native behavior test, and an export mapping are different forms of evidence. The C++ porting section does not derive its numbers from pseudocode coverage.
