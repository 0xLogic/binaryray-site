# Binaryray progress dashboard

Static [coverage and progress site](https://0xlogic.github.io/binaryray-site/) for the independent `hexx64.dll` reconstruction.

`coverage.json` is generated from thirteen hash-matched validation reports in `reports/`. The displayed counts distinguish discovered starts, C-like structured output, and selected native behavior checks. The site is a snapshot, not a live build service.

The C++ source is in the private [0xLogic/binaryray](https://github.com/0xLogic/binaryray) repository. This public site repository contains only static website files and aggregate reports; it does not contain the original DLL, IDA databases, SDK files, recovered pseudocode dumps, or the independent executable.
