"""Strip comments and docstrings from Python source, reading stdin, writing stdout.

Used by tools/vault.mjs as the Python half of the obfuscation step. Python names
cannot be safely renamed without whole-program analysis (getattr, **kwargs, Flask
route function names, dataclass fields), so this removes documentation only and
leaves the code runnable.

Rather than re-emitting the token stream — which loses indentation and mistakes
dict string keys for docstrings — this deletes the exact character ranges of
comments and docstrings from the original text, so all other formatting survives
byte for byte. Comments are located with `tokenize`, docstrings with `ast`.
"""
import ast
import io
import sys
import tokenize


def _line_offsets(source: str):
    """Absolute index of the first character of each 1-based line."""
    offsets = []
    pos = 0
    for line in source.splitlines(keepends=True):
        offsets.append(pos)
        pos += len(line)
    offsets.append(pos)
    return offsets


def _multiline_token_lines(source: str):
    """1-based line numbers spanned by any token that covers more than one line.

    Blank lines inside a triple-quoted string or a multi-line f-string are part of
    the value and must never be removed.
    """
    protected = set()
    for tok in tokenize.generate_tokens(io.StringIO(source).readline):
        if tok.end[0] > tok.start[0]:
            protected.update(range(tok.start[0], tok.end[0] + 1))
    return protected


def _cuts(source: str, offsets):
    """(start, end, replacement) ranges to remove, as absolute character indices."""
    def idx(lineno, col):
        return offsets[lineno - 1] + col

    cuts = []

    for tok in tokenize.generate_tokens(io.StringIO(source).readline):
        if tok.type == tokenize.COMMENT:
            cuts.append((idx(*tok.start), idx(*tok.end), ""))

    scoped = (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)
    for node in ast.walk(ast.parse(source)):
        if not isinstance(node, scoped):
            continue
        body = getattr(node, "body", None)
        if not body:
            continue
        first = body[0]
        if not (
            isinstance(first, ast.Expr)
            and isinstance(first.value, ast.Constant)
            and isinstance(first.value.value, str)
        ):
            continue
        # A body consisting solely of a docstring still needs a statement.
        replacement = "pass" if len(body) == 1 and not isinstance(node, ast.Module) else ""
        cuts.append((
            idx(first.value.lineno, first.value.col_offset),
            idx(first.value.end_lineno, first.value.end_col_offset),
            replacement,
        ))

    return cuts


def strip(source: str) -> str:
    offsets = _line_offsets(source)
    result = source
    # Apply back to front so earlier indices stay valid.
    for start, end, replacement in sorted(_cuts(source, offsets), key=lambda c: -c[0]):
        result = result[:start] + replacement + result[end:]

    protected = _multiline_token_lines(result)
    kept = []
    for lineno, line in enumerate(result.split("\n"), 1):
        if lineno in protected:
            kept.append(line)
            continue
        stripped = line.rstrip()
        if stripped:
            kept.append(stripped)
    return "\n".join(kept) + "\n"


def _drop_docstrings(tree):
    """Remove docstring nodes from a tree so it can be compared with stripped output."""
    scoped = (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)
    for node in ast.walk(tree):
        if not isinstance(node, scoped):
            continue
        body = getattr(node, "body", None)
        if not body:
            continue
        first = body[0]
        if (
            isinstance(first, ast.Expr)
            and isinstance(first.value, ast.Constant)
            and isinstance(first.value.value, str)
        ):
            node.body = body[1:]
            # An empty module is valid Python; an empty function or class is not.
            if not node.body and not isinstance(node, ast.Module):
                node.body = [ast.Pass()]
    return tree


def main() -> int:
    source = sys.stdin.read()
    try:
        result = strip(source)
        # Never emit source that fails to parse, and never change what it does:
        # the stripped tree must equal the original minus its docstrings.
        # ast.dump omits positions by default, so formatting differences are ignored.
        expected = ast.dump(_drop_docstrings(ast.parse(source)))
        actual = ast.dump(ast.parse(result))
        if actual != expected:
            raise ValueError("stripped source is not semantically identical to the original")
    except Exception as exc:  # noqa: BLE001 - surfaced to the caller verbatim
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    sys.stdout.write(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
