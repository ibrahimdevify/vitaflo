# extract_gli.R
library(rspiro)

cat("=== Datasets inside rspiro ===\n")
print(data(package = "rspiro")$results[, "Item"])

cat("\n=== Objects inside rspiro (NAMESPACE) ===\n")
print(ls("package:rspiro"))

cat("\n=== Looking for internal 'lookup' data ===\n")
# rspiro stores its coefficient table as an internal object called 'lookup'
# We can pull it out with rspiro:::lookup
tryCatch({
  lookup <- rspiro:::lookup
  cat("Found internal 'lookup'. Class:", class(lookup), "\n")
  cat("Columns:", paste(colnames(lookup), collapse = ", "), "\n")
  cat("Rows:", nrow(lookup), "\n")
  write.csv(lookup, "gli2012_raw_coefficients.csv", row.names = FALSE)
  cat("Wrote gli2012_raw_coefficients.csv\n")
}, error = function(e) {
  cat("Could not access rspiro:::lookup — error:", conditionMessage(e), "\n")
})