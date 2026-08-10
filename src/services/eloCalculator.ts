// The Elo calculation logic lives in api/_lib/eloCalculator.ts, so it's
// implemented exactly once for both the API and the client. Don't add
// logic here — add it there instead.
//
// It lives under api/_lib rather than a neutral shared/ directory
// deliberately: a top-level shared/ file broke every api/ function in
// production with ERR_REQUIRE_ESM (Vercel's Node bundler compiles api/
// files to CommonJS, but compiles files outside api/ that get pulled in as
// ESM — CJS can't require() an ESM module). See the comment at the top of
// api/_lib/eloCalculator.ts for the full explanation.
export * from '../../api/_lib/eloCalculator';
