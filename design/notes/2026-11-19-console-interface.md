# Console test seam

The proposed console is not part of the supported package or CLI. The
injectable runner in `src/console.ts` and its mocked-API tests are a
non-production contract seam; they do not implement query semantics or
integrate the shared API. `npm test` type-checks these tests but does not run
them.

The runner accepts declarative mode aliases and rejects JavaScript modes
without evaluating them. Any future console must use the shared API, define
its supported semantics and output, and preserve the requirements against
vault-script execution, vault mutation, and external transmission. The
current interfaces are documented in the [README](../../README.md).
