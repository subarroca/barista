"""Public API surface is re-exported here.

This file should be the package where all rules are imported from

The rules should be located in folders inside this package and re-exported
with this kind of barrel file.

Users should not load files under "/tools/bazel_rules/..."
"""

load("//tools/bazel_rules/rollup:rollup.bzl", _rollup = "rollup_macro")
load("//tools/bazel_rules:architect_macro.bzl", _architect = "architect_macro")
load("//tools/bazel_rules:stylelint_macro.bzl", _stylelint = "stylelint_macro")

rollup = _rollup
architect = _architect
stylelint = _stylelint
